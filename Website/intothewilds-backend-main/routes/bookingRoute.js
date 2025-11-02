// routes/bookingRoute.js
const express = require("express");
const router = express.Router();
const { newBooking } = require("../controller/bookingController");

router.post("/new-booking", newBooking);

module.exports = router;
