import "dotenv/config.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://intothewildstays:5xopzIkh6cFpTynT@cluster0.q3utk.mongodb.net/itw?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(MONGO_URI);
  const email = process.env.SEED_ADMIN_EMAIL || "admin@intothewildstays.in";
  const phone = process.env.SEED_ADMIN_PHONE || "+911234567890";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin!123";

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.passwordHash = hash;
    existing.phone = phone;
    await existing.save();
    console.log("Updated existing admin:", email);
  } else {
    await User.create({
      email,
      phone,
      passwordHash: hash,
      name: "ITW Admin",
      role: "admin",
    });
    console.log("Created admin:", email);
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
