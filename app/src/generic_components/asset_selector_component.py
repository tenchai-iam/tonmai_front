import os
import folium
import re
import json

from dash.exceptions import (
    PreventUpdate,
)  # util to cancel Callbacks safely

from dash import (
    html,
    callback,
    Output,
    Input,
    callback_context,
)  # dash basic stuff

from src.data_manager import get_subregional_data
from src.data_constants import asset_fields

import dash_bootstrap_components as dbc  


###########################################################
### Component Creation
##########################################################

def generate_asset_selector(solution, region):
    """Make the selector for asset selectors"""
    
    if region is None or region == "" or region == "Clear":
        return dbc.Select(
            id="asset_selector",
            options=[],
            style={"display": "none"},
        )

    else:
        df = get_subregional_data(solution, region)
        asset_ids = df[asset_fields[solution]].drop_duplicates()
        return dbc.Select(
            id="asset_selector",
            placeholder="Selected asset...",
            options=[{"label": asset_id, "value": asset_id} for asset_id in asset_ids]  + [{'label' : 'Clear', 'value' : None}],
        )

###########################################################
### Dash Callbacks
##########################################################

def inject_callbacks(app):
    """Returns the app injected with callbacks for the asset selector component"""
    
    @app.callback(
        Output("asset_selector_holder", "children"),
        Input("chosen_solution", "data"),
        Input("region_selector", "value"),
    )
    def refresh_asset_selector(chosen_solution, region):
        solution = json.loads(chosen_solution).get("chosen_solution", "missing")
        if solution == "missing":
            print("Error: Solution is missing in refresh_asset_selector")
            raise PreventUpdate

        return generate_asset_selector(solution, region)    
    
    return app
