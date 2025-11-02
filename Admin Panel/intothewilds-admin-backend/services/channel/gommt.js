// src/services/channel/gommt.js
import crypto from "crypto";

/**
 * Go-MMT Adapter (V3)
 * - credentials: { hotelCode, accessToken, baseUrl }
 * - remote: { hotelId, roomTypeId, ratePlanId }
 *
 * NOTE: Real push/pull endpoints + signing derived from the PDFs.
 * Replace stubs with the exact V3 URLs once your channel-token is issued.
 */

function sign(headers) {
  // If GiM expects HMAC or similar signature, compute here using accessToken/secret
  // Placeholder for now.
  return headers;
}

async function httpJson(url, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    const msg = data?.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

export function createGoMmtAdapter(account) {
  const { credentials } = account || {};
  const baseUrl =
    credentials?.baseUrl?.replace(/\/+$/, "") ||
    "https://connect.makemytrip.com";
  const hotelCode = credentials?.hotelCode;
  const accessToken = credentials?.accessToken;

  if (!hotelCode || !accessToken) {
    throw new Error("Go-MMT account missing hotelCode/accessToken");
  }

  // Example endpoint placeholders — adjust to real V3 endpoints from the docs:
  const endpoints = {
    pushRates: `${baseUrl}/api/v3/rates/update`,
    pushAvailability: `${baseUrl}/api/v3/inventory/update`,
    pushRestrictions: `${baseUrl}/api/v3/restrictions/update`,
    // Pull availability or booking retrieval, etc.:
    pullAvailability: `${baseUrl}/api/v3/inventory/fetch`,
  };

  return {
    provider: "gommt",

    async pushRates(mapping, { dates, rate }) {
      const { remote } = mapping;
      const payload = {
        hotelCode,
        roomTypeId: remote?.roomTypeId,
        ratePlanId: remote?.ratePlanId,
        dates,
        rate, // numeric
      };
      const headers = sign({ Authorization: `Bearer ${accessToken}` });
      return httpJson(endpoints.pushRates, {
        method: "POST",
        headers,
        body: payload,
      });
    },

    async pushAvailability(mapping, { dates, allotment }) {
      const { remote } = mapping;
      const payload = {
        hotelCode,
        roomTypeId: remote?.roomTypeId,
        dates,
        allotment, // integer availability
      };
      const headers = sign({ Authorization: `Bearer ${accessToken}` });
      return httpJson(endpoints.pushAvailability, {
        method: "POST",
        headers,
        body: payload,
      });
    },

    async pushRestrictions(mapping, { dates, closed }) {
      const { remote } = mapping;
      const payload = {
        hotelCode,
        roomTypeId: remote?.roomTypeId,
        dates,
        closed: !!closed,
      };
      const headers = sign({ Authorization: `Bearer ${accessToken}` });
      return httpJson(endpoints.pushRestrictions, {
        method: "POST",
        headers,
        body: payload,
      });
    },

    async pullAvailability(mapping, { from, to }) {
      const { remote } = mapping;
      const url = `${endpoints.pullAvailability}?hotelCode=${encodeURIComponent(
        hotelCode
      )}&roomTypeId=${encodeURIComponent(
        remote?.roomTypeId || ""
      )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const headers = sign({ Authorization: `Bearer ${accessToken}` });
      return httpJson(url, { headers });
    },
  };
}
