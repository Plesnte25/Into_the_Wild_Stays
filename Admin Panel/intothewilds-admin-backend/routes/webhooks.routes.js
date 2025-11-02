import { Router } from "express";
import { razorpayWebhook } from "../controller/webhooks.controller.js";
const router = Router();
router.post("/razorpay", razorpayWebhook);
export default router;
