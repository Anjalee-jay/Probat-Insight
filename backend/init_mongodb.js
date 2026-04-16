// init_mongodb.js
// MongoDB shell script to initialize collections for Probat Insight

// Switch to the probat_insight database
use probat_insight;

// Create collections (MongoDB creates them implicitly, but we can ensure they exist)
db.createCollection("users");
db.createCollection("contact_messages");
db.createCollection("feedbacks");
db.createCollection("images");

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "active": 1 });

// Create indexes for contact_messages collection
db.contact_messages.createIndex({ "created_at": -1 });
db.contact_messages.createIndex({ "email": 1 });
db.contact_messages.createIndex({ "status": 1 });

// Create indexes for feedbacks collection
db.feedbacks.createIndex({ "created_at": -1 });
db.feedbacks.createIndex({ "rating": 1 });
db.feedbacks.createIndex({ "email": 1 });

// Create indexes for images collection
db.images.createIndex({ "uploaded_at": -1 });
db.images.createIndex({ "status": 1 });
db.images.createIndex({ "player": 1 });
db.images.createIndex({ "filename": 1 });

// Compound indexes for common queries
db.images.createIndex({ "status": 1, "uploaded_at": -1 });

print("✅ All collections and indexes created successfully!");
print("Collections: users, contact_messages, feedbacks, images");