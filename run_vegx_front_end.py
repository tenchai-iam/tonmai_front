import os
import subprocess
import platform
import asyncio

# Set asyncio event loop policy for Windows to avoid zmq warning
if platform.system() == "Windows":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Disable PyDev debugger file validation warnings
os.environ["PYDEVD_DISABLE_FILE_VALIDATION"] = "1"

# Step 1: Define environment name and Python version
env_name = "test_thailand_digital_twin_env"

# # Step 2: Define the notebooks to run in sequence
notebooks = [
#    'notebooks/01_process_raw_data.ipynb',
#    'notebooks/02_pregenerate_maps.ipynb',
]
print("Pipeline execution started.")

# Step 5: Run each notebook with nbconvert
for notebook in notebooks:
    print(f"Running {notebook}...")
    result = subprocess.run(
        f"conda run -n {env_name} jupyter nbconvert --to notebook --inplace --execute {notebook}",
        shell=True
    )
    if result.returncode != 0:
        print(f"Error executing {notebook}. Exiting.")
        break


if platform.system() == "Windows":
    subprocess.run(f"conda activate {env_name} && cd app && python app.py", shell=True, check=True)
else:
    subprocess.run(f"conda run --cwd app --name {env_name} python app.py",shell=True, check=True)

print("Pipeline execution complete.")

subprocess.run("conda deactivate", shell=True)
