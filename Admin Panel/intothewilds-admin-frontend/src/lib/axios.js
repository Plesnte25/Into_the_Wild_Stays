import axios from "axios";

// Falls back to a relative path so a missing VITE_API_BASE never silently
// points production builds at a developer's localhost backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  withCredentials: true,
});

// attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("itw_admin_token");
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
      // Optional: keep it gentle; don’t loop on the login route
      const path = window.location.pathname;
      if (!path.includes("/login")) {
        // clear bad token and bounce to login
        localStorage.removeItem("itw_admin_token");
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
