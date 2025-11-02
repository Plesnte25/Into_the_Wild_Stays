import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5001/api",
  withCredentials: true,
});

// attach access token
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("itw_admin_token") ||
    sessionStorage.getItem("itw_admin_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Optional: keep it gentle; don’t loop on /auth routes
      const path = window.location.pathname;
      if (!path.includes("/admin/login")) {
        // clear bad token and bounce to login
        localStorage.removeItem("itw_admin_token");
        sessionStorage.removeItem("itw_admin_token");
        window.location.assign("/admin/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
