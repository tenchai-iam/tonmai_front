## VegX Front End Web App

The front end application consist of two key parts:
1. Pipeline to generate map files
2. Running Dash application as a web app

Pipeline has been incorporated as part of the web app, where each time the web app is ran, two pipeline .py files will be invoked to run (directly coded in the main.app script)

#### Running the project

WIP

#### Building for deployment

WIP

#### Environment variable

Config.py has been deprecated in this repo, in favor of .env files, in order to make deployment easier. Therefore, before running the application:
1. Create a .env file in the root of the project
2. Populate the .env file with the exact same variables as in the former config.py 
        DB_SERVER=""
        DB_PORT=""
        DB_NAME=""
        DB_USERNAME=""
        DB_PASSWORD=""

Ensure .env file is added before conda environment is activated. If created when environment is active, restart the environment.

Careful to NEVER push .env file to any shared repo.