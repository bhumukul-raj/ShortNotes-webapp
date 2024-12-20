from flask import Flask, render_template, redirect, url_for, request, session, jsonify
import json
from models import get_subjects, get_topics, add_subject, add_topic, load_json
from utils import check_login
import logging

logging.basicConfig(level=logging.DEBUG)

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


@app.route('/admin/topics')  # Topics management route
def manage_topics():
    """
    Display and manage all topics.
    """
    if 'logged_in' in session and session['logged_in']:
        topics = get_subjects()
        return render_template('/admin/topics.html', topics=topics)
    return redirect(url_for('index'))




@app.route('/api/subjects', methods=['GET'])
def api_get_subjects():
    """API to fetch all subjects."""
    return jsonify(get_subjects())


### Run Application ###
if __name__ == '__main__':
    app.run(debug=True)
