import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthCtx = createContext(null);

const TOKEN_KEY = "itw_admin_token";
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token)); // if we already have a token, verify it

  // helper: fetch with auth
  const authedFetch = useCallback(
    async (path, options = {}) => {
      const headers = new Headers(options.headers || {});
      headers.set("Content-Type", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: "include", // ok to keep, backend may ignore
      });

      // normalize non-2xx errors
      if (!res.ok) {
        const err = await safeJson(res);
        const message = err?.message || `Request failed (${res.status})`;
        throw new Error(message);
      }
      return safeJson(res);
    },
    [token]
  );

  // LOGIN
  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      try {
        const data = await authedFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: { "Content-Type": "application/json" }, // authedFetch will merge
        });
        // expect { token, user }
        if (!data?.token) throw new Error("Invalid credentials");

        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user || null);
        return { ok: true };
      } catch (e) {
        // clear any stale token
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setUser(null);
        return { ok: false, message: e.message || "Login failed" };
      } finally {
        setLoading(false);
      }
    },
    [authedFetch]
  );

  // LOGOUT
  const logout = useCallback(async () => {
    try {
      // best-effort notify server; ignore result
      if (token) {
        await authedFetch("/auth/logout", { method: "POST" }).catch(() => {});
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setUser(null);
      // ✅ Hard redirect to login to ensure we actually leave protected routes
      window.location.replace("/admin/login");
    }
  }, [authedFetch, token]);

  // CHECK (verify token & load user)
  const check = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return { ok: false };
    }
    setLoading(true);
    try {
      const data = await authedFetch("/auth/me", { method: "GET" });
      setUser(data?.user || null);
      return { ok: true, user: data?.user || null };
    } catch (e) {
      // token invalid → clear
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setUser(null);
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }, [authedFetch, token]);

  // Run a check once when we have a token on mount
  useEffect(() => {
    if (token) check();
  }, [token, check]);

  // ✅ Route guard: if we are on any /admin/* path and have no token (or after logout), push to login.
  useEffect(() => {
    const onAdminRoute = window.location.pathname.startsWith("/admin");
    if (!loading && onAdminRoute && !token) {
      // Use replace to avoid back-button bouncing
      window.location.replace("/admin/login");
    }
  }, [loading, token]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, check }),
    [user, token, loading, login, logout, check]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// --- utils ---
async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Unexpected response" };
  }
}
