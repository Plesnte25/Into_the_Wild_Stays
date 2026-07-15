const express = require("express");
const router = express.Router();
const { createEventQuery, getEventQueries } = require("../controller/eventQueryController.js");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.post("/", createEventQuery);
// Internal listing of submitted event-query PII — admin only.
router.get("/", authenticateToken, authorizeRole("admin"), getEventQueries);

module.exports = router;
