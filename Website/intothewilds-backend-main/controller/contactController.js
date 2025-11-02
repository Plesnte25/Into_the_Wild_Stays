const Contact = require("../models/Contact.js");
const nodemailer = require('nodemailer');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Change if using another provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.contactController = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const contact = new Contact({ name, email, phone, message });
        await contact.save();
        console.log("data saved successfully");

        // Send confirmation email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Contact Form Submission',
            html: `<p>Thank you ${name} for reaching out!</p>
           <p>Your message: ${message}</p>
           <p>We will get back to you shortly.</p>`,
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "New Contact Form Submission",
            html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>
           <p>Message: ${message}</p>`,
        });

        res.status(200).json({ message: "Contact saved successfully" });
    } catch (error) {
        console.error("Error saving contact", error);
        res.status(500).json({ message: "Error saving contact" });
    }
};

exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json(contacts);
    } catch (error) {
        console.error("Error fetching contacts", error);
        res.status(500).json({ message: "Error fetching contacts" });
    }
};