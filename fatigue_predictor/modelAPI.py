import os
import joblib
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, conint
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from typing import Tuple

# Load environment variables
load_dotenv()

# Load the model
model = joblib.load('perfect_model.pkl')

# Define input schema for the six features
class PredictionInput(BaseModel):
    resting_heart_rate: float
    deep_sleep: float
    sleep_efficiency: float
    awakenings: float
    duration: float
    heart_rate_avg: float

# Define output schema
class PredictionOutput(BaseModel):
    Cluster: int  # Predicted cluster (0, 1, or 2)

# Initialize FastAPI app

app = FastAPI(title="Cluster Prediction API")

# Enable CORS for http://localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Simple API key security
API_KEY = os.getenv("API_KEY", "simple-secret-key")  # Set in .env
security = HTTPBearer()

# Verify API key
async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return credentials.credentials


# Prediction endpoint (GET, no API key)
@app.get("/predict", response_model=PredictionOutput)
async def predict(
    resting_heart_rate: float,
    deep_sleep: float,
    sleep_efficiency: float,
    awakenings: float,
    duration: float,
    heart_rate_avg: float
):
    try:
        # Prepare input for model
        data = [[
            resting_heart_rate,
            deep_sleep,
            sleep_efficiency,
            awakenings,
            duration,
            heart_rate_avg
        ]]
        prediction = model.predict(data)[0]
        # Validate prediction
        if prediction not in [0, 1, 2]:
            raise HTTPException(status_code=500, detail="Invalid prediction value")
        return {"Cluster": int(prediction)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "healthy"}

# --- Workout Planner API ---

# Define activities with calorie burn per hour (approx for 150lb person) and fatigue level
ACTIVITIES = {
    'Pilates': {'cal_per_hour': 250, 'fatigue': 'medium'},
    'Weight Training': {'cal_per_hour': 400, 'fatigue': 'high'},
    'Walking': {'cal_per_hour': 275, 'fatigue': 'low'},
    'Swimming': {'cal_per_hour': 500, 'fatigue': 'medium'},
    'Cycling': {'cal_per_hour': 500, 'fatigue': 'medium'},
    'Yoga': {'cal_per_hour': 200, 'fatigue': 'low'},
    'Running': {'cal_per_hour': 700, 'fatigue': 'high'}
}

# Pydantic model for input validation
from pydantic import Field

class ActivityRequest(BaseModel):
    target_calories: int = Field(..., ge=0, description="Non-negative integer")
    fatigue_level: int = Field(..., ge=0, le=2, description="0, 1, or 2")

def recommend_activity(target_calories: int, fatigue_level: int) -> Tuple[str, int, str]:
    """
    Recommend activity, duration, and optional warning based on inputs.
    - Fatigue: 0 (normal) -> any activity, 1 (energetic) -> high/medium, 2 (fatigued) -> low
    - Duration: calculated to meet target calories, rounded to nearest 10 min
    - Caps: 30-120 min normally, 30-60 min when fatigued (level 2)
    - Returns: (activity, duration, warning_message)
    """
    fatigue_priority = {
        0: ['Pilates', 'Weight Training', 'Walking', 'Swimming', 'Cycling', 'Yoga', 'Running'],  # Normal: all activities
        1: ['Weight Training', 'Running', 'Swimming', 'Cycling'],  # Energetic: high or medium
        2: ['Yoga', 'Walking']  # Fatigued: low, prefer Yoga
    }
    # Filter candidates by fatigue level
    candidates = fatigue_priority.get(fatigue_level, ['Yoga'])  # Default to Yoga if invalid fatigue
    # Select the best: highest cal/hour that fits (to minimize duration)
    best_activity = max(candidates, key=lambda act: ACTIVITIES[act]['cal_per_hour'])
    # Calculate duration
    cal_per_hour = ACTIVITIES[best_activity]['cal_per_hour']
    max_duration = 60 if fatigue_level == 2 else 120  # Cap at 60 min for fatigued
    duration_min = max(30, min(max_duration, round((target_calories / cal_per_hour) * 60 / 10) * 10))  # Round to nearest 10 min
    # Warning if calorie target not met due to duration cap
    warning = ""
    estimated_calories = (duration_min / 60) * cal_per_hour
    if fatigue_level == 2 and estimated_calories < target_calories:
        warning = f"Note: Due to fatigue, duration is capped at 60 minutes, achieving {round(estimated_calories)} kcal instead of {target_calories} kcal."
    return best_activity, duration_min, warning

@app.post("/recommend_activity")
async def get_activity_recommendation(request: ActivityRequest):
    """
    API endpoint to recommend an activity based on target calories and fatigue level.
    Returns JSON with activity, duration, estimated calories, and warning (if any).
    """
    try:
        activity, duration, warning = recommend_activity(request.target_calories, request.fatigue_level)
        estimated_calories = round((duration / 60) * ACTIVITIES[activity]['cal_per_hour'])
        response = {
            "activity": activity,
            "duration_minutes": duration,
            "estimated_calories": estimated_calories,
            "warning": warning if warning else None
        }
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing request: {str(e)}")