import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: false,
      index: true,
    },
    userName: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, required: true, index: true },
    comment: { type: String, default: "" },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ comment: "text", userName: "text" });

export default mongoose.model("Review", reviewSchema);
