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
    State,
    callback_context, 
)  

import dash_bootstrap_components as dbc  
from src.data_manager import get_asset_data
from src.data_constants import SOLUTIONS
from src.layout_constants import asset_modal_options

###########################################################
### Internal Functions
##########################################################



###########################################################
### Component Creation
##########################################################

def generate_asset_modal_contents(solution, asset_id, deep_dive_selection, region=None):
    """
    Generate the asset modal contents. This should be an asset specific view that shows how one particular asset performs and ranks against the others on different metrics

    solution - chosen solution in the frontend
    index - index of the chosen graph to produce
    deep_dive_selection - selected chart to generate from the modal dropdown
    """

    ### Get the scheme of possible asset content based on solution
    options = asset_modal_options.get(solution, {})

    if len(list(options)) == 0:
        print(f"Error: No modal charts are defined for {solution}")

    ### Get the selected option. If we don't actually have one, take the first valid option
    deep_dive_selection = (
        deep_dive_selection if deep_dive_selection is not None else list(options)[0]
    )

    ### Get the content details possible for this asset
    modal_details = options.get(deep_dive_selection, {})

    if len(list(modal_details)) == 0:
        print(f"No Modal defaults for {deep_dive_selection}")

        ### Return just the invisible selector to avoid page errors
        return [
            dbc.Select(
                id="asset_deep_dive_selector",
                options=[],
                style={"visible": "none"},
            )
        ]

    ### Basic modal header
    header = [
        dbc.Col(dbc.ModalTitle(modal_details["title"]), width=7),
        dbc.Col(width=3),
        dbc.Col(
            dbc.Select(
                id="asset_deep_dive_selector",
                options=[{"label": x, "value": x} for x in options],
                value=deep_dive_selection,
            ),
            width=2,
        ),
    ]

    header = header + []

    ### If we don't have an actual asset, just return the basic stuff to avoid callback errors
    if deep_dive_selection is None:
        return [dbc.ModalHeader(header)]

    # This IF statement is added to handle the deep dive in subregional AMI
    # The logic here needs to be completely revisited when deep dive views of other solutions are planned
    if asset_id is None or asset_id == "":
        if 'asset_id' in modal_details:
            asset_id = modal_details['asset_id']

            params = {
                "asset_id": asset_id,
                "region": region,
                "solution": solution
            }

            try:
                response = requests.get(BACKEND_DEEPDIVE_URL, params=params)
                response.raise_for_status()
                html_file_path = get_deepdive_map_html_file(solution=solution, asset_id=asset_id, region=region)
                if os.path.exists(html_file_path):
                    with open(html_file_path, 'r') as file:
                        deep_dive_html = file.read()

                    return [
                        dbc.ModalHeader(header),
                        dbc.ModalBody(html.Iframe(srcDoc=deep_dive_html, style={'width': '100%', 'height': '400px'}))
                    ]
                else:
                    print(f"File does not exist: {html_file_path}")
                    return [dbc.ModalHeader(header)]
            except requests.exceptions.HTTPError as err_http:
                print(f"HTTP error occurred: {err_http}")
            except requests.exceptions.ConnectionError as err_conn:
                print(f"Connection error occurred: {err_conn}")
            except requests.exceptions.Timeout as err_timeout:
                print(f"Timeout error occurred: {err_timeout}")
            except requests.exceptions.RequestException as err_req:
                print(f"An error occurred: {err_req}")

            return [dbc.ModalHeader(header)]
        else:
            return [dbc.ModalHeader(header)]
    
    #### Return the requested asset content
    modal_body = [
        html.Div(modal_details["description"]),
        modal_details["layout_func"](solution, asset_id),
    ]
    return [dbc.ModalHeader(header), dbc.ModalBody(modal_body)]

    



###########################################################
### Dash Callbacks
##########################################################

def inject_callbacks(app):
    """Returns the app injected with callbacks for the asset model (and button)"""
    
    @app.callback(
        Output("asset_modal", "children"),
        Input("chosen_solution", "data"),
        Input("asset_selector", "value"),
        Input("asset_deep_dive_selector", "value"),
        Input("region_selector", "value"),
    )
    def update_asset_modal_content(solution, asset_id, deep_dive_selection,region):
        solution = json.loads(solution)["chosen_solution"]
        return generate_asset_modal_contents(
            solution=solution, 
            asset_id=asset_id, 
            deep_dive_selection=deep_dive_selection,
            region=region
        )
    
    ### toggle the asset modal visibility
    @app.callback(
        Output("asset_modal", "is_open"),
        Input("deep_dive_button", "n_clicks"),
        [State("asset_modal", "is_open")],
    )
    def toggle_deep_dive(n1, is_open):
        if n1:
            return not is_open
        return is_open
    
    return app