import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import * as C from "../controller/dashboard.controller.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/summary", C.getSummary);
router.get("/trends", C.getTrends);
router.get("/top", C.getTop);
router.get("/heatmap", C.getHeatmap);
router.get("/export", C.getExport);

export default router;
