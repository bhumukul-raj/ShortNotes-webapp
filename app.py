from flask import Flask, render_template, redirect, url_for, request, session, jsonify
import json
from models import get_subjects, add_subject, add_section_to_subject, add_topic_to_section, delete_topic_from_section, delete_section_from_subject, delete_subject_from_data, subject_has_sections, section_has_topics, update_topic_details, update_section_details, update_subject_details
from utils import check_login
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for session management

### Public Routes ###
@app.route('/')  # Checked working
def index():
    """
    Home route that displays the subject cards on the index page.
    If the user is logged in, show the admin options. Otherwise, show the login popup.
    """
    subjects = get_subjects()
    logging.debug("Subjects data is passed to index page.")  # Log
    return render_template('/public/index.html', subjects=subjects)

@app.route('/subject/<subject_name>')
def subject_page(subject_name):
    """
    Render the page for a specific subject with topics.
    """
    subjects = get_subjects()  # Use the function that returns the subjects list
    subject = next((s for s in subjects if s['name'] == subject_name), None)
    if subject is None:
        return "Subject not found", 404
    return render_template('/public/subject_page.html', subject=subject)

### Authentication Routes ###
@app.route('/login', methods=['GET', 'POST'])  # Checked working
def login():
    """
    Handle login request for the admin. Verifies admin credentials.
    """
    if request.method == 'POST':
        logging.debug("Login endpoint hit.")  # Log
        username = request.form.get('username')
        password = request.form.get('password')
        if check_login(username, password):  # Verifies login credentials
            logging.info("Login successful.")  # Log
            session['logged_in'] = True
            return redirect(url_for('dashboard'))
        logging.warning("Login failed.")  # Log
        return redirect(url_for('index'))  # If login fails
    return render_template('/auth/login.html')  # GET request

@app.route('/logout')  # Checked working
def logout():
    """
    Log out the admin and redirect to the homepage.
    """
    session.pop('logged_in', None)
    logging.info("Logout successful.")  # Log
    return redirect(url_for('index'))

### Admin Routes ###
@app.route('/admin')  # Redirect to dashboard
def admin():
    """
    Redirect to the admin dashboard.
    """
    return redirect(url_for('dashboard'))

@app.route('/admin/dashboard')  # Dashboard route
def dashboard():
    """
    Admin dashboard for managing subjects and topics.
    """
    if 'logged_in' in session and session['logged_in']:
        logging.debug("Admin dashboard accessed.")  # Log
        return render_template('/admin/dashboard.html')
    return redirect(url_for('index'))

@app.route('/admin/subjects')  # Subjects management route
def manage_subjects():
    """
    Display and manage all subjects.
    """
    if 'logged_in' in session and session['logged_in']:
        subjects = get_subjects()
        return render_template('/admin/subjects.html', subjects=subjects)
    return redirect(url_for('index'))

@app.route('/api/subjects', methods=['GET'])
def api_get_subjects():
    """API to fetch all subjects."""
    try:
        subjects = get_subjects()
        logging.debug(f"API returning subjects: {subjects}")
        return jsonify({'subjects': subjects})
    except Exception as e:
        logging.error(f"Error in api_get_subjects: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/subjects/<int:subject_id>', methods=['PUT'])
def update_subject(subject_id):
    """API endpoint to update a subject."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        
        if not name:
            return jsonify({'error': 'Subject name is required'}), 400
            
        success, message = update_subject_details(subject_id, name, description)
        
        if success:
            return jsonify({'message': message}), 200
        return jsonify({'error': message}), 400
        
    except Exception as e:
        logging.error(f"Error in update_subject: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/sections/<int:section_id>', methods=['PUT'])
def update_section(section_id):
    """API endpoint to update a section."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({'error': 'Section name is required'}), 400
            
        success, message = update_section_details(section_id, name)
        
        if success:
            return jsonify({'message': message}), 200
        return jsonify({'error': message}), 400
        
    except Exception as e:
        logging.error(f"Error in update_section: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/topics/<int:topic_id>', methods=['PUT'])
def update_topic(topic_id):
    """API endpoint to update a topic."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        text = data.get('text', '').strip()
        code = data.get('code', '').strip()
        
        if not name:
            return jsonify({'error': 'Topic name is required'}), 400
            
        success, message = update_topic_details(topic_id, name, text, code)
        
        if success:
            return jsonify({'message': message}), 200
        return jsonify({'error': message}), 400
        
    except Exception as e:
        logging.error(f"Error in update_topic: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/subjects', methods=['POST'])
def add_new_subject():
    """API endpoint to add a new subject."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        
        if not name:
            return jsonify({'error': 'Subject name is required'}), 400
            
        success, message = add_subject(name, description)
        
        if success:
            return jsonify({'message': message}), 201
        return jsonify({'error': message}), 400
        
    except Exception as e:
        logging.error(f"Error in add_new_subject: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/subjects/<int:subject_id>/sections', methods=['POST'])
def add_section(subject_id):
    """API endpoint to add a new section to a subject."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({'error': 'Section name is required'}), 400
            
        success, message = add_section_to_subject(subject_id, name)
        
        if success:
            return jsonify({'message': message}), 201
        return jsonify({'error': message}), 400
        
    except Exception as e:
        logging.error(f"Error in add_section: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/sections/<int:section_id>/topics', methods=['POST'])
def add_topic(section_id):
    """API endpoint to add a new topic to a section."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        text = data.get('text', '').strip()
        code = data.get('code', '').strip()
        
        if not name:
            return jsonify({'error': 'Topic name is required'}), 400
            
        success, message = add_topic_to_section(section_id, name, text, code)
        
        if success:
            return jsonify({'message': message}), 201
        return jsonify({'error': message}), 400
        
    except Exception as e:
        logging.error(f"Error in add_topic: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/topics/<int:topic_id>', methods=['DELETE'])
def delete_topic(topic_id):
    """API endpoint to delete a topic."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        success, message = delete_topic_from_section(topic_id)
        if success:
            return jsonify({'message': message}), 200
        return jsonify({'error': message}), 400
    except Exception as e:
        logging.error(f"Error in delete_topic: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/sections/<int:section_id>/check', methods=['GET'])
def check_section(section_id):
    """Check if a section has any topics."""
    try:
        has_topics = section_has_topics(section_id)
        return jsonify({'hasTopics': has_topics}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/sections/<int:section_id>', methods=['DELETE'])
def delete_section(section_id):
    """API endpoint to delete a section."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        success, message = delete_section_from_subject(section_id)
        if success:
            return jsonify({'message': message}), 200
        return jsonify({'error': message}), 400
    except Exception as e:
        logging.error(f"Error in delete_section: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/subjects/<int:subject_id>/check', methods=['GET'])
def check_subject(subject_id):
    """Check if a subject has any sections."""
    try:
        has_sections = subject_has_sections(subject_id)
        return jsonify({'hasSections': has_sections}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/subjects/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    """API endpoint to delete a subject."""
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        success, message = delete_subject_from_data(subject_id)
        if success:
            return jsonify({'message': message}), 200
        return jsonify({'error': message}), 400
    except Exception as e:
        logging.error(f"Error in delete_subject: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

### Run Application ###
if __name__ == '__main__':
    app.run(debug=True)
