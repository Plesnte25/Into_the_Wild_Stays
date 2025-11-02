import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { number, currencyINR } from "../../utils/format";

export default function ToursEventsAnalytics() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("tours"); // tours, events, inquiries
  const [timeRange, setTimeRange] = useState("monthly"); // weekly, monthly, custom
  const [showCalendar, setShowCalendar] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // time window
        let from, to;
        const now = new Date();
        if (timeRange === "weekly") {
          to = now;
          from = new Date(now);
          from.setDate(now.getDate() - 6);
        } else if (timeRange === "custom" && customStart && customEnd) {
          from = new Date(`${customStart}T00:00:00`);
          to = new Date(`${customEnd}T23:59:59`);
        } else {
          // monthly default (last 30 days)
          to = now;
          from = new Date(now);
          from.setDate(now.getDate() - 29);
        }

        const [topPropsRes, topLocsRes, trendsRes] = await Promise.all([
          api.get(`/dashboard/top`, {
            params: { type: "properties", limit: 5 },
          }),
          api.get(`/dashboard/top`, {
            params: { type: "locations", limit: 5 },
          }),
          api.get(`/dashboard/trends`, {
            params: {
              from: from.toISOString(),
              to: to.toISOString(),
              gran: "day",
            },
          }),
        ]);

        const topProps = topPropsRes.data || [];
        const topLocs = topLocsRes.data || [];
        const trends = trendsRes.data || [];

        const sum = (arr, k) => arr.reduce((a, c) => a + (c[k] || 0), 0);
        const trendsRevenue = sum(trends, "revenue");
        const trendsBookings = sum(trends, "bookings");

        const toRow = (x) => ({
          _id: x.key,
          bookingId: x.key,
          customerName: x.key,
          date: new Date(),
          amount: x.revenue || 0,
          status: "completed",
          details: `${x.bookings || 0} bookings · ${x.nights || 0} nights`,
          phone: "",
          email: "",
        });

        setData({
          inquiries: 0,
          tours: {
            count: trendsBookings,
            revenue: trendsRevenue,
            recent: topProps.map(toRow),
          },
          events: {
            count: trendsBookings,
            revenue: trendsRevenue,
            recent: topLocs.map(toRow),
            recentInquiries: [],
          },
          meta: { from, to },
        });
      } catch (e) {
        console.error(e);
        setData({
          inquiries: 0,
          tours: { count: 0, revenue: 0, recent: [] },
          events: { count: 0, revenue: 0, recent: [], recentInquiries: [] },
        });
      }
    })();
  }, [timeRange, customStart, customEnd]);

  const handleCustomApply = () => {
    if (customStart && customEnd) setShowCalendar(false);
  };
  const handleCustomCancel = () => {
    setShowCalendar(false);
    setCustomStart("");
    setCustomEnd("");
    setTimeRange("monthly");
  };
  const formatDateForInput = (d) => d.toISOString().split("T")[0];
  const setDefaultCustomRange = () => {
    const t = new Date(),
      first = new Date(t.getFullYear(), t.getMonth(), 1),
      last = new Date(t.getFullYear(), t.getMonth() + 1, 0);
    setCustomStart(formatDateForInput(first));
    setCustomEnd(formatDateForInput(last));
  };
  const handleCustomSelect = () => {
    setTimeRange("custom");
    setDefaultCustomRange();
    setShowCalendar(true);
  };

  if (!data) return <div className="text-sm text-slate-500">Loading…</div>;

  return (
    <div className="bg-white rounded-lg">
      {/* Header with Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Tours & Events Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Bookkeeping overview and detailed records
          </p>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          {/* Time Range Filter */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => {
                if (e.target.value === "custom") handleCustomSelect();
                else {
                  setTimeRange(e.target.value);
                  setShowCalendar(false);
                }
              }}
              className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>

            {showCalendar && (
              <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 p-4 min-w-80">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    Select Date Range
                  </h3>
                  <button
                    onClick={handleCustomCancel}
                    className="text-gray-400 hover:text-gray-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {customStart && customEnd && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                      Selected:{" "}
                      {new Date(customStart).toLocaleDateString("en-IN")} -{" "}
                      {new Date(customEnd).toLocaleDateString("en-IN")}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCustomApply}
                      disabled={!customStart || !customEnd}
                      className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleCustomCancel}
                      className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg p-1 bg-gray-50 text-sm">
            <button
              onClick={() => setActiveTab("tours")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "tours"
                  ? "bg-white border shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Tours
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "events"
                  ? "bg-white border shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "inquiries"
                  ? "bg-white border shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Inquiries
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b">
        <SummaryCard
          label="Total Visits / Inquiries"
          value={number(data.inquiries || 0)}
          subtitle="All time"
          trend="+0%"
          trendUp={true}
        />
        <SummaryCard
          label="Tour Bookings"
          value={number(data.tours.count)}
          subtitle={currencyINR(data.tours.revenue)}
          trend="+0%"
          trendUp={true}
        />
        <SummaryCard
          label="Event Bookings"
          value={number(data.events.count)}
          subtitle={currencyINR(data.events.revenue)}
          trend="+0%"
          trendUp={true}
        />
        <SummaryCard
          label="Event Inquiries"
          value={number(data.events.inquiries || 0)}
          subtitle="All time"
          trend="+0%"
          trendUp={true}
        />
      </div>

      {/* Detailed Table */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            {activeTab === "tours" && "Top Properties"}
            {activeTab === "events" && "Top Locations"}
            {activeTab === "inquiries" && "Event Inquiries"}
            {timeRange === "custom" && customStart && customEnd && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({new Date(customStart).toLocaleDateString("en-IN")} -{" "}
                {new Date(customEnd).toLocaleDateString("en-IN")})
              </span>
            )}
          </h3>
          <div className="text-sm text-gray-500">
            Showing {getDataLength(data, activeTab)} records
          </div>
        </div>

        {getDataLength(data, activeTab) === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Key</TableHeader>
                  <TableHeader>Details</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Meta</TableHeader>
                  <TableHeader>Contact</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getTableData(data, activeTab).map((item) => (
                  <TableRow key={item._id} item={item} type={activeTab} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, subtitle, trend, trendUp }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        </div>
        <div
          className={`text-sm font-medium ${
            trendUp ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend}
        </div>
      </div>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

function TableRow({ item }) {
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return (
      <div className="text-sm">
        <div className="font-medium">{date.toLocaleDateString("en-IN")}</div>
        <div className="text-gray-500 text-xs">
          {date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  };
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        {item.bookingId || item._id || "-"}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        <div className="font-medium">{item.customerName || item._id}</div>
        <div className="text-xs text-gray-500">{item.details || "-"}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
        {item.amount ? currencyINR(item.amount) : "-"}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            item.status
          )}`}
        >
          {item.status || "N/A"}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {formatDateTime(item.date || item.createdAt)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        <div className="space-y-1">
          {item.phone && (
            <div className="flex items-center gap-1">
              <span>📞</span>
              <span>{item.phone}</span>
            </div>
          )}
          {item.email && (
            <div className="flex items-center gap-1">
              <span>✉️</span>
              <span className="truncate max-w-[120px]">{item.email}</span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ type }) {
  const msg =
    type === "tours"
      ? "No tour data found"
      : type === "events"
      ? "No event data found"
      : "No inquiries found";
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-1">{msg}</h3>
        <p className="text-gray-500 text-sm">
          There are no records for the selected time period.
        </p>
      </div>
    </div>
  );
}

function getDataLength(data, activeTab) {
  if (!data) return 0;
  if (activeTab === "tours") return data.tours?.recent?.length || 0;
  if (activeTab === "events") return data.events?.recent?.length || 0;
  if (activeTab === "inquiries")
    return data.events?.recentInquiries?.length || 0;
  return 0;
}
function getTableData(data, activeTab) {
  if (!data) return [];
  if (activeTab === "tours") return data.tours?.recent || [];
  if (activeTab === "events") return data.events?.recent || [];
  if (activeTab === "inquiries") return data.events?.recentInquiries || [];
  return [];
}
