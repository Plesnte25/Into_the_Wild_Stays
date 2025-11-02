// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Properties",
      required: true,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    adults: Number,
    children: Number,
    rooms: Number,
    nights: Number,

    customer: {
      fullName: String,
      email: String,
      phone: String,
      notes: String,
    },

    pricing: {
      perNight: Number,
      subTotal: Number,
      tax: Number,
      grand: Number,
      payNow: Number,
    },

    // razorpay
    orderId: String,
    paymentId: String,
    signature: String,
    status: {
      type: String,
      enum: ["created", "paid", "failed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
