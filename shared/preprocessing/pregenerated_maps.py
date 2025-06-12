## Basic Stuff
import pandas as pd
import geopandas as gpd
import folium
import re


def generate_regional_map(df, feature):
    """
    Generates a map with regional level stats.
    """
    columns_to_remove = ['nearest_upstream_device_list', 'nearest upstream device list']
    df = df.drop(columns=[col for col in columns_to_remove if col in df.columns], axis = 1)
    m = df.apply(lambda x: x.round(2) if '%' not in x.name else x).explore(name=feature, column=feature, cmap="coolwarm", scheme="NaturalBreaks")
    folium.TileLayer(
        "cartodbpositron",
        max_zoom=25,
    ).add_to(m)
    folium.LayerControl().add_to(m)
    return m


# def generate_subregional_map(df, feature, vmin, vmax, shape_type="points"):
#     """
#     Generates a map with subregional level stats. Expects a geometry column called "geometry" to be present.

#     `shape_type` should specify 'lines' or 'points'.
#     The primary key of each row is expected to be called "globalid".
    
#     """

#     if shape_type not in ["lines", "points"]:
#         print(
#             f"Error: Got shape_type '{shape_type}' instead of expected 'lines' or 'points'"
#         )
#         return float("NaN")

#     # print(f"Generating subregional map for {feature}. Expecting to find {shape_type}")

#     m = df.apply(lambda x: x.round(2) if '%' not in x.name else x).explore(
#         name=feature,
#         column=feature,
#         cmap="coolwarm",
#         vmin=vmin,
#         vmax=vmax,  # scheme="EqualInterval"
#         style_kwds = {
#             'weight' : 5
#         },
#     )
#     folium.TileLayer(
#         "cartodbpositron",
#         max_zoom=25,
#     ).add_to(m)
    

#     return m

def generate_subregional_map(df, feature, vmin, vmax, shape_type="points"):
    """
    Generates a map with subregional level stats. Expects a geometry column called "geometry" to be present.

    Parameters:
    - df: The GeoDataFrame containing the data.
    - feature: The column name to base the visualization on.
    - vmin, vmax: Minimum and maximum values for color scaling.
    - shape_type: Specifies 'lines' or 'points' for the type of map.

    Returns:
    - A folium map object.
    """
    
    if shape_type not in ["lines", "points"]:
        print(f"Error: Got shape_type '{shape_type}' instead of expected 'lines' or 'points'")
        return float("NaN")

    # Define custom colors for specific values if "focus scenario" or "binned" is found in the column name
    frequency_color_map = {
        'one time a year': 'green',
        'two times a year': 'yellow',
        'three times a year': 'red'
    }

    binned_color_map = {
        'low': 'green',
        'medium': 'yellow',
        'high': 'red'
    }
    columns_to_remove = ['nearest_upstream_device_list', 'nearest upstream device list']
    df = df.drop(columns=[col for col in columns_to_remove if col in df.columns],axis = 1)
    # Check if 'focus scenario' or 'binned' is in the feature name and use appropriate coloring
    feature_lower = feature.lower()
    if 'focus scenario' in feature_lower or 'scenario' in feature_lower:
        # Ensure the column is not categorical
        df[feature] = df[feature].astype(str)
        m = df.apply(lambda x: x.round(2) if '%' not in x.name else x).explore(
            name=feature,
            column=feature,
            categories=list(frequency_color_map.keys()),
            cmap=list(frequency_color_map.values()),
            vmin=vmin,
            vmax=vmax,
            style_kwds={
                'weight': 5
            },
        )
    elif 'binned' in feature.lower():
        # Ensure the column is not categorical
        df[feature] = df[feature].astype(str)
        m = df.apply(lambda x: x.round(2) if '%' not in x.name else x).explore(
            name=feature,
            column=feature,
            categories=list(binned_color_map.keys()),
            cmap=list(binned_color_map.values()),
            vmin=vmin,
            vmax=vmax,
            style_kwds={
                'weight': 5
            },
        )
    else:
        m = df.apply(lambda x: x.round(2) if '%' not in x.name else x).explore(
            name=feature,
            column=feature,
            cmap="coolwarm",
            vmin=vmin,
            vmax=vmax,
            style_kwds={
                'weight': 5
            },
        )

    folium.TileLayer(
        attr="Google Satellite",
        tiles="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        name="Google Satellite",
        # max_zoom=25,
    ).add_to(m)
    
    # Add a base tile layer
    folium.TileLayer("cartodbpositron", max_zoom=25).add_to(m)

    return m


