import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import * as C from "../controller/properties.controller.js";
import Property from "../models/Property.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/options", async (req, res) => {
  try {
    const items = await Property.find({}, { name: 1 }).sort({ name: 1 }).lean();
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load properties" });
  }
});

router.get("/", C.list);
router.get("/:id", C.getOne);
router.post("/", C.create);
router.put("/:id", C.update);
router.delete("/:id", C.remove);

// images maintenance
router.put("/:id/images", C.updateImages);
router.delete("/:id/images", C.deleteImage);

export default router;
