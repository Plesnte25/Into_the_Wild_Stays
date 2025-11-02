// src/services/channel/booking.js (ESM)
import axios from "axios";

// Small axios factory with Basic Auth
function bookingClient(creds) {
  const baseURL =
    creds.baseUrl?.replace(/\/+$/, "") || "https://connect.booking.com";
  const instance = axios.create({
    baseURL,
    timeout: 20000,
    auth: { username: creds.username, password: creds.password },
    headers: { "Content-Type": "application/json" },
    // If Booking.com needs special headers, add them here
  });

  // basic retry on 429/5xx
  instance.interceptors.response.use(undefined, async (err) => {
    const status = err?.response?.status;
    if (status === 429 || (status >= 500 && status < 600)) {
      await new Promise((r) => setTimeout(r, 800));
      return instance.request(err.config);
    }
    throw err;
  });

  return instance;
}

/**
 * Expected creds on account.creds:
 *  {
 *    baseUrl, username, password, hotelId?
 *  }
 * Expected mapping.remote:
 *  {
 *    hotelId?, roomTypeId, ratePlanId
 *  }
 */
export const bookingAdapter = {
  key: "booking",

  async pushAvailability({ account, mapping, scope }) {
    const creds = account.creds || {};
    const client = bookingClient(creds);

    const hotelId = mapping.remote?.hotelId || creds.hotelId;
    const roomTypeId = mapping.remote?.roomTypeId;
    if (!hotelId || !roomTypeId) {
      console.warn(
        "[booking] Missing hotelId or roomTypeId for availability push"
      );
      return;
    }

    // TODO: pull from your PMS the availability per day for next N days
    const days = await fakeAvailabilityFeed(mapping.property);

    // Transform to Booking.com “availability” payload (example placeholder)
    const payload = {
      hotel_id: hotelId,
      room_type_id: roomTypeId,
      availability: days.map((d) => ({
        date: d.date, // 'YYYY-MM-DD'
        rooms_to_sell: d.roomsToSell, // integer
        closed: d.closed ? 1 : 0,
      })),
    };

    // NOTE: Replace with the real Connectivity endpoint for availability.
    // This is a placeholder path. Consult Booking.com Connectivity docs.
    const endpoint = `/partner-api/hotels/${hotelId}/availability`;

    const { status } = await client.post(endpoint, payload);
    console.log("[booking] pushAvailability status:", status);
  },

  async pushRates({ account, mapping }) {
    const creds = account.creds || {};
    const client = bookingClient(creds);

    const hotelId = mapping.remote?.hotelId || creds.hotelId;
    const ratePlanId = mapping.remote?.ratePlanId;
    const roomTypeId = mapping.remote?.roomTypeId;
    if (!hotelId || !ratePlanId || !roomTypeId) {
      console.warn(
        "[booking] Missing hotelId/ratePlanId/roomTypeId for rates push"
      );
      return;
    }

    // TODO: pull from your PMS: rate per day (base rate, min/max LOS, etc.)
    const days = await fakeRateFeed(mapping.property);

    // Transform to Booking.com rate payload (example placeholder)
    const payload = {
      hotel_id: hotelId,
      rate_plan_id: ratePlanId,
      room_type_id: roomTypeId,
      rates: days.map((d) => ({
        date: d.date,
        price: d.price, // numeric, in hotel’s currency
        min_los: d.minLos ?? 1,
        max_los: d.maxLos ?? 30,
      })),
    };

    // NOTE: Replace with real endpoint path from Connectivity docs.
    const endpoint = `/partner-api/hotels/${hotelId}/rates`;

    const { status } = await client.post(endpoint, payload);
    console.log("[booking] pushRates status:", status);
  },

  async pushRestrictions({ account, mapping }) {
    const creds = account.creds || {};
    const client = bookingClient(creds);

    const hotelId = mapping.remote?.hotelId || creds.hotelId;
    const ratePlanId = mapping.remote?.ratePlanId;
    if (!hotelId || !ratePlanId) {
      console.warn(
        "[booking] Missing hotelId/ratePlanId for restrictions push"
      );
      return;
    }

    // TODO: Gather restrictions (CTA/CTD/ClosedToArrival, ClosedToDeparture)
    const days = await fakeRestrictionFeed(mapping.property);

    const payload = {
      hotel_id: hotelId,
      rate_plan_id: ratePlanId,
      restrictions: days.map((d) => ({
        date: d.date,
        cta: d.cta ? 1 : 0,
        ctd: d.ctd ? 1 : 0,
        closed: d.closed ? 1 : 0,
      })),
    };

    const endpoint = `/partner-api/hotels/${hotelId}/restrictions`;
    const { status } = await client.post(endpoint, payload);
    console.log("[booking] pushRestrictions status:", status);
  },

  async pull({ account, mapping }) {
    const creds = account.creds || {};
    const client = bookingClient(creds);

    const hotelId = mapping.remote?.hotelId || creds.hotelId;
    if (!hotelId) {
      console.warn("[booking] Missing hotelId for pull");
      return;
    }

    // EXAMPLE: pull reservations (placeholder endpoint)
    const endpoint = `/partner-api/hotels/${hotelId}/reservations?since=2024-01-01`;
    try {
      const { data } = await client.get(endpoint);
      console.log(
        "[booking] pulled reservations count:",
        Array.isArray(data) ? data.length : "unknown"
      );

      // TODO: persist reservations into your DB
      // await ReservationService.upsertFromBooking(data);
    } catch (e) {
      console.warn(
        "[booking] pull reservations failed:",
        e?.response?.status || e.message
      );
    }
  },
};

// ------- Demo feeds (replace with your PMS queries) -------
async function fakeAvailabilityFeed(propertyId) {
  // Return next 14 days open/closed capacity
  const today = new Date();
  return Array.from({ length: 14 }).map((_, i) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + i);
    const date = dt.toISOString().slice(0, 10);
    return { date, roomsToSell: 3, closed: false };
  });
}

async function fakeRateFeed(propertyId) {
  const today = new Date();
  return Array.from({ length: 14 }).map((_, i) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + i);
    const date = dt.toISOString().slice(0, 10);
    return { date, price: 4000 + i * 50 };
  });
}

async function fakeRestrictionFeed(propertyId) {
  const today = new Date();
  return Array.from({ length: 14 }).map((_, i) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + i);
    const date = dt.toISOString().slice(0, 10);
    return { date, cta: false, ctd: false, closed: false };
  });
}
