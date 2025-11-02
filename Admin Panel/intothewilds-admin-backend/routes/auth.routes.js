// auth.routes.js (ESM)
import { Router } from "express";
import * as Auth from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Session
router.post("/login", Auth.login);
router.get("/me", requireAuth, Auth.me);
router.post("/refresh", Auth.refresh);
router.post("/logout", Auth.logout);

// Forgot / reset via 2FA (email + SMS OTP)
router.post("/send-email-otp", Auth.sendEmailOtp);
router.post("/send-sms-otp", Auth.sendSmsOtp);
router.post("/verify-email-otp", Auth.verifyEmailOtp);
router.post("/verify-sms-otp", Auth.verifySmsOtp);
router.post("/reset-password", Auth.resetPassword);

// Optional: classic forgot-password via email link (not used by your UI but handy)
router.post("/forgot-password", Auth.forgotPassword);
router.post("/reset-password-token", Auth.resetPasswordWithToken);

export default router;
