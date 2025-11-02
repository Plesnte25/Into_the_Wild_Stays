import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";

export default function ProtectedRoute() {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return null;

  if (!user) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }
  return <Outlet />;
}
