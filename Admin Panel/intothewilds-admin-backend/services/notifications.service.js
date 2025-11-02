// server/services/notifications.service.js
import { sendMail } from "../utils/mailer.js";

export async function sendBookingEmails(booking) {
  const toGuest = booking.guest?.email;
  const admin = process.env.NOTIFY_ADMIN || "";
  const bn = process.env.BUSINESS_NAME || "Into The Wild Stays";

  const subject = `Booking Confirmed: ${booking.code}`;
  const text = [
    `Hello ${booking.guest?.name || ""},`,
    `Your booking ${booking.code} is confirmed.`,
    `Check-in: ${fmt(booking.stay?.checkIn)}  Check-out: ${fmt(
      booking.stay?.checkOut
    )}`,
    `Amount: ${booking.price?.netReceivable} ${
      booking.price?.currency || "INR"
    }`,
    `Thank you for choosing ${bn}.`,
  ].join("\n");

  if (toGuest) await sendMail(toGuest, subject, text);
  if (admin) await sendMail(admin, `[ADMIN] ${subject}`, text);
}

function fmt(d) {
  try {
    return new Date(d).toDateString();
  } catch {
    return "";
  }
}
