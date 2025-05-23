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

import dash_bootstrap_components as dbc  
from src.data_manager import get_aoj_data, get_aoj_primary_key

###########################################################
### Internal Functions
##########################################################



###########################################################
### Component Creation
##########################################################

def generate_aoj_selector():
    """Make the selector for areas of jurisdiction"""
    
    df = get_aoj_data()
    aojs = df[get_aoj_primary_key()].drop_duplicates()
    return dbc.Select(
        id="aoj_selector",
        placeholder="Selected AOJ...",
        options=[{"label": aoj, "value": aoj} for aoj in aojs]  + [{'label' : 'Clear', 'value' : None}],
    )

###########################################################
### Dash Callbacks
##########################################################

def inject_callbacks(app):
    """Returns the app injected with callbacks for the region selector"""
    
    
    @app.callback(
        Output("aoj_selector", "value"),
        Input("client_logo", "n_clicks")
    )
    def clear_region_selection(logo_clicks):
        if logo_clicks is None or logo_clicks == 0:
            raise PreventUpdate
        return None
    
    
    return app