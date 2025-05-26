### This file contains content generation funcs specific to veg.

## Basic Stuff
import plotly.graph_objects as go
import pandas as pd
import geopandas as gpd
import folium
import os
import datetime
import re
import random
import matplotlib.pyplot as plt

import plotly.express as px

from src.runtime_charts import plot_histogram, plot_shap_waterfall

from src.data_constants import asset_fields, SOLUTIONS
from src.data_manager import (
    get_regional_data,
    get_subregional_data,
    get_asset_data,
    get_all_asset_data,
    get_asset_data_example,
    get_shap_data,
    get_raw_asset_data,
    get_scenario_data,
)

## Dash stuff
import dash_bootstrap_components as dbc
from dash import (
    Dash,
    html,
    callback,
    Output,
    Input,
    callback_context,
    dash_table,
    dcc,
)  

from dash.exceptions import (
    PreventUpdate,
)

import seaborn as sns

sns.set(style="white", font_scale=1.5)

### Styles
pad_15 = {"padding": 15}
pad_5 = {"padding": 5}
v_margin_5 = {"margin-top": 5}
v_margin_20 = {"margin-top": 20}
border = {"border-style": "solid", "border-width": "1px"}
max_width = {"width": "100%"}  # useful for things like buttons


def decile_plot():
    return dbc.Row(
        [
            dbc.Col(
                html.Img(
                    src=os.path.join("assets", "images", "model_outputs_decile_km_image.png"), style={"width" : '100%'}
                ),
                width=7,
            ),
            dbc.Col(
                html.Div(
                    children=[
                        html.H3("How to Read:"),
                        html.Div(
                            "This is a decile plot used to visualize the effectiveness of a model in predicting the target variable across different quantiles (deciles) of the data."
                        ),
                        html.Br(),
                        html.Div(
                            "It shows the distribution of the target variable across different quantiles, helping to understand how well the model is performing in each segment"
                        ),
                        html.Br(),
                        html.Div(
                            "The x axis represents the division of the test dataset into ten equal parts (deciles)"
                        ),
                        html.Br(),
                        html.Div(
                            "The Y axis represents the percentage of actual failures within each quantile"
                        ),
                        html.Br(),
                        html.Hr(),
                        html.Div(
                            "Generally we expect to see a steady decline from left to right. This demonstrates that the model performs well at detecting corridors that experienced outages."
                        ),
                    ],
                    style={"border-left": "solid #333333"} | pad_5,
                ),
                width=5,
            ),
        ]
    )

def risk_achieved_curve_chart():
    return dbc.Row(
        [
            dbc.Col(
                html.Img(
                    src=os.path.join("assets", "images", "curve_risk_image.png"),
                    style={"height": 400},
                ),
                width=7,
            ),
            dbc.Col(
                html.Div(
                    children=[
                        html.H3("How to Read:"),
                        html.Div(
                            "This chart plots the spectrum of expected achievable customer interruptions if different budgets are provided to the veg. management process."
                        ),
                        html.Br(),
                        html.Div(
                            "scenario 1 (reliability focus): Maintain reliability while reducing cost"
                        ),
                        html.Br(),
                        html.Div(
                            "scenario 2 (cost focus): Improve reliability at same spend"
                        ),
                        html.Br(),
                        html.Div(
                            "chosen: Optimize both cost and reliability"
                        ),
                        html.Hr(),
                        html.H3("Parameters:"),
                        html.Div(
                            "Assumed reduced risk: Maximum assumed reduced risk by trimming every day"
                        ),
                        html.Br(),
                        html.Div(
                            "Degredation time: Time after which the risk reaches its maximum"
                        ),
                        html.Br(),
                        html.Div(
                            "Optimization frequencies: Choice of possible trimming frequencies (i.e. 3x/y, 2x/y 1x/y)"
                        ),
                    ],
                    style={"border-left": "solid #333333"} | pad_5,
                ),
                width=5,
            ),
        ]
    )


def risk_achieved_saifi_curve_chart():
    return dbc.Row(
        [
            dbc.Col(
                html.Img(
                    src=os.path.join("assets", "images", "opti_curve_saifi_image.png"),
                    style={"height": 400},
                ),
                width=7,
            ),
            dbc.Col(
                html.Div(
                    children=[
                        html.H3("How to Read:"),
                        html.Div(
                            "This chart plots the spectrum of expected achievable SAIFI if different budgets are provided to the veg. management process."
                        ),
                        html.Br(),
                        html.Div(
                            "scenario 1 (reliability focus): maintain reliability and reduce spend on trimming"
                        ),
                        html.Br(),
                        html.Div(
                            "scenario 2 (cost focus): increase reliability and maintain cost"
                        ),
                        html.Br(),
                        html.Div(
                            "chosen: Optimize both cost and reliability"
                        ),
                        html.Hr(),
                        html.H3("Parameters:"),
                        html.Div(
                            "Assumed reduced risk: Maximum assumed reduced risk by trimming action"
                        ),
                        html.Br(),
                        html.Div(
                            "Degredation time: Time after which the risk reaches its maximum"
                        ),
                        html.Br(),
                        html.Div(
                            "Optimization frequencies: Choice of optimized trimming frequencies (i.e. 3x/y, 2x/y, 1x/y)"
                        ),
                    ],
                    style={"border-left": "solid #333333"} | pad_5,
                ),
                width=5,
            ),
        ]
    )


