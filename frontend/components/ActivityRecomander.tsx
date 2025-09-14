import React, { useState } from "react";
import {
  Target,
  Zap,
  Clock,
  Flame,
  AlertTriangle,
  Activity,
  Loader2,
} from "lucide-react";

const ActivityRecommender = () => {
  const [formData, setFormData] = useState({
    target_calories: "",
    fatigue_level: "0",
  });

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getFatigueInfo = (level) => {
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

  const getActivityIcon = (activity) => {
    const activityName = activity?.toLowerCase() || "";
    if (activityName.includes("walk")) return "🚶‍♂️";
    if (activityName.includes("run")) return "🏃‍♂️";
    if (activityName.includes("swim")) return "🏊‍♂️";
    if (activityName.includes("cycle") || activityName.includes("bike"))
      return "🚴‍♂️";
    if (activityName.includes("yoga")) return "🧘‍♂️";
    if (activityName.includes("weight") || activityName.includes("strength"))
      return "🏋️‍♂️";
    return "🏃‍♂️"; // default activity icon
  };

  const validateForm = () => {
    if (!formData.target_calories || formData.target_calories === "") {
      setError("Please enter your target calories");
      return false;
    }
    if (parseInt(formData.target_calories) <= 0) {
      setError("Target calories must be greater than 0");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setRecommendation(null);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/recommend_activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_calories: parseInt(formData.target_calories),
          fatigue_level: parseInt(formData.fatigue_level),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setRecommendation(result);
    } catch (err) {
      setError(
        "Failed to get recommendation. Please check your connection and try again."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      target_calories: "",
      fatigue_level: "0",
    });
    setRecommendation(null);
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Target className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Activity Recommender
        </h2>
        <p className="text-gray-600">
          Get personalized activity recommendations based on your goals and
          energy level
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Flame className="h-4 w-4 mr-2 text-orange-500" />
              Target Calories
            </label>
            <input
              type="number"
              name="target_calories"
              value={formData.target_calories}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="e.g., 300"
              min="1"
              max="2000"
            />
            <p className="text-xs text-gray-500 mt-1">
              How many calories do you want to burn?
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Zap className="h-4 w-4 mr-2 text-purple-500" />
              Current Fatigue Level
            </label>
            <select
              name="fatigue_level"
              value={formData.fatigue_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="1">1 - Energetic ⚡</option>
              <option value="0">0 - Neutral 😐</option>
              <option value="2">2 - Fatigued 😴</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              How are you feeling right now?
            </p>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            getFatigueInfo(formData.fatigue_level).bg
          } ${getFatigueInfo(formData.fatigue_level).border} border`}
        >
          <div
            className={`text-sm ${
              getFatigueInfo(formData.fatigue_level).color
            } font-medium`}
          >
            Current Energy State: {getFatigueInfo(formData.fatigue_level).text}
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
                Getting Recommendation...
              </div>
            ) : (
              "Get Activity Recommendation"
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

      {recommendation && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center flex items-center justify-center">
            <Activity className="h-5 w-5 mr-2" />
            Recommended Activity
          </h3>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">
                {getActivityIcon(recommendation.activity)}
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {recommendation.activity}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">
                  {recommendation.duration_minutes}
                </div>
                <div className="text-sm text-blue-600">Minutes</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">
                  {recommendation.estimated_calories}
                </div>
                <div className="text-sm text-orange-600">Calories</div>
              </div>
            </div>

            {recommendation.warning && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-amber-800 mb-1">
                      Important Note:
                    </div>
                    <div className="text-sm text-amber-700">
                      {recommendation.warning}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Recommendation based on your target of{" "}
              <strong>{formData.target_calories} calories</strong> and current
              energy level:{" "}
              <strong>{getFatigueInfo(formData.fatigue_level).text}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityRecommender;
