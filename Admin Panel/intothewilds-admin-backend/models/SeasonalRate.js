import mongoose from "mongoose";

const seasonalRateSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    seasonName: String,
    start: Date,
    end: Date,
    price: Number, // nightly override
    minNights: Number,
  },
  { timestamps: true }
);

export default mongoose.model("SeasonalRate", seasonalRateSchema);
