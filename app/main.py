## DASH APP ####################################################
## Now in a .py file because it can't speak to the external scripts otherwise
import sys
import os
from pathlib import Path
import json

# Get the project root directory
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))

# Add the app directory to the path too
app_dir = Path(__file__).resolve().parent
sys.path.append(str(app_dir))

import dash_bootstrap_components as dbc  
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
    asset_modal_component, 
    overview_modal_component, 
    map_color_scheme_picker_component, 
    aoj_selector_component, 
    region_selector_component, 
    asset_selector_component, 
    language_selector_component
)

from notebooks import pipeline01, pipeline02

import anyconfig
aesthetics = anyconfig.load(os.path.join(app_dir, 'src', 'aesthetics.yml'))

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
primary_color = {'background-color' : aesthetics['primary-background-color']}
secondary_color = {'background-color' : aesthetics['secondary-background-color']}
highlight_color = {'background-color' : aesthetics['highlight-color']}
white_bg_font_color = {'color' : aesthetics['font-color']}
button_style = aesthetics['button_style']
section_style = aesthetics['section_style']
heading_style = aesthetics['heading_style']
paragraph_style = aesthetics['paragraph_style']

### Run pipeline 01 ###########################################################################
# pipeline01.run()

### Run pipeline 02 ###########################################################################
# pipeline02.run()

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

def generate_manual_nav_content():
    
    manual_download_section = html.Div(
        style=section_style,
        children=[
            html.H1(
                id="download_manuals_heading",
                children=language_selector_component.language_dictionary['en']['download_manuals_heading'],
                style=heading_style
            ),
            html.P(
                id="download_manuals_paragraph",
                children=language_selector_component.language_dictionary['en']['download_manuals_paragraph'],
                style=paragraph_style
            ),
            html.Div([
                html.A(
                    html.Button(
                        id="vm_admin_manual_button",
                        children=language_selector_component.language_dictionary['en']['vm_admin_manual_button'],
                        style=button_style,
                        className="manual-button"
                    ),
                    href="/assets/user_manuals/VM Administrator Manual.pdf",
                    style={"textDecoration": "none"}
                ),
                html.A(
                    html.Button(
                        id="vm_business_manual_button",
                        children=language_selector_component.language_dictionary['en']['vm_business_manual_button'],
                        style=button_style,
                        className="manual-button"
                    ),
                    href="/assets/user_manuals/VM Business Solution Manual.pdf",
                    style={"textDecoration": "none"}
                ),
                html.A(
                    html.Button(
                        id="vm_user_training_button",
                        children=language_selector_component.language_dictionary['en']['vm_user_training_button'],
                        style=button_style,
                        className="manual-button"
                    ),
                    href="/assets/user_manuals/VM User Training.pdf",
                    style={"textDecoration": "none"}
                ),
            ], style={
                "display": "flex",
                "flexDirection": "row",
                "flexWrap": "wrap",
                "gap": "10px",  
                "justifyContent": "flex-start"
            })
        ]
    )

    data_upload_section = html.Div(
        style=section_style,
        children=[
            html.H1(
                id="data_upload_heading",
                children=language_selector_component.language_dictionary['en']['data_upload_heading'],
                style=heading_style
            ),
            html.P(
                id="data_upload_paragraph",
                children=language_selector_component.language_dictionary['en']['data_upload_paragraph'],
                style=paragraph_style
            ),
            html.Div([
                # Rate Card Section
                html.Div([
                    html.H3(
                            id="rate_card_heading",
                            children=language_selector_component.language_dictionary['en']['rate_card_heading'],
                            style={"marginBottom": "10px", "color": "#343a40", "fontSize": "1.2rem", "fontWeight": "bold"}
                            ),
                    html.Div([
                        # Download Rate Card Button
                        html.Button(
                            id="download_rate_card_button",
                            children=language_selector_component.language_dictionary['en']['download_rate_card_button'],
                            style=button_style
                        ),
                        # Upload Rate Card Button
                        html.Button(
                            id="upload_rate_card_button",
                            children=language_selector_component.language_dictionary['en']['upload_rate_card_button'],
                            style=button_style
                        )
                    ], style={"display": "flex", "marginBottom": "20px"}),
                ]),
                
                # Outage Section
                html.Div([
                    html.H3(
                            id="outage_heading",
                            children=language_selector_component.language_dictionary['en']['outage_heading'],
                            style={"marginBottom": "10px", "color": "#343a40", "fontSize": "1.2rem", "fontWeight": "bold"}
                            ),
                    html.Div([
                        # Download Outage Button
                        html.Button(
                            id="download_outage_button",
                            children=language_selector_component.language_dictionary['en']['download_outage_button'],
                            style=button_style
                        ),
                        # Upload Outage Button
                        html.Button(
                            id="upload_outage_button",
                            children=language_selector_component.language_dictionary['en']['upload_outage_button'],
                            style=button_style
                        )
                    ], style={"display": "flex"}),
                ]),
            ]),
            html.Div(id='output_data_upload', style={"marginTop": "15px"}),
            
            # Hidden components for storing data
            dcc.Store(id='rate_card_data_store'),
            dcc.Store(id='outage_data_store'),
            
            # Download components
            dcc.Download(id='download_rate_card'),
            dcc.Download(id='download_outage'),
        ]
    )
    
    optimization_section = html.Div(
        children=[
            html.H1(
                id="optimization_heading",
                children=language_selector_component.language_dictionary['en']['optimization_heading'],
                style=heading_style
            ),
            html.P(
                id="optimization_paragraph",
                children=language_selector_component.language_dictionary['en']['optimization_paragraph'],
                style=paragraph_style
            ),
            dbc.Row([
                dbc.Col([
                    dbc.Label(id="saifi_label", 
                              children=language_selector_component.language_dictionary['en']['saifi_label'], 
                              html_for="saifi_input"),
                    dbc.Input(type="number", 
                              id="saifi_input", 
                              placeholder=language_selector_component.language_dictionary['en']['saifi_input']),
                ], md=4),
                dbc.Col([
                    dbc.Label(id="budget_label", 
                              children=language_selector_component.language_dictionary['en']['budget_label'], 
                              html_for="budget_input"),
                    dbc.Input(type="number", 
                              id="budget_input", 
                              placeholder=language_selector_component.language_dictionary['en']['budget_input']),
                ], md=4),
            ], className="mb-2"), 
            html.Button(
                id="run_optimization_button",
                children=language_selector_component.language_dictionary['en']['run_optimization_button'],
                n_clicks=0,
                style=button_style
            ),
            html.Div(id='optimization-output', style={'marginTop': '10px'}) 
        ]
    )

    return html.Div(
        style={
            "padding": "25px",  
            "backgroundColor": "#f8f9fa",
            "borderRadius": "0.5rem",
            "marginTop": "10px"  
        },
        children=[
            manual_download_section,
            data_upload_section,
            optimization_section
        ]
    )

