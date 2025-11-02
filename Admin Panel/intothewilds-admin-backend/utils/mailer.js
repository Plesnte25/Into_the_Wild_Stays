import nodemailer from "nodemailer";

let transporter = null;

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  transporter
    .verify()
    .then(() => console.log("SMTP ready"))
    .catch((err) => console.warn("SMTP not ready:", err.message));
}

export async function sendMail(to, subject, text, attachments = []) {
  if (!transporter) {
    console.log(
      `[MAIL STUB] To: ${to}\nSubject: ${subject}\n\n${text}\nAttachments: ${attachments
        .map((a) => a.filename)
        .join(", ")}`
    );
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ITW" <no-reply@intothewildstays.in>',
    to,
    subject,
    text,
    attachments,
  });
}
