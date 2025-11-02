import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios.js";

export default function UpcomingList() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all"); // all | Check-in | Check-out
  const navigate = useNavigate();

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        // window: next 72 hours
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        const to = new Date();
        to.setDate(to.getDate() + 3);
        to.setHours(23, 59, 59, 999);
        const qs = `?from=${from.toISOString()}&to=${to.toISOString()}&status=confirmed,checked_in&sort=checkInDate_asc&limit=200`;
        const { data } = await api.get(`/bookings${qs}`);

        const items = (data?.items || []).map((b) => {
          const checkIn = b.stay?.checkIn || b.checkInDate;
          const checkOut = b.stay?.checkOut || b.checkOutDate;
          return {
            _id: b._id,
            bookingId: b._id?.slice(-8)?.toUpperCase(),
            propertyName: b.stay?.propertyName || b.propertyName || "Unknown",
            guestName: b.guest?.name || b.guestName || "Guest",
            status: (b.status || "confirmed").toLowerCase(),
            guests: b.guests?.adults ?? b.adults ?? 0,
            nights: Math.max(
              1,
              Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
            ),
            // two events we can filter by
            checkIn,
            checkOut,
          };
        });

        // materialize rows for both check-ins and check-outs that fall inside 72h
        const within = (dt) =>
          !!dt && new Date(dt) >= from && new Date(dt) <= to;
        const rows = [];
        for (const it of items) {
          if (within(it.checkIn))
            rows.push({ ...it, when: new Date(it.checkIn), type: "Check-in" });
          if (within(it.checkOut))
            rows.push({
              ...it,
              when: new Date(it.checkOut),
              type: "Check-out",
            });
        }
        rows.sort((a, b) => a.when - b.when);

        if (on) setRows(rows);
      } catch (e) {
        console.error(e);
        if (on) setRows([]);
      }
    })();
    return () => {
      on = false;
    };
  }, []);

  const filteredRows = rows.filter(
    (r) => filter === "all" || r.type === filter
  );

  const formatDateTime = (date) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const d0 = date.toDateString(),
      dN = now.toDateString(),
      dT = tomorrow.toDateString();
    const dateStr =
      d0 === dN
        ? "Today"
        : d0 === dT
        ? "Tomorrow"
        : date.toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
    const timeStr = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { dateStr, timeStr };
  };

  const getStatusColor = (type, status) => {
    const s = (status || "").toLowerCase();
    if (type === "Check-in") {
      return s === "confirmed"
        ? "bg-green-100 text-green-800 border border-green-200"
        : "bg-yellow-100 text-yellow-800 border border-yellow-200";
    }
    return s === "confirmed"
      ? "bg-blue-100 text-blue-800 border border-blue-200"
      : "bg-orange-100 text-orange-800 border border-orange-200";
  };

  const getTypeIcon = (type) => (type === "Check-in" ? "🔑" : "🚪");
  const handleViewDetails = (bookingId) =>
    navigate(`/admin/reservations?booking=${bookingId}`);

  // --- UI below unchanged (uses filteredRows) ---
  if (filteredRows.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">
              Upcoming Check-ins / Check-outs
            </h2>
            <p className="text-sm text-gray-600 mt-1">Next 72 hours</p>
          </div>
          <div className="flex gap-2 mt-3 sm:mt-0">
            {["all", "Check-in", "Check-out"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filter === tab
                    ? tab === "all"
                      ? "bg-gray-800 text-white border-gray-800"
                      : tab === "Check-in"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab === "all" ? "All" : `${tab}s`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center pb-3">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              No upcoming bookings
            </h3>
            <p className="text-gray-500 text-sm">
              {filter === "all"
                ? "No check-ins or check-outs in next 72 hours"
                : `No ${filter.toLowerCase()}s scheduled`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Upcoming Check-ins / Check-outs
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Next 72 hours • {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "booking" : "bookings"} found
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          {["all", "Check-in", "Check-out"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === tab
                  ? tab === "all"
                    ? "bg-gray-800 text-white border-gray-800"
                    : tab === "Check-in"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tab === "all" ? "All" : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-3">
          {filteredRows.map((row) => {
            const { dateStr, timeStr } = formatDateTime(row.when);
            return (
              <div
                key={`${row._id}-${row.type}`}
                className="bg-white p-3 rounded-lg border-b transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="text-center min-w-20 flex-shrink-0">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {dateStr}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {timeStr}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(row.type)}</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            row.type,
                            row.status
                          )}`}
                        >
                          {row.type} • {row.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                        {row.propertyName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span>👤</span>
                          <span className="truncate">{row.guestName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>🆔</span>
                          <span>{row.bookingId}</span>
                        </span>
                        {row.guests ? (
                          <span className="flex items-center gap-1">
                            <span>👥</span>
                            {row.guests} guest{row.guests > 1 ? "s" : ""}
                          </span>
                        ) : null}
                        {row.nights ? (
                          <span className="flex items-center gap-1">
                            <span>🌙</span>
                            {row.nights} night{row.nights > 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleViewDetails(row.bookingId)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View booking details"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
