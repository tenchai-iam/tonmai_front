## DASH APP ####################################################
## Now in a .py file because it can't speak to the external scripts otherwise
import sys
print(sys.version)

import json
# import random
import os
# import sqlite3
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

# os.chdir("..")  # go up a level for the catalog's sake

# import geopandas as gpd
# import pandas as pd

import dash_bootstrap_components as dbc  # nice html element things
from dash import (
    Dash,
    html,
    dcc,
    callback,
    Output,
    Input,
)

from src.layout_constants import map_color_scheme_options

from src.data_constants import SOLUTIONS
from src.generic_components import (
    map_component, 
    asset_modal_component, overview_modal_component, map_color_scheme_picker_component, 
    aoj_selector_component, region_selector_component, asset_selector_component
)

from notebooks import pipeline01, pipeline02

import anyconfig
colors = anyconfig.load(os.path.join('app', 'src', 'aesthetics.yml'))

from src.veg_components.veg_content import inject_veg_callbacks

### Styles
pad_15 = {"padding": 15}
pad_5 = {"padding": 5}
v_margin_5 = {"margin-top": 5}
v_margin_20 = {"margin-top": 20}
border = {"border-style": "solid", "border-width": "1px"}
borderless = {'border-style' : 'none'}
max_width = {"width": "100%"}  # useful for things like buttons
max_height = { 'height': '100%' }
vertical_center_text = {'align-items' : 'center'}
primary_color = {'background-color' : colors['primary-background-color']}
secondary_color = {'background-color' : colors['secondary-background-color']}
highlight_color = {'background-color' : colors['highlight-color']}
white_bg_font_color = {'color' : colors['font-color']}

### Run pipeline 01 ###########################################################################
pipeline01.run()

### Run pipeline 02 ###########################################################################
pipeline02.run()

### App ###########################################################################
default_chosen_solution = SOLUTIONS.VEGETATION_MANAGEMENT.value

default_map_color_scheme = map_color_scheme_options[default_chosen_solution][0]["value"]

app = Dash(
    external_stylesheets=[
        dbc.themes.ZEPHYR
    ],  # use this free styling sheet from dash. Being offline can break this.
    prevent_initial_callbacks=True,
    external_scripts=[{"src": "assets/onclick_callback.js"}],
)

layout = html.Div(
    style={"width": "100%", 'padding' : 0},
    children=[
        
        ### Navbar Header Layout ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        dbc.Navbar(
            dbc.Container(
                [
                    dbc.Row(
                        children = [
                            dbc.Col(
                                [
                                    html.Img(src="assets/images/client_logo.png", height="60px", id = "client_logo"),
                                    dbc.NavbarBrand("Veg. Analytics Hub", className="ms-2", style = vertical_center_text)
                                ],
                                width = 3,
                            ),
                            

                            dbc.Col(
                                dbc.Row(
                                    [
                                        dbc.Col(width = 3),
                                        dbc.Col(
                                            map_color_scheme_picker_component.generate_map_color_scheme_picker(
                                                solution=default_chosen_solution, 
                                                aoj = None,
                                                region=None, 
                                                asset_id=None
                                            ),
                                            id="map_color_scheme_picker_holder",
                                            width = 3
                                        ),
                                        
                                        dbc.Col(
                                            dbc.Button(
                                                "Overview",
                                                id="open_overview_button",
                                                n_clicks=0,
                                                className="btn-info d-md-flex justify-content-md-center",
                                                style=max_width | max_height | vertical_center_text | secondary_color | borderless,
                                            ),
                                            width = 3
                                        ),

                                        

                                            dbc.Col(
                                                dbc.Button(
                                                "Asset Details", 
                                                id="deep_dive_button", 
                                                className="btn-info",
                                                style=max_width | max_height | vertical_center_text | secondary_color | borderless | {'display' : 'none'},
                                            ),
                                            width = 3
                                        ),
                                    ],  
                                ),      
                                width=4,
                            ), 

                            dbc.Col(
                                dbc.Row(
                                    [
                                        dbc.Col(
aoj_selector_component.generate_aoj_selector(),
                                            width=4,
                                            id="aoj_selector_holder",
                                            style = white_bg_font_color,
                                        ),
                                        
                                        dbc.Col(
region_selector_component.generate_region_selector(default_chosen_solution, None),
                                            width=4,
                                            id="region_selector_holder",
                                            style = white_bg_font_color,
                                        ),
                                        dbc.Col(
                                            asset_selector_component.generate_asset_selector(default_chosen_solution, None),
                                            width=4,
                                            id="asset_selector_holder",
                                            style = white_bg_font_color,
                                        ),
                                    ]
                                ),
                                width=5,
                            ),
                        ],
                        align="center",
                        className="g-0",
                        style = max_width,
                    ),
                ],
                style = max_width | {'max-width' : '95%'}
            ),
            color=colors['primary-background-color'],
            dark=True,
            style = {'padding' : '10px'},
        ),
        
        ### Main Body Layout ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        dbc.Row(
            map_component.generate_map(
                solution=default_chosen_solution,
                map_color_scheme=default_map_color_scheme,
                aoj = None,
                region=None,
                asset_id=None,
            ),
            id="map_container",
        ),
        
        ### Overview Modal (Scrolls through different Overview figures for the chosen solution)
        dbc.Modal(
            overview_modal_component.generate_overview_modal_contents(default_chosen_solution, ""),
            size="xl",  # BIG!
            id="overview_modal",
            is_open=False,
        ),
        
        ### Deep Dive Modal
        dbc.Modal(
            asset_modal_component.generate_asset_modal_contents(
                solution=default_chosen_solution,
                asset_id=None,
                deep_dive_selection=None
            ),
            size="xl",  # BIG!
            id="asset_modal",
            is_open=False,
        ),
        
        ### This thing is a relic of an older design that featured more than veg. management
        dcc.Store(
            id="chosen_solution",
            data=json.dumps({"chosen_solution": default_chosen_solution}),
        ),
        dcc.Store(
            id="data"
        ),  # a little element we can use to store stateful json data behind the scene. No use right now in this app.
    ],
)

@app.callback(
    Output("deep_dive_button", "style"),
    Input("asset_selector", "value")
)
def toggle_deep_dive_visibility(asset_selector_value):
    if asset_selector_value is None or asset_selector_value == "" or asset_selector_value == "Clear":
        return {"display": "none"} | max_width | max_height | vertical_center_text | secondary_color | borderless
    return max_width | max_height | vertical_center_text | secondary_color | borderless

app.layout = dbc.Container(layout, style={"max-width": "100%", 'padding' : 0})


inject_veg_callbacks(app)
app = map_component.inject_callbacks(app)
app = asset_modal_component.inject_callbacks(app)
app = overview_modal_component.inject_callbacks(app)
app = map_color_scheme_picker_component.inject_callbacks(app)
app = aoj_selector_component.inject_callbacks(app)
app = region_selector_component.inject_callbacks(app)
app = asset_selector_component.inject_callbacks(app)
#app = map_offcanvas_details_component.inject_callbacks(app)

port = 8060
host = "0.0.0.0"
print(f'Dash is running on http://127.0.0.1:{port}/')
if __name__ == "__main__":
    # app.run(jupyter_mode="external", port=port)
    app.run_server(debug=False, host=host, port=port, use_reloader=False)
