def check_login(username, password):
    """
    Check if the provided username and password are valid.
    Currently using a simple hardcoded check - you might want to replace this
    with a more secure authentication system.
    """
    # Simple hardcoded credentials for demo purposes
    ADMIN_USERNAME = "admin"
    ADMIN_PASSWORD = "admin123"
    
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD 