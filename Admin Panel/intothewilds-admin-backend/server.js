import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import propertiesRoutes from "./routes/properties.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import webhooksRoutes from "./routes/webhooks.routes.js";
import publicRoutes from "./routes/public.routes.js";

import channelRoutes from "./routes/channel.routes.js";
import "./jobs/syncQueue.js";
import { notFound, errorHandler } from "./middleware/error.js";

dotenv.config();
import { initCloudinary } from "./services/cloudinary.service.js";
initCloudinary();
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev
    ].filter(Boolean),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(
  "/api/webhooks/razorpay",
  express.raw({ type: "*/*" }),
  (req, _res, next) => {
    req.rawBodyString = req.body.toString("utf8");
    try {
      req.body = JSON.parse(req.rawBodyString);
    } catch {}
    next();
  }
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/", (req, res) => {
  res.json({ message: "IntoTheWilds Admin API Running..." });
});
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/webhooks", webhooksRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/channels", channelRoutes);

// --- ERROR HANDLING ---
app.use(notFound);
app.use(errorHandler);

// --- DATABASE CONNECTION ---
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
app.set("mongoose", mongoose);
