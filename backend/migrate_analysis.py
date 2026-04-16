"""
Migration script to create Analysis collection and migrate data from images collection.
Run this script once to set up the new Analysis collection.
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "probat_insight")

def migrate_analysis_data():
    """Migrate analysis data from images collection to analysis collection."""
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
        db = client[MONGODB_DB]

        # Check connection
        client.admin.command("ping")
        print("✅ Connected to MongoDB")

        # Get collections
        images_collection = db["images"]
        analysis_collection = db["analysis"]

        # Check if analysis collection already exists and has data
        existing_count = analysis_collection.count_documents({})
        if existing_count > 0:
            print(f"⚠️  Analysis collection already has {existing_count} documents. Skipping migration.")
            return

        # Get all images with analysis data
        images_with_analysis = list(images_collection.find({
            "status": "completed",
            "analysis": {"$exists": True, "$ne": None}
        }))

        print(f"📊 Found {len(images_with_analysis)} images with analysis data to migrate")

        migrated_count = 0
        for image_doc in images_with_analysis:
            try:
                # Create analysis document
                analysis_doc = {
                    "image_id": image_doc["_id"],
                    "player": image_doc.get("player"),
                    "filename": image_doc.get("filename", ""),
                    "status": image_doc.get("status", "completed"),
                    "scores": image_doc.get("analysis", {}).get("scores"),
                    "features": image_doc.get("analysis", {}).get("features"),
                    "tips": image_doc.get("analysis", {}).get("tips"),
                    "grade": image_doc.get("grade"),
                    "stroke": image_doc.get("analysis", {}).get("stroke"),
                    "stroke_confidence": image_doc.get("analysis", {}).get("stroke_confidence"),
                    "model_used": image_doc.get("model_used", "unknown"),
                    "error": image_doc.get("error"),
                    "handedness": image_doc.get("handedness", "right"),
                    "analyzed_at": image_doc.get("uploaded_at"),  # Use upload time as analysis time
                    "created_at": image_doc.get("uploaded_at", datetime.utcnow())
                }

                # Insert into analysis collection
                analysis_collection.insert_one(analysis_doc)
                migrated_count += 1

                if migrated_count % 10 == 0:
                    print(f"📝 Migrated {migrated_count}/{len(images_with_analysis)} analyses...")

            except Exception as exc:
                print(f"❌ Failed to migrate image {image_doc.get('_id')}: {exc}")
                continue

        print(f"✅ Successfully migrated {migrated_count} analysis records to the 'analysis' collection")

        # Create indexes for better performance
        analysis_collection.create_index([("status", 1)])
        analysis_collection.create_index([("player", 1)])
        analysis_collection.create_index([("stroke", 1)])
        analysis_collection.create_index([("created_at", -1)])
        analysis_collection.create_index([("scores.overall", -1)])
        print("✅ Created database indexes for optimal performance")

        # Print collection stats
        total_analyses = analysis_collection.count_documents({})
        completed_analyses = analysis_collection.count_documents({"status": "completed"})
        avg_score = None

        if completed_analyses > 0:
            pipeline = [
                {"$match": {"status": "completed", "scores.overall": {"$exists": True}}},
                {"$group": {"_id": None, "avgScore": {"$avg": "$scores.overall"}}}
            ]
            result = list(analysis_collection.aggregate(pipeline))
            if result:
                avg_score = round(result[0]["avgScore"], 1)

        print("\n📈 Migration Summary:")
        print(f"   Total analyses: {total_analyses}")
        print(f"   Completed analyses: {completed_analyses}")
        print(f"   Average score: {avg_score if avg_score else 'N/A'}")

    except PyMongoError as exc:
        print(f"❌ MongoDB connection failed: {exc}")
        sys.exit(1)
    except Exception as exc:
        print(f"❌ Migration failed: {exc}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    print("🚀 Starting analysis data migration...")
    migrate_analysis_data()
    print("🎉 Migration completed!")