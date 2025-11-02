import mongoose from "mongoose";

const ReviewReplySchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    createdBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: false },
      name: { type: String, default: "Admin" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.ReviewReply ||
  mongoose.model("ReviewReply", ReviewReplySchema);
