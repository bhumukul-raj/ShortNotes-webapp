import json
import logging

# Set up logging configuration with DEBUG level
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def load_json(file_name):
    """Helper function to load data from a JSON file."""
    try:
        logging.debug(f"Attempting to load JSON file: {file_name}")
        with open(file_name, 'r') as f:
            data = json.load(f)
            logging.info(f"Successfully loaded JSON file: {file_name}")
            return data
    except FileNotFoundError:
        logging.error(f"File not found: {file_name}")
        print(f"Error: {file_name} not found.")
        return []  # Return an empty list in case of error
    except json.JSONDecodeError:
        logging.error(f"JSON decoding error in file: {file_name}")
        print(f"Error: Could not decode JSON from {file_name}.")
        return []  # Return an empty list if JSON is invalid
    except Exception as e:
        logging.exception("Unexpected error occurred while loading JSON.")
        return []  # Return empty list for any unexpected errors


def get_subjects():
    """Get all subjects from subjects.json."""
    logging.debug("Getting all subjects from JSON data.")
    data = load_json('data/subjects.json')
    subjects = data.get('subjects', [])
    logging.debug(f"Found {len(subjects)} subjects.")
    return subjects  # Make sure to return the list under 'subjects'

