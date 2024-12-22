from utils.logger_config import setup_logger
import json
from functools import lru_cache
import time

# Set up logger for models
logger = setup_logger('models')

def load_json(file_name):
    """Helper function to load data from a JSON file."""
    try:
        logger.debug(f"Attempting to load JSON file: {file_name}")
        with open(file_name, 'r') as f:
            data = json.load(f)
            logger.info(f"Successfully loaded JSON file: {file_name}")
            return data
    except FileNotFoundError:
        logger.error(f"File not found: {file_name}")
        return []
    except json.JSONDecodeError:
        logger.error(f"JSON decoding error in file: {file_name}")
        return []
    except Exception as e:
        logger.exception("Unexpected error occurred while loading JSON")
        return []

def save_json(file_name, data):
    """Helper function to save data to a JSON file."""
    try:
        logger.debug(f"Attempting to save JSON file: {file_name}")
        with open(file_name, 'w') as f:
            json.dump(data, f, indent=4)
            logger.info(f"Successfully saved JSON file: {file_name}")
            return True
    except Exception as e:
        logger.error(f"Error saving JSON file: {str(e)}")
        return False

@lru_cache(maxsize=32)
def get_subjects():
    """Get all subjects with caching."""
    return load_json('data/subjects.json').get('subjects', [])

def invalidate_cache():
    """Clear the cache when data changes."""
    get_subjects.cache_clear()

def add_subject(name, description):
    """Add a new subject if it doesn't already exist."""
    try:
        # Validate inputs
        if not isinstance(name, str) or not isinstance(description, str):
            return False, "Invalid input types"
        
        if not name.strip() or len(name) > 100:  # Add reasonable limits
            return False, "Invalid name length"
            
        if len(description) > 1000:  # Add reasonable limits
            return False, "Description too long"
            
        # Load current data
        data = load_json('data/subjects.json')
        subjects = data.get('subjects', [])
        
        # Check for duplicate name (case-insensitive)
        if any(s['name'].lower() == name.lower() for s in subjects):
            return False, "A subject with this name already exists"
        
        # Get next ID
        next_id = max([s['id'] for s in subjects], default=0) + 1
        
        # Create new subject
        new_subject = {
            "id": next_id,
            "name": name,
            "description": description,
            "sections": []
        }
        
        # Add to subjects list
        subjects.append(new_subject)
        data['subjects'] = subjects
        
        # Save updated data
        if save_json('data/subjects.json', data):
            return True, "Subject added successfully"
        return False, "Error saving subject"
        
    except Exception as e:
        logger.error(f"Error adding subject: {str(e)}", exc_info=True)  # Add stack trace
        return False, "Internal server error"

def add_section_to_subject(subject_id, name):
    """
    Add a new section to a subject.
    Returns (success, message) tuple.
    """
    try:
        data = load_json('data/subjects.json')
        subjects = data.get('subjects', [])
        
        # Find the subject
        subject = next((s for s in subjects if s['id'] == subject_id), None)
        if not subject:
            return False, "Subject not found"
        
        # Check for duplicate section name in this subject
        if any(s['name'].lower() == name.lower() for s in subject.get('sections', [])):
            return False, "A section with this name already exists in this subject"
        
        # Get next section ID (across all subjects)
        all_sections = [s for subj in subjects for s in subj.get('sections', [])]
        next_id = max([s['id'] for s in all_sections], default=0) + 1
        
        # Create new section
        new_section = {
            "id": next_id,
            "subject_id": subject_id,
            "name": name,
            "topics": []
        }
        
        # Add to subject's sections
        if 'sections' not in subject:
            subject['sections'] = []
        subject['sections'].append(new_section)
        
        # Save updated data
        if save_json('data/subjects.json', data):
            return True, "Section added successfully"
        return False, "Error saving section"
        
    except Exception as e:
        logger.error(f"Error adding section: {str(e)}")
        return False, "Internal server error"

def add_topic_to_section(section_id, name, text, code):
    """
    Add a new topic to a section.
    Returns (success, message) tuple.
    """
    try:
        data = load_json('data/subjects.json')
        subjects = data.get('subjects', [])
        
        # Find the section
        section = None
        for subject in subjects:
            for s in subject.get('sections', []):
                if s['id'] == section_id:
                    section = s
                    break
            if section:
                break
                
        if not section:
            return False, "Section not found"
        
        # Check for duplicate topic name in this section
        if any(t['name'].lower() == name.lower() for t in section.get('topics', [])):
            return False, "A topic with this name already exists in this section"
        
        # Get next topic ID (across all sections)
        all_topics = []
        for subject in subjects:
            for s in subject.get('sections', []):
                all_topics.extend(s.get('topics', []))
        next_topic_id = max([t['id'] for t in all_topics], default=0) + 1
        
        # Create new topic
        new_topic = {
            "id": next_topic_id,
            "section_id": section_id,
            "name": name,
            "details": {
                "id": next_topic_id,
                "topic_id": next_topic_id,
                "text": text if text else None,
                "code": code if code else None,
                "table": None,
                "image": None
            }
        }
        
        # Add to section's topics
        if 'topics' not in section:
            section['topics'] = []
        section['topics'].append(new_topic)
        
        # Save updated data
        if save_json('data/subjects.json', data):
            return True, "Topic added successfully"
        return False, "Error saving topic"
        
    except Exception as e:
        logger.error(f"Error adding topic: {str(e)}")
        return False, "Internal server error"

