import "dotenv/config.js";
import mongoose from "mongoose";
import fetch from "node-fetch";
import { uploadBuffer } from "../services/cloudinary.service.js";

// Adjust this import to your actual Property model path
import Property from "../models/Property.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://intothewildstays:5xopzIkh6cFpTynT@cluster0.q3utk.mongodb.net/itw?retryWrites=true&w=majority&appName=Cluster0";
const IBB_HOSTS = ["i.ibb.co", "ibb.co", "imgbb.com"];

function isIbbUrl(url = "") {
  try {
    const u = new URL(url);
    return IBB_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

async function migrateOneUrl(url, folder) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const buf = await resp.arrayBuffer();
    const nodeBuf = Buffer.from(buf);

    const result = await uploadBuffer(nodeBuf, {
      folder,
      originalname: url.split("/").pop(),
    });
    return result?.url || null;
  } catch (e) {
    console.warn("Failed to migrate URL:", url, e.message);
    return null;
  }
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to Mongo");

  const cursor = Property.find({}).cursor();

  let countProps = 0;
  let countImages = 0;
  let migrated = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    countProps++;
    const images = Array.isArray(doc.images) ? doc.images : [];
    if (!images.length) continue;

    const newImages = [];
    let changed = false;

    for (const url of images) {
      countImages++;
      if (isIbbUrl(url)) {
        const folder = `${
          process.env.CLOUDINARY_FOLDER || "itw/uploads"
        }/properties/${doc._id}`;
        const newUrl = await migrateOneUrl(url, folder);
        if (newUrl) {
          newImages.push(newUrl);
          migrated++;
          changed = true;
        } else {
          // keep old if failed
          newImages.push(url);
        }
      } else {
        newImages.push(url);
      }
    }

    if (changed) {
      doc.images = newImages;
      await doc.save({ validateBeforeSave: false });
      console.log(`Property ${doc._id} updated (${newImages.length} imgs)`);
    }
  }

  console.log(`Scanned properties: ${countProps}`);
  console.log(`Total images seen: ${countImages}`);
  console.log(`Migrated to Cloudinary: ${migrated}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
