const express = require("express");
const router = express.Router();

const { contactController, getAllContacts } = require("../controller/contactController.js");


router.post("/", contactController);
router.get("/", getAllContacts);

module.exports = router;

