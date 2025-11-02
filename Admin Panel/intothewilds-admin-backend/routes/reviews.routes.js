import { Router } from "express";
import * as C from "../controller/reviews.controller.js";

// If you have auth middleware:
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

// Listing + stats
router.get("/", C.listReviews);
router.get("/stats", C.reviewsStats);

// Single review actions
router.patch("/:id", C.patchReview);
router.delete("/:id", C.deleteReview);

// Replies (optional)
router.get("/:id/replies", C.listReplies);
router.post("/:id/replies", C.createReply);
router.delete("/:id/replies/:replyId", C.deleteReply);

export default router;
