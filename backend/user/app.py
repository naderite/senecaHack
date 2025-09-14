
from flask import Flask, jsonify, request
from flask_cors import CORS

from pymongo import MongoClient

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

client = MongoClient("mongodb://localhost:27017/")
db = client["fitness_db"]

# Get user info
@app.route('/user/<user_id>', methods=['GET'])
def get_user_info(user_id):
    user = db.users.find_one({"user_id": user_id})
    if user:
        user["_id"] = str(user["_id"])
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404

# Get activities for user
@app.route('/user/<user_id>/activities', methods=['GET'])
def get_user_activities(user_id):
    activities = list(db.activities.find({"user_id": user_id}))
    for activity in activities:
        activity["_id"] = str(activity["_id"])
    return jsonify(activities)

# Get heart rate for user
@app.route('/user/<user_id>/heart_rate', methods=['GET'])
def get_user_heart_rate(user_id):
    heart_rates = list(db.heart_rate.find({"user_id": user_id}))
    for hr in heart_rates:
        hr["_id"] = str(hr["_id"])
    return jsonify(heart_rates)

# Get measurements for user
@app.route('/user/<user_id>/measurements', methods=['GET'])
def get_user_measurements(user_id):
    measurements = list(db.measurements.find({"user_id": user_id}))
    for m in measurements:
        m["_id"] = str(m["_id"])
    return jsonify(measurements)

# Get nutrition for user
@app.route('/user/<user_id>/nutrition', methods=['GET'])
def get_user_nutrition(user_id):
    nutrition = list(db.nutrition.find({"user_id": user_id}))
    for n in nutrition:
        n["_id"] = str(n["_id"])
    return jsonify(nutrition)

# Get sleep for user
@app.route('/user/<user_id>/sleep', methods=['GET'])
def get_user_sleep(user_id):
    sleep = list(db.sleep.find({"user_id": user_id}))
    for s in sleep:
        s["_id"] = str(s["_id"])
    return jsonify(sleep)

if __name__ == '__main__':
    app.run(debug=True)