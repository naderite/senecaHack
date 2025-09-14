import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Target,
  Activity,
  Mail,
  Ruler,
  Weight,
} from "lucide-react";

// Type definition for user data
interface UserProfile {
  _id: string;
  age: number;
  email: string;
  fitness_level: string;
  gender: string;
  height: number;
  join_date: string;
  name: string;
  user_id: string;
  weight: number;
  weight_goal?: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [weightGoal, setWeightGoal] = useState<number | "">("");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/user/user_000001");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData: UserProfile = await response.json();
        setUser(userData);
        setWeightGoal(userData.weight_goal || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveWeightGoal = () => {
    if (user && weightGoal !== "") {
      setUser({
        ...user,
        weight_goal: Number(weightGoal),
      });
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFitnessLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold mb-2">Error Loading Profile</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No user data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
              <div className="flex items-center space-x-6">
                <div className="bg-white rounded-full p-4">
                  <User className="h-16 w-16 text-blue-600" />
                </div>
                <div className="text-white">
                  <h1 className="text-4xl font-bold">{user.name}</h1>
                  <p className="text-blue-100 text-lg">ID: {user.user_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                Personal Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Email</span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Age</span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {user.age} years
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Gender</span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {user.gender}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Member Since</span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {formatDate(user.join_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fitness Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-blue-600" />
                Fitness Profile
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Fitness Level</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getFitnessLevelColor(
                      user.fitness_level
                    )}`}
                  >
                    {user.fitness_level}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Ruler className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Height</span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {user.height} cm
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Weight className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Current Weight</span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {user.weight} kg
                  </span>
                </div>

                {/* Weight Goal Section */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Weight Goal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          value={weightGoal}
                          onChange={(e) =>
                            setWeightGoal(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          placeholder="kg"
                        />
                        <button
                          onClick={handleSaveWeightGoal}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setWeightGoal(user.weight_goal || "");
                          }}
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-gray-800">
                          {user.weight_goal
                            ? `${user.weight_goal} kg`
                            : "Not set"}
                        </span>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Progress Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {user.weight} kg
                </div>
                <div className="text-gray-600 mt-2">Current Weight</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {user.weight_goal ? `${user.weight_goal} kg` : "--"}
                </div>
                <div className="text-gray-600 mt-2">Goal Weight</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {user.weight_goal
                    ? `${Math.abs(user.weight - user.weight_goal).toFixed(
                        1
                      )} kg`
                    : "--"}
                </div>
                <div className="text-gray-600 mt-2">
                  {user.weight_goal
                    ? user.weight > user.weight_goal
                      ? "To Lose"
                      : "To Gain"
                    : "Difference"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
