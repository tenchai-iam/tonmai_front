import plotly.graph_objects as go
import pandas as pd
import numpy as np
import shap
import matplotlib.pyplot as plt
from dash import html, callback, callback_context, dcc  # dash basic stuff
import os
import random
import matplotlib
matplotlib.use('agg')


def plot_shap_waterfall(shap_row, asset_df_row):
    """
    Produces a shap waterfall chart, saves it as a temporary image, and returns it as an html.Img element

    Expects shap to be a table with the same scheme as asset_df
    """
    print('checking waterfall')
    plt.figure(figsize=(6, 6))

    shap.waterfall_plot(
        shap.Explanation(
            values=shap_row.iloc[0],
            base_values=0,
            data=asset_df_row.iloc[0],
            feature_names=list(shap_row),
        ),
        max_display=8,
        show=False,
    )
    plt.gcf().set_size_inches(10, 5)
    plt.tight_layout()

    print('check before assigning path')
    os.makedirs(os.path.join("app", "assets", "temp"), exist_ok=True)
    path = os.path.join("assets", "temp", f"temp_chart{random.randint(1,100000)}.png")
    tmp_path = os.path.join("app", path)
    plt.savefig(tmp_path, bbox_inches="tight")
    print('Figure saved')
    return html.Img(src=path, width="100%")


def plot_histogram(
    df: pd.DataFrame,
    column_to_plot: str,
    column_to_identify: str,
    highlight_name: str,
    y_axis_label: str,
    x_axis_label: str,
    title: str,
):
    """
    Plot a histogram with a vertical line highlighting a specific value wrapped up in a dcc.Graph element

    Parameters:
        df (DataFrame): The DataFrame containing the data.
        column_to_plot (str): The column name for which to plot the histogram.
        column_to_identify (str): unique identifier column
        highlight_name (str): The name to highlight in the histogram.
        y_axis_label (str): label for y axis
        x_axis_label (str): label for x axis
        title (str): title for plot

    Returns:
        None
    """

    print(
        f"\n\n\nMaking a histogram of {column_to_plot} where {column_to_identify} equals '{highlight_name}'\n\n\n"
    )
    # Create a copy of the DataFrame and round values
    df_copy = df.copy().round(2)

    # Create a histogram using Plotly
    fig = go.Figure()

    # Get the rows corresponding to the highlight_name
    highlight_rows = df_copy[df_copy[column_to_identify] == highlight_name]
    if len(highlight_rows) == 0:
        print("Escaping from plotting because no rows were found")
        return fig

    # Add a histogram trace
    fig.add_trace(
        go.Histogram(
            x=df_copy[column_to_plot], marker_color="royalblue", name="Histogram"
        )
    )

    # Calculate histogram
    hist, _ = np.histogram(df_copy[column_to_plot], bins="auto")

    # Find the maximum count in the histogram
    max_count = max(hist) + (
        max(hist) * 0.2
    )  # add a 20% buffer to line to make sure it stands out

    # Add a vertical line to highlight the value
    fig.add_shape(
        type="line",
        x0=highlight_rows[column_to_plot].iloc[0],
        y0=0,
        x1=highlight_rows[column_to_plot].iloc[0],
        y1=max_count,
        line=dict(color="gold", width=3),
        name="Highlighted Value",
    )

    fig.update_layout(
        title=f"{title}",
        xaxis_title=x_axis_label,
        yaxis_title=y_axis_label,
        height=500,  # height
        width=1000,  # width
        showlegend=False,
    )

    return dcc.Graph(figure=fig)


def plot_time_series(
        df:pd.DataFrame,
        column_to_plot: str,
        column_to_identify: str,
        highlight_name:str,
        y_axis_label:str,
        x_axis_label:str,
        title:str
):
    df_copy = df.copy()
    df_copy['Timestamp'] = pd.to_datetime(df_copy['Timestamp'])

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x = df_copy['Timestamp'],
            y=df_copy[column_to_plot],
            mode='lines',
            name='Transformer load history',
            line=dict(color='royalblue')

        )
    )

    highlight_rows = df_copy[df_copy[column_to_identify] == highlight_name]
    if len(highlight_rows) == 0:
        print("Escaping from plotting because no rows were found")
        return dcc.Graph(figure=fig)


    fig.add_trace(
        go.Scatter(
            x=highlight_rows['Timestamp'],
            y=highlight_rows[column_to_plot],
            mode='lines+markers',
            name='Transformer load history with values',
            line=dict(color='gold', width=3),
            marker=dict(color='gold', size=7),
            text=[f"{highlight_name}<br>{row}" for row in highlight_rows[column_to_plot]],
        )
    )
    
    fig.update_layout(
        title=f"{title}",
        xaxis_title=x_axis_label,
        yaxis_title=y_axis_label,
        height=500,  
        width=1000,  
        showlegend=True,
    )

    return dcc.Graph(figure=fig)