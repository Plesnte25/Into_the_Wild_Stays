const express = require("express");
const dotenv = require("dotenv");
const connectToMongo = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoute");
const bookingRoutes = require("./routes/bookingRoute");
const userRoutes = require("./routes/userRoutes");
const propertiesRoutes = require("./routes/propertiesRoutes");
const contactRoutes = require("./routes/contactRoutes");
const propertyListingQueryRoutes = require("./routes/propertyListingQueryRoutes");
const toursQueryRoutes = require("./routes/toursQueryRoutes");
const eventQueryRoutes = require("./routes/eventQueryRoutes");
const reviewsRoutes = require("./routes/reviewRoutes");
const rateLimiter = require("express-rate-limit");
const checkoutRoutes = require("./routes/checkoutRoutes");

dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  })
);

const ALLOWED = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsMw = cors({
  origin(origin, cb) {
    if (!origin || ALLOWED.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Disposition"],
});

app.options("*", corsMw);
app.use(corsMw);
app.use(morgan("dev"));
connectToMongo();

//middlewares
app.use(express.json({ limit: "1mb" }));

//routes
app.get("/", (req, res) => {
  res.send("ITW Backend is running!");
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/checkout", checkoutRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/properties", propertiesRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/propertyListingQuery", propertyListingQueryRoutes);
app.use("/api/v1/toursQuery", toursQueryRoutes);
app.use("/api/v1/eventQuery", eventQueryRoutes);
app.use("/api/v1/reviews", reviewsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