def section_has_topics(section_id):
    """Check if a section has any topics."""
    data = load_json('data/subjects.json')
    for subject in data.get('subjects', []):
        for section in subject.get('sections', []):
            if section['id'] == section_id:
                return len(section.get('topics', [])) > 0
    return False

def subject_has_sections(subject_id):
    """Check if a subject has any sections."""
    data = load_json('data/subjects.json')
    for subject in data.get('subjects', []):
        if subject['id'] == subject_id:
            return len(subject.get('sections', [])) > 0
    return False

def delete_topic_from_section(topic_id):
    """Delete a topic."""
    try:
        data = load_json('data/subjects.json')
        found = False
        
        for subject in data.get('subjects', []):
            for section in subject.get('sections', []):
                original_length = len(section.get('topics', []))
                section['topics'] = [t for t in section.get('topics', []) if t['id'] != topic_id]
                if len(section['topics']) < original_length:
                    found = True
                    break
            if found:
                break
        
        if not found:
            return False, "Topic not found"
            
        if save_json('data/subjects.json', data):
            return True, "Topic deleted successfully"
        return False, "Error saving changes"
        
    except Exception as e:
        logger.error(f"Error deleting topic: {str(e)}")
        return False, "Internal server error"

def delete_section_from_subject(section_id):
    """Delete a section if it's empty."""
    try:
        if section_has_topics(section_id):
            return False, "Cannot delete section with topics"
            
        data = load_json('data/subjects.json')
        found = False
        
        for subject in data.get('subjects', []):
            original_length = len(subject.get('sections', []))
            subject['sections'] = [s for s in subject.get('sections', []) if s['id'] != section_id]
            if len(subject['sections']) < original_length:
                found = True
                break
        
        if not found:
            return False, "Section not found"
            
        if save_json('data/subjects.json', data):
            return True, "Section deleted successfully"
        return False, "Error saving changes"
        
    except Exception as e:
        logger.error(f"Error deleting section: {str(e)}")
        return False, "Internal server error"

def delete_subject_from_data(subject_id):
    """Delete a subject if it's empty."""
    try:
        if subject_has_sections(subject_id):
            return False, "Cannot delete subject with sections"
            
        data = load_json('data/subjects.json')
        data['subjects'] = [s for s in data.get('subjects', []) if s['id'] != subject_id]
        
        if save_json('data/subjects.json', data):
            return True, "Subject deleted successfully"
        return False, "Error saving changes"
        
    except Exception as e:
        logger.error(f"Error deleting subject: {str(e)}")
        return False, "Internal server error"

def update_topic_details(topic_id, name, text, code):
    """Update topic details."""
    try:
        data = load_json('data/subjects.json')
        found = False
        
        # Find and update the topic
        for subject in data.get('subjects', []):
            for section in subject.get('sections', []):
                for topic in section.get('topics', []):
                    if topic['id'] == topic_id:
                        # Check for duplicate name in the same section
                        if any(t['name'].lower() == name.lower() and t['id'] != topic_id 
                              for t in section['topics']):
                            return False, "A topic with this name already exists in this section"
                        
                        topic['name'] = name
                        topic['details']['text'] = text if text else None
                        topic['details']['code'] = code if code else None
                        found = True
                        break
                if found:
                    break
            if found:
                break
                
        if not found:
            return False, "Topic not found"
            
        if save_json('data/subjects.json', data):
            return True, "Topic updated successfully"
        return False, "Error saving changes"
        
    except Exception as e:
        logger.error(f"Error updating topic: {str(e)}")
        return False, "Internal server error"

def update_section_details(section_id, name):
    """Update section details."""
    try:
        data = load_json('data/subjects.json')
        found = False
        
        # Find and update the section
        for subject in data.get('subjects', []):
            # Check for duplicate name in the same subject
            if any(s['name'].lower() == name.lower() and s['id'] != section_id 
                  for s in subject.get('sections', [])):
                return False, "A section with this name already exists in this subject"
                
            for section in subject.get('sections', []):
                if section['id'] == section_id:
                    section['name'] = name
                    found = True
                    break
            if found:
                break
                
        if not found:
            return False, "Section not found"
            
        if save_json('data/subjects.json', data):
            return True, "Section updated successfully"
        return False, "Error saving changes"
        
    except Exception as e:
        logger.error(f"Error updating section: {str(e)}")
        return False, "Internal server error"

def update_subject_details(subject_id, name, description):
    """Update subject details."""
    try:
        data = load_json('data/subjects.json')
        
        # Check for duplicate subject name
        if any(s['name'].lower() == name.lower() and s['id'] != subject_id 
              for s in data.get('subjects', [])):
            return False, "A subject with this name already exists"
        
        # Find and update the subject
        found = False
        for subject in data.get('subjects', []):
            if subject['id'] == subject_id:
                subject['name'] = name
                subject['description'] = description
                found = True
                break
                
        if not found:
            return False, "Subject not found"
            
        if save_json('data/subjects.json', data):
            return True, "Subject updated successfully"
        return False, "Error saving changes"
        
    except Exception as e:
        logger.error(f"Error updating subject: {str(e)}")
        return False, "Internal server error"