def generate_map_content():
    # unchanged map content
    return html.Div([
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
                                        dbc.Col(
                                            map_color_scheme_picker_component.generate_map_color_scheme_picker(
                                                solution=default_chosen_solution, 
                                                aoj = None,
                                                region=None, 
                                                asset_id=None
                                            ),
                                            id="map_color_scheme_picker_holder",
                                            width = 4
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
                                            width = 4
                                        ),

                                        dbc.Col(width = 1)
                                    ],  
                                ),      
                                width=4,
                            ), 

                            dbc.Col(
                                dbc.Row(
                                    [
                                        dbc.Col(
                                            aoj_selector_component.generate_district_selector(language="en"),
                                            width=2,
                                            id="district_selector_holder",
                                            style = white_bg_font_color,
                                        ),
                                        dbc.Col(
                                            aoj_selector_component.generate_province_selector(language="en"),
                                            width=3,
                                            id="province_selector_holder",
                                            style = white_bg_font_color,
                                        ),
                                        dbc.Col(
                                            aoj_selector_component.generate_aoj_selector(language="en"),
                                            width=3,
                                            id="aoj_selector_holder",
                                            style = white_bg_font_color,
                                        ),
                                        dbc.Col(
                                            region_selector_component.generate_region_selector(default_chosen_solution, None),
                                            width=2,
                                            id="region_selector_holder",
                                            style = white_bg_font_color,
                                        ),
                                        dbc.Col(
                                            asset_selector_component.generate_asset_selector(default_chosen_solution, None),
                                            width=2,
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
                style = max_width | {'max-width' : '98%'}
            ),
            color=aesthetics['primary-background-color'],
            dark=True,
            style = {'padding' : '10px'},
        ),

        ##
        
        ### Main Body Layout ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        html.Div([
        
        dbc.Row(
            map_component.generate_map(
                solution=default_chosen_solution,
                map_color_scheme=default_map_color_scheme,
                aoj = None,
                region=None,
                asset_id=None,
                category=None,
            ),
            id="map_container",
        ),
        html.Div(
            [
            html.H4("Legend:", style={'margin-bottom': '5px', 'font-size': '15px'}),
            dcc.RadioItems(
                id='radio-buttons',
                options=[
                    {'label': 'All', 'value': 'all'},
                    {'label': 'Green', 'value': 'low'},
                    {'label': 'Yellow', 'value': 'medium'},
                    {'label': 'Red', 'value': 'high'}
                ],
                value='all',
                inline=True
            ),
        ],
        style={
            'position': 'absolute',
            'top': '350px',
            'right': '30px',
            'background-color': 'white',
            'padding': '10px',
            'border-radius': '5px',
            'box-shadow': '0px 0px 10px rgba(0, 0, 0, 0.2)',
            'z-index': '1000',
            'font-size': '12px',
            #'display': 'None',
        }
    )
        ]),

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

