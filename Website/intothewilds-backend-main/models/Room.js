const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({

    type: { type: String, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    availability: { type: Boolean, default: true }
});
module.exports = mongoose.model('Room', roomSchema);