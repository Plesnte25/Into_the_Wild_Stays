import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, lowercase: true },
    phone: { type: String },
    channel: { type: String, enum: ["email", "sms"], required: true },
    purpose: { type: String, default: "password_reset" },
    code: { type: String, required: true }, // 6-digit
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, phone: 1, channel: 1, createdAt: -1 });

export default mongoose.model("OtpToken", otpSchema);
