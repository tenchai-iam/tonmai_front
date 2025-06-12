import sys
import os
from pathlib import Path

# Get the project root directory
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))

import shared.preprocessing.data_preprocessing as funcs
import shared.cleaning_functions.general_cleaning_functions as general_cleaning_functions
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
from shared.io_utils import io_utils
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

    print("Running pipeline01...")  # Add this

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

    # Load files
    #print(f"About to read aoj with schema: 'corridor_model', table: 'areas_of_jurisdiction'")
    aoj, _= io_utils.read_from_db("areas_of_jurisdiction", "corridor_model", engine)
    #print(f"Finished reading aoj data")
    corridors_df, _= io_utils.read_from_db("front_end_input", "risk_modeling", engine)
    scenario_outcomes, _= io_utils.read_from_db("optimization_scenarios", "risk_modeling", engine)
    scenario_features, _= io_utils.read_from_db("optimization_metrics", "risk_modeling", engine)
    shap_features, _= io_utils.read_from_db("model_shap_features", "risk_modeling", engine)
    values_df, _= io_utils.read_from_db("model_inputs_prediction", "risk_modeling", engine)

    # Load parameters
    raw_data_processing_parameters = io_utils.load_param("raw_data_processing_parameters")
    local_path = io_utils.load_param("local_path")

    # Process data
    full_corridor_name = corridors_df[
    ["nearest_upstream_device", "full_nearest_upstream_device"]
    ]
    corridors_df = corridors_df.drop("nearest_upstream_device", axis=1).rename(
        columns={"full_nearest_upstream_device": "nearest_upstream_device"}
    )
    scenario_outcomes = scenario_outcomes.rename(
        columns={"nearest_upstream_device": "nearest upstream device"}
    )
    shap_features = shap_features.rename(
        columns={"full_nearest_upstream_device": "nearest upstream device"}
    )
    values_df = values_df.drop("nearest_upstream_device", axis=1).rename(
        columns={"full_nearest_upstream_device": "nearest upstream device"}
    )
    shap_features = funcs.map_and_rename_nearest_upstream_device(
        df=shap_features, corridors_df=full_corridor_name
    )
    scenario_outcomes = funcs.map_and_rename_nearest_upstream_device(
        df=scenario_outcomes, corridors_df=full_corridor_name
    )
    scenario_features["scenario"] = scenario_features["scenario"].replace(
        {
            "scenario_1": "Reliability Focus Scenario",
            "scenario_2": "Cost Focus Scenario",
            "scenario_chosen": "Chosen Scenario",
        }
    )
    aoj["NAME"] = aoj["NAME"].map(lambda x: re.sub(r"\.", "", x))
    corridors_df = funcs.prepare_corridors(corridors_df)
    veg_df = funcs.create_vegetation_features(
        corridors_df,
        raw_data_processing_parameters["columns_to_categorize"],
        raw_data_processing_parameters["column_renames"],
    )
    scenario_outcomes = funcs.prepare_scenario_outcomes(scenario_outcomes)
    veg_df = funcs.merge_scenario_outcomes(veg_df, scenario_outcomes)

    veg_df = funcs.map_frequencies(
    veg_df,
    raw_data_processing_parameters["frequency_mapping"],
    raw_data_processing_parameters["frequency_columns"],
)
    
    veg_out = funcs.prepare_output_dataframe(
    veg_df,
    raw_data_processing_parameters["columns_to_drop"],
    raw_data_processing_parameters["output_columns"],
    raw_data_processing_parameters["rename_columns"],
)
    
    veg_df = funcs.calculate_weighted_metrics(veg_df)
    veg_df = funcs.general_clean(veg_df)

    veg_units = funcs.create_veg_units(
    veg_df,
    aoj,
    corridors_df.crs,
    raw_data_processing_parameters["agg_columns"],
    raw_data_processing_parameters["veg_units_columns"],
)
    
    veg_out_sql, veg_units_sql = funcs.prepare_for_sql(veg_out, veg_units)

    io_utils.write_to_db(veg_out, "veg_features", "front_end_visualization", engine, "replace")
    io_utils.write_to_db(veg_units, "veg_clusters", "front_end_visualization", engine, "replace")

    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    conn = sqlite3.connect(local_path + '/digital_twin_database.sqlite')
    
    veg_out_sql.to_sql("veg_features", conn, if_exists="replace", index=False)
    veg_units_sql.to_sql("veg_units", conn, if_exists="replace", index=False)
    scenario_features.to_sql("veg_scenarios", conn, if_exists="replace", index=False)
    shap_features.to_sql("veg_shap_features", conn, if_exists="replace", index=False)
    values_df[list(shap_features)].to_sql("veg_raw", conn, if_exists="replace", index=False)
    aoj[['NAME', 'Province', 'จังหวัด', 'District', 'เขต']].to_sql("areas_of_jurisdiction", conn, if_exists="replace", index=False)

    # existing pipeline logic
    print("pipeline01 finished successfully!")  # Add this
