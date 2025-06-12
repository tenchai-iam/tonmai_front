import dash
from dash.exceptions import PreventUpdate     # util to cancel Callbacks safely

from dash import (
    html,
    callback,
    Output,
    Input,
    callback_context,
)  # dash basic stuff

import dash_bootstrap_components as dbc  
from src.data_manager import get_aoj_data, get_district_key, get_aoj_primary_key, get_province_key


###########################################################
### Component Creation
##########################################################

def get_language_specific_column(base_key, language="en"):
    """Return the appropriate column name based on language
    
    Args:
        base_key (str): The base column key function (e.g., get_district_key)
        language (str): Language code ('en' for English, 'th' for Thai)
    
    Returns:
        str: The column name to use
    """
    column_mapping = {
        "district": {"en": "District", "th": "เขต"},
        "province": {"en": "Province", "th": "จังหวัด"}
    }
    
    # Default to English if language not supported
    if language not in ["en", "th"]:
        language = "en"
    
    return column_mapping[base_key][language]

def generate_district_selector(language="en"):
    """Make the selector for district with language support"""
    
    df = get_aoj_data()
    district_col = get_language_specific_column("district", language)
    
    districts = df[district_col].drop_duplicates()
    
    # Translate placeholder based on language
    placeholder = "เลือกเขต..." if language == "th" else "Select District..."
    clear_label = "ล้าง" if language == "th" else "Clear"
    
    return dbc.Select(
        id="district_selector",
        placeholder=placeholder,
        options=[{"label": district, "value": district} for district in districts] + [{'label': clear_label, 'value': None}],
    )

def generate_province_selector(language="en"):
    """Make the selector for province with language support"""
    
    df = get_aoj_data()
    province_col = get_language_specific_column("province", language)
    
    provinces = df[province_col].drop_duplicates()
    
    # Translate placeholder based on language
    placeholder = "เลือกจังหวัด..." if language == "th" else "Select Province..."
    clear_label = "ล้าง" if language == "th" else "Clear"
    
    return dbc.Select(
        id="province_selector",
        placeholder=placeholder,
        options=[{"label": province, "value": province} for province in provinces] + [{'label': clear_label, 'value': None}],
    )

def generate_aoj_selector(language="en"):
    """Make the selector for areas of jurisdiction"""
    
    df = get_aoj_data()
    aojs = df[get_aoj_primary_key()].drop_duplicates()

    # Translate placeholder based on language
    placeholder = "เลือก AOJ..." if language == "th" else "Select AOJ ..."
    clear_label = "ล้าง" if language == "th" else "Clear"

    return dbc.Select(
        id="aoj_selector",
        placeholder=placeholder,
        options=[{"label": aoj, "value": aoj} for aoj in aojs]  + [{'label' : clear_label, 'value' : None}],
    )

###########################################################
### Dash Callbacks
##########################################################

def inject_callbacks(app):
    """Returns the app injected with callbacks for district, province & region selector"""

    @app.callback(
        [Output("district_selector_holder", "children"),
         Output("province_selector_holder", "children"),
         Output("aoj_selector_holder", "children")],
        [Input('language-selector', 'value')]
    )
    def update_selectors_language(selected_language):
        # Default to English if language not found or None
        language = selected_language if selected_language in ["en", "th"] else "en"
        
        return [
            generate_district_selector(language),
            generate_province_selector(language),
            generate_aoj_selector(language)
        ]

    @app.callback(
        [Output("province_selector", "value"),
         Output("province_selector", "options")],
        [Input("client_logo", "n_clicks"),
         Input("district_selector", "value"),
         Input('language-selector', 'value')]
    )

    def update_province_options(logo_clicks, selected_district, selected_language):
        ctx = dash.callback_context
        trigger_id = ctx.triggered[0]['prop_id'].split('.')[0]
        
        # Default to English if language not found or None
        language = selected_language if selected_language in ["en", "th"] else "en"
        
        # Get column names based on language
        province_col = get_language_specific_column("province", language)
        district_col = get_language_specific_column("district", language)
        
        # Text for clear option
        clear_label = "ล้าง" if language == "th" else "Clear"
        
        # Handle logo click to clear selection
        if trigger_id == "client_logo":
            if logo_clicks is None or logo_clicks == 0:
                raise PreventUpdate
            
            # Get all provinces for dropdown options
            df = get_aoj_data()
            provinces = df[province_col].drop_duplicates().sort_values()
            province_options = [{"label": province, "value": province} for province in provinces] + [{'label': clear_label, 'value': None}]
            return None, province_options
        
        # Handle district selection change
        if selected_district is None:
            # Get all provinces if district is cleared
            df = get_aoj_data()
            provinces = df[province_col].drop_duplicates().sort_values()
        else:
            # Filter provinces based on district
            df = get_aoj_data()
            filtered_df = df[df[district_col] == selected_district]
            provinces = filtered_df[province_col].drop_duplicates().sort_values()
        
        province_options = [{"label": province, "value": province} for province in provinces] + [{'label': clear_label, 'value': None}]
        return None, province_options
        
    @app.callback(
            [Output("aoj_selector", "value"),
             Output("aoj_selector", "options")],
            [Input("client_logo", "n_clicks"),
             Input("district_selector", "value"),
             Input("province_selector", "value"),
             Input('language-selector', 'value')]
             )
    def update_aoj_options(logo_clicks, selected_district, selected_province, selected_language):
        ctx = dash.callback_context
        trigger_id = ctx.triggered[0]['prop_id'].split('.')[0]
        
        # Default to English if language not found or None
        language = selected_language if selected_language in ["en", "th"] else "en"
        
        # Determine which column to use based on language
        province_col = "จังหวัด" if language == "th" else get_province_key()
        district_col = "เขต" if language == "th" else get_district_key()
        
        # Text for clear option
        clear_label = "ล้าง" if language == "th" else "Clear"
        
        # Handle logo click to clear selection
        if trigger_id == "client_logo":
            if logo_clicks is None or logo_clicks == 0:
                raise PreventUpdate
            # Get all AOJs for dropdown options
            df = get_aoj_data()
            aojs = df[get_aoj_primary_key()].drop_duplicates().sort_values()
            aoj_options = [{"label": aoj, "value": aoj} for aoj in aojs] + [{'label': clear_label, 'value': None}]
            return None, aoj_options
        
        # Start with full dataset
        df = get_aoj_data()
        
        # Apply filters sequentially
        if selected_district is not None:
            df = df[df[district_col] == selected_district]
        
        if selected_province is not None:
            df = df[df[province_col] == selected_province]
        
        # Get filtered AOJs
        aojs = df[get_aoj_primary_key()].drop_duplicates().sort_values()
        aoj_options = [{"label": aoj, "value": aoj} for aoj in aojs] + [{'label': clear_label, 'value': None}]
        
        return None, aoj_options
    
    return app





