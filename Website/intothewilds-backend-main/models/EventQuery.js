const mongoose = require("mongoose");

const eventQuerySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
});

const EventQuery = mongoose.model("EventQuery", eventQuerySchema);

module.exports = EventQuery;

