import json , logging

logging.basicConfig(level=logging.DEBUG)


def load_json(file_name):       # cheaked working
    """Helper function to load data from a JSON file."""
    try:
        with open(file_name, 'r') as f:
            logging.info("JSON File is Loaded.") # log
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: {file_name} not found.")
        return []  # Return an empty list in case of error
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {file_name}.")
        return []  # Return an empty list if JSON is invalid

def get_subjects():
    """Get all subjects from subjects.json."""
    data = load_json('data/subjects.json')
    return data.get('subjects', [])  # Make sure to return the list under 'subjects'