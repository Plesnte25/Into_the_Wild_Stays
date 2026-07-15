// src/lib/ChannelApi.js
// Respects VITE_API_BASE like the rest of the app's API clients (see
// src/lib/axios.js, src/lib/api.js) so this doesn't silently break when the
// API is hosted on a different origin in production.
const BASE = `${import.meta.env.VITE_API_BASE || "/api"}/channels`;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    const message = data?.message || res.statusText;
    throw new Error(message);
  }
  return data?.data ?? data;
}

export const ChannelAPI = {
  // Accounts (Settings ▸ Channels)
  listAccounts() {
    return fetchJson(`${BASE}/accounts`);
  },
  createAccount(payload) {
    // payload: { provider: 'gommt', channel:'go-mmt', credentials: { hotelCode, accessToken, baseUrl } }
    return fetchJson(`${BASE}/accounts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Mappings
  listMappings({ property } = {}) {
    const q = property ? `?property=${encodeURIComponent(property)}` : "";
    return fetchJson(`${BASE}/mappings${q}`);
  },
  createMapping(payload) {
    // payload must contain: provider, property, account, remote, sync
    return fetchJson(`${BASE}/mappings`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateMapping(id, patch) {
    return fetchJson(`${BASE}/mappings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
  deleteMapping(id) {
    return fetchJson(`${BASE}/mappings/${id}`, { method: "DELETE" });
  },

  // Sync
  syncProperty(mappingId, scope) {
    return fetchJson(`${BASE}/mappings/${mappingId}/sync`, {
      method: "POST",
      body: JSON.stringify({ scope }),
    });
  },

  // Preview (see TODO in ChannelMappingDrawer.jsx — this is a mock/stub)
  previewMapping(mappingId) {
    return fetchJson(`${BASE}/mappings/${mappingId}/preview`);
  },
};
