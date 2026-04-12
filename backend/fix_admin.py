import sys
from pathlib import Path

# Add the backend directory to Python path for imports
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.database import users_collection
from app.security import hash_password

# Remove existing admin
users_collection.delete_many({'email': 'admin@gmail.com'})

# Create new admin with correct hash
users_collection.insert_one({
    'name': 'Admin User',
    'email': 'admin@gmail.com',
    'password_hash': hash_password('Admin123#@$'),
    'role': 'admin',
    'initials': 'AD',
})
print('Admin user recreated with correct password hash')
