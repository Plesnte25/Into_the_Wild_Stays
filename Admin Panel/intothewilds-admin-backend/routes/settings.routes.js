import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import upload from "../middleware/upload.js";
import * as S from "../controller/settings.controller.js";

const router = Router();

// Guard all settings routes
router.use(requireAuth, requireRole("admin"));

// System info
router.get("/system-info", S.getSystemInfo);

// Cloudinary
router.get("/cloudinary/stats", S.getcloudinaryStats);
router.get("/cloudinary/signature", S.getCloudinarySignature);

// Site settings
router.get("/site", S.getSiteSettings);
router.put("/site", S.updateSiteSettings);
router.post("/site/logo", upload.single("logo"), S.uploadSiteLogo);

// Business settings
router.get("/business", S.getBusinessSettings);
router.put("/business", S.updateBusinessSettings);

// Razorpay
// router.get("/razorpay", S.getRazorpaySettings); // returns masked secret
// router.put("/razorpay", S.updateRazorpaySettings); // stores full secret
// router.get("/razorpay/check", S.checkRazorpay); // optional live check

router.get("/razorpay/status", S.getRazorpayStatus);

// Admin users
router.get("/admin-users", S.listAdminUsers);
router.post("/admin-users", S.createAdminUser);
router.delete("/admin-users/:id", S.deleteAdminUser);

export default router;
