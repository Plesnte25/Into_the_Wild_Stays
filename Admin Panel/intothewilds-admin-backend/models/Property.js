import mongoose from "mongoose";

const seasonalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
});

const otaSchema = new mongoose.Schema({
  booking: { type: String, default: "" },
  makemytrip: { type: String, default: "" },
  goibibo: { type: String, default: "" },
  agoda: { type: String, default: "" },
});

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    addressLine: { type: String, default: "" },
    price: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    occupancy: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
    },
    description: { type: String, default: "" },
    amenities: { type: [String], default: [] },
    policy: { type: String, default: "" },
    images: { type: [String], default: [] },
    imagesPublicIds: { type: [String], default: [] },
    seasonalPricing: [seasonalSchema],
    otaLinks: otaSchema,
    paused: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
