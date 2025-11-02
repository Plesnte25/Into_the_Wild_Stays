const ical = require("node-ical");
const axios = require("axios");
const moment = require("moment");
const Calender = require("../models/Calender");

// const AIRBNB_ICAL_URL = "https://www.airbnb.co.in/calendar/ical/53911149.ics?s=c093df7fe991459a67a6f6d7bd2372f5"

exports.refreshAirbnbBookings = async (req,res) => {
    try{
        const calendars = await Calender.find(); 
        const sixHours = 6 * 60 * 60 * 1000; 
        for (const calender of calendars) {
            if (Date.now() - calender.lastRefreshed > sixHours) {
                const response = await axios.get(calender.icalLink); 
                const data = ical.parseICS(response.data);
                let bookings = []; 
                for (let eventKey in data) {
                    const event = data[eventKey];
                    if (event.type === "VEVENT") {
                        bookings.push({
                            id: event.uid,
                            start: moment(event.start).format("YYYY-MM-DD"),
                            end: moment(event.end).format("YYYY-MM-DD"),
                            summary: event.summary || "Booked",
                        });
                    }
                }
                calender.bookings = bookings; 
                calender.lastRefreshed = Date.now(); 
                await calender.save(); 
            }
        }
        return res.status(200).json({ message: "Bookings updated successfully." }); 
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"});
    }
};

exports.addIcalLink = async (req,res) => {
    try{
        const {icalLink,propertyId} = req.body;
        if(!icalLink){
            return res.status(400).json({message:"iCal Link is required"});
        }
        const response = await axios.get(icalLink);
        const data = ical.parseICS(response.data);
        let bookings = [];
        for (let eventKey in data) {
            const event = data[eventKey];
            if (event.type === "VEVENT") {
                bookings.push({
                    id: event.uid,
                    start: moment(event.start).format("YYYY-MM-DD"),
                    end: moment(event.end).format("YYYY-MM-DD"),
                    summary: event.summary || "Booked",
                });
            }
        }
        const newCalender = new Calender({
            icalLink,
            propertyId,
            bookings,
            lastRefreshed: Date.now(),
        });
        await newCalender.save();
        return res.status(201).json(newCalender);
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"});
    }
}

exports.getAllCalendars = async (req,res) => {
    try{
        const calendars = await Calender.find();
        return res.status(200).json(calendars);
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"});
    }
}
