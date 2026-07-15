const express = require("express");
const router = express.Router();
const { createToursQuery, getToursQuery } = require("../controller/toursQueryController.js");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.post("/", createToursQuery);
// Internal listing of submitted tour-query PII — admin only.
router.get("/", authenticateToken, authorizeRole("admin"), getToursQuery);

module.exports = router;
