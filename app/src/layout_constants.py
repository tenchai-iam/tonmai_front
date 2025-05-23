import os
import src.runtime_charts as runtime_charts
import src.veg_components.veg_content as veg
from src.data_constants import asset_fields, SOLUTIONS

ASSETS_DIR = os.path.join("app", "assets")
REGIONAL_MAP_DIR = os.path.join(ASSETS_DIR, "regional_maps")
SUBREGIONAL_MAP_DIR = os.path.join(ASSETS_DIR, "subregional_maps")

### Lookup of what to call each asset "unit" for a given solution. E.g. the word "Corridor" for veg.
solution_units = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: "Corridor",
}


### Look up of data needed to populate charts that describe the overall solution results. For now, these are static images.
### Later I would like to make these more dynamic. Like simulation results.

overview_modal_options = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: {
        "Model Performance (AUC)": {
            "title": "Model Performance (AUC)",
            "layout_function": veg.auc,
        },
        "How does the model work": {
            "title": "How the model works (shap chart)",
            "layout_function": veg.shap_chart,
        },
        "Expected Risk Concentration Curve": {
            "title": "Expected Risk Concentration Curve",
            "layout_function": veg.risk,
        },
        "Expected Probability of Failure Concentration Curve": {
            "title": "Expected Probability of Failure Concentration Curve",
            "layout_function": veg.health_concentration,
        },
        "Decile plot of test set":{
            "title": "Decile plot of test set",
            "layout_function": veg.decile_plot,
        },
        "Risk achieved curve": {
            "title": "Risk achieved curve",
            "layout_function": veg.risk_achieved_curve_chart,
        },
        "Risk achieved curve (SAIFI)": {
            "title": "Risk achieved curve (SAIFI)",
            "layout_function": veg.risk_achieved_saifi_curve_chart,
        },
        "Scenario Comparisons - Risk": {
            "title": "Expected Risk Removed by Scenario",
            "layout_function": veg.scenario_bar_chart_risk_removed,
        },
        
        "Scenario Comparisons - Cost": {
            "title": "Expected Cost by Scenario",
            "layout_function": veg.scenario_bar_chart_cost,
        },

        "Scenario Comparisons - SAIFI": {
            "title": "Optimized Saifi by Scenario",
            "layout_function": veg.scenario_bar_chart_saifi,
        },
        
        "Table Exports": {
            "title": "Asset overview",
            "layout_function": veg.full_asset_table,
        },
    },
}


### Lookup of options for maps at the highest level (regions / clusters)
### These are pregenerated maps, so this is just helping to find the path to the right .html file
map_color_scheme_options = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: [
        {
            "label": "Risk (Customer Interruptions)", 
            "value": "Risk (Customer Interruptions)"
        },
        {
            "label": "Avg. Prob. Outage (%)",
            "value": "Avg. Prob. Outage (%)",
        },
        # {
        #     "label": "Max Consequence of Outage", 
        #     "value": "Max Consequence of Outage"
        # },
        {
            "label": "Customers Affected (Original)", 
            "value": "Customers Affected (Original)"
        },
        {
            "label": "Customers Affected (Adjusted)", 
            "value": "Customer Affected (Adjusted)"
        },
        {
            "label": "Cost to Trim (BHT) [META + Sentinel-2]", 
            "value": "Cost to Trim (BHT) [META + Sentinel-2]"},
        {
            "label": "Cost to Trim (BHT) [MJM]", 
            "value": "Cost to Trim (BHT) [MJM]"
        },
    ],
}


### Lookup of options for maps one level down; zoomed in on a (region / cluster)
### These are pregenerated maps, so this is just helping to find the path to the right .html file
subregion_map_color_scheme_options = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: [
        {
            "label": "Risk (Customer Interruptions)", 
            "value": "Risk (Customer Interruptions)"
        },
        {
            "label": "Risk (Customer Interruptions, Binned)", 
            "value": "Risk (Customer Interruptions, Binned)"
        },
        {
            "label": "Cost to Trim (BHT) [MJM]", 
            "value": "Cost to Trim (BHT) [MJM]"
        },
        
        {
            "label": "Cost to Trim (BHT) [META + Sentinel-2]", 
            "value": "Cost to Trim (BHT) [META + Sentinel-2]"
        },
        {
            "label": "Customers Affected (Original)", 
            "value": "Customers Affected (Original)"
        },
        {
            "label": "Customers Affected (Adjusted)", 
            "value": "Customers Affected (Adjusted)"
        },
        {
            "label": "Customers Affected (Adjusted) [Binned]", 
            "value": "Customers Affected (Adjusted) [Binned]"
        },
        {
            "label": "Probability of Outage (%)", 
            "value": "Probability of Outage (%)"
        },
        {
            "label": "Probability of Outage (%, Binned)", 
            "value": "Probability of Outage (%, Binned)"
        },
        # {
        #     "label": "Vegetation Density (%) (MJM)", 
        #     "value": "Vegetation Density (%) (MJM)"
        # },
        {
            "label": "Vegetation Density (%) [META + Sentinel-2]", 
            "value": "Vegetation Density (%) [META + Sentinel-2]"
        },
        {
            "label": "Chosen Scenario", 
            "value": "Chosen Scenario"
        },
        {
            "label": "Cost Focus Scenario Frequency", 
            "value": "Cost Focus Scenario Frequency"
        },
        {
            "label": "Reliability Focus Scenario Frequency", 
            "value": "Reliability Focus Scenario frequency"
        },
        
    ],
}


### Lookup of options for generating deep dive modal content that shows charts for a single asset
### These are NOT pregenerated! They need to have a function that generates the desired content at runtime.
asset_modal_options = {
    SOLUTIONS.VEGETATION_MANAGEMENT.value: {
        # "Expected Number of Outage Events Ranking": {
        "Probability of Outage Ranking": {
            "title": "Probability of Outage Ranking",
            "layout_func": veg.asset_outage_ranking,
            "description": "",
        },
        "Customers at Risk Ranking": {
            "title": "Customers at Risk Ranking",
            "layout_func": veg.asset_customers_at_risk_ranking,
            "description": "",
        },
        "Expected Customer Interruptions Ranking": {
            "title": "Expected Customer Interruptions Ranking",
            "layout_func": veg.asset_risk_ranking,
            "description": "",
        },
        "Shap Breakdown of Corridor Probability of Outage": {
            "title": "Shap Breakdown of Corridor Probability of Outage",
            "layout_func": veg.asset_shap_waterfall,
            "description": "",
        },
    },
}
