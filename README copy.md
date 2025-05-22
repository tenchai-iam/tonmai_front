# VEGX_THAILAND_FRONT_END
## Outline of this README

- [Introduction](#introduction)
- [Installation Instructions](#installation-instructions)
- [Pipeline Structure](#Pipeline-structure)
- [How To](#how-to)
- [Specific Parameters](#specific-parameters)
- [Additional-notes](#Additional-notes)
- [Contact & Support](#contact--support)



## Introduction

This pipeline creates a portable dash web app that serves as a digital twin for vegetation maintenance. **This version is temporary** in order to be able to run the app locally via command line until its deployment is complete.

## Installation Instructions

0) Make sure to have SQL Server ODBC Driver 17 in your machine to connect to PEA SQL database

For Microsoft, follow the instructions here: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16

1) Clone this repo to your local machine, e.g.,

    ```bash
    git clone https://github.com/McK-Private/vegx_thailand_front_end.git
    ```

*  **NOTE**:Please create an individual branch for testing and do not commit changes to main unless code has been thoroughly reviewed and tested

2) Create virual environment, after installing [Conda](https://conda.io/projects/conda/en/latest/user-guide/install/index.html) to your machine.

    From the terminal, run:

    ```bash
    conda init
    conda create --name test_thailand_digital_twin_env python=3.12.4
    ```

3) Activate the environment. From the terminal, run:

    ```bash
    conda activate test_thailand_digital_twin_env
    ```

4) Make sure the environment is activated. `(test_thailand_digital_twin_env)` should be visible to the left of your terminal command line. Then install all the packages in requirements.txt by invoking:

    ```bash
    pip install -r requirements.txt
    ```

5) Install pre-commit so the repo is automatically formatted to [black](https://ljvmiranda921.github.io/notebook/2018/06/21/precommits-using-black-and-flake8/).

    From the terminal, run

    ```bash
    pre-commit install

    # optional (this will run automatically with each commit)
    pre-commit run --all-files
    ```

## Pipeline-Structure

This pipeline codebase is structured as follows:

```bash

├── front_end
│   │
│   ├── app/assets - stores the maps and images that will be loaded in the app 
│   │
│   ├── F2_processed - stores parquet files created from the risk analytics pipeline outaputs and cleaned to be ready for visualization
│
├── notebooks
│   ├── 01_process_raw_data.ipynb: cleanes resulting tables from risk modeling, beautify column names and values and process data into the tables needed to create maps
│   │
│   ├── 02_pregenerate_maps.ipynb: generate regional and subregional maps 
│
└── src
│   ├── cleaning_functions
│   |   ├── general_cleaning_functions.py: logging functions to store outputs in UAT.txt and logs.txt
│   ├── io_utils
│   |   ├── io_utils.py: reades and writes files to database or local
│   ├── preprocessing
│   |   ├── data_preprocessing.py: functions to clean and process tables
│   |   ├── pregenerated_maps.py: functions to generate maps from table
├── app
│   |   ├── app.py: function that runs the app using the maps and images generated in the notebooks

```

## How-to

### Run the pipeline locally

1. Set up config_blank.py by renaming it to config.py and adding the relevent datbase path. The repository will be provided with config_blank.py. This **file should be renamed to config.py** for each user who creates a branch on this repository. Please put the path of the database that will be called to load any relevant data
a) **NOTE:** Please take appropriate steps to set up the database connection


2. Check ```conf/base/parameters/general_parameters.yml``` and ```conf/catalog.yml```

*   The paths in the catalog file and parameters here are used the notebooks and the names or values may need to be updated to run pipeline

3. Follow instructions in section Installation Instructions to set up the correct environment

2. Run notebooks in ```notebooks/``` in the following order:
    1) 01_process_raw_data.ipynb
    2) 02_pregenerate_maps.ipynb

3. Run the app
    ```bash
    cd app

    python run app.py
    ```

## Specific Parameters

### List of parameters used in corridor pipeline 
1) local_path: path of local folder to save maps and images

## Contact & Support

For general questions, access to the data or questions related to the pipeline please contact:

- [Jake Lieberfarb](mailto:jake_lieberfarb@McKinsey.com)
- [Francesca Andretta](mailto:francesca_andretta@McKinsey.com)