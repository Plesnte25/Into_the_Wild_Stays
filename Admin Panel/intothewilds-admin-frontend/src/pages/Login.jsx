import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/IntotheWildStaysLogo.png";

const API = import.meta.env.VITE_API_BASE || "/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed");

      // IMPORTANT: persist the token so your guard passes
      if (data?.token) {
        localStorage.setItem("itw_admin_token", data.token);
      }

      // now move to dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-dark-space text-light-grey">
      {/* Mobile/Small: Brand header */}
      <header className="mx-auto w-full max-w-7xl px-6 sm:px-10 md:hidden pt-10">
        <div className="flex flex-col items-center gap-4">
          <img
            src={logo}
            alt="Into the Wild Stays logo"
            className="h-16 w-16"
          />
          <h1 className="text-center text-2xl font-medium tracking-wide">
            Into The Wild Stays
          </h1>
        </div>
      </header>

      {/* Canvas */}
      <div className="relative mx-auto grid min-h-screen max-w-8xl grid-cols-1 px-6 sm:px-10 md:grid-cols-2">
        {/* Thin vertical divider (desktop only) */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[72%] w-px -translate-x-1/2 -translate-y-1/2 bg-white/70 md:block"
          aria-hidden="true"
        />

        {/* LEFT: branding (desktop/tablet) */}
        <section className="hidden md:flex items-center justify-center">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Into the Wild Stays logo"
              className="h-50 w-50 object-contain"
            />
            <h1 className="text-[2rem] font-medium tracking-wide uppercase">
              Into The Wild Stays
            </h1>
          </div>
        </section>

        {/* RIGHT: form column */}
        <section className="flex items-center justify-center py-16 md:py-0">
          {/* Form Card – keep consistent width on all fields */}
          <div className="w-full max-w-md">
            <div className="text-center">
              <h2 className="mb-6 text-3xl font-light">Welcome</h2>
              <p className="text-[12px] uppercase tracking-[0.18em] text-white/80">
                Please login to admin dashboard.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-7">
              {error ? (
                <div className="rounded-md bg-red-500/10 border border-red-500/40 px-3 py-2 text-sm text-red-200 text-center">
                  {error}
                </div>
              ) : null}

              <input
                type="email"
                placeholder="you@intothewildstays.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-md bg-white px-4 text-dark-space placeholder-black-grey shadow-sm outline-none focus:ring-2 focus:ring-teal"
                autoComplete="email"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-md bg-white px-4 pr-12 text-dark-space placeholder-black-grey shadow-sm outline-none focus:ring-2 focus:ring-teal"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center rounded-md p-2 text-dark-space hover:text-light-grey focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full rounded-md bg-teal font-semibold tracking-wide transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {loading ? "Logging in..." : "LOGIN"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/forgot-password"
                className="text-[12px] uppercase tracking-[0.18em] text-white/80 hover:text-white"
              >
                Forgotten your password?
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
