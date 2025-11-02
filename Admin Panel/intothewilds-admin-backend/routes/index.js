import { Router } from "express";
import auth from "./auth.routes.js";
import properties from "./properties.routes.js";
import bookings from "./bookings.routes.js";
import reviews from "./reviews.routes.js";
import payments from "./payments.routes.js";
import uploads from "./uploads.routes.js";
import dashboard from "./dashboard.routes.js";

const r = Router();
r.get("/", (_req, res) => res.json({ ok: true, ping: "itw-admin-api" }));

r.use("/auth", auth);
r.use("/properties", properties);
r.use("/bookings", bookings);
r.use("/reviews", reviews);
r.use("/payments", payments);
r.use("/uploads", uploads);
r.use("/dashboard", dashboard);

export default r;
