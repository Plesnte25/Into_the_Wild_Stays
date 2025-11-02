import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import * as C from "../controller/payments.controller.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.post("/order", C.createOrderForBooking);
router.post("/verify", C.verifyCapture);
router.post("/refund", C.issueRefund);

router.get("/", C.listPayments);
router.get("/summary", C.getSummary);
router.get("/key", C.getPublicKey);

export default router;
