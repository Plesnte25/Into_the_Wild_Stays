// server/models/Booking.js
import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    currency: { type: String, default: process.env.CURRENCY || "INR" },

    // authoritative financials
    grossAmount: { type: Number, required: true, default: 0 }, // before tax/fees/discount
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    channelFee: { type: Number, default: 0 },

    netReceivable: { type: Number, required: true, default: 0 }, // computed & persisted for audit

    // payments
    paidAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
    },
  },
  { _id: false }
);

const guestSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
  },
  { _id: false }
);

const staySchema = new mongoose.Schema(
  {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, default: 1 },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    propertyId: { type: mongoose.Types.ObjectId, ref: "Property" },
    propertyName: String,
    roomType: String,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    code: { type: String, index: true }, // human-readable booking code (optional)

    guest: guestSchema,
    stay: staySchema,

    price: priceSchema,

    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "pending",
      index: true,
    },

    invoiceNumber: String,
    invoiceDate: Date,

    notes: String,
    channel: { type: String, default: "direct" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
