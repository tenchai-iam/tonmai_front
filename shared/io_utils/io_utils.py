import anyconfig
import pandas as pd
import geopandas as gpd
import glob
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import os
from shapely.wkt import loads
from sqlalchemy.engine.base import Engine
import io
from sqlalchemy.dialects.mssql import VARBINARY

load_function_map = {
        'xlsx' : pd.read_excel,
        'csv' : pd.read_csv,
        'shp' : gpd.read_file,
        'gdb' : gpd.read_file,
    }


def modify_catalog_file_name(catalog_name):
    try:
        catalog = anyconfig.load(os.path.join('conf', 'catalog.yml'))
    except:
        print("Failed to load catalog. Ensure that your working directory is the project root and that the catalog file is at conf/catalog.yml")
        return float('NaN'), float('NaN')

    dataset = catalog.get(catalog_name, float('NaN'))
    
    ### Throw an error if the file is not found
    if pd.isnull(dataset):
        print(f"The name {catalog_name} does not appear in the catalog file.")
        return float('NaN'), float('NaN')
    
    ### Get the filepath to the dataset
    file_path = dataset.get('filepath', float('NaN'))
    db_file_path = ('.').join(file_path.split('.')[:-1])
    file_name = db_file_path.split('.')[-1]
    db_file_path = db_file_path.replace('/', '.')
    return file_path, db_file_path

def read_from_db(catalog_name: str, schema_name: str, engine: Engine) -> pd.DataFrame:
    """Read data from the database and return a DataFrame."""
    file_path, table_name = modify_catalog_file_name(catalog_name)
    query = "SELECT * FROM [" + schema_name + "].[" + table_name + "]"
    ok = 0
    with engine.connect() as connection:
        df = pd.read_sql_query(query, connection)
    for column in df.columns:
        if 'geometr' in str(column).lower() or 'polygon' == str(column).lower():  # Check if the column name contains 'geometry'
            try:
                # Convert the WKT to Shapely geometry
                df[column] = df[column].apply(lambda x: loads(x) if isinstance(x, str) else x)
                geom_col = column
            except Exception as e:
                ok = 1
                # Skip if the conversion fails and log the error
    try:
        df = gpd.GeoDataFrame(df, geometry = geom_col)
    except Exception as e:
        ok = 1
    return df, file_path

def write_to_db(df: pd.DataFrame, catalog_name: str, schema_name: str, engine: Engine, if_exists: str = 'replace') -> None:
    """Write a DataFrame to a database table."""
    ok=0
    file_path, table_name = modify_catalog_file_name(catalog_name)
    for column in df.columns:
        if 'geometr' in str(column).lower() or 'polygon' == str(column).lower():  # Check if the column name contains 'geometry'
            try:
                # Convert the WKT to Shapely geometry
                df[column] = df[column].apply(lambda x: x.wkt if x is not None else None)
            except Exception as e:
                ok=1
    try:
        with engine.connect() as connection:
            df.to_sql(table_name, con=connection, schema=schema_name, if_exists=if_exists, index=False)
    except Exception as e:
            print(f'Could not save file {file_path} : {e}')
           
def save_image_to_db(fig: plt.Figure, image_name: str, catalog_name: str, schema_name: str, engine: Engine, if_exists: str = 'append') -> None:
    """
    Save a matplotlib figure to a database as a binary blob.
    
    Args:
        fig (plt.Figure): The matplotlib figure to save.
        image_name (str): Name of the image.
        table_name (str): Name of the table where the image will be stored.
        schema_name (str): Schema name for the table.
        engine (Engine): SQLAlchemy engine connected to the database.
        if_exists (str): Behavior if the table already exists. Options: 'replace', 'append'.
    """
    # Save the figure to a binary buffer
    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    
    # Create a DataFrame for storage
    df = pd.DataFrame({
        'image_name': [image_name],
        'image_data': [buf.read()]  # Store as binary
    })
    buf.close()
    
    # Define the column types explicitly for binary data
    dtype = {'image_data': VARBINARY}
    file_path, table_name = modify_catalog_file_name(catalog_name)
    # Save the DataFrame to the database
    with engine.connect() as connection:
        df.to_sql(
            table_name,
            con=connection,
            schema=schema_name,
            if_exists=if_exists,
            index=False,
            dtype=dtype  # Ensure binary data is handled correctly
        )

def read_image_from_db(image_name: str, catalog_name: str, schema_name: str, engine: Engine) -> plt.Figure:
    """
    Retrieve a matplotlib figure from the database by image name.
    
    Args:
        image_name (str): Name of the image to retrieve.
        table_name (str): Name of the table where the image is stored.
        schema_name (str): Schema name for the table.
        engine (Engine): SQLAlchemy engine connected to the database.
    
    Returns:
        plt.Figure: The retrieved matplotlib figure.
    """
    # Query the database for the image
    file_path, table_name = modify_catalog_file_name(catalog_name)
    query = "SELECT * FROM [" + schema_name + "].[" + table_name + "]"
    ok = 0
    with engine.connect() as connection:
        df = pd.read_sql_query(query, connection)    
    if df is None:
        raise ValueError(f"Image with not found in {schema_name}.{table_name}.")
    
    # Load the binary image data into a matplotlib figure
    buf = io.BytesIO(df['image_data'].values[0])
    fig = plt.figure()
    img = plt.imread(buf, format='png')
    plt.imshow(img)
    plt.axis('off')  # Hide axes for an image
    buf.close()
    
    return fig, file_path


