import { useMemo, useState } from "react";

export const quickRanges = {
  today: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setMilliseconds(end.getMilliseconds() - 1);
    return { start, end, label: "Today" };
  },
  week: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end, label: "Week" };
  },
  month: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end, label: "Month" };
  },
};

export default function DateRangeBar({ value, onChange }) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");

  const pretty = useMemo(() => {
    const fmt = (d) =>
      d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    return `${fmt(value.start)} – ${fmt(value.end)}`;
  }, [value]);

  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleCustomClick = () => {
    setTempStart(formatDateForInput(value.start));
    setTempEnd(formatDateForInput(value.end));
    setShowCustomPicker(true);
  };

  const handleCustomApply = () => {
    if (tempStart && tempEnd) {
      const startDate = new Date(`${tempStart}T00:00:00`);
      const endDate = new Date(`${tempEnd}T23:59:59`);

      if (startDate <= endDate) {
        onChange({
          start: startDate,
          end: endDate,
          label: "Custom",
        });
        setShowCustomPicker(false);
      }
    }
  };

  const handleCustomCancel = () => {
    setShowCustomPicker(false);
    setTempStart("");
    setTempEnd("");
  };

  const isActiveRange = (rangeKey) => {
    return value.label === quickRanges[rangeKey]().label;
  };

  return (
    <div className="flex items-center gap-4">
      {/* Current Range Display - Only show if not "Today" */}
      {value.label !== "Today" && (
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
              {pretty}
            </span>
          </div>

          {/* Mobile view */}
          <div className="md:hidden text-sm">
            <div className="font-medium text-gray-900">{value.label}</div>
            <div className="text-xs text-gray-500">{pretty}</div>
          </div>
        </div>
      )}

      {/* Quick Range Buttons */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${
            isActiveRange("today")
              ? "bg-white shadow-sm border font-medium text-gray-900"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => onChange(quickRanges.today())}
        >
          Today
        </button>
        <button
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${
            isActiveRange("week")
              ? "bg-white shadow-sm border font-medium text-gray-900"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => onChange(quickRanges.week())}
        >
          7D
        </button>
        <button
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${
            isActiveRange("month")
              ? "bg-white shadow-sm border font-medium text-gray-900"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => onChange(quickRanges.month())}
        >
          30D
        </button>

        {/* Custom Date Picker Button */}
        <div className="relative">
          <button
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              value.label === "Custom"
                ? "bg-blue-100 text-blue-700 border border-blue-200 font-medium"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
            onClick={handleCustomClick}
          >
            Custom
          </button>

          {/* Custom Date Picker Popup */}
          {showCustomPicker && (
            <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-lg z-20 p-4 min-w-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-sm">
                  Select Date Range
                </h3>
                <button
                  onClick={handleCustomCancel}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
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
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {tempStart && tempEnd && (
                  <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg border">
                    <div className="font-medium mb-1">Selected Range:</div>
                    <div>
                      {new Date(tempStart).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(tempEnd).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCustomApply}
                    disabled={
                      !tempStart ||
                      !tempEnd ||
                      new Date(tempStart) > new Date(tempEnd)
                    }
                    className="flex-1 bg-blue-600 text-white text-sm py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Apply Range
                  </button>
                  <button
                    onClick={handleCustomCancel}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close picker when clicking outside */}
      {showCustomPicker && (
        <div className="fixed inset-0 z-10" onClick={handleCustomCancel} />
      )}
    </div>
  );
}
