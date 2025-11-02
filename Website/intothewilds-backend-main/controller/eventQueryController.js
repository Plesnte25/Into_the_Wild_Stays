const EventQuery = require("../models/EventQuery.js");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.createEventQuery = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const eventQuery = new EventQuery({ name, email, phone, message });
        await eventQuery.save();
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Event Query Received",
            html: `<p>Thank you for your interest in our event. We will get back to you soon.</p>`,
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "New Event Query",
            html: `<p>Name: ${name}</p>
               <p>Email: ${email}</p>
               <p>Phone: ${phone}</p>
               <p>Message: ${message}</p>`,
        });
        res.status(200).json({ message: "Event query saved successfully" });
    }
    catch (error) {
        console.error("Error saving event query", error);
        res.status(500).json({ message: "Error saving event query" });
    }
}

exports.getEventQueries = async (req, res) => {
    try{
        const eventQueries = await EventQuery.find();
        res.status(200).json(eventQueries);
    }
    catch(error){
        console.error("Error fetching event queries", error);
        res.status(500).json({ message: "Error fetching event queries" });
    }
}