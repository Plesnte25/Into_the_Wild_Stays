import { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";

// small helpers
const fmtInt = (n) => (Number.isFinite(n) ? n.toLocaleString() : "—");
const fmtBytes = (b) => {
  if (!Number.isFinite(b)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0,
    v = b;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export default function CloudinaryPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/settings/cloudinary/stats");
      setStats(data);
      if (data?.ok === false && data?.error) setErr(data.error);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = useMemo(() => {
    return [
      { label: "Total Images", value: fmtInt(stats?.totalImages) },
      { label: "Storage Used", value: fmtBytes(stats?.totalStorageBytes) },
      { label: "Bandwidth Used", value: fmtBytes(stats?.bandwidthBytes) },
      { label: "Uploads Today", value: fmtInt(stats?.uploadsToday ?? 0) },
    ];
  }, [stats]);

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gray-200 p-4 bg-white"
          >
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? <span className="animate-pulse">…</span> : c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Info + Refresh */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-blue-900">
              Cloudinary Configuration
            </div>
            <div className="text-sm text-blue-800">
              {stats?.ok
                ? "Cloudinary is configured for automatic image optimization and CDN delivery."
                : err
                ? `Cloudinary not fully configured: ${err}`
                : "Checking Cloudinary configuration…"}
            </div>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-white border border-blue-200 px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-100 disabled:opacity-50"
            title="Refresh Stats"
          >
            ↻ Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
