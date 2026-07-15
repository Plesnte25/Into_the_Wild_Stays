// scripts/wire-cloudinary.js
//
// Backfills Properties.images / imagesPublicIds from a Cloudinary folder
// structure. Requires MONGO_URI plus CLOUDINARY_CLOUD_NAME /
// CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET to be set in the environment —
// see .env.example. This script intentionally does not run without them.

require("dotenv").config();
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const Properties = require("../models/Properties"); // adjust path if different

// ----- CONFIG -----
const MATCH =
  process.argv.find((a) => a.startsWith("--match="))?.split("=")[1] || "byId";

const { MONGO_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;
const ROOT = process.env.CLOUDINARY_FOLDER || "itw/uploads";
const PROPS_ROOT = `${ROOT}/properties`;

if (!MONGO_URI) {
  console.error("wire-cloudinary: MONGO_URI is not set. Aborting.");
  process.exit(1);
}
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error(
    "wire-cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must all be set. Aborting."
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function slug(s = "") {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function listFolder(folder) {
  // fetch all resources in folder (paginate)
  let next = null;
  const out = [];
  do {
    const res = await cloudinary.search
      .expression(`folder="${folder}"`)
      .max_results(500)
      .next_cursor(next || undefined)
      .execute();
    (res.resources || []).forEach((r) => out.push(r));
    next = res.next_cursor;
  } while (next);
  return out;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Mongo connected");

  // Build a map of cloudinary subfolders under PROPS_ROOT
  console.log("Indexing Cloudinary Properties folders ...");
  const all = await cloudinary.search
    .expression(`folder="${PROPS_ROOT}"`) // this returns resources; we’ll derive folders
    .max_results(500)
    .execute();

  // Derive folder set
  const folders = new Set();
  (all.resources || []).forEach((r) => {
    // r.folder like "itw/uploads/properties/<subfolder>"
    const parts = (r.folder || "").split("/");
    const sub = parts.slice(parts.indexOf("properties") + 1).join("/");
    if (sub) folders.add(sub);
  });
  console.log(`Found ${folders.size} Properties subfolders.`);

  let touched = 0,
    skipped = 0,
    updated = 0,
    totalImages = 0;

  const cursor = Properties.find({}).cursor();
  for (let p = await cursor.next(); p; p = await cursor.next()) {
    // Decide which folder to use
    let subfolder = "";
    if (MATCH === "byId") {
      subfolder = p._id.toString();
    } else {
      // byName: find a folder that matches Properties name/slug
      const target = slug(p.name || "");
      const hit = [...folders].find((f) => slug(f) === target);
      if (!hit) {
        console.log(`SKIP: no folder match for "${p.name}" (${p._id})`);
        skipped++;
        continue;
      }
      subfolder = hit;
    }

    const folder = `${PROPS_ROOT}/${subfolder}`;
    const res = await listFolder(folder);
    if (!res.length) {
      console.log(`SKIP: empty folder ${folder}`);
      skipped++;
      continue;
    }

    // Order by public_id or created (Cloudinary returns a mix; sort for consistency)
    res.sort((a, b) => (a.public_id < b.public_id ? -1 : 1));

    const urls = res.map((r) => r.secure_url).filter(Boolean);
    const pids = res.map((r) => r.public_id);

    totalImages += urls.length;

    const changed = JSON.stringify(p.images || []) !== JSON.stringify(urls);
    if (changed) {
      p.images = urls;
      p.imagesPublicIds = pids; // NEW FIELD: handy for admin deletes later
      await p.save();
      updated++;
      console.log(`UPDATED: ${p.name} (${p._id}) -> ${urls.length} images`);
    } else {
      touched++;
    }
  }

  console.log({ updated, touched, skipped, totalImages });
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
