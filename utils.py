def check_login(username, password):
    """
    Validate admin credentials. For simplicity, this example uses hardcoded values.
    In production, you should use a secure authentication mechanism.
    """
    admin_username = 'admin'  # Replace with your desired username
    admin_password = 'admin123'  # Replace with your desired password
    
    return username == admin_username and password == admin_password
