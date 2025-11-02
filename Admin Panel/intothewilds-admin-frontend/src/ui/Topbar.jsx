import { useState } from "react";
import { useAuth } from "../store/auth.jsx";
import logo from "../assets/IntotheWildStaysLogo.png";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOTAs, setShowOTAs] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Mock unread count

  const notifications = [
    {
      id: 1,
      type: "checkin",
      message: "New check-in today for Sun N Sand Villa",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "cancellation",
      message: "Booking BK-105 cancelled",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "status",
      message: "Booking status changed to confirmed",
      time: "1 day ago",
      read: false,
    },
  ];

  const connectedOTAs = [
    { name: "Booking.com", status: "connected", icon: "🏨" },
    { name: "Airbnb", status: "connected", icon: "🏠" },
    { name: "Expedia", status: "disconnected", icon: "✈️" },
    { name: "Agoda", status: "connected", icon: "🌏" },
  ];

  const markAsRead = () => {
    setUnreadNotifications(0);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6 shadow-sm">
      {/* Left Section - Logo & Heading */}
      <div className="font-medium flex items-center">
        <img
          src={logo}
          alt="IntoTheWild Logo"
          className="h-14 lg:h-14 inline-block"
        />
        <span className="hidden md:inline text-gray-800 font-bold uppercase text-sm lg:text-base ml-2">
          IntoTheWild • channel manager
        </span>
      </div>

      {/* Right Section - Icons & User Info */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* OTA Platforms Icon - Visible on all screens */}
        <div className="relative">
          <button
            onClick={() => setShowOTAs(!showOTAs)}
            className="p-2 text-gray-600 hover:text-teal transition-colors relative"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </button>

          {/* OTA Platforms Dropdown */}
          {showOTAs && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg z-50">
              <div className="p-2 border-b">
                <h3 className="font-semibold text-gray-800">
                  Channels
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {connectedOTAs.map((ota, index) => (
                  <div
                    key={index}
                    className="p-2 border-b hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{ota.icon}</span>
                      <span className="text-sm text-gray-800">{ota.name}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        ota.status === "connected"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ota.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-600 hover:text-teal transition-colors relative"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button
                    onClick={markAsRead}
                    className="text-xs text-teal hover:text-teal/80"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          notification.type === "cancellation"
                            ? "bg-red-500"
                            : notification.type === "checkin"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 border-t">
                <button className="w-full text-center text-sm text-gray-600 hover:text-gray-800">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Info - Hidden on mobile */}
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-xs text-gray-500">Signed in as</span>
          <span className="text-sm font-medium text-gray-800">
            {user?.email}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="rounded-lg bg-teal px-3 lg:px-4 py-1.5 text-sm text-white hover:bg-teal/90 transition-colors cursor-pointer shadow-sm"
        >
          Logout
        </button>
      </div>

      {/* Overlay for dropdowns */}
      {(showNotifications || showOTAs) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowOTAs(false);
          }}
        />
      )}
    </header>
  );
}
