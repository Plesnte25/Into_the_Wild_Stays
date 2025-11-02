import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  User,
  Globe,
  Building,
  CreditCard,
  Cloud,
  Server,
  Check,
  X,
  Shield,
  ExternalLink,
} from "lucide-react";
import api from "../lib/axios";
import CloudinaryPanel from "../components/settings/CloudinaryPanel";

/**
 * SETTINGS PAGE (CLEAN)
 * - Only calls confirmed, existing routes:
 *   • GET /settings/cloudinary/stats        (CloudinaryPanel handles)
 *   • GET /settings/razorpay/status         (Razorpay panel below)
 *   • GET /api/health                       (System info ping)
 * - All other sections are presentational until their APIs are added.
 */

function RazorpayPanel() {
  const [loading, setLoading] = useState(false);
  const [st, setSt] = useState(null);
  const [err, setErr] = useState("");

  const fetchStatus = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/settings/razorpay/status");
      setSt(data);
      if (data?.ok === false && data?.message) setErr(data.message);
    } catch (e) {
      setErr(
        e?.response?.data?.message || e.message || "Failed to contact Razorpay"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const statusBadge = useMemo(() => {
    if (!st) return null;
    const ok = !!st.ok;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {ok ? <Check size={12} /> : <X size={12} />}
        {ok ? "Connected" : "Not connected"}
      </span>
    );
  }, [st]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 p-4 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">Razorpay</div>
            <div className="text-xl font-semibold text-gray-900">
              Gateway Status
            </div>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
            title="Refresh Razorpay status"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Connection</div>
              {statusBadge}
            </div>
            <div className="mt-2 text-sm text-gray-700">
              {st?.configured
                ? "Credentials present in the server environment."
                : "Server is missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET."}
            </div>
            {st?.keyIdMasked && (
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Key ID:</span>{" "}
                <span className="font-mono text-gray-900">
                  {st.keyIdMasked}
                </span>
              </div>
            )}
            {!!err && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {err}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Actions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="https://dashboard.razorpay.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Open Razorpay Dashboard <ExternalLink size={14} />
              </a>
              <a
                href="https://razorpay.com/docs/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Docs <ExternalLink size={14} />
              </a>
            </div>
            <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 flex items-start gap-2">
              <Shield size={16} className="mt-0.5" />
              <span>
                Secrets are managed server-side. Update your <code>.env</code>{" "}
                with <code>RAZORPAY_KEY_ID</code>,{" "}
                <code>RAZORPAY_KEY_SECRET</code> and{" "}
                <code>RAZORPAY_WEBHOOK_SECRET</code>, then restart the API.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("cloudinary");
  const [sysLoading, setSysLoading] = useState(false);
  const [sysOk, setSysOk] = useState(null);

  const tabs = [
    { id: "profile", label: "Admin Profile", icon: User },
    { id: "site", label: "Site Information", icon: Globe },
    { id: "business", label: "Business Settings", icon: Building },
    { id: "payments", label: "Razorpay", icon: CreditCard },
    { id: "cloudinary", label: "Cloudinary", icon: Cloud },
    { id: "system", label: "System Info", icon: Server },
  ];

  const pingSystem = async () => {
    setSysLoading(true);
    try {
      const { data } = await api.get("/health"); // server exposes GET /api/health
      setSysOk(!!data?.ok);
    } catch {
      setSysOk(false);
    } finally {
      setSysLoading(false);
    }
  };

  useEffect(() => {
    pingSystem();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your platform configuration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === "cloudinary") {
                // CloudinaryPanel has its own refresh button; do nothing here
              } else if (activeTab === "payments") {
                // RazorpayPanel handles refresh internally; no-op
              } else if (activeTab === "system") {
                pingSystem();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            title="Refresh current tab"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? "border-teal-500 text-teal-700 bg-teal-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Read-only placeholders to avoid 401 until APIs exist */}
          {activeTab === "profile" && (
            <div className="text-sm text-gray-600">
              Admin profile settings will appear here once the endpoint is
              available.
            </div>
          )}

          {activeTab === "site" && (
            <div className="text-sm text-gray-600">
              Site information settings will appear here once the endpoint is
              available.
            </div>
          )}

          {activeTab === "business" && (
            <div className="text-sm text-gray-600">
              Business settings (banking, invoicing) will appear here once the
              endpoint is available.
            </div>
          )}

          {activeTab === "payments" && <RazorpayPanel />}

          {activeTab === "cloudinary" && <CloudinaryPanel />}

          {activeTab === "system" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">API</div>
                    <div className="text-xl font-semibold text-gray-900">
                      Health
                    </div>
                  </div>
                  <button
                    onClick={pingSystem}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <RefreshCw
                      size={16}
                      className={sysLoading ? "animate-spin" : ""}
                    />
                    Ping
                  </button>
                </div>
                <div className="mt-3">
                  {sysOk == null ? (
                    <span className="text-gray-500 text-sm">Checking…</span>
                  ) : sysOk ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-700">
                      <Check size={14} /> API is healthy
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-red-700">
                      <X size={14} /> API is unreachable
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-2 text-blue-800">
                  <Shield size={16} className="mt-0.5" />
                  <p className="text-sm">
                    This page only calls read-only endpoints to avoid
                    unauthorized (401) errors. When you’re ready, we can wire
                    the Admin Profile, Site Info, Business Settings, and Admin
                    Users sections to their respective APIs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
