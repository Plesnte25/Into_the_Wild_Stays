import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { upload, uploaded } from "../controller/uploads.controller.js";

const r = Router();
r.use(requireAuth, requireRole("admin"));

r.post("/images", upload.array("files", 8), uploaded);

export default r;
