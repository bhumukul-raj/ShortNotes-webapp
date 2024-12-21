from flask import Flask, render_template, redirect, url_for, request, session, jsonify
import json
from models import get_subjects, delete_section, save_data, save_new_subject, delete_subject_from_data, delete_topic
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
    return jsonify(get_subjects())
#####-----------------------------------------------------------------------------------------------------------
@app.route('/temp') 
def temp():
    """
    Home route that displays the subject cards on the index page.
    If the user is logged in, show the admin options. Otherwise, show the login popup.
    """
    subjects = get_subjects()
    logging.debug("Subjects data is passed to temp page.")  # Log
    return render_template('/temp/temp.html', subjects=subjects)

@app.route('/api/subjects/<int:id>', methods=['DELETE'])
def delete_subject(id):
    result = delete_subject_from_data(id)
    if result["status"] == "success":
        return jsonify(result), 200
    else:
        return jsonify(result), 400

######******************************************************************
@app.route('/api/sections/<subject_id>/<section_id>', methods=['DELETE'])
def delete_section_route(subject_id, section_id):
    result = delete_section(subject_id, section_id)
    if result["status"] == "success":
        return jsonify(result), 200
    else:
        return jsonify(result), 400
######******************************************************************
@app.route('/api/topics/<int:subject_id>/<int:section_id>/<int:topic_id>', methods=['DELETE'])
def delete_topic_route(subject_id, section_id, topic_id):
    result = delete_topic(subject_id, section_id, topic_id)
    if result["status"] == "success":
        return jsonify(result), 200
    else:
        return jsonify(result), 400
######*********************************************
@app.route('/api/subjects', methods=['POST'])
def add_subject():
    """
    API to add a new subject.
    """
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')

    if not name or not description:
        return jsonify({"status": "error", "message": "Name and description are required"}), 400

    new_subject = save_new_subject(name, description)

    if new_subject:
        return jsonify(new_subject), 201
    else:
        return jsonify({"status": "error", "message": "Failed to add the subject"}), 500




########---------------------------------------------------------------------------------------------------------
### Run Application ###
if __name__ == '__main__':
    app.run(debug=True)
