// app/components/NotificationAlerts.tsx

// This directive is crucial. It tells Next.js to render this component on the client-side,
// allowing us to use hooks like useState and useEffect.
"use client";

import { useState, useEffect } from "react";

// Define a TypeScript type for our alert messages to ensure type safety.
type Alert = {
  user_id: string;
  time: string;
  alert: string;
  type: "heart_rate" | "steps";
};

export default function NotificationAlerts() {
  // State to store the list of received alert notifications.
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // Static anomaly detection data
  const anomalyScenarios = [
    {
      user_id: "system",
      alert: "⚠️ Low heart rate detected ",
      type: "heart_rate" as const,
    },
    {
      user_id: "system",
      alert: "⚠️ High heart rate detected",
      type: "heart_rate" as const,
    },
    {
      user_id: "system",
      alert: "⚠️ Very high activity  → consider a break",
      type: "steps" as const,
    },
    {
      user_id: "system",
      alert: "⚠️ Very high activity detected",
      type: "steps" as const,
    },
    {
      user_id: "system",
      alert: "⚠️ Critical low heart rate detected",
      type: "heart_rate" as const,
    },
    {
      user_id: "system",
      alert: "⚠️ Extremely high heart rate detected",
      type: "heart_rate" as const,
    },
    {
      user_id: "system",
      alert: "⚠️ Minimal activity detected",
      type: "steps" as const,
    },
    {
      user_id: "system",
      alert: "⚠️ Excessive activity detected",
      type: "steps" as const,
    },
  ];

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let notificationCount = 0;
    const maxNotifications = 5;

    // Simulate anomaly detection every 5 seconds
    const startAnomalyDetection = () => {
      intervalId = setInterval(() => {
        // Check if we've reached the maximum number of notifications
        if (notificationCount >= maxNotifications) {
          console.log(
            "🛑 Maximum notifications reached. Stopping anomaly detection."
          );
          clearInterval(intervalId);
          return;
        }

        // Pick a random anomaly scenario
        const randomIndex = Math.floor(Math.random() * anomalyScenarios.length);
        const scenario = anomalyScenarios[randomIndex];

        const newAlert: Alert = {
          ...scenario,
          time: new Date().toISOString(),
        };

        console.log(
          `🚨 Anomaly Detected (${notificationCount + 1}/${maxNotifications}):`,
          newAlert.alert
        );

        // Update our component's state with the new alert.
        setNotifications((prevNotifications) => [
          newAlert,
          ...prevNotifications,
        ]);

        // Mark that we have new notifications if panel is not expanded
        if (!isExpanded) {
          setHasNewNotifications(true);
        }

        // Increment the notification counter
        notificationCount++;
      }, 5000); // 5 seconds interval
    };

    // Start the anomaly detection simulation
    startAnomalyDetection();

    // Add initial notification after 2 seconds
    const initialTimeout = setTimeout(() => {
      const initialAlert: Alert = {
        user_id: "SYSTEM",
        time: new Date().toISOString(),
        alert: "🟢 Anomaly Detection System Activated",
        type: "heart_rate",
      };

      setNotifications([initialAlert]);
    }, 2000);

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (initialTimeout) clearTimeout(initialTimeout);
    };
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setHasNewNotifications(false);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setHasNewNotifications(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "heart_rate":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "steps":
        return (
          <svg
            className="w-4 h-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      default:
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Notification Ring */}
      <div className="relative">
        <button
          onClick={toggleExpanded}
          className={`
            relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
            ${
              notifications.length > 0
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
            }
            transform hover:scale-105 active:scale-95
          `}
        >
          {/* Heart Icon for Health Monitoring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Notification Count Badge */}
          {notifications.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-red-500">
              {notifications.length > 99 ? "99+" : notifications.length}
            </div>
          )}

          {/* Pulse Animation for New Notifications */}
          {hasNewNotifications && (
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
          )}
        </button>
      </div>

      {/* Expanded Notification Panel */}
      {isExpanded && (
        <div className="absolute top-16 right-0 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-semibold">
                Health Anomaly Detection
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                {notifications.length}
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-white hover:text-red-200 transition-colors p-1 rounded"
                  title="Clear all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Detection Rules Info */}
          <div className="bg-gray-50 p-3 border-b">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Heart Rate:</span>
                <span>&lt;50 or &gt;120 bpm</span>
              </div>
              <div className="flex justify-between">
                <span>Steps:</span>
                <span>&lt;500 or &gt;10,000</span>
              </div>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm">No anomalies detected</p>
                <p className="text-xs text-gray-400 mt-1">
                  Monitoring health metrics...
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif, index) => (
                  <div
                    key={`${notif.time}-${index}`}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 mb-1 leading-relaxed">
                          {notif.alert}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {notif.user_id}
                          </span>
                          <span>
                            {new Date(notif.time).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">
              🔄 Auto-detecting anomalies every 5 seconds
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        ></div>
      )}
    </div>
  );
}
