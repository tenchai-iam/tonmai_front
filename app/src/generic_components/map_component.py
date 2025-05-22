import os
import folium
import re
import json

from dash.exceptions import (
    PreventUpdate,
)  
from dash import (
    html,
    callback,
    Output,
    Input,
    callback_context,
)  
from src.data_manager import get_asset_data


from src.layout_constants import (
    solution_units,
    REGIONAL_MAP_DIR,
    SUBREGIONAL_MAP_DIR,
    CATEGORICAL_MAP_DIR,
    ASSETS_DIR
)

import anyconfig
colors = anyconfig.load(os.path.join('app', 'src', 'aesthetics.yml'))

###########################################################
### Internal Functions
##########################################################

def get_aoj_map_html_file():
    return os.path.join(ASSETS_DIR, "areas_of_jurisdiction_map.html")

def get_regional_map_html_file(aoj, solution, map_color_scheme):
    return os.path.join(REGIONAL_MAP_DIR, f"{solution}", f"{aoj}_{map_color_scheme}.html")


def get_subregional_map_html_file(solution, map_color_scheme, region):
    return os.path.join(
        SUBREGIONAL_MAP_DIR, f"{solution}", f"{map_color_scheme}_{region}.html"
    )

def get_subregional_cat_map_html_file(solution, map_color_scheme, region, category):
    return os.path.join(
        CATEGORICAL_MAP_DIR, f"{solution}", f"{map_color_scheme}_{region}_{category}.html"
    )

def get_asset_map_html_file(solution, region, asset_id):
    """
    Gets an asset specific html file. This one, unlike other functions, generates a small map at runtime
    """
    path = os.path.join(ASSETS_DIR, "temp_map.html")

    df = get_asset_data(solution, asset_id)
    columns_to_remove = ['nearest_upstream_device_list', 'nearest upstream device list']
    df = df.drop(columns=[col for col in columns_to_remove if col in df.columns],axis = 1)
    runtime_map(df).save(path)
    return path

class ClickForOneMarker(folium.ClickForMarker):
    """
    Class used to inject creating a marker on clickwith street view into maps
    """

    _template = folium.map.Template(
        """
    {% macro script(this, kwargs) %}
    var new_mark = L.marker();
    function newMarker(e){
    new_mark.setLatLng(e.latlng).addTo({{this._parent.get_name()}});
    new_mark.dragging.enable();
    new_mark.on('dblclick', function(e){ {{this._parent.get_name()}}.removeLayer(e.target)})
    var lat = e.latlng.lat.toFixed(4),
    lng = e.latlng.lng.toFixed(4);
    new_mark.bindPopup("<a href=https://www.google.com/maps?layer=c&cbll=" + lat + "," + lng + " target=blank >Google Street View</a>");
    parent.document.getElementById("latitude").value = lat;
    parent.document.getElementById("longitude").value =lng;
    };
    {{this._parent.get_name()}}.on('click', newMarker);
    {% endmacro %}
    """
    )

    def __init__(self, popup=None):
        super(ClickForOneMarker, self).__init__(popup)
        self._name = "ClickForOneMarker"


def runtime_map(df):
    """Generates a folium map of a single corridor with veg. management details at runtime"""
    m = folium.Map()
    m = df.explore(
        color="royalblue",
        style_kwds={
            "weight": 10,
        },
        name="Veg. Management Work Units",
    )

    m.add_child(ClickForOneMarker())

    folium.TileLayer(
        attr="Google Satellite",
        tiles="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        name="Google Satellite",
        max_zoom=25,
    ).add_to(m)

    return m


###########################################################
### Component Creation
##########################################################

