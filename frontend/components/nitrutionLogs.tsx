import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Utensils,
  Droplets,
  AlertCircle,
  Apple,
  Coffee,
  Sandwich,
  Pizza,
} from "lucide-react";
import { useParams } from "next/navigation";
// Type definitions matching your nutrition API data structure
interface NutritionLog {
  _id: string;
  calories: number;
  carbs: number;
  date: string;
  fat: number;
  fiber: number;
  food_items: string[];
  meal_type: string;
  notes: string;
  nutrition_id: string;
  protein: number;
  sodium: number;
  sugar: number;
  user_id: string;
  water_intake: number;
}

type SortField =
  | "date"
  | "calories"
  | "protein"
  | "carbs"
  | "fat"
  | "water_intake";
type SortDirection = "asc" | "desc";
type FilterPeriod = "all" | "today" | "week" | "month";
type MealTypeFilter = "all" | "Breakfast" | "Lunch" | "Dinner" | "Snack";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const NutritionLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("week");
  const [mealTypeFilter, setMealTypeFilter] = useState<MealTypeFilter>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const params = useParams();
  let id = params.id; // This will be '001' for /link/001
  id = id ? id : "user_000001";
  // Fetch nutrition data from API
  useEffect(() => {
    const fetchNutritionLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5000/user/${id}/nutrition`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NutritionLog[] = await response.json();
        setLogs(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch nutrition logs"
        );
        console.error("Error fetching nutrition logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionLogs();
  }, []);

  // Filter logs based on search term, time period, and meal type
  const filteredLogs = useMemo(() => {
    let filtered = logs.filter(
      (log) =>
        log.meal_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.food_items.some((item) =>
          item.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        log.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by meal type
    if (mealTypeFilter !== "all") {
      filtered = filtered.filter((log) => log.meal_type === mealTypeFilter);
    }

    // Filter by time period
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    switch (filterPeriod) {
      case "today":
        filtered = filtered.filter((log) => log.date === today);
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((log) => new Date(log.date) >= weekAgo);
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((log) => new Date(log.date) >= monthAgo);
        break;
      case "all":
      default:
        break;
    }

    return filtered;
  }, [logs, searchTerm, filterPeriod, mealTypeFilter]);

  // Sort logs
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortConfig.field) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "calories":
          aValue = a.calories;
          bValue = b.calories;
          break;
        case "protein":
          aValue = a.protein;
          bValue = b.protein;
          break;
        case "carbs":
          aValue = a.carbs;
          bValue = b.carbs;
          break;
        case "fat":
          aValue = a.fat;
          bValue = b.fat;
          break;
        case "water_intake":
          aValue = a.water_intake;
          bValue = b.water_intake;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getMealIcon = (mealType: string): React.ReactNode => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case "lunch":
        return <Sandwich className="w-4 h-4 text-green-600" />;
      case "dinner":
        return <Pizza className="w-4 h-4 text-red-600" />;
      case "snack":
        return <Apple className="w-4 h-4 text-purple-600" />;
      default:
        return <Utensils className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMealColor = (mealType: string): string => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return "bg-amber-100 text-amber-800";
      case "lunch":
        return "bg-green-100 text-green-800";
      case "dinner":
        return "bg-red-100 text-red-800";
      case "snack":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const SortableHeader: React.FC<{
    field: SortField;
    children: React.ReactNode;
  }> = ({ field, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig.field === field &&
          (sortConfig.direction === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          ))}
      </div>
    </th>
  );

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (sortedLogs.length === 0) {
      return {
        totalMeals: 0,
        totalCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        totalWater: 0,
        avgFiber: 0,
        avgSodium: 0,
      };
    }

    return {
      totalMeals: sortedLogs.length,
      totalCalories: sortedLogs.reduce((sum, log) => sum + log.calories, 0),
      avgProtein:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.protein, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      avgCarbs:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.carbs, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      avgFat:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.fat, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      totalWater:
        Math.round(
          sortedLogs.reduce((sum, log) => sum + log.water_intake, 0) * 10
        ) / 10,
      avgFiber:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.fiber, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      avgSodium: Math.round(
        sortedLogs.reduce((sum, log) => sum + log.sodium, 0) / sortedLogs.length
      ),
    };
  }, [sortedLogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">
            Loading nutrition data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nutrition Tracker
          </h1>
          <p className="text-gray-600">
            Monitor your daily nutrition intake and eating habits
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalMeals}
                </div>
                <div className="text-sm text-gray-500">Meals</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalCalories}
                </div>
                <div className="text-sm text-gray-500">Calories</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgProtein}g
                </div>
                <div className="text-sm text-gray-500">Avg Protein</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgCarbs}g
                </div>
                <div className="text-sm text-gray-500">Avg Carbs</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                F
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgFat}g
                </div>
                <div className="text-sm text-gray-500">Avg Fat</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalWater}L
                </div>
                <div className="text-sm text-gray-500">Water</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                F
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgFiber}g
                </div>
                <div className="text-sm text-gray-500">Avg Fiber</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgSodium}
                </div>
                <div className="text-sm text-gray-500">Avg Sodium</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search meals, food items, notes..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={filterPeriod}
                    onChange={(e) =>
                      setFilterPeriod(e.target.value as FilterPeriod)
                    }
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Utensils className="w-4 h-4 text-gray-400" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={mealTypeFilter}
                    onChange={(e) =>
                      setMealTypeFilter(e.target.value as MealTypeFilter)
                    }
                  >
                    <option value="all">All Meals</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Showing {sortedLogs.length} of {logs.length} entries
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader field="date">Date</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal & Foods
                  </th>
                  <SortableHeader field="calories">Calories</SortableHeader>
                  <SortableHeader field="protein">Protein</SortableHeader>
                  <SortableHeader field="carbs">Carbs</SortableHeader>
                  <SortableHeader field="fat">Fat</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiber/Sugar
                  </th>
                  <SortableHeader field="water_intake">Water</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(log.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {getMealIcon(log.meal_type)}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMealColor(
                            log.meal_type
                          )}`}
                        >
                          {log.meal_type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.food_items.slice(0, 2).map((item, index) => (
                          <div key={index} className="truncate">
                            {item}
                          </div>
                        ))}
                        {log.food_items.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{log.food_items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-orange-600">
                        {log.calories}
                      </div>
                      <div className="text-xs text-gray-500">kcal</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-red-600">
                        {log.protein}g
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-yellow-600">
                        {log.carbs}g
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-purple-600">
                        {log.fat}g
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.fiber}g fiber
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.sugar}g sugar
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Droplets className="w-4 h-4 text-blue-400 mr-1" />
                        <span className="text-sm text-blue-600 font-medium">
                          {log.water_intake}L
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-600 max-w-32 truncate"
                        title={log.notes}
                      >
                        {log.notes}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Sodium: {log.sodium}mg
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedLogs.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">
                No nutrition logs found
              </div>
              <div className="text-gray-400 text-sm mt-1">
                Try adjusting your search or filter criteria
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionLogsTable;
