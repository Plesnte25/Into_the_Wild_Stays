// server/routes/public.routes.js
import { Router } from "express";
import * as C from "../controller/public.controller.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

// Light public IP rate-limits
router.get(
  "/availability",
  rateLimit({ key: "avail", limit: 60, windowSec: 60 }),
  C.checkAvailability
);
router.post(
  "/quote",
  rateLimit({ key: "quote", limit: 30, windowSec: 60 }),
  C.createQuote
);
router.post(
  "/checkout",
  rateLimit({ key: "checkout", limit: 15, windowSec: 60 }),
  C.checkout
);
router.post(
  "/confirm",
  rateLimit({ key: "confirm", limit: 30, windowSec: 60 }),
  C.confirmPayment
);

router.get("/booking/:code", C.getPublicBooking);
router.post(
  "/cancel-request",
  rateLimit({ key: "cancelreq", limit: 5, windowSec: 300 }),
  C.submitCancelRequest
);

export default router;
