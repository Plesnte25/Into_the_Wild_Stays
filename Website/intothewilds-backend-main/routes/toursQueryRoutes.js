const express = require("express");
const router = express.Router();
const { createToursQuery, getToursQuery } = require("../controller/toursQueryController.js");

router.post("/", createToursQuery);
router.get("/", getToursQuery);

module.exports = router;

