import mongoose from "mongoose";

const blackoutSchema = new mongoose.Schema(
  {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: String,
  },
  { _id: false }
);

const inventorySchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Types.ObjectId,
      ref: "Property",
      unique: true,
      index: true,
    },
    units: { type: Number, default: 1 }, // simultaneous bookable units
    minStay: { type: Number, default: 1 },
    blackouts: { type: [blackoutSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
