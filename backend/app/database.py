import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "probat_insight")

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
db = client[MONGODB_DB]
users_collection = db["users"]
