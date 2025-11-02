import { useEffect, useState } from "react";
import api from "../../lib/axios";

export default function EarningsChart() {
  const [viewMode, setViewMode] = useState("yearly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [seriesData, setSeriesData] = useState({ revenue: [], bookings: [] });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const loadEarningsData = async () => {
    try {
      if (viewMode === "yearly") {
        const from = new Date(selectedYear, 0, 1).toISOString();
        const to = new Date(
          selectedYear,
          11,
          31,
          23,
          59,
          59,
          999
        ).toISOString();
        const resp = await api.get(`/dashboard/trends`, {
          params: { from, to, gran: "month" },
        });

        const data = Array.isArray(resp.data) ? resp.data : [];
        const revenueByMonth = new Map();
        const bookingsByMonth = new Map();

        data.forEach((r) => {
          const month = new Date(r.date).getMonth();
          revenueByMonth.set(month, Math.max(0, r.revenue || 0));
          bookingsByMonth.set(month, Math.max(0, r.bookings || 0));
        });

        const months = Array.from({ length: 12 }, (_, i) => i);
        const revenueSeries = months.map((m) => ({
          period: `${selectedYear}-${String(m + 1).padStart(2, "0")}`,
          amount: revenueByMonth.get(m) || 0,
        }));

        const bookingsSeries = months.map((m) => ({
          period: `${selectedYear}-${String(m + 1).padStart(2, "0")}`,
          amount: bookingsByMonth.get(m) || 0,
        }));

        setSeriesData({ revenue: revenueSeries, bookings: bookingsSeries });
      } else {
        const start = new Date(selectedYear, selectedMonth, 1);
        const end = new Date(
          selectedYear,
          selectedMonth + 1,
          0,
          23,
          59,
          59,
          999
        );
        const resp = await api.get(`/dashboard/trends`, {
          params: {
            from: start.toISOString(),
            to: end.toISOString(),
            gran: "day",
          },
        });

        const data = Array.isArray(resp.data) ? resp.data : [];
        const revenueByWeek = new Map();
        const bookingsByWeek = new Map();

        data.forEach((r) => {
          const d = new Date(r.date);
          if (d.getMonth() === selectedMonth) {
            const week = Math.max(1, Math.ceil(d.getDate() / 7));
            revenueByWeek.set(
              week,
              (revenueByWeek.get(week) || 0) + (r.revenue || 0)
            );
            bookingsByWeek.set(
              week,
              (bookingsByWeek.get(week) || 0) + (r.bookings || 0)
            );
          }
        });

        const maxWeeks = 4;
        const revenueSeries = Array.from({ length: maxWeeks }, (_, i) => ({
          period: `week-${i + 1}`,
          amount: revenueByWeek.get(i + 1) || 0,
        }));

        const bookingsSeries = Array.from({ length: maxWeeks }, (_, i) => ({
          period: `week-${i + 1}`,
          amount: bookingsByWeek.get(i + 1) || 0,
        }));

        setSeriesData({ revenue: revenueSeries, bookings: bookingsSeries });
      }
    } catch (err) {
      console.error("Earnings load failed:", err);
      const fallbackData =
        viewMode === "yearly"
          ? Array.from({ length: 12 }, (_, i) => ({
              period: `${selectedYear}-${String(i + 1).padStart(2, "0")}`,
              amount: 0,
            }))
          : Array.from({ length: 4 }, (_, i) => ({
              period: `week-${i + 1}`,
              amount: 0,
            }));

      setSeriesData({ revenue: fallbackData, bookings: fallbackData });
    }
  };

  useEffect(() => {
    loadEarningsData();
  }, [viewMode, selectedYear, selectedMonth]);

  const getLabels = () =>
    viewMode === "yearly"
      ? [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]
      : ["Week 1", "Week 2", "Week 3", "Week 4"];

  // Chart configuration
  const labels = getLabels();
  const revenueValues = seriesData.revenue.map((x) => x.amount || 0);
  const bookingsValues = seriesData.bookings.map((x) => x.amount || 0);

  const maxRevenue = Math.max(1, ...revenueValues);
  const maxBookings = Math.max(1, ...bookingsValues);

  const prettyMaxRevenue =
    viewMode === "yearly"
      ? Math.max(10000, Math.ceil(maxRevenue / 10000) * 10000)
      : Math.max(5000, Math.ceil(maxRevenue / 5000) * 5000);

  const prettyMaxBookings = Math.max(10, Math.ceil(maxBookings / 10) * 10);

  // Chart dimensions and scales
  const top = 10;
  const bottom = 90;
  const height = bottom - top;

  const revenueYScale = (v) =>
    bottom -
    (Math.min(prettyMaxRevenue, Math.max(0, v)) / prettyMaxRevenue) * height;
  const bookingsYScale = (v) =>
    bottom -
    (Math.min(prettyMaxBookings, Math.max(0, v)) / prettyMaxBookings) * height;

  const createChartPoints = (data, yScale) =>
    data.map((item, index) => {
      const x = (index / Math.max(1, labels.length - 1)) * 100;
      const y = yScale(item.amount);
      return { ...item, x, y, label: labels[index] };
    });

  const revenuePoints = createChartPoints(seriesData.revenue, revenueYScale);
  const bookingsPoints = createChartPoints(seriesData.bookings, bookingsYScale);

  const changeYear = (delta) => setSelectedYear((prev) => prev + delta);
  const changeMonth = (delta) => {
    setSelectedMonth((prev) => {
      let nm = prev + delta,
        ny = selectedYear;
      if (nm < 0) {
        nm = 11;
        ny--;
      } else if (nm > 11) {
        nm = 0;
        ny++;
      }
      setSelectedYear(ny);
      return nm;
    });
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatYAxisLabel = (value, isBookings = false) => {
    if (isBookings) {
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
      return value.toString();
    }
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const getMonthName = (i) =>
    new Date(selectedYear, i).toLocaleString("en-US", { month: "long" });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Earnings Overview
        </h2>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg p-1 bg-gray-100 text-sm">
            <button
              onClick={() => setViewMode("yearly")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "yearly"
                  ? "bg-white shadow-sm border border-gray-200 font-medium text-gray-900"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "monthly"
                  ? "bg-white shadow-sm border border-gray-200 font-medium text-gray-900"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() =>
                viewMode === "yearly" ? changeYear(-1) : changeMonth(-1)
              }
              className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm font-medium px-2 min-w-[100px] text-center text-gray-700">
              {viewMode === "yearly"
                ? selectedYear
                : `${getMonthName(selectedMonth)} ${selectedYear}`}
            </span>
            <button
              onClick={() =>
                viewMode === "yearly" ? changeYear(1) : changeMonth(1)
              }
              className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Bookings</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0 relative">
        {/* Y Axis Labels - Revenue (Left) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 py-4">
          {[0, 0.25, 0.5, 0.75, 1].reverse().map((t, i) => (
            <span key={i} className="text-right pr-2 font-medium">
              {formatYAxisLabel(Math.round(prettyMaxRevenue * t))}
            </span>
          ))}
        </div>

        {/* Y Axis Labels - Bookings (Right) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 py-4">
          {[0, 0.25, 0.5, 0.75, 1].reverse().map((t, i) => (
            <span key={i} className="text-left pl-2 font-medium">
              {formatYAxisLabel(Math.round(prettyMaxBookings * t), true)}
            </span>
          ))}
        </div>

        {/* Main Chart Area */}
        <div
          className="mx-12 relative border-l border-b border-gray-200"
          style={{ height: "100%" }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-t border-gray-100" />
            ))}
          </div>
          <div className="absolute inset-0 flex justify-between">
            {labels.map((_, i) => (
              <div key={i} className="border-r border-gray-100" />
            ))}
          </div>

          {/* SVG Chart */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Revenue Line */}
            <polyline
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              points={revenuePoints.map((p) => `${p.x},${p.y}`).join(" ")}
            />

            {/* Bookings Line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              points={bookingsPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            />

            {/* Revenue Points */}
            {revenuePoints.map((p, i) => (
              <circle
                key={`revenue-${i}`}
                cx={p.x}
                cy={p.y}
                r="2"
                fill="#4f46e5"
                className="cursor-pointer transition-all hover:r-3 hover:stroke-2 hover:stroke-white"
                onMouseEnter={() =>
                  setHoveredPoint({
                    ...p,
                    type: "revenue",
                    bookings: bookingsPoints[i]?.amount,
                  })
                }
              />
            ))}

            {/* Bookings Points */}
            {bookingsPoints.map((p, i) => (
              <circle
                key={`bookings-${i}`}
                cx={p.x}
                cy={p.y}
                r="2"
                fill="#10b981"
                className="cursor-pointer transition-all hover:r-3 hover:stroke-2 hover:stroke-white"
                onMouseEnter={() =>
                  setHoveredPoint({
                    ...p,
                    type: "bookings",
                    revenue: revenuePoints[i]?.amount,
                  })
                }
              />
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm z-10 pointer-events-none min-w-[140px]"
              style={{
                left: `${hoveredPoint.x}%`,
                top: `calc(${hoveredPoint.y}% - 60px)`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-semibold text-gray-800 mb-2">
                {hoveredPoint.label}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-indigo-600 font-medium">Revenue:</span>
                  <span className="font-bold">
                    {formatCurrency(
                      hoveredPoint.revenue || hoveredPoint.amount
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-emerald-600 font-medium">
                    Bookings:
                  </span>
                  <span className="font-bold">
                    {hoveredPoint.bookings ||
                      seriesData.bookings.find(
                        (b) => b.period === hoveredPoint.period
                      )?.amount ||
                      0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* X Axis Labels */}
        <div className="mx-12 flex justify-between text-xs text-gray-500 mt-2 px-1">
          {labels.map((label, i) => (
            <span
              key={i}
              className="text-center flex-1 truncate px-1 font-medium"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {seriesData.revenue.length > 0 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 text-sm">
          <div className="text-gray-600">
            Total {viewMode === "yearly" ? "yearly" : "monthly"} earnings:{" "}
            <span className="font-bold text-indigo-600">
              {formatCurrency(
                seriesData.revenue.reduce((s, x) => s + (x.amount || 0), 0)
              )}
            </span>
          </div>
          <div className="text-gray-600">
            Total bookings:{" "}
            <span className="font-bold text-emerald-600">
              {seriesData.bookings
                .reduce((s, x) => s + (x.amount || 0), 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
