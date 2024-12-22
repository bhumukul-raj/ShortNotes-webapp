from flask import Flask, render_template, redirect, url_for, request, session, jsonify
import json
from models import get_subjects
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
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        # Implement your update logic here
        # This is a placeholder - you'll need to implement the actual update
        # in your data storage system
        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Error updating subject: {str(e)}")
        return jsonify({'error': 'Failed to update subject'}), 500

@app.route('/api/sections/<int:section_id>', methods=['PUT'])
def update_section(section_id):
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        # Implement your section update logic here
        # This is a placeholder - you'll need to implement the actual update
        # in your data storage system
        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Error updating section: {str(e)}")
        return jsonify({'error': 'Failed to update section'}), 500

@app.route('/api/topics/<int:topic_id>', methods=['PUT'])
def update_topic(topic_id):
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        # Implement your topic update logic here
        # This is a placeholder - you'll need to implement the actual update
        # in your data storage system
        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Error updating topic: {str(e)}")
        return jsonify({'error': 'Failed to update topic'}), 500

### Run Application ###
if __name__ == '__main__':
    app.run(debug=True)
