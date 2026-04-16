#!/usr/bin/env python3
"""Check database collections and indexes."""

from app.database import db, images_collection

print("Database Collections:")
collections = db.list_collection_names()
for collection in sorted(collections):
    print(f"  - {collection}")

print("\nImages Collection Indexes:")
for idx in images_collection.list_indexes():
    print(f"  - {idx['name']}: {idx['key']}")