import React, { useState, useEffect } from "react";
import {
  Heart,
  Footprints,
  Flame,
  TrendingUp,
  Calendar,
  Moon,
  Apple,
  BookOpen,
  Utensils,
  Target,
  Brain,
  CalendarDays,
} from "lucide-react";

const FitnessDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [heartRate, setHeartRate] = useState(72);
  const [isHeartBeating, setIsHeartBeating] = useState(true);

  // Simulate real-time heart rate updates
  useEffect(() => {
    const heartRateInterval = setInterval(() => {
      setHeartRate((prev) => {
        const variation = Math.random() * 10 - 5; // ±5 bpm variation
        return Math.max(60, Math.min(100, prev + variation));
      });
    }, 2000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const heartBeatInterval = setInterval(() => {
      setIsHeartBeating((prev) => !prev);
    }, 60000 / heartRate); // Beat based on current heart rate

    return () => {
      clearInterval(heartRateInterval);
      clearInterval(timeInterval);
      clearInterval(heartBeatInterval);
    };
  }, [heartRate]);

  // Mock fitness data - in real app, this would come from your API/state management
  const fitnessData = {
    steps: {
      current: 8247,
      goal: 10000,
      percentage: 82.47,
    },
    calories: {
      burned: 542,
      goal: 700,
      percentage: 77.43,
    },
    heartRate: {
      current: Math.round(heartRate),
      resting: 68,
      max: 185,
    },
  };

  const StatCard = ({
    icon: Icon,
    title,
    current,
    goal,
    unit,
    percentage,
    color,
    children,
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {percentage && (
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {current.toLocaleString()}
          </span>
          <span className="text-lg text-gray-500">{unit}</span>
        </div>

        {goal && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${color
                  .replace("bg-", "bg-")
                  .replace("-500", "-400")}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Goal: {goal.toLocaleString()} {unit}
            </p>
          </>
        )}

        {children}
      </div>
    </div>
  );

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Fitness Dashboard
              </h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(currentTime)}</span>
                <span className="ml-4 font-mono text-lg">
                  {currentTime.toLocaleTimeString("en-US", { hour12: false })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Heart Rate Card */}
          <StatCard
            icon={Heart}
            title="Heart Rate"
            current={fitnessData.heartRate.current}
            unit="bpm"
            color="bg-red-500"
          >
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <Heart
                  className={`w-6 h-6 text-red-500 transition-transform duration-150 ${
                    isHeartBeating ? "scale-125" : "scale-100"
                  }`}
                />
                <div className="text-sm">
                  <div className="text-gray-600">
                    Resting: {fitnessData.heartRate.resting} bpm
                  </div>
                  <div className="text-gray-600">
                    Max: {fitnessData.heartRate.max} bpm
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  Normal
                </div>
                <div className="text-xs text-gray-500">Zone 2</div>
              </div>
            </div>
          </StatCard>

          {/* Steps Card */}
          <StatCard
            icon={Footprints}
            title="Steps Today"
            current={fitnessData.steps.current}
            goal={fitnessData.steps.goal}
            unit="steps"
            percentage={fitnessData.steps.percentage}
            color="bg-blue-500"
          >
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  +12% from yesterday
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {(
                  fitnessData.steps.goal - fitnessData.steps.current
                ).toLocaleString()}{" "}
                left
              </div>
            </div>
          </StatCard>

          {/* Calories Card */}
          <StatCard
            icon={Flame}
            title="Calories Burned"
            current={fitnessData.calories.burned}
            goal={fitnessData.calories.goal}
            unit="kcal"
            percentage={fitnessData.calories.percentage}
            color="bg-orange-500"
          >
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  On track
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {fitnessData.calories.goal - fitnessData.calories.burned} left
              </div>
            </div>
          </StatCard>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Today's Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">82%</div>
              <div className="text-sm text-gray-600 mt-1">
                Daily Goal Progress
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600">6.2</div>
              <div className="text-sm text-gray-600 mt-1">Miles Walked</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">47</div>
              <div className="text-sm text-gray-600 mt-1">Active Minutes</div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Health Tracking */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Health Tracking
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Logs Button */}
            <a
              href="/logs"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-center">
                <div className="p-3 bg-blue-500 rounded-full mx-auto mb-3 group-hover:bg-blue-600 transition-colors duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                  Activity Logs
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Track your workouts
                </p>
              </div>
            </a>

            {/* Nutrition Button */}
            <a
              href="/nutritions"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-200"
            >
              <div className="text-center">
                <div className="p-3 bg-green-500 rounded-full mx-auto mb-3 group-hover:bg-green-600 transition-colors duration-300">
                  <Apple className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
                  Nutrition
                </h3>
                <p className="text-sm text-gray-600 mt-1">Monitor your diet</p>
              </div>
            </a>

            {/* Sleep Button */}
            <a
              href="/sleep"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-indigo-200 sm:col-span-2 lg:col-span-1"
            >
              <div className="text-center">
                <div className="p-3 bg-indigo-500 rounded-full mx-auto mb-3 group-hover:bg-indigo-600 transition-colors duration-300">
                  <Moon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300">
                  Sleep Tracking
                </h3>
                <p className="text-sm text-gray-600 mt-1">Analyze your rest</p>
              </div>
            </a>
          </div>
        </div>

        {/* Navigation Buttons - Smart Features */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Smart Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Planner Button */}
            <a
              href="/planner"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-200"
            >
              <div className="text-center">
                <div className="p-3 bg-purple-500 rounded-full mx-auto mb-3 group-hover:bg-purple-600 transition-colors duration-300">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                  monthly Planner
                </h3>
                <p className="text-sm text-gray-600 mt-1">Plan your fitness</p>
              </div>
            </a>

            {/* Predict Button */}
            <a
              href="/predict"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-cyan-200"
            >
              <div className="text-center">
                <div className="p-3 bg-cyan-500 rounded-full mx-auto mb-3 group-hover:bg-cyan-600 transition-colors duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-700 transition-colors duration-300">
                  Predict fatigue
                </h3>
                <p className="text-sm text-gray-600 mt-1">AI predictions</p>
              </div>
            </a>

            {/* Recommander Button */}
            <a
              href="/recomander"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-amber-200"
            >
              <div className="text-center">
                <div className="p-3 bg-amber-500 rounded-full mx-auto mb-3 group-hover:bg-amber-600 transition-colors duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-amber-700 transition-colors duration-300">
                  activity Recommendations
                </h3>
                <p className="text-sm text-gray-600 mt-1">Personalized tips</p>
              </div>
            </a>

            {/* Meals Button */}
            <a
              href="/meals"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-rose-200"
            >
              <div className="text-center">
                <div className="p-3 bg-rose-500 rounded-full mx-auto mb-3 group-hover:bg-rose-600 transition-colors duration-300">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-rose-700 transition-colors duration-300">
                  Meals
                </h3>
                <p className="text-sm text-gray-600 mt-1">Meal planning</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessDashboard;
