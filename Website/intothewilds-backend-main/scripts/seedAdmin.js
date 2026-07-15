// scripts/seedAdmin.js
//
// Idempotently creates (or promotes) a single admin user so there is a way
// to reach the admin-only endpoints (GET /api/v1/auth/getAllUsers, property
// create/edit/delete, etc.) on a fresh database.
//
// Configure via env vars before running `npm run seed:admin`:
//   ADMIN_EMAIL    - required, login email for the admin account
//   ADMIN_PASSWORD - required, plaintext password (hashed by the User model's
//                    pre-save hook — never stored in plaintext)
//   ADMIN_USERNAME - optional, defaults to the local part of ADMIN_EMAIL
//   ADMIN_NAME     - optional, defaults to "Admin"
//
// Safe to re-run: if a user with ADMIN_EMAIL already exists it is simply
// promoted to role "admin" instead of being duplicated.

const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

(async () => {
  const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, ADMIN_NAME } =
    process.env;

  if (!MONGO_URI) {
    console.error("seedAdmin: MONGO_URI is not set. Aborting.");
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "seedAdmin: ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment. Aborting."
    );
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    admin.role = "admin";
    await admin.save();
    console.log(`seedAdmin: promoted existing user ${ADMIN_EMAIL} to admin.`);
  } else {
    admin = new User({
      username: (ADMIN_USERNAME || ADMIN_EMAIL.split("@")[0]).toLowerCase(),
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // hashed by the User pre-save hook
      name: ADMIN_NAME || "Admin",
      role: "admin",
      isVerified: true,
    });
    await admin.save();
    console.log(`seedAdmin: created new admin user ${ADMIN_EMAIL}.`);
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("seedAdmin: failed -", err);
  process.exit(1);
});
