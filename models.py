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

def save_data(file_name, data):
    """Helper function to save data to a JSON file."""
    try:
        logging.debug(f"Attempting to save data to JSON file: {file_name}")
        with open(file_name, 'w') as f:
            json.dump(data, f, indent=4)  # Save the data with indentation for readability
        logging.info(f"Successfully saved data to {file_name}.")
    except Exception as e:
        logging.exception(f"Error occurred while saving data to {file_name}.")
        print(f"Error: Could not save data to {file_name}.")


def get_subjects():
    """Get all subjects from subjects.json."""
    logging.debug("Getting all subjects from JSON data.")
    data = load_json('data/subjects.json')
    subjects = data.get('subjects', [])
    logging.debug(f"Found {len(subjects)} subjects.")
    return subjects  # Make sure to return the list under 'subjects'

def delete_subject_from_data(subject_id):
    """Delete a subject by its ID from the subjects data."""
    logging.debug(f"Attempting to delete subject {subject_id}.")
    try:
        data = load_json('data/subjects.json')  # Load data from the JSON file
        subject_id = int(subject_id)

        subject_to_delete = next((s for s in data.get('subjects', []) if s['id'] == subject_id), None)
        
        if subject_to_delete:
            # Check if the subject has sections before deleting
            if len(subject_to_delete.get('sections', [])) > 0:
                logging.warning(f"Subject {subject_id} has sections, cannot delete")
                return {"status": "error", "message": "Cannot delete a subject with sections"}

            # Remove the subject from the list
            data = [subject for subject in data.get('subjects', []) if subject['id'] != subject_id]
            logging.info(f"Deleted subject {subject_id}.")

            # Save the updated data back to the file
            save_data('data/subjects.json', {'subjects': data})
            return {"status": "success", "message": "Subject deleted successfully"}
        else:
            logging.warning(f"Subject {subject_id} not found.")
            return {"status": "error", "message": "Subject not found"}
    
    except Exception as e:
        logging.exception(f"Unexpected error occurred while deleting subject {subject_id}.")
        return {"status": "error", "message": str(e)}


def delete_section(subject_id, section_id):
    """Delete a section from the subject."""
    logging.debug(f"Attempting to delete section {section_id} from subject {subject_id}.")
    try:
        data = load_json('data/subjects.json')  # Load data from the JSON file
        # Ensure subject_id is an integer for comparison
        subject_id = int(subject_id)
        section_id = int(section_id)

        subject = next((s for s in data.get('subjects', []) if s['id'] == subject_id), None)
        
        if subject:
            sections = subject.get('sections', [])
            section_to_delete = next((s for s in sections if s['id'] == section_id), None)
            
            if section_to_delete:
                sections.remove(section_to_delete)
                logging.info(f"Deleted section {section_id} from subject {subject_id}.")
                # Save the updated data back to the file
                save_data('data/subjects.json', data)
                return {"status": "success", "message": "Section deleted successfully"}
            else:
                logging.warning(f"Section {section_id} not found in subject {subject_id}.")
                return {"status": "error", "message": "Section not found"}
        else:
            logging.warning(f"Subject {subject_id} not found.")
            return {"status": "error", "message": "Subject not found"}
    
    except Exception as e:
        logging.exception("Unexpected error occurred while deleting section.")
        return {"status": "error", "message": str(e)}

def delete_topic(subject_id, section_id, topic_id):
    """Delete a topic from a section within a subject."""
    logging.debug(f"Attempting to delete topic {topic_id} from section {section_id} in subject {subject_id}.")
    try:
        data = load_json('data/subjects.json')  # Load data from the JSON file
        subject_id = int(subject_id)
        section_id = int(section_id)
        topic_id = int(topic_id)

        subject = next((s for s in data.get('subjects', []) if s['id'] == subject_id), None)
        
        if subject:
            # Find the section within the subject
            section = next((sec for sec in subject.get('sections', []) if sec['id'] == section_id), None)
            
            if section:
                # Find the topic within the section
                topic = next((t for t in section.get('topics', []) if t['id'] == topic_id), None)
                
                if topic:
                    # Remove the topic from the section
                    section['topics'] = [t for t in section['topics'] if t['id'] != topic_id]
                    logging.info(f"Deleted topic {topic_id} from section {section_id} in subject {subject_id}.")
                    
                    # Save the updated data back to the file
                    save_data('data/subjects.json', data)
                    return {"status": "success", "message": "Topic deleted successfully"}
                else:
                    logging.warning(f"Topic {topic_id} not found in section {section_id} of subject {subject_id}.")
                    return {"status": "error", "message": "Topic not found"}
            else:
                logging.warning(f"Section {section_id} not found in subject {subject_id}.")
                return {"status": "error", "message": "Section not found"}
        else:
            logging.warning(f"Subject {subject_id} not found.")
            return {"status": "error", "message": "Subject not found"}
    
    except Exception as e:
        logging.exception("Unexpected error occurred while deleting topic.")
        return {"status": "error", "message": str(e)}
