const mongoose = require("mongoose");

const propertyListingQuerySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  propertyDetails: String,
});

const PropertyListingQuery = mongoose.model("PropertyListingQuery", propertyListingQuerySchema);

module.exports = PropertyListingQuery;

