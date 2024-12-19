from flask import Flask, render_template, redirect, url_for, request, session, jsonify
import json
from models import get_subjects, get_topics, add_subject, add_topic, load_json
from utils import check_login
import logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for session management

@app.route('/') # cheaked working
def index():
    """
    Home route that displays the subject cards on the index page.
    If the user is logged in, show the admin options. Otherwise, show the login popup.
    """
    subjects = get_subjects()
    logging.debug("subjects data is passed to index page")  #log
    return render_template('index.html', subjects=subjects)

@app.route('/admin')  #Cheaked Working
def admin():
    """
    Admin panel page for CRUD operations. Only accessible if the admin is logged in.
    """
    if 'logged_in' in session and session['logged_in']:
        return render_template('admin.html')
        logging.debug("Login Sucessfull!") # log
    return redirect(url_for('index'))

@app.route('/login', methods=['GET','POST']) # cheaked Working
def login():
    """
    Handle login request for the admin. Verifies admin credentials.
    """
    if request.method == 'POST' :
        logging.debug("Login Endpoint Hit!") # log     
        
        username = request.form.get('username')
        password = request.form.get('password')
        if check_login(username, password):  # Verifies login credentials
            logging.info("Login successful!")  # log
            session['logged_in'] = True
            return redirect(url_for('admin'))
        
        logging.warning("Login failed!")  # log
        return redirect(url_for('index')) # if login is failed
    # For GET requests (e.g., when the user directly visits /login)
    return render_template('login.html')

@app.route('/logout')  # cheaked working
def logout():
    """
    Log out the admin and redirect to the homepage.
    """
    session.pop('logged_in', None)
    logging.info("Logout Sucessfull") # log
    return redirect(url_for('index'))

@app.route('/subject/<subject_name>')   # cheak working
def subject_page(subject_name):
    """Render the page for a specific subject with topics."""
    subjects = load_json('data/subjects.json')
    # Find the subject matching the subject_name
    subject = next((s for s in subjects if s['subject'] == subject_name), None)
    if subject is None:
        return "Subject not found", 404
    return render_template('subject_page.html', subject=subject)




@app.route('/admin/add_subject', methods=['POST'])
def add_subject_route():
    """
    Handle the creation of a new subject from the admin panel.
    """
    name = request.form['name']
    add_subject(name)
    return redirect(url_for('admin'))

@app.route('/admin/add_topic', methods=['POST'])
def add_topic_route():
    """
    Handle adding topics and their subtopics under a subject.
    """
    subject_id = int(request.form['subject_id'])
    topic_name = request.form['topic_name']
    subtopics = json.loads(request.form['subtopics'])  # JSON string for subtopics
    add_topic(subject_id, topic_name, subtopics)
    return redirect(url_for('admin'))

if __name__ == '__main__':
    app.run(debug=True)
