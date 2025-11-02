import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    bytes: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    tags: { type: [String], default: [] },
    uploadedBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("MediaAsset", mediaSchema);
