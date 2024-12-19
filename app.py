from flask import Flask, render_template, redirect, url_for, request, session, jsonify
import json
from models import get_subjects, get_topics, add_subject, add_topic
from utils import check_login

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for session management

@app.route('/')
def index():
    """
    Home route that displays the subject cards on the index page.
    If the user is logged in, show the admin options. Otherwise, show the login popup.
    """
    subjects = get_subjects()
    return render_template('index.html', subjects=subjects)

@app.route('/subject/<int:id>')
def subject_page(id):
    """
    Dynamic page for each subject where topics and subtopics are shown based on subject_id.
    """
    topics = get_topics(id)
    return render_template('subject_page.html', subject_id=id, topics=topics)

@app.route('/admin')
def admin():
    """
    Admin panel page for CRUD operations. Only accessible if the admin is logged in.
    """
    if 'logged_in' in session and session['logged_in']:
        return render_template('admin.html')
    return redirect(url_for('index'))

@app.route('/login', methods=['POST'])
def login():
    """
    Handle login request for the admin. Verifies admin credentials.
    """
    username = request.form['username']
    password = request.form['password']
    
    if check_login(username, password):  # Verifies login credentials
        session['logged_in'] = True
        return redirect(url_for('admin'))
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    """
    Log out the admin and redirect to the homepage.
    """
    session.pop('logged_in', None)
    return redirect(url_for('index'))

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
