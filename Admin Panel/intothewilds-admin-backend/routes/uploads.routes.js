import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { upload, uploaded } from "../controller/uploads.controller.js";

const r = Router();
r.use(requireAuth);

r.post("/images", upload.array("files", 8), uploaded);

export default r;
