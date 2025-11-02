import { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";

// Colors & labels per platform
const OTA_COLORS = {
  website: "bg-indigo-500",
  airbnb: "bg-rose-500",
  agoda: "bg-purple-500",
  mmt: "bg-teal-500",
  goibibo: "bg-orange-500",
  googlehotelads: "bg-green-500",
  easemytrip: "bg-cyan-500",
  tripadvisor: "bg-yellow-500",
  other: "bg-slate-500",
};

const OTA_NAMES = {
  website: "Website",
  airbnb: "Airbnb",
  agoda: "Agoda",
  mmt: "MakeMyTrip",
  goibibo: "Goibibo",
  googlehotelads: "Google Hotel Ads",
  easemytrip: "EaseMyTrip",
  tripadvisor: "TripAdvisor",
  other: "Other",
};

const monthName = (y, m) =>
  new Date(y, m, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

export default function BookingCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch bookings for the visible month
  const load = async (y, m) => {
    setIsTransitioning(true);
    setLoading(true);
    try {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      const qs = `?from=${start.toISOString()}&to=${end.toISOString()}`;
      const { data } = await api.get(
        `/bookings${qs}&limit=500&sort=checkInDate_asc`
      );
      const rows = (data?.items || []).map((b) => ({
        _id: b._id,
        platform: (b.channel || b.platform || "other").toLowerCase(),
        property: { name: b.stay?.propertyName || b.propertyName || "Unknown" },
        checkIn: b.stay?.checkIn || b.checkInDate,
        checkOut: b.stay?.checkOut || b.checkOutDate,
      }));
      setBookings(rows);
    } catch (err) {
      console.error("Failed to load calendar data:", err);
      setBookings([]);
    } finally {
      setLoading(false);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  useEffect(() => {
    load(year, month);
  }, [year, month]);

  const allPlatforms = useMemo(() => Object.keys(OTA_COLORS), []);

  // Build 6-week calendar grid (42 cells)
  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const start = new Date(first);
    // start week on Sunday
    start.setDate(first.getDate() - first.getDay());

    const out = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      // bookings that overlap this day
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayBookings = bookings.filter((b) => {
        const ci = new Date(b.checkIn);
        const co = new Date(b.checkOut);
        return ci <= dayEnd && co >= dayStart; // overlap
      });

      out.push({
        date: d,
        key: d.toISOString().slice(0, 10),
        bookings: dayBookings,
        isCurrentMonth: d.getMonth() === month,
        isToday: d.toDateString() === new Date().toDateString(),
      });
    }
    return out;
  }, [year, month, bookings]);

  const prevMonth = () => {
    const d = new Date(year, month, 1);
    d.setMonth(month - 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    d.setMonth(month + 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <div className="rounded-xl bg-white">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 transition-colors"
        >
          ◀ Previous
        </button>
        <div className="text-lg font-semibold text-dark-space">
          {monthName(year, month)}{" "}
          {loading && (
            <span className="text-xs text-slate-500">• loading…</span>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 transition-colors"
        >
          Next ▶
        </button>
      </div>

      <div
        className={`grid grid-cols-7 rounded-lg overflow-hidden transition-opacity duration-300 ${
          isTransitioning ? "opacity-50" : "opacity-100"
        }`}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-1 text-center border border-slate-200 text-xs font-medium bg-slate-50"
          >
            {day}
          </div>
        ))}

        {cells.map((cell, idx) => (
          <div
            key={cell.key}
            className={`min-h-[60px] border-b border-slate-200 p-1 transition-colors
              ${
                !cell.isCurrentMonth
                  ? "bg-slate-50 text-slate-400"
                  : cell.isToday
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-slate-200"
              }
              ${(idx + 1) % 7 === 0 ? "border-r-1" : ""}
              ${idx >= 35 ? "border-b-0" : ""}`}
          >
            <div
              className={`text-xs font-medium mb-1 ${
                cell.isToday ? "text-blue-600" : "text-slate-700"
              }`}
            >
              {cell.date.getDate()}
            </div>

            <div className="space-y-0.5">
              {cell.bookings.slice(0, 2).map((b) => (
                <div
                  key={b._id}
                  className={`text-[10px] p-0.5 rounded ${
                    OTA_COLORS[b.platform] || OTA_COLORS.other
                  } text-white font-medium truncate`}
                  title={`${b.property?.name || "Unknown Property"} - ${
                    OTA_NAMES[b.platform] || OTA_NAMES.other
                  }`}
                >
                  {b.property?.name || "Unknown"}
                </div>
              ))}
              {cell.bookings.length > 2 && (
                <div className="text-[9px] text-slate-500 text-center">
                  +{cell.bookings.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        {allPlatforms.map((platform) => (
          <span key={platform} className="inline-flex items-center gap-1">
            <span
              className={`inline-block h-2 w-3 rounded ${
                OTA_COLORS[platform] || OTA_COLORS.other
              }`}
            />
            {OTA_NAMES[platform] || OTA_NAMES.other}
          </span>
        ))}
      </div>
    </div>
  );
}
