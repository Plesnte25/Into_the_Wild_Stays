import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  listAccounts,
  createAccount,
  listMappings,
  createMapping,
  updateMapping,
  deleteMapping,
  syncOneMapping,
} from "../controller/channel.controller.js";
import { previewMapping } from "../controller/channel.controller.js";

const r = Router();

// These routes expose OTA account credentials (hotelCode/accessToken) and
// trigger live syncs, so they must be admin-authenticated like every other
// admin route.
r.use(requireAuth, requireRole("admin"));

r.get("/accounts", listAccounts);
r.post("/accounts", createAccount);

//mock
r.get("/mappings/:id/preview", previewMapping);

r.get("/mappings", listMappings);
r.post("/mappings", createMapping);
r.patch("/mappings/:id", updateMapping);
r.delete("/mappings/:id", deleteMapping);

r.post("/mappings/:id/sync", syncOneMapping);

export default r;
