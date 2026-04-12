import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "probat_insight")

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
db = client[MONGODB_DB]
users_collection = db["users"]
contact_messages_collection = db["contact_messages"]
feedbacks_collection = db["feedbacks"]


def check_db_connection() -> tuple[bool, str | None]:
	try:
		client.admin.command("ping")
		return True, None
	except PyMongoError as exc:
		return False, str(exc)
