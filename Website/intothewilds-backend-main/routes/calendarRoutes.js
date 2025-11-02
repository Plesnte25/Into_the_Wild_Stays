const express = require('express');
const router = express.Router();
const airbnbController = require('../controller/calendarController.js');

router.post("/bookings", airbnbController.refreshAirbnbBookings);
router.post("/addIcalLink", airbnbController.addIcalLink);
router.get('/all', airbnbController.getAllCalendars);
module.exports = router;