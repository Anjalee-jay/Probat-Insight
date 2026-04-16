"""
seed_images.py
---------------
Script to initialize the images collection in MongoDB for Probat Insight.

This script creates the images collection and sets up any necessary indexes.
"""

from app.database import images_collection, db
from pymongo.errors import PyMongoError

def create_images_collection():
    """Create and initialize the images collection."""
    try:
        # Check if collection already exists
        if "images" in db.list_collection_names():
            print("Images collection already exists")
            return

        # Create the collection (MongoDB creates it implicitly when first document is inserted)
        # But we can explicitly create it and add some initial setup

        # Create indexes for better performance
        images_collection.create_index([("uploaded_at", -1)])  # Index for sorting by upload date
        images_collection.create_index([("status", 1)])       # Index for filtering by status
        images_collection.create_index([("player", 1)])       # Index for filtering by player
        images_collection.create_index([("filename", 1)])     # Index for filename searches

        print("Images collection created successfully with indexes")

        # Optional: Insert a sample document to ensure collection exists
        sample_doc = {
            "_id": "sample-image-id",
            "filename": "sample.jpg",
            "player": "Sample Player",
            "size": 1024,
            "content_type": "image/jpeg",
            "image_data": b"",  # Empty for sample
            "handedness": "right",
            "uploaded_at": None,
            "status": "sample",
            "analysis": None,
            "score": None,
            "grade": None,
            "model_used": None,
            "error": None
        }

        images_collection.insert_one(sample_doc)
        print("Sample document inserted")

        # Remove the sample document
        images_collection.delete_one({"_id": "sample-image-id"})
        print("Sample document removed - collection is ready for use")

    except PyMongoError as exc:
        print(f"Error creating images collection: {exc}")
        return False

    return True

if __name__ == "__main__":
    print("Initializing images collection for Probat Insight...")
    success = create_images_collection()
    if success:
        print("✅ Images collection initialization completed successfully!")
    else:
        print("❌ Failed to initialize images collection")