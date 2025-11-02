// server/services/invoice.service.js
import PDFDocument from "pdfkit";
import dayjs from "dayjs";

const BN = () => process.env.BUSINESS_NAME || "Into The Wild Stays";
const B1 = () => process.env.BUSINESS_ADDRESS_LINE1 || "";
const B2 = () => process.env.BUSINESS_ADDRESS_LINE2 || "";
const GST = () => process.env.BUSINESS_GSTIN || "";

export function renderInvoiceHtml(b) {
  const d = dayjs(b.invoiceDate || b.createdAt).format("DD MMM YYYY");
  const c = b.price?.currency || "INR";

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Invoice ${b.invoiceNumber || ""}</title>
<style>
 body{font-family: system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:24px;color:#111}
 h1{font-size:20px;margin:0}
 .muted{color:#555}
 table{border-collapse:collapse;width:100%;margin-top:16px}
 th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}
 .right{text-align:right}
 .totals td{font-weight:600}
</style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <h1>${BN()}</h1>
      <div class="muted">${B1()}${B2() ? "<br/>" + B2() : ""}${
    GST() ? "<br/>GSTIN: " + GST() : ""
  }</div>
    </div>
    <div class="right">
      <div><strong>Invoice</strong> ${b.invoiceNumber || ""}</div>
      <div>Date: ${d}</div>
    </div>
  </div>

  <div style="margin-top:16px">
    <strong>Bill To:</strong><br/>
    ${b.guest?.name || ""}<br/>
    ${b.guest?.email || ""}${b.guest?.phone ? "<br/>" + b.guest.phone : ""}
  </div>

  <table>
    <thead>
      <tr><th>Description</th><th class="right">Amount (${c})</th></tr>
    </thead>
    <tbody>
      <tr><td>Room charges (gross)</td><td class="right">${fmt(
        b.price.grossAmount
      )}</td></tr>
      ${
        b.price.discountAmount
          ? `<tr><td>Discount</td><td class="right">- ${fmt(
              b.price.discountAmount
            )}</td></tr>`
          : ""
      }
      <tr><td>Tax</td><td class="right">${fmt(b.price.taxAmount)}</td></tr>
      ${
        b.price.platformFee
          ? `<tr><td>Platform fee</td><td class="right">- ${fmt(
              b.price.platformFee
            )}</td></tr>`
          : ""
      }
      ${
        b.price.channelFee
          ? `<tr><td>Channel fee</td><td class="right">- ${fmt(
              b.price.channelFee
            )}</td></tr>`
          : ""
      }
      <tr class="totals"><td>Net receivable</td><td class="right">${fmt(
        b.price.netReceivable
      )}</td></tr>
    </tbody>
  </table>

  <div style="margin-top:16px" class="muted">
    Stay: ${dayjs(b.stay?.checkIn).format("DD MMM")} → ${dayjs(
    b.stay?.checkOut
  ).format("DD MMM YYYY")}
    ${b.stay?.propertyName ? `<br/>Property: ${b.stay.propertyName}` : ""}
  </div>
</body>
</html>
`;
}

export async function generateInvoicePdfBuffer(b) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(chunks)))
  );

  // Header
  doc.fontSize(18).text(BN(), { continued: false });
  if (B1()) doc.fontSize(10).fillColor("#444").text(B1());
  if (B2()) doc.text(B2());
  if (GST()) doc.text(`GSTIN: ${GST()}`);
  doc.moveDown();

  const inv = `Invoice ${b.invoiceNumber || ""}`;
  const d = dayjs(b.invoiceDate || b.createdAt).format("DD MMM YYYY");
  doc.fontSize(12).fillColor("#000").text(inv, { align: "right" });
  doc.text(`Date: ${d}`, { align: "right" });
  doc.moveDown(0.5);

  // Bill to
  doc.fontSize(12).text("Bill To:");
  doc.text(b.guest?.name || "");
  if (b.guest?.email) doc.text(b.guest.email);
  if (b.guest?.phone) doc.text(b.guest.phone);
  doc.moveDown();

  // Table-like lines
  const c = b.price?.currency || "INR";
  const line = (label, amount) => {
    doc.fontSize(11).text(label, 40, doc.y, { continued: true });
    doc.text(`${fmt(amount)} ${c}`, { align: "right" });
  };

  line("Room charges (gross)", b.price.grossAmount);
  if (b.price.discountAmount)
    line("Discount", -Math.abs(b.price.discountAmount));
  line("Tax", b.price.taxAmount);
  if (b.price.platformFee) line("Platform fee", -Math.abs(b.price.platformFee));
  if (b.price.channelFee) line("Channel fee", -Math.abs(b.price.channelFee));

  doc
    .moveTo(40, doc.y + 4)
    .lineTo(555, doc.y + 4)
    .stroke();
  doc.moveDown(0.5);
  doc.fontSize(12).text("Net receivable", 40, doc.y, { continued: true });
  doc.text(`${fmt(b.price.netReceivable)} ${c}`, { align: "right" });
  doc.moveDown();

  // Stay info
  const stay = `Stay: ${dayjs(b.stay?.checkIn).format("DD MMM")} → ${dayjs(
    b.stay?.checkOut
  ).format("DD MMM YYYY")}`;
  doc.fontSize(10).fillColor("#444").text(stay);
  if (b.stay?.propertyName) doc.text(`Property: ${b.stay.propertyName}`);

  doc.end();
  return done;
}

function fmt(n) {
  const v = Number(n || 0);
  return v.toFixed(2);
}
