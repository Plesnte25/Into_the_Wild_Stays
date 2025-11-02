export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200/70 ${className}`} />
  );
}