def scenario_bar_chart_risk_removed():
    scenario_data = get_scenario_data(SOLUTIONS.VEGETATION_MANAGEMENT.value)
    
    return dcc.Graph(
        figure = px.bar(
            scenario_data, 
            x="scenario", 
            y="Risk reduced by optimization", 
            title="Risk Removed by Scenario"
        )
    )

def scenario_bar_chart_cost():
    scenario_data = get_scenario_data(SOLUTIONS.VEGETATION_MANAGEMENT.value)
    
    return dcc.Graph(
        figure = px.bar(
            scenario_data.round(), 
            x="scenario", 
            y="Opex saved", 
            title="OPEX Savings by Scenario"
        )
    )

def scenario_bar_chart_saifi():
    scenario_data = get_scenario_data(SOLUTIONS.VEGETATION_MANAGEMENT.value)
    
    return dcc.Graph(
        figure = px.bar(
            scenario_data, 
            x="scenario", 
            y="Optimized Saifi", 
            title="Optimized SAIFI"
        )
    )
    
    
def full_asset_table():
    asset_data = get_all_asset_data(SOLUTIONS.VEGETATION_MANAGEMENT.value)
    asset_data = asset_data[[x for x in list(asset_data) if str(asset_data[x].dtype) != 'geometry']]
    return [
        dbc.Row(
            dbc.Button("Export", id = "export_button")
        ), 
        dcc.Download(id="download"), # invisible element used to send download events
        dbc.Row(
                dash_table.DataTable(
                    data = asset_data.to_dict('records'), 
                    columns = [{"name": i, "id": i} for i in asset_data.columns],
                    page_size=20,
                    fixed_rows={'headers': True},
                    style_table={'height': '100%', 'overflowY': 'auto', 'overflowX' : 'auto'},
                    style_cell = {
                        'minWidth': '180px',  'whiteSpace': 'normal', 'maxWidth' : '250px'
                    },
                    filter_action="native",
                    sort_action="native",
                    sort_mode='multi',
            ))]

def shap_chart():
    return dbc.Row(
        [
            dbc.Col(
                html.Img(
                    src=os.path.join("assets", "images", "model_outputs_shaps_image.png"), style={"width" : '100%'}
                ),
                width=7,
            ),
            dbc.Col(
                html.Div(
                    children=[
                        html.H3("How to Read:"),
                        html.Div(
                            "Each feature is ordered from top to bottom based on their significance in the model’s prediction"
                        ),
                        html.Br(),
                        html.Div(
                            "Dots to the right of the x axis mean they are more likely to cause an outage, and dots on the left mean they are less likely"
                        ),
                        html.Br(),
                        html.Div(
                            "Red dots mean the actual values were higher (e.g. larger years since last trim or more canopy, while blue dots imply lower values"
                        ),
                        html.Br(),
                        html.Div(
                            "Long spreads of blue to red imply a strong, positive, linear correlation between a feature and a variable that the model used extensively"
                        ),
                        html.Br(),
                        html.Hr(),
                        html.Div(
                            "Generally we expect years since last trim, canopy features, and outage history to be the most important features"
                        ),
                        html.Br(),
                        html.Div(
                            "Some dots may be grey if the field is categorical (e.g. labels) and not easily colored on a blue:red spectrum"
                        ),
                    ],
                    style={"border-left": "solid #333333"} | pad_5,
                ),
                width=5,
            ),
        ]
    )


def auc():
    return dbc.Row(
        [
            dbc.Col(
                html.Img(
                    src=os.path.join("assets", "images", "model_outputs_roc_image.png"), style={"width": "100%"}
                ),
                width=7,
            ),
            dbc.Col(
                html.Div(
                    children=[
                        html.H3("How to Read:"),
                        html.Div(
                            "The blue line represents the performance of our model"
                        ),
                        html.Br(),
                        html.Div(
                            "\n\nThe dotted red line represents the performance of a random model"
                        ),
                        html.Br(),
                        html.Hr(),
                        html.Div(
                            "The more area that is captured under the green line (AUC), the better the model is performing AUC values are context-dependent but scores over 0.75 are considered acceptable. A typical v1 model will usually score in the range of 0.7-0.8 for veg. modeling in our experience."
                        ),
                        html.Br(),
                        html.Div(
                            "\n\nSpecifically, the line tracks 'Y% of corridors that DID experience an outage had a higher expected probability of doing so than X% of corridors that DID NOT'"
                        ),
                    ],
                    style={"border-left": "solid #333333"} | pad_5,
                ),
                width=5,
            ),
        ]
    )


