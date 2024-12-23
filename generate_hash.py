from werkzeug.security import generate_password_hash

password = 'admin123'
hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
print(hash) 