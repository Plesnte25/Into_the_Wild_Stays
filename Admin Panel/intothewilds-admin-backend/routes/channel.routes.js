import { Router } from "express";
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
