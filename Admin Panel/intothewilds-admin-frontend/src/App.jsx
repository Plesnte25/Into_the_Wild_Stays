import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./store/auth.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Reservations from "./pages/Reservations";
import Reviews from "./pages/Reviews";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";

function PrivateRoute() {
  const token = localStorage.getItem("itw_admin_token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  const { check, loading } = useAuth();
  useEffect(() => {
    check();
  }, []);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
