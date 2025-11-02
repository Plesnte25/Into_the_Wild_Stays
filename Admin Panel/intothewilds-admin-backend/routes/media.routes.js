import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import upload from "../middleware/upload.js";
import * as C from "../controller/media.controller.js";

const router = Router();

// All media endpoints are admin-protected
router.use(requireAuth, requireRole("admin"));

// Generic asset upload (multipart 'file')
router.post("/upload", upload.single("file"), C.uploadAsset);

// Delete by publicId (URL-encoded)
router.delete("/:publicId", C.deleteAsset);

// Optional: return signed parameters for client-side direct uploads
router.get("/signature", C.getSignedParams);

export default router;
