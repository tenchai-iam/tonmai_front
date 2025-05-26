import logging
logger = logging.getLogger("vegx_logger")
import sys


# Configure the logger for logging to a separate log file
log_file_name = 'logs.txt'  # Separate log file for logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# FileHandler to write logs to a separate log file
log_file_handler = logging.FileHandler(log_file_name, mode='a')
log_file_handler.setLevel(logging.INFO)
log_formatter = logging.Formatter('%(message)s')
log_file_handler.setFormatter(log_formatter)
logger.addHandler(log_file_handler)

# Function to log messages to a dedicated log file and print to terminal
def log(x):
    """Logs a message to the log file and prints it to the terminal."""
    # Log to the dedicated log file
    with open(log_file_name, 'a') as log_file:
        log_file.write(x + '\n')  # Append the message to the log file
    print(x)
    return

def log_header(x):
    """Logs a headline for a function with no modifications."""
    log(x)
    return

def log_detail(x):
    """Logs a headline for a function with one tab indentation."""
    log("\t" + x)
    return

def log_subdetail(x):
    """Logs a headline for a function with two tab indentations."""
    log("\t\t" + x)
    return

### This will evaluate as true if the logger was not found (presumably in a jupyter notebook)
if len(logger.handlers) == 0:
    
    ### Set up the logging system to push outputs to the jupyter notebook
    logging.basicConfig(
        format = '%(asctime)s - %(levelname)s - %(message)s', 
        datefmt = "%H:%M:%S",
        level=logging.INFO,
        stream=sys.stdout
    )
    
    ### Kill the logger reference as its broken
    logger = None

def dual_print(message, file_name='UAT.txt'):
    with open(file_name, 'a') as log_file:
        log_file.write(message + '\n')  
    sys.__stdout__.write(message + '\n')  