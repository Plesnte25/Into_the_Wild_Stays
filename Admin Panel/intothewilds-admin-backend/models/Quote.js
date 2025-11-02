import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Types.ObjectId, ref: "Property", index: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    breakdown: { type: Object, required: true }, // { currency,gross,discount,tax,platformFee,channelFee,net,propertyName }
    fingerprint: { type: String, index: true }, // hash of inputs to detect dupes
    expiresAt: { type: Date, index: true }, // TTL index (ensure created)
  },
  { timestamps: true }
);

quoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Quote", quoteSchema);