layout = html.Div(
    style={"width": "100%", 'padding': 0},
    children=[
        dbc.Row([
            dbc.Col(width=9),
            dbc.Col([
                dcc.Dropdown(
                    id='language-selector',
                    options=language_selector_component.language_options,
                    value='en',  # Default language
                    clearable=False,
                    style={'width': '100%'}
                )], width=3)
        ], style={'padding': '10px'}),  # Add language selector at the top

        dbc.Tabs(
            [
                dbc.Tab(
                    label=language_selector_component.language_dictionary['en']['tab_manuals'],
                    children=generate_manual_nav_content(),
                    tab_id="tab-manuals",
                    label_style={"color": "#fff"},
                    active_label_style={"color": "#000"},
                    id="tab_manuals"  # add id for label
                ),
                dbc.Tab(
                    label=language_selector_component.language_dictionary['en']['tab_map'],
                    children=generate_map_content(),
                    tab_id="tab-map",
                    label_style={"color": "#fff"},
                    active_label_style={"color": "#000"},
                    id="tab_map"  # add id for label
                ),
            ],
            id="tabs",
            active_tab="tab-manuals",
            style={
                "backgroundColor": aesthetics['primary-background-color']
            }
        ),
    ]  
)  

@app.callback(
    Output("deep_dive_button", "style"),
    Input("asset_selector", "value")
)
def toggle_deep_dive_visibility(asset_selector_value):
    if asset_selector_value is None or asset_selector_value == "" or asset_selector_value == "Clear":
        return {"display": "none"} | max_width | max_height | vertical_center_text | secondary_color | borderless
    return max_width | max_height | vertical_center_text | secondary_color | borderless

@app.callback(
    [
        Output("tabs", "active_tab"),
    ],
    [
        Input("tabs", "active_tab")
    ]
)
def switch_tab(active_tab):
    return [active_tab]

@app.callback(
    Output('output-div', 'children'),
    Input('radio-buttons', 'value')
)
def update_output(value):
    return f"You selected: {value}"

app.layout = dbc.Container(layout, style={"max-width": "100%", 'padding' : 0})

inject_veg_callbacks(app)
app = map_component.inject_callbacks(app)
app = asset_modal_component.inject_callbacks(app)
app = overview_modal_component.inject_callbacks(app)
app = map_color_scheme_picker_component.inject_callbacks(app)
app = aoj_selector_component.inject_callbacks(app)
app = region_selector_component.inject_callbacks(app)
app = asset_selector_component.inject_callbacks(app)
app = language_selector_component.inject_callbacks(app)
#app = map_offcanvas_details_component.inject_callbacks(app)

port = 8060
host = "0.0.0.0"
print(f'Dash is running on http://127.0.0.1:{port}/')
if __name__ == "__main__":
    # app.run(jupyter_mode="external", port=port)
    app.run_server(debug=False, host=host, port=port, use_reloader=False)
