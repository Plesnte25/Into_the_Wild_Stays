// src/components/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../utils/baseurl";

// Helpers
const dmy = (d) => (d ? dayjs(d).format("DD MMMM YYYY") : "");
const iso = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "");

// -------- Component --------
export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 1) Source the booking data from navigation state OR sessionStorage fallback
  const saved = (() => {
    try {
      const raw = sessionStorage.getItem("itw_booking");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // PropertyDetail may put the object under different keys; normalize once
  const boot = state?.booking || state || saved || {};
  const bootProperty = boot.property || boot.selectedProperty || {};
  const bootPrice = Number(boot.price ?? bootProperty.price ?? 0);

  // 2) State that powers UI AND request payload (single source of truth)
  const [property] = useState(bootProperty || {});
  const [pricePerNight] = useState(bootPrice);

  const [checkin, setCheckin] = useState(
    boot.checkin || boot.checkIn || boot.startDate || ""
  );
  const [checkout, setCheckout] = useState(
    boot.checkout || boot.checkOut || boot.endDate || ""
  );

  const [adults, setAdults] = useState(Number(boot.adults ?? 1));
  const [children, setChildren] = useState(Number(boot.children ?? 0));

  const [fullName, setFullName] = useState(boot.fullName || boot.name || "");
  const [email, setEmail] = useState(boot.email || "");
  const [phone, setPhone] = useState(boot.phone || "");
  const [specialRequests, setSpecialRequests] = useState(
    boot.specialRequests || ""
  );

  const [loading, setLoading] = useState(false);

  // Keep the persisted snapshot updated so refresh/back works
  useEffect(() => {
    const snapshot = {
      property,
      price: pricePerNight,
      checkin,
      checkout,
      adults,
      children,
      fullName,
      email,
      phone,
      specialRequests,
    };
    try {
      sessionStorage.setItem("itw_booking", JSON.stringify(snapshot));
    } catch {}
  }, [
    property,
    pricePerNight,
    checkin,
    checkout,
    adults,
    children,
    fullName,
    email,
    phone,
    specialRequests,
  ]);

  // 3) Derived values
  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0;
    const a = dayjs(checkin);
    const b = dayjs(checkout);
    const diff = b.diff(a, "day");
    return diff > 0 ? diff : 0;
  }, [checkin, checkout]);

  // rule: 1 room = 2 adults + 1 child (extra children spill into new rooms)
  const roomsNeeded = useMemo(() => {
    const roomsByAdults = Math.max(1, Math.ceil(adults / 2));
    const childCapacity = roomsByAdults * 1;
    const extraChildRooms =
      children > childCapacity ? Math.ceil((children - childCapacity) / 1) : 0;
    return Math.max(1, roomsByAdults + extraChildRooms);
  }, [adults, children]);

  const dates = useMemo(() => {
    if (!checkin || !checkout || nights <= 0) return [];
    const start = dayjs(checkin);
    return Array.from({ length: nights }, (_, i) =>
      start.add(i, "day").format("YYYY-MM-DD")
    );
  }, [checkin, checkout, nights]);

  const amounts = useMemo(() => {
    const subtotal = pricePerNight * nights * roomsNeeded;
    const tax = Math.round(subtotal * 0.18); // 18%
    const total = subtotal + tax;
    const payNow = Math.round(total * 0.2); // 20%
    return { pricePerNight, subtotal, tax, total, payNow, currency: "INR" };
  }, [pricePerNight, nights, roomsNeeded]);

  // 4) Availability check (correct endpoint & params)
  async function ensureAvailability() {
    try {
      const { data } = await axios.get(`${BASE_URL}/inventory/availability`, {
        params: {
          propertyId: property._id,
          start: iso(checkin),
          end: iso(checkout),
          rooms: roomsNeeded,
        },
      });
      return data;
    } catch (err) {
      console.error("[availability] error:", err?.response?.data || err);
      return null;
    }
  }

  // 5) Build create-order payload that your backend expects
  function buildPayload() {
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const date = dayjs(dateStr);
      return date.isValid() ? date.format("YYYY-MM-DD") : "";
    };
    return {
      propertyId: property._id,
      checkIn: formatDate(checkin),
      checkOut: formatDate(checkout),
      adults,
      children,
      name: fullName,
      email,
      phone,
      // property: property._id,
      // dates,
      // specialRequests,
      // amounts,
      // gateway: "razorpay",
      // source: "web",
    };
  }

  // 6) Pay flow
  async function onPay() {
    try {
      if (!property?._id) {
        toast.error("Property is missing. Please reselect.");
        return;
      }
      if (!checkin || !checkout || nights <= 0) {
        toast.error("Check-in and Check-out are required.");
        return;
      }
      if (!fullName?.trim() || !email?.trim() || !String(phone || "").trim()) {
        toast.error("Please fill Name, Email and Phone to continue.");
        return;
      }

      setLoading(true);

      const avail = await ensureAvailability();
      if (avail && avail.ok === false) {
        toast.error(avail.message || "Selected dates are not available.");
        setLoading(false);
        return;
      }

      const payload = buildPayload();
      console.log("Debug - Booking payload:", payload);
      console.log("Debug - date range:", {
        checkin: payload.checkin,
        checkout: payload.checkout,
        nights: nights,
        rooms: roomsNeeded,
      });
      const createRes = await axios.post(
        `${BASE_URL}/booking/new-booking`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      // Your API may return: { ok, order?, bookingId?, message? }
      const { ok, order, bookingId, message } = createRes?.data || {};

      if (!ok) {
        toast.error(message || "Could not create booking.");
        setLoading(false);
        return;
      }

      // If server gave us a Razorpay order, open the checkout; otherwise just route to reservation
      //   if (order?.id) {
      //     // @ts-ignore
      //     const rzp = new window.Razorpay({
      //       key:
      //         import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_RTMuJuKtTfafaU",
      //       amount: order.amount,
      //       currency: order.currency || "INR",
      //       name: "IntoTheWild Stays",
      //       description: `${property?.name || "Reservation"} (${dmy(
      //         checkin
      //       )} → ${dmy(checkout)})`,
      //       order_id: order.id,
      //       prefill: {
      //         name: fullName,
      //         email,
      //         contact: String(phone || ""),
      //       },
      //       notes: { bookingId: bookingId || "", propertyId: property._id },
      //       theme: { color: "#0b4a6f" },
      //       handler: async (resp) => {
      //         try {
      //           const verify = await axios.post(
      //             `${BASE_URL}/booking/verify-payment`,
      //             {
      //               bookingId,
      //               razorpay: {
      //                 order_id: resp.razorpay_order_id,
      //                 payment_id: resp.razorpay_payment_id,
      //                 signature: resp.razorpay_signature,
      //               },
      //             }
      //           );
      //           if (verify?.data?.ok) {
      //             toast.success("Payment successful! Reservation confirmed.");
      //             navigate("/reservation", { state: { bookingId } });
      //           } else {
      //             toast.error(
      //               verify?.data?.message || "Payment verification failed."
      //             );
      //           }
      //         } catch (e) {
      //           console.error(e);
      //           toast.error("Payment verification failed.");
      //         }
      //       },
      //       modal: {
      //         ondismiss: () => toast("Payment window closed.", { icon: "ℹ️" }),
      //       },
      //     });
      //     rzp.open();
      //   } else {
      //     // No online payment (maybe COD/hold) — still proceed
      //     toast.success("Booking created.");
      //     navigate("/reservation", { state: { bookingId } });
      //   }
      // If server gave us a Razorpay order OR test order, handle accordingly
      if (order?.id) {
        // Check if this is a test order (bypass Razorpay)
        if (order.id.startsWith("order_test_")) {
          // ✅ TEST MODE: Skip Razorpay and directly confirm booking
          toast.success("Booking created successfully! (Test Mode)");
          navigate("/booking-confirmation", { state: { bookingId } });
        } else {
          // ✅ LIVE MODE: Use Razorpay
          const rzp = new window.Razorpay({
            key:
              import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1234567890abcd",
            amount: order.amount,
            currency: order.currency || "INR",
            name: "IntoTheWild Stays",
            description: `${property?.name || "Reservation"} (${dmy(
              checkin
            )} → ${dmy(checkout)})`,
            order_id: order.id,
            prefill: { name: fullName, email, contact: String(phone || "") },
            notes: { bookingId: bookingId || "", propertyId: property._id },
            theme: { color: "#0b4a6f" },
            handler: async (resp) => {
              try {
                const verify = await axios.post(
                  `${BASE_URL}/booking/verify-payment`,
                  {
                    bookingId,
                    razorpay: {
                      order_id: resp.razorpay_order_id,
                      payment_id: resp.razorpay_payment_id,
                      signature: resp.razorpay_signature,
                    },
                  }
                );
                if (verify?.data?.ok) {
                  toast.success("Payment successful! Reservation confirmed.");
                  navigate("/booking-confirmation", { state: { bookingId } });
                } else {
                  toast.error(
                    verify?.data?.message || "Payment verification failed."
                  );
                }
              } catch (e) {
                console.error(e);
                toast.error("Payment verification failed.");
              }
            },
            modal: {
              ondismiss: () => toast("Payment window closed.", { icon: "ℹ️" }),
            },
          });
          rzp.open();
        }
      } else {
        // No payment required
        toast.success("Booking created.");
        navigate("/booking-confirmation", { state: { bookingId } });
      }
    } catch (err) {
      console.error("[createOrder] error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while creating the order.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  } // end onPay

  // 7) UI (unchanged look/feel)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-2">Review Your Booking</h1>
      <p className="text-gray-600 mb-6">Confirm details & pay securely</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: property + counters */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex gap-4">
            <img
              src={property?.images?.[0] || "/placeholder.jpg"}
              alt={property?.name || "Property"}
              className="w-40 h-40 object-cover rounded-lg"
            />
            <div>
              <h2 className="font-semibold text-lg">{property?.name}</h2>
              <p className="text-sm text-gray-600">{property?.location}</p>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-gray-500">Check-in</label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={dmy(checkin)}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Check-out</label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={dmy(checkout)}
                    readOnly
                  />
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-600">
                {adults} Adult{adults !== 1 ? "s" : ""} & {children} Child
                {children !== 1 ? "ren" : ""} · Rooms needed:{" "}
                <b>{roomsNeeded}</b> · Nights: <b>{nights}</b>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Counter
              label="Adults (12+)"
              value={adults}
              onChange={setAdults}
              min={1}
            />
            <Counter
              label="Children (0–11)"
              value={children}
              onChange={setChildren}
              min={0}
            />
          </div>
        </div>

        {/* Right: price summary */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-lg mb-3">Your Reservation</h3>

          <div className="space-y-2 text-sm">
            {dates &&
              dates.map((d) => (
                <div key={d} className="flex justify-between border-b pb-1">
                  <span>{dmy(d)}</span>
                  <span>
                    ₹{pricePerNight.toLocaleString()}{" "}
                    <span className="text-gray-500">/ night</span>
                  </span>
                </div>
              ))}
          </div>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <b>₹{amounts.subtotal.toLocaleString()}</b>
            </div>
            <div className="flex justify-between">
              <span>Tax (18%)</span>
              <b>₹{amounts.tax.toLocaleString()}</b>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Total</span>
              <b>₹{amounts.total.toLocaleString()}</b>
            </div>
            <div className="flex justify-between">
              <span>Pay Now (20%)</span>
              <b>₹{amounts.payNow.toLocaleString()}</b>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onPay}
            className={`mt-4 w-full rounded-md px-4 py-3 text-white font-medium ${
              loading ? "bg-gray-400" : "bg-[#0b4a6f] hover:bg-[#083b58]"
            }`}
          >
            {loading ? "Processing..." : "Pay & Confirm Reservation"}
          </button>
        </div>
      </div>

      {/* Guest details */}
      <div className="bg-white rounded-xl shadow p-4 mt-6">
        <h3 className="font-semibold text-lg resemb-4">Guest Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Full Name *"
            value={fullName}
            onChange={setFullName}
          />
          <TextField
            label="Email *"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <TextField
            label="Phone *"
            value={phone}
            onChange={setPhone}
            type="tel"
          />
        </div>
        <div className="mt-4">
          <label className="text-sm text-gray-600">
            Special Requests (Optional)
          </label>
          <textarea
            rows={3}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2"
            placeholder="Any requests..."
          />
        </div>
      </div>
    </div>
  );
}

/* ------- small UI helpers ------- */

function Counter({ label, value, onChange, min = 0 }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          className="w-8 h-8 rounded-md border flex items-center justify-center"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          –
        </button>
        <span className="w-6 text-center">{value}</span>
        <button
          type="button"
          className="w-8 h-8 rounded-md border flex items-center justify-center"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        className="mt-1 w-full border rounded-md px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
