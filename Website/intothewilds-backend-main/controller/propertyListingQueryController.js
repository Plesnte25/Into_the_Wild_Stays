const PropertyListingQuery = require("../models/PropertyListingQuery.js");
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

exports.propertyListingQueryController = async (req, res) => {
    try{
  const { name, email, phone, message } = req.body;
  const propertyListingQuery = new PropertyListingQuery({ name, email, phone, propertyDetails:message });
  await propertyListingQuery.save();
  // console.log(propertyListingQuery);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Property Listing Query",
    html: `<p>Thank you ${name} for your interest in our property listing!</p>
           <p>We will get back to you shortly.</p>`,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "New Property Listing Query",
    html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>
           <p>Property Details: ${message}</p>`,
  });
  res.status(200).json({ message: "Property listing query saved successfully" });
}
catch(error){
    // console.error("Error saving property listing query", error);
    res.status(500).json({ message: "Error saving property listing query" });
}
};

exports.getAllPropertyListingQueries = async (req, res) => {
    try {
        const propertyListingQueries = await PropertyListingQuery.find();
        res.status(200).json(propertyListingQueries);
    } catch (error) {
        console.error("Error fetching property listing queries", error);
        res.status(500).json({ message: "Error fetching property listing queries" });
    }
};

