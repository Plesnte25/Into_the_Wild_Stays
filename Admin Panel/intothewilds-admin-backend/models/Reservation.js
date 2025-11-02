import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    channel: { type: String, required: true }, // “booking”, “airbnb”, etc.
    remoteBookingId: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "modified", "cancelled"],
      default: "new",
    },
    guest: {
      name: String,
      email: String,
      phone: String,
    },
    stay: {
      checkIn: Date,
      checkOut: Date,
      nights: Number,
      adults: Number,
      children: Number,
      rooms: Number,
      roomType: String,
    },
    pricing: {
      currency: { type: String, default: "INR" },
      total: Number,
      taxes: Number,
      fees: Number,
      payout: Number,
    },
    meta: Object, // raw payload for audit
    idempotencyKey: String,
  },
  { timestamps: true }
);

reservationSchema.index({ remoteBookingId: 1, channel: 1 }, { unique: true });
reservationSchema.index({ idempotencyKey: 1 });

export default mongoose.model("Reservation", reservationSchema);
