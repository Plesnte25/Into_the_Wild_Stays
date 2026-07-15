const express = require("express");
const router = express.Router();

const { contactController, getAllContacts } = require("../controller/contactController.js");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.post("/", contactController);
// Internal listing of submitted contact-form PII — admin only.
router.get("/", authenticateToken, authorizeRole("admin"), getAllContacts);

module.exports = router;