def risk():
    return dbc.Row(
        [
            dbc.Col(
                html.Img(
                    src=os.path.join("assets", "images", "risk_concentration_image.png"),
                    style={"width": '100%'},
                ),
                width=7,
            ),
            dbc.Col(
                html.Div(
                    children=[
                        html.H3("How to Read:"),
                        html.Div(
                            "This chart shows the expected risk (BHT) concentration across all corridors. "
                        ),
                        html.Br(),
                        html.Div(
                            "Risk is defined as the probability of failure multipled by the consequence of failure."
                        ),
                        html.Br(),
                        html.Div(
                            "In this chart, we sort the corridors by expected risk per unit of length and then plot the cumulative share of risk on the y axis against the cumulative share of line miles on the x-axis"
                        ),
                        html.Hr(),
                        html.Div(
                            "Typically we expect to say about 80% of risk fall inside of the top 20%-40% of line length. A large portion of this is driven by the main line corridors at the top of a feeder with thousands of customers at risk."
                        ),
                    ],
                    style={"border-left": "solid #333333"} | pad_5,
                ),
                width=5,
            ),
        ]
    )


def health_concentration():
    return dbc.Row(
        [
            dbc.Col(
                html.Img(
                    src=os.path.join("assets", "images", "model_outputs_health_concentration_image.png"),
                    style={"width": '100%'},
                ),
                width=7,
            ),
            dbc.Col(
                html.Div(
                    children=[
                        html.H3("How to Read:"),
                        html.Div(
                            "This chart shows the expected probability of failure concentration across all corridors. "
                        ),
                        html.Br(),
                        html.Div(
                            "This measure can be read as an approximate measure of the share of the number of expected outage events"
                        ),
                        html.Br(),
                        html.Div(
                            "In this chart, we sort the corridors by expected probability of failure per unit of length and then plot the cumulative share of risk on the y axis against the cumulative share of line miles on the x-axis"
                        ),
                        html.Hr(),
                        html.Div(
                            "Typically we expect to say about 80% of total probability of failure inside of the top 20%-40% of line length. A large portion of this is driven by the main line corridors at the top of a feeder with thousands of customers at risk."
                        ),
                    ],
                    style={"border-left": "solid #333333"} | pad_5,
                ),
                width=5,
            ),
        ]
    )


def inject_veg_callbacks(app):
    """
    Injects veg. specific callbacks into the app.

    We could do this in the main script, but use this function to more cleanly isolate asset specific code into asset specific modules.
    """
    
    #### Tentatively all content here is stripped out
    @app.callback(
        Output("download", "data"),
        Input("export_button", "n_clicks"),
    )
    def export_data(n_clicks):
        if n_clicks is None or n_clicks == 0:
            raise PreventUpdate
        return dcc.send_data_frame(get_all_asset_data(SOLUTIONS.VEGETATION_MANAGEMENT.value).to_csv, "corridors.csv", index=False) 

    


def asset_risk_ranking(solution, asset_id):
    return plot_histogram(
        get_all_asset_data(solution),
        column_to_plot="risk (customer interruptions)",
        column_to_identify=asset_fields["Vegetation Management"],
        highlight_name=asset_id,
        y_axis_label="Frequency",
        x_axis_label="Risk (customer interruptions)",
        title="",
    )


def asset_outage_ranking(solution, asset_id):
    return plot_histogram(
        get_all_asset_data(solution),
        column_to_plot="probability of outage (%)",
        column_to_identify=asset_fields["Vegetation Management"],
        highlight_name=asset_id,
        y_axis_label="Frequency",
        x_axis_label="Probability of Outage",
        title="",
    )


def asset_customers_at_risk_ranking(solution, asset_id):
    return plot_histogram(
        get_all_asset_data(solution),
        column_to_plot="customers affected (adjusted)",
        column_to_identify=asset_fields["Vegetation Management"],
        highlight_name=asset_id,
        y_axis_label="Frequency",
        x_axis_label="Customers Affected (Adjusted)",
        title="",
    )


def asset_shap_waterfall(solution, asset_id):
    """
    Produces a waterfall plot for a single prediction.

    Code here is awkward. Relies on the RAW asset data and the shap data. We expect the shap data to have the asset id as the index and features as columns.
    We rely on the shap data to help subset the raw asset data to get the features as needed.
    """
    
    asset_field = asset_fields[solution]
    
    shap_data = get_shap_data(solution, asset_id)
    shap_data = shap_data.set_index(asset_field).loc[[asset_id]]
    
    raw_asset_data = get_raw_asset_data(solution, asset_id)
    
    raw_asset_data = raw_asset_data.set_index(asset_field).loc[
        [asset_id], list(shap_data)
        ]

    return plot_shap_waterfall(
        shap_row=shap_data,
        asset_df_row=raw_asset_data,
    )





