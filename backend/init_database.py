"""
init_database.py
-----------------
Comprehensive database initialization script for Probat Insight.

This script creates all collections and sets up necessary indexes for optimal performance.
"""

from app.database import (
    db, users_collection, contact_messages_collection,
    feedbacks_collection, images_collection
)
from pymongo.errors import PyMongoError

def init_users_collection():
    """Initialize users collection with indexes."""
    try:
        # Create indexes
        users_collection.create_index([("email", 1)], unique=True)
        users_collection.create_index([("role", 1)])
        users_collection.create_index([("active", 1)])
        print("✅ Users collection initialized")
        return True
    except PyMongoError as exc:
        print(f"❌ Error initializing users collection: {exc}")
        return False

def init_contact_messages_collection():
    """Initialize contact_messages collection with indexes."""
    try:
        # Create indexes
        contact_messages_collection.create_index([("created_at", -1)])
        contact_messages_collection.create_index([("email", 1)])
        contact_messages_collection.create_index([("status", 1)])
        print("✅ Contact messages collection initialized")
        return True
    except PyMongoError as exc:
        print(f"❌ Error initializing contact messages collection: {exc}")
        return False

def init_feedbacks_collection():
    """Initialize feedbacks collection with indexes."""
    try:
        # Create indexes
        feedbacks_collection.create_index([("created_at", -1)])
        feedbacks_collection.create_index([("rating", 1)])
        feedbacks_collection.create_index([("email", 1)])
        print("✅ Feedbacks collection initialized")
        return True
    except PyMongoError as exc:
        print(f"❌ Error initializing feedbacks collection: {exc}")
        return False

def init_images_collection():
    """Initialize images collection with indexes."""
    try:
        # Create indexes for better performance
        images_collection.create_index([("uploaded_at", -1)])  # Sort by upload date
        images_collection.create_index([("status", 1)])       # Filter by status
        images_collection.create_index([("player", 1)])       # Filter by player
        images_collection.create_index([("filename", 1)])     # Search by filename
        images_collection.create_index([("image_id", 1)])     # For lookups (if needed)

        # Compound indexes for common queries
        images_collection.create_index([
            ("status", 1),
            ("uploaded_at", -1)
        ])  # Status + date sorting

        print("✅ Images collection initialized with indexes")
        return True
    except PyMongoError as exc:
        print(f"❌ Error initializing images collection: {exc}")
        return False

def check_db_connection():
    """Check database connection."""
    try:
        db.command("ping")
        print("✅ Database connection successful")
        return True
    except PyMongoError as exc:
        print(f"❌ Database connection failed: {exc}")
        return False

def main():
    """Main initialization function."""
    print("🚀 Initializing Probat Insight Database...")
    print("=" * 50)

    # Check connection first
    if not check_db_connection():
        return False

    # Initialize all collections
    success = True
    success &= init_users_collection()
    success &= init_contact_messages_collection()
    success &= init_feedbacks_collection()
    success &= init_images_collection()

    print("=" * 50)
    if success:
        print("🎉 Database initialization completed successfully!")
        print("\nCollections created:")
        print("- users")
        print("- contact_messages")
        print("- feedbacks")
        print("- images")
        print("\nAll collections have proper indexes for optimal performance.")
    else:
        print("⚠️  Database initialization completed with some errors.")
        print("Please check the error messages above.")

    return success

if __name__ == "__main__":
    main()