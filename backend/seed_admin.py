from app.database import users_collection
from app.security import hash_password

ADMIN_EMAIL = "admin@probat.com"
ADMIN_PASSWORD = "admin123"

existing_admin = users_collection.find_one({"email": ADMIN_EMAIL})
if existing_admin:
    print("Admin user already exists")
else:
    users_collection.insert_one(
        {
            "name": "Admin User",
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "initials": "AD",
        }
    )
    print("Admin user created: admin@probat.com / admin123")
