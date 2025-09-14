import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Heart,
  Footprints,
  Flame,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Thermometer,
  AlertCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
// Type definitions matching your API data structure
interface FitnessLog {
  _id: string;
  activity_id: string;
  activity_type: string;
  calories_burned: number;
  date: string;
  distance: number;
  duration: number;
  elevation_gain: number;
  heart_rate_avg: number;
  heart_rate_max: number;
  intensity: "Low" | "Moderate" | "High";
  notes: string;
  steps: number;
  user_id: string;
  weather: string;
}

type SortField =
  | "date"
  | "steps"
  | "calories_burned"
  | "heart_rate_avg"
  | "duration"
  | "distance";
type SortDirection = "asc" | "desc";
type FilterPeriod = "all" | "today" | "week" | "month";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface ApiError {
  message: string;
}

const FitnessLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("week");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const params = useParams();
  let id = params.id; // This will be '001' for /link/001
  id = id ? id : "user_000001";
  // Fetch data from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5000/user/${id}/activities`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FitnessLog[] = await response.json();
        setLogs(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch fitness logs"
        );
        console.error("Error fetching fitness logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on search term and time period
  const filteredLogs = useMemo(() => {
    let filtered = logs.filter(
      (log) =>
        log.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.intensity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.weather.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        // No additional filtering
        break;
    }

    return filtered;
  }, [logs, searchTerm, filterPeriod]);

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
        case "steps":
          aValue = a.steps;
          bValue = b.steps;
          break;
        case "calories_burned":
          aValue = a.calories_burned;
          bValue = b.calories_burned;
          break;
        case "heart_rate_avg":
          aValue = a.heart_rate_avg;
          bValue = b.heart_rate_avg;
          break;
        case "duration":
          aValue = a.duration;
          bValue = b.duration;
          break;
        case "distance":
          aValue = a.distance;
          bValue = b.distance;
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

  const getIntensityColor = (intensity: FitnessLog["intensity"]): string => {
    switch (intensity) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWeatherIcon = (weather: string): React.ReactNode => {
    const weatherLower = weather.toLowerCase();
    if (weatherLower.includes("sunny")) return "☀️";
    if (weatherLower.includes("rainy")) return "🌧️";
    if (weatherLower.includes("cloudy")) return "☁️";
    if (weatherLower.includes("snowy")) return "❄️";
    if (weatherLower.includes("windy")) return "💨";
    return "🌤️";
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
        totalWorkouts: 0,
        totalSteps: 0,
        totalCalories: 0,
        avgHeartRate: 0,
        totalDistance: 0,
        totalDuration: 0,
      };
    }

    return {
      totalWorkouts: sortedLogs.length,
      totalSteps: sortedLogs.reduce((sum, log) => sum + log.steps, 0),
      totalCalories: sortedLogs.reduce(
        (sum, log) => sum + log.calories_burned,
        0
      ),
      avgHeartRate: Math.round(
        sortedLogs.reduce((sum, log) => sum + log.heart_rate_avg, 0) /
          sortedLogs.length
      ),
      totalDistance:
        Math.round(
          sortedLogs.reduce((sum, log) => sum + log.distance, 0) * 10
        ) / 10,
      totalDuration: sortedLogs.reduce((sum, log) => sum + log.duration, 0),
    };
  }, [sortedLogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">
            Loading fitness logs...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Fitness Activity Logs
          </h1>
          <p className="text-gray-600">Track your fitness journey over time</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalWorkouts}
                </div>
                <div className="text-sm text-gray-500">Activities</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Footprints className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalSteps.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Steps</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalCalories.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Calories</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgHeartRate}
                </div>
                <div className="text-sm text-gray-500">Avg BPM</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalDistance}
                </div>
                <div className="text-sm text-gray-500">km Total</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(summaryStats.totalDuration / 60)}h
                </div>
                <div className="text-sm text-gray-500">Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                {" "}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search activities, intensity, weather..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Activity
                  </th>
                  <SortableHeader field="steps">Steps</SortableHeader>
                  <SortableHeader field="calories_burned">
                    Calories
                  </SortableHeader>
                  <SortableHeader field="heart_rate_avg">
                    Heart Rate
                  </SortableHeader>
                  <SortableHeader field="distance">Distance</SortableHeader>
                  <SortableHeader field="duration">Duration</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intensity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weather
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.activity_type}
                      </div>
                      {log.notes && (
                        <div
                          className="text-xs text-gray-500 truncate max-w-32"
                          title={log.notes}
                        >
                          {log.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Footprints className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900">
                          {log.steps.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Flame className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-sm text-gray-900">
                          {log.calories_burned}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-2" />
                        <div>
                          <span className="text-sm text-gray-900">
                            {log.heart_rate_avg}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            avg
                          </span>
                          <div className="text-xs text-gray-400">
                            max: {log.heart_rate_max}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-purple-500 mr-2" />
                        <div>
                          <span className="text-sm text-gray-900">
                            {log.distance} km
                          </span>
                          {log.elevation_gain > 0 && (
                            <div className="text-xs text-gray-400">
                              ↗ {log.elevation_gain}m
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {log.duration} min
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getIntensityColor(
                          log.intensity
                        )}`}
                      >
                        {log.intensity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {getWeatherIcon(log.weather)}
                        </span>
                        <span className="text-sm text-gray-700">
                          {log.weather}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedLogs.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">No activities found</div>
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

export default FitnessLogsTable;
