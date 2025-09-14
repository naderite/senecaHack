import os
import pandas as pd
import random
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

# Environment variable for API key (set this in production)
API_KEY = os.getenv("API_KEY", "secret-key")  # Default for dev, change in prod

class MacroTargets(BaseModel):
    calories: float = Field(2000, ge=1000, le=5000)
    protein: float = Field(150, ge=50, le=300)
    carbs: float = Field(250, ge=100, le=500)
    fat: float = Field(67, ge=30, le=150)
    fatigue: int = Field(0, ge=0, le=2)

class RealisticMealPlanner:
    def __init__(self, csv_path: str):
        self.foods = self.load_and_process_foods(csv_path)
        self.meal_templates = self.define_meal_templates()
        
    def load_and_process_foods(self, csv_path: str) -> pd.DataFrame:
        """Load and clean nutrition data from CSV file"""
        foods = pd.read_csv(csv_path)
        
        # Handle 't' (trace) values by replacing with small numbers
        numeric_cols = ["Grams", "Calories", "Protein", "Fat", "Sat.Fat", "Fiber", "Carbs"]
        for col in numeric_cols:
            if col in foods.columns:
                # Replace 't' with 0.1 (trace amounts)
                foods[col] = foods[col].replace('t', 0.1)
                foods[col] = pd.to_numeric(foods[col], errors="coerce")
        
        # Drop rows with missing critical nutrition data
        foods = foods.dropna(subset=["Calories", "Protein", "Carbs", "Fat"])
        
        # Convert grams to per-100g basis for easier calculations
        foods['calories_per_100g'] = (foods['Calories'] / foods['Grams']) * 100
        foods['protein_per_100g'] = (foods['Protein'] / foods['Grams']) * 100
        foods['carbs_per_100g'] = (foods['Carbs'] / foods['Grams']) * 100
        foods['fat_per_100g'] = (foods['Fat'] / foods['Grams']) * 100
        
        # Add realistic serving sizes based on the original measure
        foods['realistic_serving_g'] = foods.apply(self.determine_realistic_serving, axis=1)
        
        return foods
    
    def determine_realistic_serving(self, row) -> int:
        """Determine realistic serving size based on food type and original measure"""
        category = row['Category']
        original_grams = row['Grams']
        
        # Use original measure as baseline but adjust for realism
        if category == "Dairy products":
            if "milk" in row['Food'].lower():
                return 240  # 1 cup of milk
            elif "cheese" in row['Food'].lower():
                return 30   # 1 oz cheese
            elif "eggs" in row['Food'].lower():
                return 100  # ~2 eggs
            else:
                return min(240, max(30, original_grams))
                
        elif category in ["Meat, Poultry", "Fish, Seafood"]:
            return min(150, max(85, original_grams))  # 3-5 oz serving
            
        elif "Vegetables" in category:
            return min(200, max(100, original_grams))  # 1/2 to 1 cup
            
        elif "Fruits" in category:
            return min(200, max(100, original_grams))  # 1 medium fruit or 1 cup
            
        elif "Breads" in category or "cereals" in category:
            if "bread" in row['Food'].lower():
                return 60   # 2 slices
            elif "rice" in row['Food'].lower():
                return 150  # 3/4 cup cooked
            else:
                return min(150, max(30, original_grams))
                
        elif "Seeds and Nuts" == category:
            return min(30, max(15, original_grams))  # 1-2 tbsp or 1 oz
            
        else:
            return min(200, max(50, original_grams))
    
    def define_meal_templates(self) -> Dict[str, Dict]:
        """Define realistic meal structures using available categories"""
        return {
            'breakfast': {
                'structure': [
                    {'component': 'grain', 'calories_pct': 0.4},
                    {'component': 'protein', 'calories_pct': 0.3},
                    {'component': 'fruit', 'calories_pct': 0.3}
                ],
                'calorie_range': (300, 500),
                'preferred_categories': {
                    'grain': ["Breads, cereals, fastfood,grains"],
                    'protein': ["Dairy products"],
                    'fruit': ["Fruits A-F", "Fruits G-P", "Fruits R-Z"]
                }
            },
            'lunch': {
                'structure': [
                    {'component': 'protein', 'calories_pct': 0.4},
                    {'component': 'grain', 'calories_pct': 0.3},
                    {'component': 'vegetable', 'calories_pct': 0.3}
                ],
                'calorie_range': (400, 700),
                'preferred_categories': {
                    'protein': ["Meat, Poultry", "Fish, Seafood"],
                    'grain': ["Breads, cereals, fastfood,grains"],
                    'vegetable': ["Vegetables A-E", "Vegetables R-Z", "Vegetables F-P"]
                }
            },
            'dinner': {
                'structure': [
                    {'component': 'protein', 'calories_pct': 0.4},
                    {'component': 'vegetable1', 'calories_pct': 0.3},
                    {'component': 'vegetable2', 'calories_pct': 0.3}
                ],
                'calorie_range': (500, 800),
                'preferred_categories': {
                    'protein': ["Meat, Poultry", "Fish, Seafood"],
                    'vegetable1': ["Vegetables A-E", "Vegetables R-Z", "Vegetables F-P"],
                    'vegetable2': ["Vegetables A-E", "Vegetables R-Z", "Vegetables F-P"]
                }
            },
            'snack': {
                'structure': [
                    {'component': 'protein_fat', 'calories_pct': 1.0}
                ],
                'calorie_range': (150, 300),
                'preferred_categories': {
                    'protein_fat': ["Seeds and Nuts", "Dairy products"]
                }
            }
        }
    
    def select_food_from_category(self, categories: List[str]) -> pd.Series:
        """Select a random food from given categories"""
        available_foods = self.foods[self.foods['Category'].isin(categories)]
        if available_foods.empty:
            # Fallback - select from any category
            available_foods = self.foods
        return available_foods.sample(1).iloc[0]
    
    def calculate_realistic_portion(self, food: pd.Series, target_calories: float) -> Tuple[int, Dict]:
        """Calculate realistic portion size"""
        realistic_serving = food['realistic_serving_g']
        calories_per_gram = food['calories_per_100g'] / 100
        
        if calories_per_gram == 0:
            return realistic_serving, self.get_nutrition_for_portion(food, realistic_serving)
        
        # Calculate grams needed for target calories
        target_grams = target_calories / calories_per_gram
        
        # Use a reasonable range around the realistic serving
        min_serving = max(realistic_serving * 0.5, 15)
        max_serving = realistic_serving * 2
        
        # Clamp to reasonable range
        final_grams = max(min_serving, min(target_grams, max_serving))
        
        # Round to reasonable increments
        if final_grams < 50:
            final_grams = round(final_grams / 5) * 5  # Round to 5g
        else:
            final_grams = round(final_grams / 10) * 10  # Round to 10g
        
        final_grams = int(final_grams)
        nutrition = self.get_nutrition_for_portion(food, final_grams)
        
        return final_grams, nutrition
    
    def get_nutrition_for_portion(self, food: pd.Series, grams: int) -> Dict:
        """Calculate nutrition for a specific portion size"""
        factor = grams / 100  # Convert to per-100g factor
        
        return {
            'grams': grams,
            'calories': food['calories_per_100g'] * factor,
            'protein': food['protein_per_100g'] * factor,
            'carbs': food['carbs_per_100g'] * factor,
            'fat': food['fat_per_100g'] * factor
        }
    
    def generate_meal_with_macros(self, meal_type: str, targets: Dict[str, float]) -> List[Dict]:
        """Generate a meal that hits specific macro targets"""
        template = self.meal_templates.get(meal_type, self.meal_templates['lunch'])
        structure = template['structure']
        preferred_cats = template['preferred_categories']
        
        meal_items = []
        remaining_targets = targets.copy()
        
        # Generate initial meal based on calorie distribution
        for component_info in structure:
            component = component_info['component']
            target_calories = targets['calories'] * component_info['calories_pct']
            
            categories = preferred_cats.get(component, ["Meat, Poultry"])
            food = self.select_food_from_category(categories)
            
            portion_grams, nutrition = self.calculate_realistic_portion(food, target_calories)
            
            meal_items.append({
                'food': food['Food'],
                'category': food['Category'],
                'component_type': component,
                'portion_grams': portion_grams,
                'portion_description': self.get_portion_description(food, portion_grams),
                'original_measure': food['Measure'],
                'food_data': food,  # Keep original food data for adjustments
                **nutrition
            })
        
        # Adjust portions to better match macro targets
        meal_items = self.optimize_meal_macros(meal_items, targets)
        
        return meal_items
    
    def optimize_meal_macros(self, meal_items: List[Dict], targets: Dict[str, float]) -> List[Dict]:
        """Fine-tune meal portions to better match macro targets"""
        max_iterations = 5
        tolerance = 0.05  # 5% tolerance
        
        for iteration in range(max_iterations):
            # Calculate current totals
            current = {
                'calories': sum(item['calories'] for item in meal_items),
                'protein': sum(item['protein'] for item in meal_items),
                'carbs': sum(item['carbs'] for item in meal_items),
                'fat': sum(item['fat'] for item in meal_items)
            }
            
            # Check if we're close enough
            if all(abs(current[macro] - targets[macro]) / targets[macro] < tolerance 
                   for macro in targets if targets[macro] > 0):
                break
            
            # Find the macro that's furthest from target (proportionally)
            worst_macro = max(targets.keys(), 
                            key=lambda m: abs(current[m] - targets[m]) / targets[m] if targets[m] > 0 else 0)
            
            if targets[worst_macro] == 0:
                continue
                
            ratio_needed = targets[worst_macro] / current[worst_macro] if current[worst_macro] > 0 else 1
            
            # Find the food item that's richest in the macro we need more of
            best_item_idx = 0
            best_macro_density = 0
            
            for i, item in enumerate(meal_items):
                food_data = item['food_data']
                macro_per_100g = getattr(food_data, f'{worst_macro}_per_100g', 0)
                if macro_per_100g > best_macro_density:
                    best_macro_density = macro_per_100g
                    best_item_idx = i
            
            # Adjust the portion of the best item
            item_to_adjust = meal_items[best_item_idx]
            current_grams = item_to_adjust['portion_grams']
            
            # Calculate new portion size (but keep it reasonable)
            new_grams = int(current_grams * ratio_needed)
            new_grams = max(15, min(new_grams, current_grams * 1.5))  # Don't change by more than 50%
            
            # Recalculate nutrition for adjusted portion
            food_data = item_to_adjust['food_data']
            new_nutrition = self.get_nutrition_for_portion(food_data, new_grams)
            
            # Update the item
            meal_items[best_item_idx].update({
                'portion_grams': new_grams,
                'portion_description': self.get_portion_description(food_data, new_grams),
                **new_nutrition
            })
        
        # Remove food_data from final output (it was just for calculations)
        for item in meal_items:
            item.pop('food_data', None)
            
        return meal_items
    
    def generate_meal(self, meal_type: str, target_calories: float) -> List[Dict]:
        """Generate a realistic meal based on meal type"""
        template = self.meal_templates.get(meal_type, self.meal_templates['lunch'])
        structure = template['structure']
        preferred_cats = template['preferred_categories']
        
        meal_items = []
        
        for component_info in structure:
            component = component_info['component']
            calories_for_component = target_calories * component_info['calories_pct']
            
            # Get appropriate food categories for this component
            categories = preferred_cats.get(component, ["Meat, Poultry"])
            
            # Select food
            food = self.select_food_from_category(categories)
            
            # Calculate realistic portion
            portion_grams, nutrition = self.calculate_realistic_portion(
                food, calories_for_component
            )
            
            meal_items.append({
                'food': food['Food'],
                'category': food['Category'],
                'component_type': component,
                'portion_grams': portion_grams,
                'portion_description': self.get_portion_description(food, portion_grams),
                'original_measure': food['Measure'],
                **nutrition
            })
        
        return meal_items
    
    def get_portion_description(self, food: pd.Series, grams: int) -> str:
        """Convert grams to user-friendly portion descriptions"""
        original_measure = food['Measure']
        original_grams = food['Grams']
        
        # Calculate ratio to original serving
        ratio = grams / original_grams
        
        if ratio <= 0.25:
            return f"1/4 {original_measure}"
        elif ratio <= 0.5:
            return f"1/2 {original_measure}"
        elif ratio <= 0.75:
            return f"3/4 {original_measure}"
        elif ratio <= 1.25:
            return f"1 {original_measure}"
        elif ratio <= 1.75:
            return f"1.5 {original_measure}"
        elif ratio <= 2.25:
            return f"2 {original_measure}"
        else:
            return f"{ratio:.1f} {original_measure}"
    
    def generate_daily_meal_plan(self, daily_calories: float = 2000, daily_protein: float = 150, 
                                 daily_carbs: float = 250, daily_fat: float = 67, 
                                 fatigue: int = 0) -> Dict[str, List]:
        """Generate a full day's meal plan with specific macro targets, adjusted for fatigue level"""
        # Adjust calorie and macro targets based on fatigue level
        if fatigue == 1:  # Energetic: Slightly reduce calories for efficiency
            calorie_modifier = 0.95  # 5% reduction
            daily_calories *= calorie_modifier
            daily_protein *= calorie_modifier
            daily_carbs *= calorie_modifier
            daily_fat *= calorie_modifier
        elif fatigue == 2:  # Fatigued: Increase calories for energy
            calorie_modifier = 1.25  # 15% increase
            daily_calories *= calorie_modifier
            daily_protein *= 1.1  # Slightly increase protein for recovery
            daily_carbs *= 1.2   # Increase carbs for quick energy
            daily_fat *= 1.1     # Slightly increase fat for sustained energy
        
        # Distribute macros across meals
        macro_distribution = {
            'breakfast': {'calories': daily_calories * 0.25, 'protein': daily_protein * 0.25, 
                          'carbs': daily_carbs * 0.30, 'fat': daily_fat * 0.25},
            'lunch': {'calories': daily_calories * 0.35, 'protein': daily_protein * 0.35,
                      'carbs': daily_carbs * 0.35, 'fat': daily_fat * 0.35}, 
            'dinner': {'calories': daily_calories * 0.35, 'protein': daily_protein * 0.35,
                       'carbs': daily_carbs * 0.30, 'fat': daily_fat * 0.35},
            'snack': {'calories': daily_calories * 0.05, 'protein': daily_protein * 0.05,
                      'carbs': daily_carbs * 0.05, 'fat': daily_fat * 0.05}
        }
        
        # For fatigued state, add an extra snack to boost energy
        if fatigue == 2:
            macro_distribution['extra_snack'] = {
                'calories': daily_calories * 0.05,
                'protein': daily_protein * 0.05,
                'carbs': daily_carbs * 0.05,
                'fat': daily_fat * 0.05
            }
        
        meal_plan = {}
        for meal_type, targets in macro_distribution.items():
            meal_plan[meal_type] = self.generate_meal_with_macros(meal_type if meal_type != 'extra_snack' else 'snack', targets)
        
        return meal_plan

