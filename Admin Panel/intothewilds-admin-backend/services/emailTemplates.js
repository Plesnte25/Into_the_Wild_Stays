import { sendMail } from "../utils/mailer.js";

export function invoiceEmailBody(b) {
  const bn = process.env.BUSINESS_NAME || "Into The Wild Stays";
  const num = b.invoiceNumber || "";
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#111">
    <p>Hi ${b.guest?.name || ""},</p>
    <p>Thank you for staying with ${bn}. Please find attached your invoice ${num}.</p>
    <p>We hope to host you again soon!</p>
    <p>— ${bn}</p>
  </div>`;
}

export async function sendMailWrapped(to, subject, html, attachments = []) {
  // our mailer only supports text in previous step; add minimal HTML handling
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // try to send with attachments if transporter exists; otherwise fall back to console
  try {
    await sendMail(to, subject, text, attachments);
  } catch (e) {
    console.log("[MAIL STUB with attachment]", {
      to,
      subject,
      preview: text.slice(0, 120) + "...",
    });
  }
}
