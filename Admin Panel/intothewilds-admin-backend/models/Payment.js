// server/models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "razorpay", index: true },
    orderId: String,
    paymentId: String,
    refundId: String,
    bookingId: { type: mongoose.Types.ObjectId, ref: "Booking" },
    amount: { type: Number, default: 0 }, // in major units (INR)
    currency: { type: String, default: "INR" },
    status: { type: String }, // created|authorized|captured|failed|refunded|...
    raw: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.index({ provider: 1, orderId: 1 }, { unique: false });

export default mongoose.model("Payment", paymentSchema);
