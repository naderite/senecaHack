import json
from pymongo import MongoClient

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["fitness_db"]

# Map filenames to collection names
files_collections = {
    "users.json": "users",
    "measurements.json": "measurements",
    "activities.json": "activities",
    "workouts.json": "workouts",
    "heart_rate.json": "heart_rate",
    "nutrition.json": "nutrition",
    "sleep.json": "sleep"
}

def import_json_to_mongo(file_path, collection_name, chunk_size=1000):
    collection = db[collection_name]
    with open(file_path, "r", encoding="utf-8") as f:
        # For large files, read line by line and parse objects
        buffer = ""
        docs = []
        for line in f:
            buffer += line
            if line.strip() == "}," or line.strip().endswith("}"):
                try:
                    doc = json.loads(buffer.rstrip(",\n"))
                    docs.append(doc)
                except Exception as e:
                    print(f"Error parsing: {e}")
                buffer = ""
                if len(docs) >= chunk_size:
                    collection.insert_many(docs)
                    docs = []
        if docs:
            collection.insert_many(docs)
    print(f"Imported {collection_name}")

# Import each file
for filename, collection in files_collections.items():
    import_json_to_mongo(f"d:/igl4/s1/seneca data/fitness/large/{filename}", collection)

# Create indexes for user_id
for collection in files_collections.values():
    db[collection].create_index("user_id")