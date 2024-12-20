import json , logging
from os.path import join, exists

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




def save_json(file_name, data):
    """Helper function to save data to a JSON file."""
    with open(join('data', file_name), 'w') as f:
        json.dump(data, f, indent=4)



def get_topics(subject_id=None):
    """Get topics related to a specific subject from subjects.json."""
    subjects = load_json('data/subjects.json')  # Load subjects from subjects.json
    if subject_id is None:
        # If no subject_id is passed, return all topics
        topics = []
        for subject in subjects:
            for section in subject.get('sections', []):
                topics.extend(section.get('topics', []))
        return topics
    else:
        # Find the subject by ID and return its topics
        subject = next((s for s in subjects if s['id'] == subject_id), None)
        if subject is None:
            return []
        topics = []
        for section in subject.get('sections', []):
            topics.extend(section.get('topics', []))
        return topics






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
