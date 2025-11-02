const mongoose = require("mongoose");
require("dotenv").config();
const Inventory = require("../models/Inventory");
const Properties = require("../models/Properties");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const props = await Properties.find({});
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const p of props) {
    const totalRooms = p.guestCapacity
      ? Math.ceil(p.maximumCapacity / p.guestCapacity)
      : 4;
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      await Inventory.updateOne(
        { property: p._id, date: d },
        { $setOnInsert: { totalRooms, bookedRooms: 0 } },
        { upsert: true }
      );
    }
    console.log("Seeded", p.name);
  }
  process.exit(0);
})();
