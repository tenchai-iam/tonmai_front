import os
from enum import Enum

class SOLUTIONS(Enum):
    VEGETATION_MANAGEMENT = "Vegetation Management"
    
regional_tables = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: "veg_units",
}

asset_tables = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: "veg_features",
}

cluster_fields = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: "feeder id",
}

asset_fields = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: "nearest upstream device",
}

raw_asset_tables = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: "veg_raw",
}


shap_tables = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value : "veg_shap_features"
}

scenario_tables = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value : "veg_scenarios"
}
