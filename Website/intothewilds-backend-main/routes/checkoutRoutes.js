const { Router } = require("express");
const { getCheckoutSummary } = require("../controller/checkoutController");
const r = Router();
r.get("/summary", getCheckoutSummary);
module.exports = r;
