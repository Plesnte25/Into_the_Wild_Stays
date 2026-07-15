import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import * as C from "../controller/properties.controller.js";
import Property from "../models/Property.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/options", async (req, res) => {
  try {
    const items = await Property.find({}, { name: 1 }).sort({ name: 1 }).lean();
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load properties" });
  }
});

router.get("/", C.list);
router.get("/:id", C.getOne);
router.post("/", C.create);
router.put("/:id", C.update);
router.delete("/:id", C.remove);

// images maintenance
router.put("/:id/images", C.updateImages);
router.post("/:id/images", C.saveImages); // same-length-array validated variant
router.delete("/:id/images", C.deleteImage);

// status / pricing maintenance
router.patch("/:id/toggle-status", C.togglePropertyStatus);
router.post("/:id/seasonal-pricing", C.addSeasonalPricing);

// NOTE: C.uploadPropertyImage is intentionally NOT wired here. It expects
// `req.files.image` with a `tempFilePath` (the express-fileupload contract),
// but this app's multipart uploads go through multer (see middleware/upload.js
// and services/cloudinary.service.js#uploadBuffer / #uploadLogoBuffer) —
// mixing express-fileupload into the same app would conflict with the
// existing multer body-parsing on other routes. Property image uploads
// should go through the existing multer + Cloudinary buffer-upload flow
// (mirroring routes/media.routes.js or routes/settings.routes.js's
// "/site/logo" upload) instead of wiring this function as-is.

export default router;
