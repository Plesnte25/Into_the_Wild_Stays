const express = require("express");
const router = express.Router();
const { propertyListingQueryController, getAllPropertyListingQueries } = require("../controller/propertyListingQueryController.js");

router.post("/", propertyListingQueryController);
router.get("/", getAllPropertyListingQueries);

module.exports = router;