const mongoose = require("mongoose");

const toursQuerySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
  tourName: String,
});

const ToursQuery = mongoose.model("ToursQuery", toursQuerySchema);

module.exports = ToursQuery;

