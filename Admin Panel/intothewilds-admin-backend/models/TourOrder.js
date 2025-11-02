import mongoose from "mongoose";

const TourOrderSchema = new mongoose.Schema(
  {
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" },
    amount: { type: Number, default: 0 },
    attendees: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("TourOrder", TourOrderSchema);