def generate_subregional_cat_map(df, feature, cat, vmin, vmax, shape_type="points"):
    """
    Generates a map with subregional level stats. Expects a geometry column called "geometry" to be present.

    Parameters:
    - df: The GeoDataFrame containing the data.
    - feature: The column name to base the visualization on.
    - vmin, vmax: Minimum and maximum values for color scaling.
    - shape_type: Specifies 'lines' or 'points' for the type of map.

    Returns:
    - A folium map object.
    """
    
    if shape_type not in ["lines", "points"]:
        print(f"Error: Got shape_type '{shape_type}' instead of expected 'lines' or 'points'")
        return float("NaN")

    # Define custom colors for specific values if "focus scenario" or "binned" is found in the column name
    frequency_color_map = {
        'one time a year': 'green',
        'two times a year': 'yellow',
        'three times a year': 'red'
    }

    binned_color_map = {
        'low': 'green',
        'medium': 'yellow',
        'high': 'red'
    }
    columns_to_remove = ['nearest_upstream_device_list', 'nearest upstream device list']
    df = df.drop(columns=[col for col in columns_to_remove if col in df.columns],axis = 1)
    # Check if 'focus scenario' or 'binned' is in the feature name and use appropriate coloring
    feature_lower = feature.lower()
    if 'focus scenario' in feature_lower or 'scenario' in feature_lower:
        # Ensure the column is not categorical
        df[feature] = df[feature].astype(str)
        m = df.apply(lambda x: x.round(2) if '%' not in x.name else x).explore(
            name=feature,
            column=feature,
            categories=list(frequency_color_map.keys()),
            cmap=list(frequency_color_map.values()),
            vmin=vmin,
            vmax=vmax,
            style_kwds={
                'weight': 5
            },
        )
    elif 'binned' in feature.lower():
        # Ensure the column is not categorical
        df[feature] = df[feature].astype(str)
        m = df.apply(lambda x: x.round(2) if '%' not in x.name else x).explore(
            name=feature,
            column=feature,
            categories=list(binned_color_map.keys()),
            cmap=list(binned_color_map.values()),
            vmin=vmin,
            vmax=vmax,
            style_kwds={
                'weight': 5
            },
        )
    else:
        m = df.apply(lambda x: x.round(2) if '%' not in x.name else x).explore(
            name=feature,
            column=feature,
            cmap="coolwarm",
            vmin=vmin,
            vmax=vmax,
            style_kwds={
                'weight': 5
            },
        )

    folium.TileLayer(
        attr="Google Satellite",
        tiles="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        name="Google Satellite",
        # max_zoom=25,
    ).add_to(m)
    
    # Add a base tile layer
    folium.TileLayer("cartodbpositron", max_zoom=25).add_to(m)

    return m

def move_geom_to_end(df, crs):
    """
    Dummy helper function because we're going to constantly get polygon geometry at col 2, but we want it at the end

    We also need to remind it that it's a GeoDataFrame because we'll have lost this in the groupby
    """
    df = df.iloc[:, [0] + list(range(2, len(list(df)))) + [1]]
    df = gpd.GeoDataFrame(df, geometry="polygon", crs=crs)
    return df


def zoom_in_function(html, cluster_field):
    ### Get the hashy geosjon name from the html and don't you dare let us find more than one
    geojson_name = re.search(r"geo_json_.{32}", html)[0]
    func = (
        """
            function send_cluster_id_on_click(e){
                            var cluster = {'type' : 'region_selector', 'value' : e['layer']['feature']['properties']['"""
        + cluster_field
        + """']};
                            window.top.postMessage(cluster, '*');
                        }\n
            """
    )
    func = func + geojson_name + ".on('click', send_cluster_id_on_click);"
    return func


def add_zoom_in_function(path, cluster_field):
    """Given the path to a regional map .html file, injects the functionality to zoom in on a clicked region by literally adding code text"""

    #### Inject the script as literal text
    with open(path, "r+") as file:
        html_as_string = file.read()
        file.seek(0)
        html_as_string = (
            html_as_string[:-17]
            + zoom_in_function(html_as_string, cluster_field)
            + html_as_string[-17:]
        )  # 17 refers to len of </script>\n</html>
        file.write(html_as_string)
        file.truncate()

def aoj_selection_function(html, asset_id):
    ### Get the hashy geosjon name from the html and don't you dare let us find more than one
    geojson_name = re.search(r"geo_json_.{32}", html)[0]
    func = (
        """
            function send_cluster_id_on_click(e){
                            var asset = {'type' : 'aoj_selector', 'value' : e['layer']['feature']['properties']['"""
        + asset_id
        + """']};
                            window.top.postMessage(asset, '*');
                        }\n
            """
    )
    func = func + geojson_name + ".on('click', send_cluster_id_on_click);"
    return func


def asset_selection_function(html, aoj_name_column="NAME"):
    ### Get the hashy geosjon name from the html and don't you dare let us find more than one
    geojson_name = re.search(r"geo_json_.{32}", html)[0]
    func = (
        """
            function send_cluster_id_on_click(e){
                            var asset = {'type' : 'asset_selector', 'value' : e['layer']['feature']['properties']['"""
        + aoj_name_column
        + """']};
                            window.top.postMessage(asset, '*');
                        }\n
            """
    )
    func = func + geojson_name + ".on('click', send_cluster_id_on_click);"
    return func


def add_asset_selection_function(path, asset_id):
    """Given the path to a subregional map .html file, injects the functionality to zoom in on a clicked region by literally adding code text"""

    #### Inject the script as literal text
    with open(path, "r+") as file:
        html_as_string = file.read()
        file.seek(0)
        html_as_string = (
            html_as_string[:-17]
            + asset_selection_function(html_as_string, asset_id)
            + html_as_string[-17:]
        )  # 17 refers to len of </script>\n</html>
        file.write(html_as_string)
        file.truncate()
        
        
def add_aoj_selection_function(path, aoj_name_column="NAME"):
    """Given the path to a subregional map .html file, injects the functionality to zoom in on a clicked region by literally adding code text"""

    #### Inject the script as literal text
    with open(path, "r+") as file:
        html_as_string = file.read()
        file.seek(0)
        html_as_string = (
            html_as_string[:-17]
            + aoj_selection_function(html_as_string, aoj_name_column)
            + html_as_string[-17:]
        )  # 17 refers to len of </script>\n</html>
        file.write(html_as_string)
        file.truncate()

def rename_columns(df, rename_dict):
    return df.rename(columns=rename_dict)

def round_columns(df, columns, decimals=2):
    for column in columns:
        df[column] = df[column].map(lambda x: round(x, decimals))
    return df

def filter_columns(df, columns):
    return df[columns]

def map_views(df, exclude_columns):
    return [x for x in list(df) if x not in exclude_columns]

def clean_column_values(df, column, pattern, replacement):
    df[column] = df[column].map(lambda x: re.sub(pattern, replacement, x))
    return df