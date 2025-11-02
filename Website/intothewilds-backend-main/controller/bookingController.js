const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Properties = require("../models/Properties");
const Inventory = require("../models/Room");

function asDateOnly(d) {
  const dt = new Date(d);
  return new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
  );
}

function nightsBetween(checkIn, checkOut) {
  const ms = asDateOnly(checkOut) - asDateOnly(checkIn);
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
}

function calcRoomsNeeded(adults, children) {
  // 1 room holds up to 2 adults + 1 child (0–11)
  const a = Math.max(0, Number(adults || 0));
  const c = Math.max(0, Number(children || 0));
  const roomByAdults = Math.ceil(a / 2);
  const roomByChildren = Math.ceil(c / 1); // 1 child per room rule
  return Math.max(1, Math.max(roomByAdults, roomByChildren));
}

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_RTMuJuKtTfafaU",
//   key_secret: process.env.RAZORPAY_KEY_SECRET || "RUjO6lObvSv9y3mao1271dKD",
// });

exports.newBooking = async (req, res) => {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      name,
      email,
      phone,
      payNowPercent, // optional
    } = req.body || {};

    // ---- Validation (fast-fail with readable message)
    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ error: "Invalid propertyId" });
    }
    if (!checkIn || !checkOut) {
      return res
        .status(400)
        .json({ error: "checkIn and checkOut are required" });
    }
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ error: "name, email and phone are required" });
    }

    const property = await Properties.findById(propertyId).lean();
    if (!property) return res.status(404).json({ error: "Property not found" });

    const nights = nightsBetween(checkIn, checkOut);
    if (nights <= 0) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    const roomsNeeded = calcRoomsNeeded(adults, children);

    // ---- Pricing
    const nightly = Number(property.price || 0);
    const subtotal = nightly * nights * roomsNeeded;
    const tax = Math.round(subtotal * 0.18); // GST 18%
    const total = subtotal + tax;
    const payPercent = Number(payNowPercent ?? 20); // default 20%
    const amountToPay = Math.round((total * payPercent) / 100);

    // ---- Razorpay (optional, test-friendly)
    let order = {
      id: `order_test_${Date.now()}`,
      amount: amountToPay * 100,
      currency: "INR",
      status: "created",
    };
    // const haveRzp =
    //   process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
    // if (haveRzp) {
    //   const razorpay = new Razorpay({
    //     key_id: process.env.RAZORPAY_KEY_ID,
    //     key_secret: process.env.RAZORPAY_KEY_SECRET,
    //   });
    //   order = await razorpay.orders.create({
    //     amount: amountToPay * 100, // paise
    //     currency: "INR",
    //     receipt: `itw_${Date.now().toString(36)}`,
    //   });
    // } else {
    //   // Test stub so dev flow doesn't crash
    //   order = {
    //     id: `order_test_${Date.now()}`,
    //     amount: amountToPay * 100,
    //     currency: "INR",
    //     status: "created",
    //   };
    // }

    // ---- Persist booking (status=pending)
    const booking = await Booking.create({
      property: propertyId,
      checkIn: asDateOnly(checkIn), // ✅ Fixed: Use asDateOnly function
      checkOut: asDateOnly(checkOut), // ✅ Fixed: Use asDateOnly function
      adults,
      children,
      rooms: roomsNeeded,
      priceNight: nightly,
      subtotal,
      tax,
      total,
      payPercent,
      amountToPay,
      customer: { name, email, phone },
      razorpayOrderId: order.id,
      status: "pending",
    });

    return res.status(200).json({
      ok: true,
      bookingId: booking._id,
      order,
      amountToPay,
      total,
      roomsNeeded,
      nights,
    });
  } catch (err) {
    console.error("newBooking error:", err);
    // Never crash the process — return a readable message
    return res
      .status(500)
      .json({ error: "Unable to create booking, please try again." });
  }
};
