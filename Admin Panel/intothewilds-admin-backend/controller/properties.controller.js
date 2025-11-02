import Property from "../models/Property.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { deleteByPublicId } from "../services/cloudinary.service.js";

// ⚙️ Initialize Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const Properties = mongoose.connection.collection("properties");

// 🟢 Get all properties
export async function getOne(req, res, next) {
  try {
    const doc = await Property.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Property not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function list(req, res, next) {
  try {
    const { search } = req.query || {};
    const q = {};
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const cursor = Properties.find(q)
      .project({
        name: 1,
        location: 1,
        address: 1,
        price: 1,
        status: 1,
        occupancy: 1,
      })
      .limit(200);

    const rows = await cursor.toArray();

    // Normalize to UI expectation
    const items = rows.map((r) => ({
      _id: r._id,
      name: r.name || r.title || "Unnamed",
      location: r.location || r.address || "",
      price: typeof r.price === "number" ? r.price : r.rate || 0,
      occupancy: r.occupancy ?? r.capacity ?? 0,
      status: r.status || "active",
    }));

    res.json({ items, total: items.length });
  } catch (e) {
    next(e);
  }
}

// 🟢 Add new property
export const create = async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟠 Update property details
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Property.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔴 Delete property
export const remove = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟡 Upload images
export const uploadPropertyImage = async (req, res) => {
  try {
    const file = req.files.image; // Using express-fileupload or multer
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "intothewild/properties",
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟠 Toggle pause/resume property
export const togglePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    property.paused = !property.paused;
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Add seasonal pricing
export const addSeasonalPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, price } = req.body;
    const property = await Property.findById(id);
    property.seasonalPricing.push({ startDate, endDate, price });
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const doc = await Property.findByIdAndUpdate(id, { status }, { new: true });
  if (!doc) return res.status(404).json({ message: "Property not found" });
  res.json(doc);
};

export async function saveImages(req, res, next) {
  try {
    const { id } = req.params;
    const { images = [], imagesPublicIds = [] } = req.body || {};
    if (
      !Array.isArray(images) ||
      !Array.isArray(imagesPublicIds) ||
      images.length !== imagesPublicIds.length
    ) {
      return res.status(400).json({
        message: "images and imagesPublicIds must be same-length arrays",
      });
    }
    const doc = await Property.findByIdAndUpdate(
      id,
      { $set: { images, imagesPublicIds } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Property not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function deleteImage(req, res, next) {
  try {
    const { id } = req.params;
    const { publicId } = req.body || {};
    if (!publicId)
      return res.status(400).json({ message: "publicId required" });

    // remove from cloudinary (best-effort)
    await deleteByPublicId(publicId, "image");

    // pull from arrays
    const doc = await Property.findById(id);
    if (!doc) return res.status(404).json({ message: "Property not found" });

    const i = (doc.imagesPublicIds || []).indexOf(publicId);
    if (i >= 0) {
      doc.images.splice(i, 1);
      doc.imagesPublicIds.splice(i, 1);
      await doc.save();
    }
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function updateImages(req, res, next) {
  try {
    const { id } = req.params;
    const { images = [], imagesPublicIds = [] } = req.body || {};
    const doc = await Property.findByIdAndUpdate(
      id,
      { $set: { images, imagesPublicIds } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Property not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}
