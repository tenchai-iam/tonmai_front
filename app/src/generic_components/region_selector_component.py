import os
import folium
import re
import json
import dash

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
import dash_bootstrap_components as dbc  # nice html element things

from src.data_manager import get_regional_data, get_cluster_field
from src.data_manager import get_aoj_data, get_district_key, get_aoj_primary_key, get_province_key


###########################################################
### Component Creation
##########################################################

def generate_region_selector(solution, aoj):
    """Make the selector for regions"""
    
    df = get_regional_data(solution)
    df = df.loc[df['Area of Jurisdiction'] == aoj]
    clusters = df[get_cluster_field(solution)].drop_duplicates()
    return dbc.Select(
        id="region_selector",
        placeholder="Selected feeder...",
        options=[{"label": cluster, "value": cluster} for cluster in clusters] + [{'label' : 'Clear', 'value' : None}],
    )

###########################################################
### Dash Callbacks
##########################################################

def inject_callbacks(app):
    """Returns the app injected with callbacks for the region selector"""
    
    ### Update region selector when solution changes
    @app.callback(
        Output("region_selector_holder", "children"), 
        Input("chosen_solution", "data"),
        Input("aoj_selector", "value")
    )
    def refresh_region_selector(solution, aoj):
        if aoj is None:
            return dbc.Select(
                id = "region_selector",
                options = []
            )
        else:
            return generate_region_selector(json.loads(solution).get("chosen_solution", "missing"), aoj)
    
    @app.callback(
        Output("region_selector", "value"),
        Input("client_logo", "n_clicks"),
    )
    def clear_region_selection(logo_clicks):
        if logo_clicks is None or logo_clicks == 0:
            raise PreventUpdate
        return None
    
    
    return app
