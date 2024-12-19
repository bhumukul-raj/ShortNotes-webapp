import json
from os.path import join, exists

def load_json(file_name):
    """Helper function to load data from a JSON file."""
    try:
        with open(file_name, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: {file_name} not found.")
        return []  # Return an empty list in case of error
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {file_name}.")
        return []  # Return an empty list if JSON is invalid

def save_json(file_name, data):
    """Helper function to save data to a JSON file."""
    with open(join('data', file_name), 'w') as f:
        json.dump(data, f, indent=4)

def get_subjects():
    """Get all subjects from the subjects.json file."""
    return load_json('subjects.json')

def get_topics(subject_id):
    """Get topics related to a specific subject from topics.json."""
    topics = load_json('topics.json')
    return [t for t in topics if t['subject_id'] == subject_id]

def add_subject(name):
    """Add a new subject to subjects.json."""
    subjects = get_subjects()
    new_subject = {'id': len(subjects) + 1, 'name': name}
    subjects.append(new_subject)
    save_json('subjects.json', subjects)

def add_topic(subject_id, topic_name, subtopics):
    """Add a new topic to topics.json."""
    topics = get_topics(subject_id)
    new_topic = {'subject_id': subject_id, 'topic_name': topic_name, 'subtopics': subtopics}
    topics.append(new_topic)
    save_json('topics.json', topics)
