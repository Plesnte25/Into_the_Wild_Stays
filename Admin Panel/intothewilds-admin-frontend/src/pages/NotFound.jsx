import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center">
        <div className="text-7xl font-black text-brand-navy">404</div>
        <p className="mt-2 text-slate-600">Page not found.</p>
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-2 bg-brand-yellow text-brand-navy rounded-lg"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
