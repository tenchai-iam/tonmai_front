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
    State,
    callback_context,
)

import dash_bootstrap_components as dbc  
from src.layout_constants import overview_modal_options

###########################################################
### Internal Functions
##########################################################



###########################################################
### Component Creation
##########################################################

def generate_overview_modal_contents(solution, chosen_view):
    """Generates the modal contents where users can see details of a the overall models behind the solution"""
    options = overview_modal_options.get(solution, [])

    if len(options) == 0:
        print(f"Error: No Overview Modal options found for solution {solution}")
        return []

    modal_content = options.get(chosen_view, options[list(options)[0]])
    return [
        dbc.ModalHeader(
            [
                dbc.Col(dbc.ModalTitle(modal_content["title"]), width=7),
                dbc.Col(width=3),
                dbc.Select(
                    id="overview_modal_selector",
                    options=[{"label": val, "value": val} for val in list(options)],
                    value=chosen_view
                    if chosen_view in list(options)
                    else list(options)[0],
                ),
            ]
        ),
        dbc.ModalBody(modal_content["layout_function"]()),
    ]

###########################################################
### Dash Callbacks
##########################################################

def inject_callbacks(app):
    """Returns the app injected with callbacks for the overview modal component (and button)"""
    
    ### Toggle the Overview modal visibility
    @app.callback(
        Output("overview_modal", "is_open"),
        Input("open_overview_button", "n_clicks"),
        [State("overview_modal", "is_open")],
    )
    def toggle_overview_modal(n1, is_open):
        if n1:
            return not is_open
        return is_open
    
    ### Update the overview modal contents
    @app.callback(
        Output("overview_modal", "children"),
        Input("chosen_solution", "data"),
        Input("overview_modal_selector", "value"),
    )
    def change_overview_modal_content(solution, chosen_view):
        return generate_overview_modal_contents(
            json.loads(solution)["chosen_solution"],
            chosen_view,
        )
    
    return app