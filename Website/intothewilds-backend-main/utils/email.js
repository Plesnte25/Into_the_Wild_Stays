const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.SENDER_EMAIL, pass: process.env.SENDER_PASS },
});

exports.sendBookingEmail = async (booking) => {
  const html = `
    <h2>Booking Confirmed – Into The Wilds</h2>
    <p>Hi ${booking.customer.fullName},</p>
    <p>Your booking is confirmed.</p>
    <ul>
      <li>Check-in: ${new Date(booking.checkIn).toDateString()}</li>
      <li>Check-out: ${new Date(booking.checkOut).toDateString()}</li>
      <li>Rooms: ${booking.rooms} • Nights: ${booking.nights}</li>
      <li>Paid Now: ₹${booking.pricing.payNow}</li>
    </ul>
    <p>We look forward to hosting you!</p>
  `;
  await transporter.sendMail({
    to: booking.customer.email,
    from: `"Into The Wilds" <${process.env.SENDER_EMAIL}>`,
    subject: "Your booking is confirmed",
    html,
  });
};
