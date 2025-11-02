import mongoose from "mongoose";

const EventOrderSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    amount: { type: Number, default: 0 },
    attendees: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("EventOrder", EventOrderSchema);
