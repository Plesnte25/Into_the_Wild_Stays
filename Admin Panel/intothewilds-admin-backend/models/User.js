import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { type } from "os";

const otpSub = new mongoose.Schema(
  {
    codeHash: { type: String },
    expiresAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Admin" },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    phone: { type: String, index: true },
    role: { type: String, enum: ["admin", "staff"], default: "admin" },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },

    //Reset OTPs
    emailOtp: otpSub,
    smsOtp: otpSub,

    // Refresh token rotation
    refreshTokens: [
      {
        tokenHash: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

userSchema.methods.validatePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model("User", userSchema);
