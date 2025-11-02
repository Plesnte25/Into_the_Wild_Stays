import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "itw-admin",
    public_id: `${Date.now()}-${file.originalname}`.replace(/\s+/g, "-"),
    resource_type: "image",
  }),
});

export const upload = multer({ storage });

export const uploaded = (req, res) => {
  const files = (req.files || []).map((f) => f.path);
  res.json({ ok: true, files });
};
