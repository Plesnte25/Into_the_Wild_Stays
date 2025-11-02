import PDFDocument from "pdfkit";
import dayjs from "dayjs";

export function exportCSV({ summary, trends, from, to }) {
  const lines = [];
  lines.push(`Report From,${fmt(from)},To,${fmt(to)}`);
  lines.push("");
  lines.push("Metric,Value");
  lines.push(`Revenue,${summary.revenue.toFixed(2)}`);
  lines.push(`Avg Rate,${summary.avgRate.toFixed(2)}`);
  lines.push(`Bookings Total,${summary.bookings.total}`);
  lines.push(`Bookings Cancelled,${summary.bookings.cancelled}`);
  lines.push(`Payments Paid,${summary.payments.paid.toFixed(2)}`);
  lines.push("");
  lines.push("Date,Revenue,Bookings");
  for (const r of trends) {
    lines.push(`${fmt(r.date)},${r.revenue.toFixed(2)},${r.bookings}`);
  }
  return lines.join("\n");
}

export async function exportPDF({ summary, trends, from, to }) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(chunks)))
  );

  doc.fontSize(18).text("ITW — Dashboard Report");
  doc
    .fontSize(10)
    .fillColor("#555")
    .text(`Range: ${fmt(from)} - ${fmt(to)}`);
  doc.moveDown();

  doc.fillColor("#000").fontSize(12).text("Key Metrics");
  doc.fontSize(11);
  doc.text(`Revenue: ${summary.revenue.toFixed(2)}`);
  doc.text(`Avg Rate: ${summary.avgRate.toFixed(2)}`);
  doc.text(
    `Bookings: total ${summary.bookings.total}, cancelled ${summary.bookings.cancelled}`
  );
  doc.text(`Payments (captured): ${summary.payments.paid.toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(12).text("Trends (daily)");
  doc.moveDown(0.5);

  // simple table
  doc.fontSize(10).fillColor("#111");
  doc.text("Date", 40, doc.y, { continued: true });
  doc.text("Revenue", 200, doc.y, { continued: true });
  doc.text("Bookings", 320);
  doc.moveDown(0.3);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  for (const r of trends) {
    doc.text(fmt(r.date), 40, doc.y, { continued: true });
    doc.text(r.revenue.toFixed(2), 200, doc.y, { continued: true });
    doc.text(String(r.bookings), 320);
  }

  doc.end();
  return done;
}

function fmt(d) {
  return dayjs(d).format("YYYY-MM-DD");
}
