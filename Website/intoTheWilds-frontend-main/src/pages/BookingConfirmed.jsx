// src/pages/BookingConfirmed.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { BASE_URL } from "../utils/baseurl";

// tiny helpers
const dmy = (d) => (d ? dayjs(d).format("DD MMM YYYY") : "");
const iso = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "");

export default function BookingConfirmed() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  // We prefer the bookingId coming from Checkout. If missing, we’ll try sessionStorage.
  const bookingId = state?.bookingId ?? null;

  // If your backend exposes a booking-get endpoint, we’ll hit it.
  // If not, we gracefully fall back to the session snapshot saved by Checkout.
  useEffect(() => {
    (async () => {
      const fallback = (() => {
        try {
          const raw = sessionStorage.getItem("itw_booking");
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

      if (!bookingId) {
        // no id – use snapshot only
        setSummary(fallback);
        return;
      }

      // Try fetching from server; if it fails, still render fallback
      try {
        setLoading(true);
        const { data } = await axios.get(`${BASE_URL}/booking/${bookingId}`);
        // Expecting: { ok, booking }
        if (data?.ok && data?.booking) {
          setSummary({
            ...fallback,
            ...normalizeFromAPI(data.booking),
          });
        } else {
          setSummary(fallback);
        }
      } catch {
        setSummary(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const n = (x) => (typeof x === "number" ? x : Number(x || 0));

  const nights = useMemo(() => {
    if (!summary?.checkin || !summary?.checkout) return 0;
    const a = dayjs(summary.checkin);
    const b = dayjs(summary.checkout);
    const diff = b.diff(a, "day");
    return diff > 0 ? diff : 0;
  }, [summary]);

  if (!summary) {
    return (
      <div className="container mx-auto px-4 py-14">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
          <p className="text-amber-800">
            We couldn’t find your booking details. Please return to the property
            page and try again.
          </p>
          <button
            onClick={() => navigate("/properties")}
            className="mt-4 inline-flex items-center rounded-md bg-[#0b4a6f] px-4 py-2 text-white"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const property = summary.property || {};
  const price = n(summary.price);
  const adults = n(summary.adults ?? 1);
  const children = n(summary.children ?? 0);
  const roomsNeeded = calcRooms(adults, children);

  // bill (matches Checkout math)
  const subtotal = price * nights * roomsNeeded;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Booking Confirmed 🎉</h1>
        <p className="text-gray-600 mt-1">
          A confirmation has been created for your stay. We’ve also sent a copy
          to your email (if provided).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: property snapshot */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          <div className="flex gap-4">
            <img
              src={property?.images?.[0] || "/placeholder.jpg"}
              alt={property?.name || "Property"}
              className="w-40 h-40 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-xl font-semibold">{property?.name}</h2>
              <p className="text-gray-600 text-sm">{property?.location}</p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <Info label="Check-in" value={dmy(summary.checkin)} />
                <Info label="Check-out" value={dmy(summary.checkout)} />
                <Info label="Nights" value={String(nights)} />
                <Info
                  label="Guests"
                  value={`${adults} Adult${
                    adults !== 1 ? "s" : ""
                  } · ${children} Child${children !== 1 ? "ren" : ""}`}
                />
                <Info label="Rooms" value={String(roomsNeeded)} />
                {state?.paymentRef && (
                  <Info label="Payment Ref" value={state.paymentRef} />
                )}
              </div>
            </div>
          </div>

          {/* House rules / policies */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-2">Good to know</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
              <li>Check-in is after 2:00 PM. Check-out before 10:00 AM.</li>
              <li>Please respect quiet hours after 10:00 PM.</li>
              <li>Valid government ID is required at check-in.</li>
              <li>
                Cancellation policy varies by property; see your confirmation
                email for details.
              </li>
            </ul>
          </div>
        </div>

        {/* Right: bill + actions */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Your Receipt</h3>
          <Line label="Price / night" value={`₹${price.toLocaleString()}`} />
          <Line label="Nights" value={`${nights}`} />
          <Line label="Rooms" value={`${roomsNeeded}`} />
          <div className="my-2 h-px bg-gray-200" />
          <Line label="Subtotal" value={`₹${subtotal.toLocaleString()}`} />
          <Line label="Tax (18%)" value={`₹${tax.toLocaleString()}`} />
          <div className="mt-2 pt-2 border-t flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => navigate("/properties")}
              className="w-full rounded-md bg-[#0b4a6f] px-4 py-2.5 text-white hover:bg-[#083b58]"
            >
              Explore More Stays
            </button>
            <button
              onClick={() => window.print()}
              className="w-full rounded-md border px-4 py-2.5"
            >
              Download / Print Receipt
            </button>
          </div>

          {loading && (
            <p className="text-xs text-gray-500 mt-3">Syncing booking…</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function calcRooms(adults = 1, children = 0) {
  // rule: 1 room = 2 adults + 1 child
  const roomsByAdults = Math.max(1, Math.ceil(adults / 2));
  const childCapacity = roomsByAdults * 1;
  const extraChildRooms =
    children > childCapacity ? Math.ceil((children - childCapacity) / 1) : 0;
  return Math.max(1, roomsByAdults + extraChildRooms);
}

// If your GET /booking/:id shape differs, convert it to what we render here.
function normalizeFromAPI(b) {
  return {
    property: b?.property || b?.propertyRef || b?.room || {},
    price: b?.pricePerNight ?? b?.price ?? 0,
    checkin: b?.checkIn ?? b?.checkin ?? b?.startDate,
    checkout: b?.checkOut ?? b?.checkout ?? b?.endDate,
    adults: b?.adults ?? 1,
    children: b?.children ?? 0,
  };
}
