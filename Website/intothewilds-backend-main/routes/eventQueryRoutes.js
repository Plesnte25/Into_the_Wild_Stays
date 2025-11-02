const express = require("express");
const router = express.Router();
const { createEventQuery, getEventQueries } = require("../controller/eventQueryController.js");

router.post("/", createEventQuery);
router.get("/", getEventQueries);

module.exports = router;

