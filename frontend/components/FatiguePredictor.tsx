import React, { useState } from "react";
import { Activity, Heart, Moon, Clock, BarChart3, Loader2 } from "lucide-react";

const FatiguePredictor = () => {
  const [formData, setFormData] = useState({
    resting_heart_rate: "",
    deep_sleep: "",
    sleep_efficiency: "",
    awakenings: "",
    duration: "",
    heart_rate_avg: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getPredictionText = (cluster) => {
    switch (cluster) {
      case 0:
        return {
          text: "Neutral",
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: "😐",
        };
      case 1:
        return {
          text: "Energetic",
          color: "text-green-600",
          bg: "bg-green-100",
          icon: "⚡",
        };
      case 2:
        return {
          text: "Fatigued",
          color: "text-red-600",
          bg: "bg-red-100",
          icon: "😴",
        };
      default:
        return {
          text: "Unknown",
          color: "text-gray-600",
          bg: "bg-gray-100",
          icon: "❓",
        };
    }
  };

  const validateForm = () => {
    const requiredFields = Object.keys(formData);
    for (let field of requiredFields) {
      if (!formData[field] || formData[field] === "") {
        setError(`Please fill in all fields`);
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setPrediction(null);
    setError("");

    try {
      const queryParams = new URLSearchParams(formData).toString();
      const response = await fetch(
        `http://127.0.0.1:8000/predict?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result.Cluster);
    } catch (err) {
      setError(
        "Failed to get prediction. Please check your connection and try again."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      resting_heart_rate: "",
      deep_sleep: "",
      sleep_efficiency: "",
      awakenings: "",
      duration: "",
      heart_rate_avg: "",
    });
    setPrediction(null);
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Activity className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Fatigue Predictor
        </h2>
        <p className="text-gray-600">
          Enter your health metrics to predict your energy level
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              Resting Heart Rate (BPM)
            </label>
            <input
              type="number"
              name="resting_heart_rate"
              value={formData.resting_heart_rate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="e.g., 65"
              min="40"
              max="120"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Moon className="h-4 w-4 mr-2 text-indigo-500" />
              Deep Sleep (hours)
            </label>
            <input
              type="number"
              step="0.1"
              name="deep_sleep"
              value={formData.deep_sleep}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1.5"
              min="0"
              max="10"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <BarChart3 className="h-4 w-4 mr-2 text-green-500" />
              Sleep Efficiency (%)
            </label>
            <input
              type="number"
              name="sleep_efficiency"
              value={formData.sleep_efficiency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 85"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              Awakenings (count)
            </label>
            <input
              type="number"
              name="awakenings"
              value={formData.awakenings}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 3"
              min="0"
              max="50"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 mr-2 text-purple-500" />
              Exercise Duration (hours)
            </label>
            <input
              type="number"
              step="0.1"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1.5"
              min="0"
              max="10"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Heart className="h-4 w-4 mr-2 text-red-400" />
              Average Heart Rate (BPM)
            </label>
            <input
              type="number"
              name="heart_rate_avg"
              value={formData.heart_rate_avg}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 120"
              min="60"
              max="200"
            />
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
                Predicting...
              </div>
            ) : (
              "Predict Fatigue Level"
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

      {prediction !== null && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Prediction Result
          </h3>
          <div
            className={`${getPredictionText(prediction).bg} ${
              getPredictionText(prediction).color
            } p-4 rounded-lg text-center`}
          >
            <div className="text-4xl mb-2">
              {getPredictionText(prediction).icon}
            </div>
            <div className="text-2xl font-bold mb-2">
              {getPredictionText(prediction).text}
            </div>
            <div className="text-sm opacity-75">Cluster: {prediction}</div>
          </div>

          <div className="mt-4 text-sm text-gray-600 text-center">
            <p className="mb-2">
              <strong>Energy Levels:</strong>
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>1 =
                Energetic
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-yellow-200 rounded mr-1"></div>0 =
                Neutral
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-200 rounded mr-1"></div>2 =
                Fatigued
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FatiguePredictor;
