import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  Heart,
  Eye,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Type definitions matching your sleep API data structure
interface SleepLog {
  _id: string;
  awakenings: number;
  bedtime: string;
  date: string;
  deep_sleep: number;
  light_sleep: number;
  notes: string;
  rem_sleep: number;
  resting_heart_rate: number;
  sleep_efficiency: number;
  sleep_id: string;
  sleep_quality: "Poor" | "Fair" | "Good" | "Excellent";
  total_sleep: number;
  user_id: string;
  wake_time: string;
}

type SortField =
  | "date"
  | "total_sleep"
  | "sleep_efficiency"
  | "deep_sleep"
  | "rem_sleep"
  | "awakenings"
  | "resting_heart_rate";
type SortDirection = "asc" | "desc";
type FilterPeriod = "all" | "today" | "week" | "month";
type QualityFilter = "all" | "Poor" | "Fair" | "Good" | "Excellent";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const SleepLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("week");
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });

  // Fetch sleep data from API
  useEffect(() => {
    const fetchSleepLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "http://localhost:5000/user/user_000001/sleep"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SleepLog[] = await response.json();
        setLogs(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch sleep logs"
        );
        console.error("Error fetching sleep logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSleepLogs();
  }, []);

  // Filter logs based on search term, time period, and sleep quality
  const filteredLogs = useMemo(() => {
    let filtered = logs.filter(
      (log) =>
        log.sleep_quality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.bedtime.includes(searchTerm) ||
        log.wake_time.includes(searchTerm)
    );

    // Filter by sleep quality
    if (qualityFilter !== "all") {
      filtered = filtered.filter((log) => log.sleep_quality === qualityFilter);
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
  }, [logs, searchTerm, filterPeriod, qualityFilter]);

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
        case "total_sleep":
          aValue = a.total_sleep;
          bValue = b.total_sleep;
          break;
        case "sleep_efficiency":
          aValue = a.sleep_efficiency;
          bValue = b.sleep_efficiency;
          break;
        case "deep_sleep":
          aValue = a.deep_sleep;
          bValue = b.deep_sleep;
          break;
        case "rem_sleep":
          aValue = a.rem_sleep;
          bValue = b.rem_sleep;
          break;
        case "awakenings":
          aValue = a.awakenings;
          bValue = b.awakenings;
          break;
        case "resting_heart_rate":
          aValue = a.resting_heart_rate;
          bValue = b.resting_heart_rate;
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

  const getQualityColor = (quality: SleepLog["sleep_quality"]): string => {
    switch (quality) {
      case "Excellent":
        return "bg-green-100 text-green-800";
      case "Good":
        return "bg-blue-100 text-blue-800";
      case "Fair":
        return "bg-yellow-100 text-yellow-800";
      case "Poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 85) return "text-green-600";
    if (efficiency >= 75) return "text-blue-600";
    if (efficiency >= 65) return "text-yellow-600";
    return "text-red-600";
  };

  const formatTime = (timeString: string): string => {
    return timeString.substring(0, 5); // Remove seconds
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateSleepDuration = (
    bedtime: string,
    wakeTime: string
  ): string => {
    const bed = new Date(`2000-01-01T${bedtime}`);
    let wake = new Date(`2000-01-01T${wakeTime}`);

    // If wake time is earlier than bedtime, it's next day
    if (wake < bed) {
      wake = new Date(`2000-01-02T${wakeTime}`);
    }

    const duration = (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
    return `${duration.toFixed(1)}h`;
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
        totalNights: 0,
        avgTotalSleep: 0,
        avgEfficiency: 0,
        avgDeepSleep: 0,
        avgRemSleep: 0,
        avgAwakenings: 0,
        avgRestingHR: 0,
        bestQuality: "N/A",
      };
    }

    const qualityScores = { Poor: 1, Fair: 2, Good: 3, Excellent: 4 };
    const avgQualityScore =
      sortedLogs.reduce(
        (sum, log) => sum + qualityScores[log.sleep_quality],
        0
      ) / sortedLogs.length;
    const bestQuality =
      avgQualityScore >= 3.5
        ? "Excellent"
        : avgQualityScore >= 2.5
        ? "Good"
        : avgQualityScore >= 1.5
        ? "Fair"
        : "Poor";

    return {
      totalNights: sortedLogs.length,
      avgTotalSleep:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.total_sleep, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      avgEfficiency:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.sleep_efficiency, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      avgDeepSleep:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.deep_sleep, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      avgRemSleep:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.rem_sleep, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      avgAwakenings:
        Math.round(
          (sortedLogs.reduce((sum, log) => sum + log.awakenings, 0) /
            sortedLogs.length) *
            10
        ) / 10,
      avgRestingHR: Math.round(
        sortedLogs.reduce((sum, log) => sum + log.resting_heart_rate, 0) /
          sortedLogs.length
      ),
      bestQuality,
    };
  }, [sortedLogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">
            Loading sleep data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sleep Tracker
          </h1>
          <p className="text-gray-600">
            Monitor your sleep patterns and quality for better rest
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Moon className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalNights}
                </div>
                <div className="text-sm text-gray-500">Nights</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgTotalSleep}h
                </div>
                <div className="text-sm text-gray-500">Avg Sleep</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-500" />
              <div>
                <div
                  className={`text-2xl font-bold ${getEfficiencyColor(
                    summaryStats.avgEfficiency
                  )}`}
                >
                  {summaryStats.avgEfficiency}%
                </div>
                <div className="text-sm text-gray-500">Efficiency</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                D
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgDeepSleep}h
                </div>
                <div className="text-sm text-gray-500">Deep Sleep</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgRemSleep}h
                </div>
                <div className="text-sm text-gray-500">REM Sleep</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgRestingHR}
                </div>
                <div className="text-sm text-gray-500">Resting HR</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  summaryStats.bestQuality === "Excellent"
                    ? "bg-green-500"
                    : summaryStats.bestQuality === "Good"
                    ? "bg-blue-500"
                    : summaryStats.bestQuality === "Fair"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                Q
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {summaryStats.bestQuality}
                </div>
                <div className="text-sm text-gray-500">Avg Quality</div>
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
                    placeholder="Search quality, times, notes..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  <Moon className="w-4 h-4 text-gray-400" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={qualityFilter}
                    onChange={(e) =>
                      setQualityFilter(e.target.value as QualityFilter)
                    }
                  >
                    <option value="all">All Quality</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
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
                    Sleep Schedule
                  </th>
                  <SortableHeader field="total_sleep">
                    Total Sleep
                  </SortableHeader>
                  <SortableHeader field="sleep_efficiency">
                    Efficiency
                  </SortableHeader>
                  <SortableHeader field="deep_sleep">Deep Sleep</SortableHeader>
                  <SortableHeader field="rem_sleep">REM Sleep</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Light Sleep
                  </th>
                  <SortableHeader field="awakenings">Awakenings</SortableHeader>
                  <SortableHeader field="resting_heart_rate">
                    Resting HR
                  </SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 mb-1">
                        <Moon className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(log.bedtime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {formatTime(log.wake_time)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {log.total_sleep}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-semibold ${getEfficiencyColor(
                          log.sleep_efficiency
                        )}`}
                      >
                        {log.sleep_efficiency}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-purple-600">
                        {log.deep_sleep}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-sm font-semibold text-orange-600">
                          {log.rem_sleep}h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.light_sleep}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            log.awakenings === 0
                              ? "bg-green-100 text-green-700"
                              : log.awakenings <= 2
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.awakenings}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-sm text-gray-900">
                          {log.resting_heart_rate} bpm
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(
                          log.sleep_quality
                        )}`}
                      >
                        {log.sleep_quality}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-600 max-w-32 truncate"
                        title={log.notes}
                      >
                        {log.notes}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedLogs.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">No sleep logs found</div>
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

export default SleepLogsTable;
