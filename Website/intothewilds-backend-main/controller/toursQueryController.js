const ToursQuery = require("../models/ToursQuery");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.createToursQuery = async (req, res) => {
    try {
        const { name, email, phone, message, date, tourName } = req.body;
        const toursQuery = new ToursQuery({ name, email, phone, message });
        await toursQuery.save();

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Tours Query',
        html: `<p>Thank you ${name} for reaching out!</p>
               <p>Your message: ${message}</p>
               ${date ? `<p>Date: ${date}</p>` : ''}
               ${tourName ? `<p>Tour Name: ${tourName}</p>` : ''}
               <p>We will get back to you shortly.</p>`,
    });
   await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Tours Query',
    html: `<p>New tours query received from ${name}</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>
           <p>Message: ${message}</p>
           ${date ? `<p>Date: ${date}</p>` : ''}
           ${tourName ? `<p>Tour Name: ${tourName}</p>` : ''}`,
   });
    res.status(200).json({ message: "Tours query saved successfully" });
} catch (error) {
    console.error("Error saving tours query", error);
    res.status(500).json({ message: "Error saving tours query" });
}
}

exports.getToursQuery = async (req, res) => {
    try {
        const toursQuery = await ToursQuery.find();
        res.status(200).json(toursQuery);
    } catch (error) {
        console.error("Error fetching tours query", error);
        res.status(500).json({ message: "Error fetching tours query" });
    }
}


