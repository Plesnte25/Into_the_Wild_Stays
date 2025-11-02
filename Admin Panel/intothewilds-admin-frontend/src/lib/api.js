export const ADMIN_API =
  import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

export const postJSON = async (path, body, opts = {}) => {
  const res = await fetch(`${ADMIN_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include", // to receive/set httpOnly cookie
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
};
