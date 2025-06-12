import numpy as np
import pandas as pd
import geopandas as gpd
import re

def create_features_for_veg(veg_corridors, column_renames):
    # print("creating veg. df with temporary features. fix earlier in pipeline later")

    veg_df = veg_corridors.copy()
    ### Adjust to include whatever columns we want to make maps for
    veg_df = veg_df.rename(columns=column_renames)
    
    for col in veg_df.select_dtypes(include='float'):
        veg_df[col] = veg_df[col].map(lambda x: round(x, 2))
    return veg_df


def categorize_by_deciles(df: pd.DataFrame, column: str) -> pd.DataFrame:
    """
    Categorize values in the specified column of a DataFrame into bins based on deciles.

    Parameters:
        df (pd.DataFrame): The input DataFrame.
        column (str): The column to categorize.

    Returns:
        pd.DataFrame: A copy of the original DataFrame with an added column named '{column} [bins]'.
    """
    # Make a copy of the input DataFrame
    df_copy = df.copy()
    
    # Calculate deciles using numpy to create an array of quantiles
    deciles = df_copy[column].quantile(np.arange(0, 1.1, 0.1)).values
    
    # Define bin edges and labels by using index positions for 0.4 and 0.7
    bins = [-float('inf'), deciles[4], deciles[7], float('inf')]  
    labels = ['low', 'medium', 'high']
    
    # Apply binning
    df_copy[f'{column} [bins]'] = pd.cut(df_copy[column], bins=bins, labels=labels, right=True)
    
    # Cast the final column as categorical
    df_copy[f'{column} [bins]'] = df_copy[f'{column} [bins]'].astype('category')
    
    return df_copy



def prepare_corridors(corridors_df):
    corridors_df = corridors_df.rename(columns={"line_geometries": "geometry"})
    return gpd.GeoDataFrame(corridors_df, geometry="geometry")

def create_vegetation_features(corridors_df, columns_to_categorize, columns_to_rename):
    veg_df = create_features_for_veg(corridors_df, columns_to_rename)
    veg_df["corridor length (km)"] = veg_df["corridor length"]
    veg_df["corridor length (km)"] = veg_df["corridor length (km)"] / 1000
    for column in columns_to_categorize:
        veg_df = categorize_by_deciles(df=veg_df, column=column)
    return veg_df

def prepare_scenario_outcomes(scenario_outcomes):
    scenario_outcomes = scenario_outcomes.groupby(["nearest upstream device", "scenario"])["frequency"].agg("first").unstack()
    scenario_outcomes.columns = [re.sub("_", " ", x) + " frequency" for x in scenario_outcomes.columns]
    return scenario_outcomes.reset_index()

def merge_scenario_outcomes(veg_df, scenario_outcomes):
    return veg_df.merge(scenario_outcomes, how="left", on="nearest upstream device")

def map_frequencies(veg_df, frequency_mapping, frequency_columns):
    for col in frequency_columns:
        veg_df[col] = veg_df[col].map(frequency_mapping)
    return veg_df

def prepare_output_dataframe(veg_df, columns_to_drop, output_columns, rename_columns):
    veg_out = veg_df.drop(columns_to_drop, axis=1)
    veg_out = veg_out[output_columns].rename(columns=rename_columns)
    veg_out['nearest upstream device list'] = veg_out['nearest upstream device list'].fillna('None')
    #veg_out['downstream device list'] = veg_out['downstream device list'].fillna('None')
    non_categorical_cols = veg_out.select_dtypes(exclude=["category"]).columns
    veg_out[non_categorical_cols] = veg_out[non_categorical_cols].fillna(0)
    return veg_out


def prepare_for_sql(veg_corridors_to_sql, veg_units):
    veg_corridors_to_sql.crs = 'EPSG:32647'
    veg_corridors_to_sql = veg_corridors_to_sql.to_crs("epsg:4326")
    veg_corridors_to_sql["feeder id"] = veg_corridors_to_sql["feeder id"].apply(
        lambda x: str(x)
    )
    veg_corridors_to_sql["geometry_wkt"] = veg_corridors_to_sql["geometry"].map(
        lambda x: x.wkt
    )
    veg_corridors_to_sql = veg_corridors_to_sql.drop("geometry", axis=1)
    veg_corridors_to_sql.map(lambda x: round(x, 2) if type(x) == float else x)

    veg_units_sql = veg_units.copy()
    veg_units_sql["polygon"] = veg_units_sql["polygon"].map(lambda x: x.wkt)
    veg_units_sql = veg_units_sql.fillna(0)

    return veg_corridors_to_sql, veg_units_sql