def load_and_save_images(catalog_name, schema_name, local_image_path, engine):
    image, file_path = read_image_from_db(catalog_name, catalog_name, schema_name, engine)
    image_name = file_path.split('/')[-1]
    local_path = os.path.join(local_image_path, "images")
    os.makedirs(local_path, exist_ok=True)
    local_image_path_complete = os.path.join(local_path, image_name)
    image.savefig(local_image_path_complete, format="png")

    


def load_file_from_catalog(catalog_name, base_path=""):
    """
    Loads a file from the catalog. The appropriate loading function will be inferred automatically. If the file name is not defined in the catalog an error will be thrown. Any load or save args required for the file should be specified in the catalog.
    
    Parquet files will be attempted to be loaded with geopandas before pandas
    """
    
    
    ### Get the Catalog
    try:
        catalog = anyconfig.load(os.path.join('conf', 'catalog.yml'))
    except:
        print("Failed to load catalog. Ensure that your working directory is the project root and that the catalog file is at conf/catalog.yml")
        return float('NaN'), float('NaN')    

    dataset = catalog.get(catalog_name, float('NaN'))
    
    ### Throw an error if the file is not found
    if pd.isnull(dataset):
        print(f"The name {catalog_name} does not appear in the catalog file.")
        return float('NaN'), float('NaN')    
    
    ### Get the filepath to the dataset
    file_path = dataset.get('filepath', float('NaN'))
    file_path = base_path + file_path
    if pd.isnull(dataset):
        print(f"The catalog entry {catalog_name} does not have a filepath argument.")
        return float('NaN'), float('NaN')    
    
    ### Get the file type by assuming that the file name has exactly one period in it with a standard file suffix afterwards. This will need customization if pulling from a DB!
    file_type = file_path.split('.')[-1]
    
    
    ### Parquets can be saved with either pandas or geopandas
    ### although they're both parquets, they're not interchangeable due to nuances of the geometry columns. We try geopandas first.
    if file_type == 'parquet':
        try:
            return gpd.read_parquet(file_path, **dataset.get('load_args', {})), file_path
        except:
            return pd.read_parquet(file_path, **dataset.get('load_args', {})), file_path
    if file_type == 'png':
        return mpimg.imread(file_path), file_path


            
    ### Everything except parquet's we just look up the standard function to use    
    function = load_function_map.get(file_type, float('NaN'))
    
    ### Error handling
    if pd.isnull(function):
        print(f"The file type appears to be {file_type} which is not handled by this function. Check src/io_utils/py if you need to adapt it.")
        return float('NaN'), float('NaN')
    
    return function(file_path, **dataset.get('load_args', {})), file_path
    




def save_file_via_catalog(df, catalog_name, base_path=""):
    """
    Saves a file using the catalog. The appropriate saving function will be inferred automatically. If the file name is not defined in the catalog an error will be thrown. Any load or save args required for the file should be specified in the catalog.
    """
    try:
        catalog = anyconfig.load(os.path.join('conf', 'catalog.yml'))
    except:
        print("Failed to load catalog. Ensure that your working directory is the project root and that the catalog file is at conf/catalog.yml")
        return float('NaN')
    
    dataset = catalog.get(catalog_name, float('NaN'))
    if pd.isnull(dataset):
        print(f"The name {catalog_name} does not appear in the catalog file.")
        return float('NaN')
    
    file_path = dataset.get('filepath', float('NaN'))
    file_path = base_path + file_path
    folder_path = os.path.dirname(file_path)
    os.makedirs(folder_path, exist_ok=True)

    if pd.isnull(dataset):
        print(f"The catalog entry {catalog_name} does not have a filepath argument.")
        return float('NaN')
        
    ### Get the function to call
    ### We have to do a two step process in order to possibly call GeoDataFrame specific methods
    ### to avoid errors
    if isinstance(df, pd.DataFrame):
        file_type = file_path.split('.')[-1]
        function = {
            'parquet' : df.to_parquet,
            'xlsx' : df.to_excel,
            'csv' : df.to_csv,
        }.get(file_type, float('NaN'))
        
        if pd.isnull(function):
            function = {
            'shp' : df.to_file,
            'gdb' : df.to_file,
        }.get(file_type, float('NaN'))
            
    elif isinstance(df, plt.Figure):
        try:
            df.savefig(file_path, **dataset.get('save_args', {}))
            return 1
        except Exception as e:
            print(f"Failed to save figure. Error: {e}")
            return float('NaN')

    
    return function(file_path, **dataset.get('save_args', {}))


def load_param(param_name_in_catalog):
    """
    Gets a parameter, by name, as defined in a .yml file in `project/conf/parameters/`
    
    You do not need to specify which parameters file. This function will look through all of them in that folder.
    
    This will fail if your current working directory is not set to the project root
    
    Use parameters as a way to avoid declaring global constants anywhere in the code where possible.
    
    """
    
    params = {}
    directory_path = os.path.join('conf', 'parameters')
    pattern = os.path.join(directory_path, '*.yml')
    param_files = glob.glob(pattern)
    for param_file in param_files:
        f = anyconfig.load(param_file)
        overlapped_keys = [existing_param for existing_param in params if existing_param in list(f.keys())]
        if len(overlapped_keys) > 0:
            print(f"Warning: there are overlapping keys in parameter files: {overlapped_keys}. Ensure each key is used only one time!")
        params = params | f
    
    return params[param_name_in_catalog]
