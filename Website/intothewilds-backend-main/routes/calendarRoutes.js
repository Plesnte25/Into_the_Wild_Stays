// TODO(unfinished): This router is NOT mounted in server.js — the Airbnb
// iCal sync feature is unreachable over HTTP. To finish it: (1) decide on
// auth for these endpoints (they currently have none — addIcalLink/bookings
// should almost certainly be admin-only once mounted), (2) mount it in
// server.js, e.g. `app.use("/api/v1/calendar", calendarRoutes)`. See
// KNOWN_ISSUES.md for more.
const express = require('express');
const router = express.Router();
const airbnbController = require('../controller/calendarController.js');

router.post("/bookings", airbnbController.refreshAirbnbBookings);
router.post("/addIcalLink", airbnbController.addIcalLink);
router.get('/all', airbnbController.getAllCalendars);
module.exports = router;