import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";

// Single source of truth for guarding /admin/* routes. Uses the AuthProvider's
// real `user`/`loading` state (populated by the /auth/me check) instead of a
// raw localStorage read, so a stale/invalid token doesn't grant a render.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }
  return <Outlet />;
}
