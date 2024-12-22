import os
from werkzeug.security import check_password_hash
from dotenv import load_dotenv

load_dotenv()

def check_login(username, password):
    ADMIN_USERNAME = os.getenv('ADMIN_USERNAME')
    ADMIN_PASSWORD_HASH = os.getenv('ADMIN_PASSWORD_HASH')
    return username == ADMIN_USERNAME and check_password_hash(ADMIN_PASSWORD_HASH, password) 