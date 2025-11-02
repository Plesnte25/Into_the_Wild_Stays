import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import * as C from "../controller/bookings.controller.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

// List + query
router.get("/", C.listBookings);

// Single booking
router.get("/:id", C.getBooking);

// Status change (with server-side validation)
router.patch("/:id/status", C.updateStatus);

// Invoice preview (HTML) + PDF + email
router.get("/:id/invoice.html", C.getInvoiceHtml);
router.get("/:id/invoice.pdf", C.getInvoicePdf);
router.post("/:id/send-invoice", C.sendInvoice);

router.post("/seed-upcoming", C.seedUpcoming);
router.post("/backfill", C.backfillBookings);
router.post("/summary", C.summaryMetrics);

export default router;
