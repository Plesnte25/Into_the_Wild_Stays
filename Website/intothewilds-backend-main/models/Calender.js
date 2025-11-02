const mongoose = require("mongoose");

const calenderSchema = new mongoose.Schema({
    icalLink: String,
    propertyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
    },
    bookings: [
        {
            id: String,
            start: Date,
            end: Date,
            summary: String,
        }
    ],
    lastRefreshed: {
        type: Date,
        default: Date.now,
    },
})

const Calender = mongoose.model("Calender", calenderSchema);