def generate_map(solution, aoj, region, asset_id, map_color_scheme, category):

    """
    Generates or grabs a pre-made folium map html file and returns it wrapped up in a iframe element
    """

    ### First get the desired map file
    if aoj is None or aoj == "Clear":
            map_file = get_aoj_map_html_file()
            title = html.H6("Areas of Jursidiction")
            
    elif region is None or region == "Clear":
        print(f"Region is not defined, so creating regional view for {solution}")
        map_file = get_regional_map_html_file(
            aoj,
            solution, 
            map_color_scheme
        )
        
        title = html.H6(f"{solution} - {re.sub('_', ' ', map_color_scheme.title())}", style = {'color' : colors['font-color']})

    elif ((asset_id is None or asset_id == "Clear") and (category is None or category == "all")):
        print(
            f"Asset id is not defined, so creating a subregional view for {solution} -> {region}"
        )
        map_file = get_subregional_map_html_file(
            solution, 
            map_color_scheme, 
            region
        )
        
        title = html.H6(
            f"{solution} - {re.sub('_', ' ', map_color_scheme.title())} within region {region}", 
            style = {'color' : colors['font-color']}
        )

    elif asset_id is None or asset_id == "Clear":
        print(
            f"Asset id is not defined, so creating a subregional view for {solution} -> {region} -> {category}"
        )

        if map_color_scheme == 'Risk (Customer Interruptions, Binned)':
            print("Category name changed", map_color_scheme)
            map_color_scheme = 'Risk (Customer Interruptions) [Category]'

        if "scenario" in map_color_scheme.lower():
            if category == 'low':
                category = "one time a year"
            elif category == "medium":
                category = "two times a year"
            elif category == "high":
                category = "three times a year"
            else:
                category = category
        
        map_file = get_subregional_cat_map_html_file(
            solution, 
            map_color_scheme, 
            region,
            category
        )
        
        title = html.H6(
            f"{solution} - {re.sub('_', ' ', map_color_scheme.title())} within region {region}", 
            style = {'color' : colors['font-color']}
        )

    else:
        print(f"Producing an asset level map for {solution} -> {region} ->  {asset_id}")
        map_file = get_asset_map_html_file(
            solution,
            region,
            asset_id,
        )

        # Lookup appropriate unit, e.g. "corridor" for veg management
        unit = solution_units.get(
            solution, f"Unknown asset class for {solution}: Check layout_constants.py:"
        )
        title = html.H6(f"{unit}: {asset_id}", style = {'color' : colors['font-color']})

    ### Then check if it's valid
    if not os.path.isfile(map_file):
        print(
            f"Warning: there is no map file at {map_file}. There's a 50/50 chance of this occuring when switching granularity of maps due to the random order of callbacks, so this is not a problem unless you expect to see a file at that path."
        )
        return []

    ### Finally return it wrapped up in an iframe so dash can use it
    return [
        title,
        html.Iframe(
            id="map",
            srcDoc=open(map_file, "r").read(),
            width="100%",
            height=800,
        ),
    ]


###########################################################
### Dash Callbacks
##########################################################

def inject_callbacks(app):
    """Returns the app injected with callbacks for the map component"""
    
    ### Load up the relevant map based on choices
    ### If we had more inputs that we wanted to use to inform the map, we would want to add them to this function
    @app.callback(
        Output("map_container", "children"),
        #Output('radio-container', 'style'),
        Input("chosen_solution", "data"),
        Input("map_color_picker", "value"),
        Input("asset_selector", "value"),
        Input("region_selector", "value"),
        Input("aoj_selector", "value"),
        Input('radio-buttons', 'value'),
    )
    def update_map(solution, map_color_scheme, asset_id, region, aoj, category):
        ### Don't update map if the chosen solution changes
        ### Because it's just going to trigger a change on the decision lens
        ### Which would cause it to redraw anyway
        if callback_context.triggered_id == "chosen_solution":
            raise PreventUpdate

        chosen_solution = json.loads(solution).get("chosen_solution", "missing")
        if chosen_solution == "missing":
            return [html.Div("Unable to load map because chosen solution is not defined")]

        if type(map_color_scheme) == dict:
            map_color_scheme = map_color_scheme["value"]

        children = generate_map(
            solution=chosen_solution,
            map_color_scheme=map_color_scheme,
            region=region,
            asset_id=asset_id,
            aoj = aoj,
            category = category,
        )

        ### This should only occur if it loads the wrong map due to random callback timing
        ### Not a problem. Just ignore the request.
        if len(children) == 0:
            raise PreventUpdate

        return children
    
    return app