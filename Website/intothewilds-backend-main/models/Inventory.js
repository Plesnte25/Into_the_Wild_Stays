const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Properties",
      required: true,
    },
    // store ALL inventory dates at start-of-day UTC to avoid TZ mismatches
    date: { type: Date, required: true },
    totalRooms: { type: Number, required: true },
    bookedRooms: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Correct way to create a compound unique index in Mongoose
inventorySchema.index({ property: 1, date: 1 }, { unique: true });

inventorySchema.virtual("available").get(function () {
  return Math.max(0, (this.totalRooms || 0) - (this.bookedRooms || 0));
});

module.exports = mongoose.model("Inventory", inventorySchema);
