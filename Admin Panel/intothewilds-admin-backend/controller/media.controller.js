import {
  uploadBuffer,
  deleteByPublicId,
  buildSignedParams,
} from "../services/cloudinary.service.js";
import MediaAsset from "../models/MediaAsset.js";

export async function uploadAsset(req, res, next) {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ message: "No file uploaded (field 'file')." });
    const { buffer, originalname, mimetype } = req.file;

    const result = await uploadBuffer(buffer, {
      originalname,
      mimetype,
      folder: process.env.CLOUDINARY_FOLDER || "itw/uploads",
    });

    // Save lightweight registry record (handy for audits/deletes later)
    const doc = await MediaAsset.create({
      publicId: result.publicId,
      url: result.url,
      bytes: result.bytes || 0,
      width: result.width || null,
      height: result.height || null,
      format: result.format || null,
      uploadedBy: req.user?.id || null,
      tags: ["admin-upload"],
    });

    res.status(201).json({ asset: doc });
  } catch (e) {
    next(e);
  }
}

export async function deleteAsset(req, res, next) {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    if (!publicId)
      return res.status(400).json({ message: "publicId required" });

    await deleteByPublicId(publicId);
    await MediaAsset.deleteOne({ publicId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function getSignedParams(_req, res, next) {
  try {
    const signed = buildSignedParams({
      folder: process.env.CLOUDINARY_FOLDER || "itw/uploads",
    });
    res.json(signed);
  } catch (e) {
    next(e);
  }
}
