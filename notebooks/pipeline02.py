import sys
import os
from pathlib import Path

# Get the project root directory
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))

import folium
from shared.io_utils import io_utils
import shared.preprocessing.pregenerated_maps as funcs
import shared.cleaning_functions.general_cleaning_functions as general_cleaning_functions
from concurrent.futures import ThreadPoolExecutor, as_completed
from sqlalchemy import create_engine
from sqlalchemy.engine import URL

import sqlite3

from dotenv import load_dotenv
load_dotenv()

def run():
    # general_cleaning_functions.log_detail("Initialize database engine.")
    # # Create URL object
    # connection_url = URL.create(
    # "mssql+pyodbc",
    # username=os.environ.get("DB_USERNAME"),
    # password=os.environ.get("DB_PASSWORD"),
    # host=os.environ.get("DB_SERVER"),
    # port=os.environ.get("DB_PORT"),
    # database=os.environ.get("DB_NAME"),
    # query={
    #     "driver": "ODBC Driver 17 for SQL Server",
    #     "TrustServerCertificate": "yes",
    #     "Encrypt": "no",
    #     "timeout": "120",
    # }
    # )

    # # Create engine with modified settings
    # engine = create_engine(
    #     connection_url,
    #     pool_size=5,
    #     max_overflow=10,
    # )

    print("Running pipeline02...")  # Add this

    general_cleaning_functions.log_detail("Initialize database engine.")
    # Create URL object
    connection_url = URL.create(
    "mssql+pyodbc",
    username="sa",
    password="P@ssw0rd",
    host="172.16.104.40",
    port="59356",
    database="VEGETATION",
    query={
        "driver": "ODBC Driver 17 for SQL Server",
        "TrustServerCertificate": "yes",
        "Encrypt": "no",
        "timeout": "120",
    }
    )

    # Create engine with modified settings
    engine = create_engine(
        connection_url,
        pool_size=5,
        max_overflow=10,
    )
        
    # Load Data
    devices, _= io_utils.read_from_db("protective_devices", "corridor_model", engine)
    devices.crs = 'EPSG:32647'
    veg_clusters, _= io_utils.read_from_db("veg_clusters", "front_end_visualization", engine)
    veg_clusters.crs = 'EPSG:32647'
    corridors, _= io_utils.read_from_db("veg_features", "front_end_visualization", engine)
    corridors.crs = 'EPSG:32647'
    aoj_df, _= io_utils.read_from_db("areas_of_jurisdiction", "corridor_model", engine)
    aoj_df.crs = 'EPSG:32647'

    # Load parameters
    pregenerate_maps_parameters = io_utils.load_param("pregenerate_maps_parameters")
    local_path = io_utils.load_param("local_path")

    # Process Data
    veg_clusters = funcs.rename_columns(
    veg_clusters, pregenerate_maps_parameters["veg_clusters_rename"]
    )
    corridors = funcs.rename_columns(
        corridors, pregenerate_maps_parameters["veg_features_rename"]
    )
    veg_clusters = funcs.round_columns(
        veg_clusters, pregenerate_maps_parameters["veg_clusters_round"], decimals=2
    )
    corridors = funcs.round_columns(
        corridors, pregenerate_maps_parameters["veg_features_round"], decimals=2
    )
    corridors = funcs.filter_columns(
        corridors, pregenerate_maps_parameters["corridors_columns"]
    )
    feeder_level_map_views = funcs.map_views(
        veg_clusters, pregenerate_maps_parameters["feeder_level_map_views_exclude"]
    )
    corridor_level_map_views = funcs.map_views(
        corridors, pregenerate_maps_parameters["corridor_level_map_views_exclude"]
    )
    aoj = funcs.clean_column_values(aoj_df, "NAME", r"\.", "")

    # Create regional maps
    def run_in_parallel(func, features):
        with ThreadPoolExecutor(max_workers=1) as executor:
            futures = [executor.submit(func, feature) for feature in features]
            for i, future in enumerate(as_completed(futures), 1):
                try:
                    future.result()
                    print(f"Task {i}/{len(futures)} completed successfully.")
                except Exception as e:
                    print(f"Task {i}/{len(futures)} failed with error: {e}")
                    

    def veg_region(feature):
        path = os.path.join(
            local_path,
            "regional_maps",
            "Vegetation Management",
            aoj + "_" + feature + ".html",
        )
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print(f"Generating map for: {path}")

        m = funcs.generate_regional_map(
            veg_clusters.loc[veg_clusters["Area of Jurisdiction"] == aoj], feature
        )
        m.save(path, encoding="utf-8")
        funcs.add_zoom_in_function(path, cluster_field="Feeder ID")


    for aoj in veg_clusters["Area of Jurisdiction"].drop_duplicates():
        run_in_parallel(veg_region, feeder_level_map_views)

    ### Seperate device dataframe into assets and sources
    # Create device dataframe for sources
    devices_source = devices[devices["device_type"] == "Source"].reset_index(drop=True)

    # Create a buffer around the point (e.g., with a radius of 1 unit)
    devices_source["geometry"] = devices_source["geometry"].buffer(30)

    # Get the envelope (bounding box) of the buffer
    devices_source["geometry"] = devices_source["geometry"].envelope

    # Create device dataframe for devices
    devices_assets = devices[devices["device_type"] != "Source"].reset_index(drop=True)
    devices_assets["device_type"] = devices_assets["device_type"].replace({"Dynamic Protective Device": "recloser"})

    # Generate subregional maps
    def veg_subregion(cluster):
        path = os.path.join(
            local_path,
            "subregional_maps",
            "Vegetation Management",
            f"{feature}_{cluster}.html",
        )
        os.makedirs(os.path.dirname(path), exist_ok=True)
        m = funcs.generate_subregional_map(
            corridors.loc[corridors["Feeder ID"] == cluster],
            feature,
            ### These vmin and vmax entires determine the logic of the color scheme upper and lower bounds
            vmin=(
                corridors[feature].quantile(0.2)
                if type(corridors[feature].iloc[0]) != str
                else None
            ),
            vmax=(
                corridors[feature].quantile(0.9)
                if type(corridors[feature].iloc[0]) != str
                else None
            ),
            shape_type="lines",
        )

        m = devices_source.loc[devices_source["FEEDERID"] == cluster].explore(
            m=m,
            column="device_type",
            color="black",
            name="sources",
            style_kwds={"weight": 10},
        )

        # assets map
        custom_colors = [
            "#8B4513",  # SaddleBrown
            "#FF8C00",  # DarkOrange
            "#800080",  # Purple
            "#8B008B",  # DarkMagenta
            "#483D8B",  # DarkSlateBlue
            "#708090",  # SlateGray
            "#2F4F4F",  # DarkSlateGray
            "#DA70D6",  # Orchid
        ]
        devices_assets_cluster = devices_assets.loc[devices_assets["FEEDERID"] == cluster]
        if not devices_assets_cluster.empty:
            m = devices_assets_cluster.explore(
                m=m,
                column="device_type",
                cmap=custom_colors,
                name="devices",
                style_kwds={"weight": 10},
            )
        else:
            print(f"No data for devices_assets for cluster {cluster}")

        ### For some reason this MUST be called AFTER adding extra shape layers otherwise the extra layers don't show?
        folium.LayerControl().add_to(m)

        m.save(path)
        funcs.add_asset_selection_function(path, "Nearest Upstream Device")


    for feature in corridor_level_map_views[::-1]:
        print(f"Generating maps for {feature}")
        run_in_parallel(veg_subregion, corridors["Feeder ID"].drop_duplicates())

    ### Generate categorical maps for selected columns
    selected_cat_cols = ['Risk (Customer Interruptions) [Category]', 
                        'Cost Focus Scenario Frequency',
                        'Reliability Focus Scenario Frequency',
                        'Chosen Scenario']
    
    def veg_subregion_categorical(cluster):
        path = os.path.join(
            local_path,
            "categorical_maps",
            "Vegetation Management",
            f"{feature}_{cluster}_{cat}.html",
        )
        os.makedirs(os.path.dirname(path), exist_ok=True)
        m = funcs.generate_subregional_cat_map(
            corridors.loc[(corridors["Feeder ID"] == cluster) & (corridors[feature] == cat)],
            feature,
            cat,
            ### These vmin and vmax entires determine the logic of the color scheme upper and lower bounds
            vmin=(
                corridors[feature].quantile(0.2)
                if type(corridors[feature].iloc[0]) != str
                else None
            ),
            vmax=(
                corridors[feature].quantile(0.9)
                if type(corridors[feature].iloc[0]) != str
                else None
            ),
            shape_type="lines",
        )

        m = devices_source.loc[devices_source["FEEDERID"] == cluster].explore(
            m=m,
            column="device_type",
            color="black",
            name="sources",
            style_kwds={"weight": 10},
        )

        # assets map
        custom_colors = [
            "#8B4513",  # SaddleBrown
            "#FF8C00",  # DarkOrange
            "#800080",  # Purple
            "#8B008B",  # DarkMagenta
            "#483D8B",  # DarkSlateBlue
            "#708090",  # SlateGray
            "#2F4F4F",  # DarkSlateGray
            "#DA70D6",  # Orchid
        ]
        devices_assets_cluster = devices_assets.loc[devices_assets["FEEDERID"] == cluster]
        if not devices_assets_cluster.empty:
            m = devices_assets_cluster.explore(
                m=m,
                column="device_type",
                cmap=custom_colors,
                name="devices",
                style_kwds={"weight": 10},
            )
        else:
            print(f"No data for devices_assets for cluster {cluster}")

        ### For some reason this MUST be called AFTER adding extra shape layers otherwise the extra layers don't show?
        folium.LayerControl().add_to(m)

        m.save(path)
        funcs.add_asset_selection_function(path, "Nearest Upstream Device")

    for feature in corridor_level_map_views[::-1]:
        print(f"Generating maps for {feature}")
        if feature in selected_cat_cols:
            feature_cat_list = corridors[feature].unique()
            for cat in feature_cat_list:
                run_in_parallel(veg_subregion_categorical, corridors["Feeder ID"].drop_duplicates())

    # Area of Jurisdiction
    m = aoj_df[["NAME", "geometry"]].explore(
        color="#460D5C", tiles=folium.TileLayer("cartodbpositron", min_zoom=6)
    )

    path = os.path.join(local_path, f"areas_of_jurisdiction_map.html")

    m.save(path)
    funcs.add_aoj_selection_function(path, aoj_name_column="NAME")

    # Save 
    io_utils.load_and_save_images("model_outputs_decile_km_image", "risk_modeling", local_path, engine)
    io_utils.load_and_save_images("opti_curve_risk_image", "risk_modeling", local_path,  engine)
    io_utils.load_and_save_images("opti_curve_saifi_image", "risk_modeling", local_path, engine)
    io_utils.load_and_save_images("model_outputs_shaps_image", "risk_modeling", local_path, engine)
    io_utils.load_and_save_images("roc_image", "risk_modeling", local_path, engine)
    io_utils.load_and_save_images("risk_concentration_image", "risk_modeling", local_path, engine)
    io_utils.load_and_save_images("model_outputs_health_concentration_image", "risk_modeling", local_path, engine)

    print("pipeline02 finished successfully!")