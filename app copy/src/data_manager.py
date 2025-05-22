import sqlite3
import pandas as pd
import geopandas as gpd
from shapely import wkt
import anyconfig
import os
from src.data_constants import (
    asset_tables,
    regional_tables,
    cluster_fields,
    asset_fields,
    shap_tables,
    raw_asset_tables,
    scenario_tables
)


def conn():
    """
    Grab a db connection. There's something about how the dash app uses different threads that makes it hard to reuse the connection
    """
    return sqlite3.connect(
        "app/assets/digital_twin_database.sqlite"
    )  # grab db connection


def get_aoj_primary_key():
    return "NAME"

def get_district_key():
    return "District"

def get_province_key():
    return "Province"

def get_aoj_data():
    """Returns a data frame with the areas of jurisdiction data"""
    df = pd.read_sql_query(f"SELECT * FROM areas_of_jurisdiction", conn())
    return df

def get_regional_data(solution):
    """Returns a region/cluster dataframe for a given solution"""
    print(
        "Getting the regional dataframe. For now this is ALWAYS the cluster boundaries"
    )
    table = get_regional_table(solution)
    df = pd.read_sql_query(f"SELECT * FROM {table}", conn())
    df["polygon"] = df["polygon"].apply(wkt.loads)
    df = gpd.GeoDataFrame(df, geometry="polygon", crs="epsg:4326")

    return df


def get_subregional_data(solution, cluster):
    """Returns a dataframe for a given solution / cluster combination"""

    cluster_field = get_cluster_field(solution)
    asset_table = get_asset_table(solution)
    query = f'SELECT * FROM {asset_table} WHERE "{cluster_field}" = "{cluster}"'
    df = pd.read_sql_query(
        query, conn()
    )
    df["geometry"] = df["geometry_wkt"].apply(wkt.loads)
    df = gpd.GeoDataFrame(df, geometry="geometry", crs="epsg:4326")

    ### Log error for no data
    if len(df) == 0:
        print(f"Warning, no data found for cluster {cluster} with query: {query}")
    return df

def get_asset_table_column_names(solution):
    """Returns a list containing the column names of the asset table associated with the given solution"""
    asset_table = get_asset_table(solution)
    columns = pd.read_sql(
        f"SELECT name FROM PRAGMA_TABLE_INFO('{asset_table}');", 
        conn()
    )
    return list(columns)

def get_asset_data_example(solution):
    """Returns the first element of the dataframe to test data structure"""
    ### Probably could do this with more data scheme style tests but... eh.
    asset_table = get_asset_table(solution)
    print(f"Requesting data for the first asset within {solution}")
    df = pd.read_sql_query(f"SELECT * FROM {asset_table}", conn())
    df["geometry"] = df["geometry_wkt"].apply(wkt.loads)
    df = gpd.GeoDataFrame(df, geometry="geometry", crs="epsg:4326")
    print(f"We got data.. {len(df):,} rows?")
    return df.drop('geometry_wkt',axis=1)


def get_all_asset_data(solution):
    """Returns a dataframe covering every asset"""
    asset_table = get_asset_table(solution)
    print(f"Requesting data for ALL assets within {solution}")
    df = pd.read_sql_query(f"SELECT * FROM {asset_table}", conn())
    df["geometry"] = df["geometry_wkt"].apply(wkt.loads)
    df = gpd.GeoDataFrame(df, geometry="geometry", crs="epsg:4326")
    return df.drop('geometry_wkt',axis=1)


def get_asset_data(solution, asset_id):
    """Returns a dataframe for a given asset"""
    asset_table = get_asset_table(solution)
    print(f"Requesting data for {solution} - {asset_id}")
    df = pd.read_sql_query(
        f'SELECT * FROM {asset_table} WHERE "{asset_fields[solution]}" = "{asset_id}"',
        conn(),
    )
    df["geometry"] = df["geometry_wkt"].apply(wkt.loads)
    df = gpd.GeoDataFrame(df, geometry="geometry", crs="epsg:4326")
    ### Log error for no data
    if len(df) == 0:
        print(
            f"Warning, no data found for asset_id {asset_id} for individual asset data"
        )
    return df.drop('geometry_wkt',axis=1)


def get_regional_table(solution):
    table = regional_tables.get(solution, "missing")
    if table == "missing":
        print(f"ERROR: Unhandled subregional table for solution {solution}")
    return table


def get_asset_table(solution):
    table = asset_tables.get(solution, "missing")
    if table == "missing":
        print(f"ERROR: Unhandled subregional table for solution {solution}")
    return table


def get_cluster_field(solution):
    field = cluster_fields[solution]
    if field == "missing":
        print(f"ERROR: Unhandled cluster field for solution {solution}")
    return field


def get_raw_asset_data(solution, asset_id):
    """Grab the raw data for a given asset"""
    print(f"Requesting raw data for {solution} - {asset_id}")
    raw_asset_table = raw_asset_tables[solution]
    
    df = pd.read_sql_query(
        f'SELECT * FROM {raw_asset_table} WHERE "{asset_fields[solution]}" = "{asset_id}"',
        conn(),
    )
    return df
        

def get_shap_data(solution, asset_id):
    """Grab the shap data from the table"""
    print(f"Requesting shap data for {solution} - {asset_id}")
    shap_table = shap_tables[solution]
    
    df = pd.read_sql_query(
        f'SELECT * FROM {shap_table} WHERE "{asset_fields[solution]}" = "{asset_id}"',
        conn(),
    )
    ### Log error for no data
    if len(df) == 0:
        print(
            f"Warning, no data found for asset_id {asset_id} for individual asset data"
        )
    return df

def get_scenario_data(solution):
    """Grab the data associated with a given solution"""
    scenario_table = scenario_tables[solution]
    df = pd.read_sql_query(
        f'SELECT * FROM {scenario_table}',
        conn()
    )
    
    return df
