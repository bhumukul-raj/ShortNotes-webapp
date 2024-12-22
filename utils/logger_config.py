import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
import json

# Create logs directory if it doesn't exist
LOGS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'logs')
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

# Create different log files for different purposes
ACCESS_LOG = os.path.join(LOGS_DIR, 'access.log')
ERROR_LOG = os.path.join(LOGS_DIR, 'error.log')
DEBUG_LOG = os.path.join(LOGS_DIR, 'debug.log')

# Configure logging format
LOG_FORMAT = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

class CustomJSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        if record.exc_info:
            log_obj['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

def setup_logger(name):
    """
    Creates a logging object and returns it
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Create handlers
    debug_handler = RotatingFileHandler(
        DEBUG_LOG, 
        maxBytes=1024*1024,  # 1MB
        backupCount=5
    )
    debug_handler.setLevel(logging.DEBUG)
    debug_handler.setFormatter(CustomJSONFormatter())

    error_handler = RotatingFileHandler(
        ERROR_LOG,
        maxBytes=1024*1024,  # 1MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(CustomJSONFormatter())

    access_handler = RotatingFileHandler(
        ACCESS_LOG,
        maxBytes=1024*1024,  # 1MB
        backupCount=5
    )
    access_handler.setLevel(logging.INFO)
    access_handler.setFormatter(CustomJSONFormatter())

    # Add handlers to logger
    logger.addHandler(debug_handler)
    logger.addHandler(error_handler)
    logger.addHandler(access_handler)

    return logger 