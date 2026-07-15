const express = require("express");
const router = express.Router();
const { propertyListingQueryController, getAllPropertyListingQueries } = require("../controller/propertyListingQueryController.js");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.post("/", propertyListingQueryController);
// Internal listing of submitted property-listing-query PII — admin only.
router.get("/", authenticateToken, authorizeRole("admin"), getAllPropertyListingQueries);

module.exports = router;
