import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, index: true }, // e.g., 'site', 'business', 'razorpay'
    key: { type: String, required: true, index: true }, // e.g., 'name', 'logo', 'config'
    value: { type: mongoose.Schema.Types.Mixed }, // flexible payload
  },
  { timestamps: true }
);

settingSchema.index({ scope: 1, key: 1 }, { unique: true });

export default mongoose.model("Setting", settingSchema);
