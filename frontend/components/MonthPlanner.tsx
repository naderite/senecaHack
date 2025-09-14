import React, { useState } from "react";
import MealPlanner from "./MealPlanner";

type MonthData = {
  calories_per_day: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  calories_burn: number;
};

type PlanData = {
  goal: string;
  pace: string;
  start_weight: number;
  target_weight: number;
  monthly_plan: Record<string, MonthData>;
};

type MealPlannerData = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fatigue: string;
};
import {
  Calendar,
  Target,
  TrendingUp,
  Scale,
  Flame,
  Drumstick,
  Droplets,
  Wheat,
  User,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";

const MonthPlanner = () => {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [userId, setUserId] = useState<string>("user_000001");
  const [mealPlannerData, setMealPlannerData] =
    useState<MealPlannerData | null>(null);

  const fetchPlan = async (id: string = userId) => {
    setLoading(true);
    setError("");
    setPlanData(null);
    setMealPlannerData(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:3001/plans/user/user_000001`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setPlanData(result);

      // Extract nutrition values from the first month in the plan
      if (result?.monthly_plan) {
        const firstMonthKey = Object.keys(result.monthly_plan)[0];
        const monthData: MonthData = result.monthly_plan[firstMonthKey];
        setMealPlannerData({
          calories: monthData.calories_per_day?.toString() || "",
          protein: monthData.protein_g?.toString() || "",
          carbs: monthData.carbs_g?.toString() || "",
          fat: monthData.fat_g?.toString() || "",
          fatigue: "0", // default fatigue
        });
      }
    } catch (err) {
      setError(
        "Failed to load plan. Please check your connection and try again."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // THIS useEffect BLOCK WAS REMOVED
  // useEffect(() => {
  //   fetchPlan();
  // }, []);

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handleFetchPlan = () => {
    fetchPlan(userId);
  };

  const getGoalIcon = (goal: string) => {
    const goalLower = goal?.toLowerCase() || "";
    if (goalLower.includes("muscle") || goalLower.includes("gain")) return "💪";
    if (goalLower.includes("weight") || goalLower.includes("lose")) return "⚖️";
    if (goalLower.includes("maintain")) return "🎯";
    return "🏃‍♂️";
  };

  const getPaceColor = (pace: string) => {
    const paceLower = pace?.toLowerCase() || "";
    if (paceLower.includes("quickly"))
      return "bg-red-100 text-red-700 border-red-200";
    if (paceLower.includes("moderately"))
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (paceLower.includes("slowly"))
      return "bg-green-100 text-green-700 border-green-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const formatWeight = (weight: number) => {
    return `${weight} kg`;
  };

  type MacroCardProps = {
    icon: React.ElementType;
    title: string;
    value: number;
    unit: string;
    color: string;
    bgColor: string;
  };
  const MacroCard = ({
    icon: Icon,
    title,
    value,
    unit,
    color,
    bgColor,
  }: MacroCardProps) => (
    <div className={`${bgColor} p-4 rounded-lg border`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-lg font-bold text-gray-800">{value}</span>
      </div>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-xs text-gray-500">{unit}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Calendar className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Monthly Fitness Planner
        </h2>
        <p className="text-gray-600">
          View your personalized fitness and nutrition plan
        </p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 items-end">
          {/* <div className="flex-1">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 mr-2 text-blue-500" />
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={handleUserIdChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Enter user ID (e.g., user_000001)"
            />
          </div> */}
          <button
            onClick={handleFetchPlan}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading
              </div>
            ) : (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Plan
              </div>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && !planData && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your fitness plan...</p>
        </div>
      )}

      {planData && (
        <div className="space-y-6">
          {/* User Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Fitness Goals Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ...existing code... */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {getGoalIcon(planData.goal)}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {planData.goal}
                  </div>
                  <div className="text-sm text-gray-600">Goal</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-center">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPaceColor(
                      planData.pace
                    )}`}
                  >
                    {planData.pace}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Pace</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-center">
                  <Scale className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {formatWeight(planData.start_weight)}
                  </div>
                  <div className="text-sm text-gray-600">Start Weight</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {formatWeight(planData.target_weight)}
                  </div>
                  <div className="text-sm text-gray-600">Target Weight</div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Plans */}
          {Object.entries(planData.monthly_plan).map(
            ([monthKey, monthData]: [string, MonthData]) => (
              <div
                key={monthKey}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  {monthKey.charAt(0).toUpperCase() + monthKey.slice(1)} Plan
                </h3>
                {/* ...existing code for month details... */}
                <div className="mb-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Flame className="h-8 w-8 text-orange-600 mr-3" />
                        <div>
                          <div className="text-2xl font-bold text-gray-800">
                            {monthData.calories_per_day}
                          </div>
                          <div className="text-sm text-gray-600">
                            Daily Calories
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-orange-700">
                          {monthData.calories_burn}
                        </div>
                        <div className="text-sm text-gray-600">
                          Calories to Burn
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4">
                    Daily Macronutrients
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MacroCard
                      icon={Drumstick}
                      title="Protein"
                      value={monthData.protein_g}
                      unit="grams per day"
                      color="text-red-600"
                      bgColor="bg-red-50 border-red-200"
                    />
                    <MacroCard
                      icon={Droplets}
                      title="Fat"
                      value={monthData.fat_g}
                      unit="grams per day"
                      color="text-yellow-600"
                      bgColor="bg-yellow-50 border-yellow-200"
                    />
                    <MacroCard
                      icon={Wheat}
                      title="Carbohydrates"
                      value={monthData.carbs_g}
                      unit="grams per day"
                      color="text-green-600"
                      bgColor="bg-green-50 border-green-200"
                    />
                  </div>
                </div>
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-3">
                    Calorie Breakdown
                  </h5>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-red-700">
                        {Math.round(monthData.protein_g * 4)}
                      </div>
                      <div className="text-gray-600">Protein Calories</div>
                    </div>
                    <div>
                      <div className="font-semibold text-yellow-700">
                        {Math.round(monthData.fat_g * 9)}
                      </div>
                      <div className="text-gray-600">Fat Calories</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-700">
                        {Math.round(monthData.carbs_g * 4)}
                      </div>
                      <div className="text-gray-600">Carb Calories</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Plan Summary
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                • <strong>Goal:</strong> {planData.goal} at a{" "}
                {planData.pace.toLowerCase()} pace
              </p>
              <p>
                • <strong>Weight Change:</strong>{" "}
                {formatWeight(planData.start_weight)} →{" "}
                {formatWeight(planData.target_weight)} (
                {(planData.target_weight - planData.start_weight).toFixed(1)}{" "}
                kg)
              </p>
              <p>
                • <strong>Plan Duration:</strong>{" "}
                {Object.keys(planData.monthly_plan).length} month
                {Object.keys(planData.monthly_plan).length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* MealPlanner Integration */}
          {mealPlannerData && (
            <div className="mt-8">
              <MealPlanner initialData={mealPlannerData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthPlanner;
