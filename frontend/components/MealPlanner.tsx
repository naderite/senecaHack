import React, { useState } from "react";
import {
  UtensilsCrossed,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Zap,
  Clock,
  ChefHat,
  Loader2,
  Coffee,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";

type MealPlannerProps = {
  initialData?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fatigue: string;
  };
};

const MealPlanner: React.FC<MealPlannerProps> = ({ initialData }) => {
  type FormData = {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fatigue: string;
    [key: string]: string; // index signature for dynamic access
  };

  const [formData, setFormData] = useState<FormData>({
    calories: initialData?.calories || "",
    protein: initialData?.protein || "",
    carbs: initialData?.carbs || "",
    fat: initialData?.fat || "",
    fatigue: initialData?.fatigue || "0",
  });

  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getFatigueInfo = (level: string) => {
    switch (parseInt(level)) {
      case 0:
        return {
          text: "Neutral",
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
        };
      case 1:
        return {
          text: "Energetic",
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
        };
      case 2:
        return {
          text: "Fatigued",
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
        };
      default:
        return {
          text: "Unknown",
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
        };
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return <Coffee className="h-5 w-5" />;
      case "lunch":
        return <Sun className="h-5 w-5" />;
      case "dinner":
        return <Sunset className="h-5 w-5" />;
      case "snack":
        return <Moon className="h-5 w-5" />;
      default:
        return <UtensilsCrossed className="h-5 w-5" />;
    }
  };

  const getMealColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "lunch":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "dinner":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "snack":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getComponentTypeColor = (componentType?: string) => {
    switch (componentType?.toLowerCase()) {
      case "protein":
        return "bg-red-100 text-red-800 border-red-200";
      case "grain":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "fruit":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "vegetable":
      case "vegetable1":
      case "vegetable2":
        return "bg-green-100 text-green-800 border-green-200";
      case "protein_fat":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const validateForm = (): boolean => {
    const requiredFields: string[] = ["calories", "protein", "carbs", "fat"];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field] === "") {
        setError(`Please fill in all nutritional fields`);
        return false;
      }
      if (parseInt(formData[field]) <= 0) {
        setError(
          `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } must be greater than 0`
        );
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    setMealPlan(null);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:4000/api/v1/meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calories: parseInt(formData.calories),
          protein: parseInt(formData.protein),
          carbs: parseInt(formData.carbs),
          fat: parseInt(formData.fat),
          fatigue: parseInt(formData.fatigue),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMealPlan(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes("Failed to fetch")) {
        setError(
          "Cannot connect to the server. Please make sure the API is running on http://127.0.0.1:4000"
        );
      } else {
        setError(`Failed to generate meal plan: ${errorMsg}`);
      }
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      fatigue: "0",
    });
    setMealPlan(null);
    setError("");
  };

  type Food = {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    food?: string;
    component_type?: string;
    category?: string;
    portion_description?: string;
    portion_grams?: number;
  };

  const calculateMealTotals = (
    meal: Food[]
  ): { calories: number; protein: number; carbs: number; fat: number } => {
    return meal.reduce(
      (
        totals: {
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        },
        food: Food
      ) => ({
        calories: totals.calories + (food.calories || 0),
        protein: totals.protein + (food.protein || 0),
        carbs: totals.carbs + (food.carbs || 0),
        fat: totals.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const calculateDayTotals = (): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } => {
    if (!mealPlan) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    return Object.values(mealPlan).reduce(
      (
        dayTotals: {
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        },
        meal: Food[]
      ) => {
        const mealTotals = calculateMealTotals(meal);
        return {
          calories: dayTotals.calories + mealTotals.calories,
          protein: dayTotals.protein + mealTotals.protein,
          carbs: dayTotals.carbs + mealTotals.carbs,
          fat: dayTotals.fat + mealTotals.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  type FoodItemProps = {
    food: Food;
  };
  const FoodItem: React.FC<FoodItemProps> = ({ food }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 flex-1">{food.food}</h4>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${getComponentTypeColor(
            food.component_type
          )}`}
        >
          {food.component_type?.replace("_", " ").replace(/\d+/g, "")}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <p className="mb-1">{food.category}</p>
        <p className="font-medium">
          {food.portion_description} ({food.portion_grams}g)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <Flame className="h-3 w-3 text-orange-500 mr-1" />
          <span>{Math.round(food.calories ?? 0)} cal</span>
        </div>
        <div className="flex items-center">
          <Beef className="h-3 w-3 text-red-500 mr-1" />
          <span>{Math.round(food.protein ?? 0)}g protein</span>
        </div>
        <div className="flex items-center">
          <Wheat className="h-3 w-3 text-amber-500 mr-1" />
          <span>{Math.round(food.carbs ?? 0)}g carbs</span>
        </div>
        <div className="flex items-center">
          <Droplets className="h-3 w-3 text-blue-500 mr-1" />
          <span>{Math.round(food.fat ?? 0)}g fat</span>
        </div>
      </div>
    </div>
  );

  type MealSectionProps = {
    mealType: string;
    foods: Food[];
  };
  const MealSection: React.FC<MealSectionProps> = ({ mealType, foods }) => {
    const mealTotals = calculateMealTotals(foods);

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border ${getMealColor(mealType)}`}>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            {getMealIcon(mealType)}
            <span className="ml-2 capitalize">{mealType}</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center">
              <Flame className="h-4 w-4 mr-1" />
              <span>{Math.round(mealTotals.calories)} cal</span>
            </div>
            <div className="flex items-center">
              <Beef className="h-4 w-4 mr-1" />
              <span>{Math.round(mealTotals.protein)}g</span>
            </div>
            <div className="flex items-center">
              <Wheat className="h-4 w-4 mr-1" />
              <span>{Math.round(mealTotals.carbs)}g</span>
            </div>
            <div className="flex items-center">
              <Droplets className="h-4 w-4 mr-1" />
              <span>{Math.round(mealTotals.fat)}g</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foods.map((food: Food, index: number) => (
            <FoodItem key={index} food={food} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <ChefHat className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Meal Planner</h2>
        <p className="text-gray-600">
          Generate personalized meal plans based on your nutritional goals
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Flame className="h-4 w-4 mr-2 text-orange-500" />
              Target Calories
            </label>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="2000"
              min="1"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Beef className="h-4 w-4 mr-2 text-red-500" />
              Protein (g)
            </label>
            <input
              type="number"
              name="protein"
              value={formData.protein}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="150"
              min="1"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Wheat className="h-4 w-4 mr-2 text-amber-500" />
              Carbs (g)
            </label>
            <input
              type="number"
              name="carbs"
              value={formData.carbs}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="250"
              min="1"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Droplets className="h-4 w-4 mr-2 text-blue-500" />
              Fat (g)
            </label>
            <input
              type="number"
              name="fat"
              value={formData.fat}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="67"
              min="1"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Zap className="h-4 w-4 mr-2 text-purple-500" />
              Fatigue Level
            </label>
            <select
              name="fatigue"
              value={formData.fatigue}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="1">1 - Energetic ⚡</option>
              <option value="0">0 - Neutral 😐</option>
              <option value="2">2 - Fatigued 😴</option>
            </select>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${getFatigueInfo(formData.fatigue).bg} ${
            getFatigueInfo(formData.fatigue).border
          } border`}
        >
          <div
            className={`text-sm ${
              getFatigueInfo(formData.fatigue).color
            } font-medium`}
          >
            Current Energy State: {getFatigueInfo(formData.fatigue).text}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Meal Plan...
              </div>
            ) : (
              "Generate Meal Plan"
            )}
          </button>

          <button
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {!mealPlan && !loading && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No meal plan generated yet</p>
          <p className="text-sm text-gray-500">
            Fill in your nutritional goals and click "Generate Meal Plan"
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Creating your personalized meal plan...
          </p>
        </div>
      )}

      {mealPlan && (
        <div className="space-y-8">
          {/* Daily Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Daily Nutrition Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const totals = calculateDayTotals();
                return (
                  <>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800">
                        {Math.round(totals.calories)}
                      </div>
                      <div className="text-sm text-gray-600">Calories</div>
                      <div className="text-xs text-gray-500">
                        Target: {formData.calories}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <Beef className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800">
                        {Math.round(totals.protein)}g
                      </div>
                      <div className="text-sm text-gray-600">Protein</div>
                      <div className="text-xs text-gray-500">
                        Target: {formData.protein}g
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <Wheat className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800">
                        {Math.round(totals.carbs)}g
                      </div>
                      <div className="text-sm text-gray-600">Carbs</div>
                      <div className="text-xs text-gray-500">
                        Target: {formData.carbs}g
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800">
                        {Math.round(totals.fat)}g
                      </div>
                      <div className="text-sm text-gray-600">Fat</div>
                      <div className="text-xs text-gray-500">
                        Target: {formData.fat}g
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Meal Sections */}
          {Object.entries(mealPlan).map(([mealType, foods]) => (
            <div key={mealType} className="bg-gray-50 rounded-lg p-6">
              <MealSection mealType={mealType} foods={foods as Food[]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