def save_to_sql(df, table_name, conn):
    df["feeder id"] = df["feeder id"].apply(lambda x: str(x))
    df["geometry_wkt"] = df["geometry"].map(lambda x: x.wkt)
    df = df.drop("geometry", axis=1)
    df.map(lambda x: round(x, 2) if isinstance(x, float) else x).to_sql(table_name, conn, if_exists="replace", index=False)

def calculate_weighted_metrics(veg_df):
    veg_df["share line miles"] = veg_df["corridor length"] / veg_df.groupby("feeder id")["corridor length"].transform("sum")
    veg_df["weighted density (%) [META + Sentinel-2]"] = veg_df["average vegetation density (%) [META + Sentinel-2]"] * veg_df["share line miles"]
    veg_df["weighted probability"] = veg_df["probability of outage (%)"] * veg_df["share line miles"]
    return veg_df

def general_clean(veg_df):
    veg_df["nearest upstream device list"] = veg_df["nearest upstream device list"].map(
    lambda x: re.sub(",", "", str(x))
    )
    veg_df["density_distribution_meta"] = veg_df["density_distribution_meta"].map(
        lambda x: re.sub(",", "", str(x))
    )
    return veg_df

def create_veg_units(veg_df, aoj, crs, agg_columns, veg_units_columns):
    veg_units = veg_df[["feeder id", "geometry"]].dissolve("feeder id")
    veg_units = veg_units.merge(
        veg_df.groupby("feeder id").agg(
            risk=pd.NamedAgg("risk (customer interruptions)", "sum"),
            average_probability_of_outage=pd.NamedAgg("weighted probability", "sum"),
            total_original_customer_count=pd.NamedAgg("customers affected (original)", "max"),
            total_adjusted_customer_count=pd.NamedAgg("customers affected (adjusted)", "max"),
            cost_to_trim_meta=pd.NamedAgg("cost to trim (BHT) [META + Sentinel-2]", "sum"),
            cost_to_trim_mjm=pd.NamedAgg("cost to trim (BHT) [MJM]", "sum"),
        ),
        left_index=True,
        right_index=True,
    )
    veg_units = veg_units.rename(columns=agg_columns)
    veg_units["geometry"] = veg_units["geometry"].convex_hull
    veg_units = veg_units.rename(columns={"geometry": "polygon"}).reset_index()
    veg_units = gpd.GeoDataFrame(veg_units, geometry="polygon", crs=crs)
    veg_units = veg_units.sjoin(aoj[["NAME", "geometry"]].rename(columns={"NAME": "Area of Jurisdiction"})).drop("index_right", axis=1)
    return veg_units[veg_units_columns]


def map_and_rename_nearest_upstream_device(
    df: pd.DataFrame, corridors_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Maps the 'full_nearest_upstream_device' column from corridors_df to df,
    renames it to 'nearest upstream device', and removes any existing
    'nearest_upstream_device' or 'nearest upstream device' column in df.

    Parameters:
    - df: pd.DataFrame
        The input DataFrame where mapping should be applied.
    - corridors_df: pd.DataFrame
        The DataFrame containing 'nearest_upstream_device' and 'full_nearest_upstream_device' columns.

    Returns:
    - pd.DataFrame
        The modified DataFrame.
    """
    # Standardize column names for comparison
    possible_columns = ["nearest_upstream_device", "nearest upstream device"]

    # Find the matching column in the input DataFrame
    matching_col = next(
        (col for col in df.columns if col.lower() in possible_columns), None
    )

    if matching_col:
        # Merge the full_nearest_upstream_device column into df
        df = df.merge(
            corridors_df[["nearest_upstream_device", "full_nearest_upstream_device"]],
            how="left",
            left_on=matching_col,
            right_on="nearest_upstream_device",
        )

        # Drop the original nearest upstream device column(s) from df
        df.drop(
            columns=[matching_col, "nearest_upstream_device"],
            inplace=True,
            errors="ignore",
        )

        # Rename the 'full_nearest_upstream_device' column to 'nearest upstream device'
        df.rename(
            columns={"full_nearest_upstream_device": "nearest upstream device"},
            inplace=True,
        )

    return df