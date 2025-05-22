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
from src.layout_constants import map_color_scheme_options, subregion_map_color_scheme_options
import dash_bootstrap_components as dbc  

###########################################################
### Internal Functions
##########################################################



###########################################################
### Component Creation
##########################################################

def generate_map_color_scheme_picker(solution, aoj, region, asset_id):
    """Generates the drop down that lets users choose the map color scheme"""

    if aoj is None or aoj == "":
        return dbc.Select(id="map_color_picker", value = None, options = [])
    
    ### If there's no region selected, show the decision lens for the aggregate views
    elif region is None or region == "" or region == "Clear":
        options = map_color_scheme_options.get(solution, [])

        if len(options) == []:
            print(f"Unhandled map color picker input '{solution}' for regional views")
            return []

        return dbc.Select(id="map_color_picker", value=options[0], options=options)

    ### if there's no asset, show the subregion level views
    elif asset_id is None or asset_id == "" or asset_id == "Clear":
        options = subregion_map_color_scheme_options.get(solution, [])

        if len(options) == []:
            print(f"Unhandled map color picker input '{solution}' for subregional views")
            return []

        return dbc.Select(id="map_color_picker", value=options[0], options=options)
    ### If there's an asset selected then its kind of pointless to color by anything
    ### We sitll add the selector to avoid callbacks but we make it invisible
    else:
        return [
            dbc.Select(
                id="map_color_picker", 
                options=["Cannot apply a color scheme when there's only one asset!"],
                value = "Cannot apply a color scheme when there's only one asset!",
                style={"visible": "none"}),
        ]

###########################################################
### Dash Callbacks
##########################################################

def inject_callbacks(app):
    """Returns the app injected with callbacks for the map color scheme picker"""
    
    ### Change the decision lens drop downs
    @app.callback(
        Output("map_color_scheme_picker_holder", "children"),
        Input("chosen_solution", "data"),
        Input("aoj_selector", "value"),
        Input("region_selector", "value"),
        Input("asset_selector", "value"),
    )
    def update_decision_lens(chosen_solution, aoj, region, asset_id):
        solution = json.loads(chosen_solution)["chosen_solution"]
        return generate_map_color_scheme_picker(solution, aoj, region, asset_id)
    
    return app