export default function KpiCard({
  icon = "📊",
  label,
  value,
  hint,
  delta, // e.g. +4.2 or -1.1 (percentage)
  tone = "default", // default | success | danger | warn
}) {
  const ring = {
    success: "ring-emerald-200",
    danger: "ring-rose-200",
    warn: "ring-amber-200",
    default: "ring-slate-200",
  }[tone];

  const deltaColor =
    delta > 0
      ? "text-emerald-600"
      : delta < 0
      ? "text-rose-600"
      : "text-slate-500";

  return (
    <div className={`rounded-xl bg-white ring-1 ${ring} p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="text-2xl">{icon}</div>
        {typeof delta === "number" && (
          <div className={`text-xs ${deltaColor}`}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"}{" "}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