# Initialize the planner globally (load data once)
planner = RealisticMealPlanner("nutrition-data.csv")

# FastAPI app
app = FastAPI(
    title="Realistic Meal Planner API",
    description="A scalable and secure API for generating personalized meal plans",
    version="1.0.0",
    openapi_tags=[{"name": "meal-plan", "description": "Meal planning endpoints"}]
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
security = HTTPBearer()

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials

@app.post("/api/v1/meal-plan", tags=["meal-plan"])
async def generate_meal_plan(targets: MacroTargets):
    """
    Generate a daily meal plan based on macro targets and fatigue level.
    
    - **calories**: Daily calorie target (1000-5000)
    - **protein**: Daily protein in grams (50-300)
    - **carbs**: Daily carbs in grams (100-500)
    - **fat**: Daily fat in grams (30-150)
    - **fatigue**: Fatigue level (0: neutral, 1: energetic, 2: fatigued)
    
    Returns the meal plan as JSON.
    """
    try:
        meal_plan = planner.generate_daily_meal_plan(
            daily_calories=targets.calories,
            daily_protein=targets.protein,
            daily_carbs=targets.carbs,
            daily_fat=targets.fat,
            fatigue=targets.fatigue
        )
        return meal_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For running: uvicorn main:app --reload
# In production: Use gunicorn with uvicorn workers for scalability
# e.g., gunicorn -k uvicorn.workers.UvicornWorker -w 4 main:app
# Deploy with Docker, Kubernetes for further scalability
# Ensure HTTPS in production for security