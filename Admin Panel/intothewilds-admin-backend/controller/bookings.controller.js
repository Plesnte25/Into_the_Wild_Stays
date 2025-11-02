import Booking from "../models/Booking.js";
import InvoiceCounter from "../models/InvoiceCounter.js";
import {
  computeFinancials,
  sortToMongo,
  validateTransition,
} from "../services/bookingMath.service.js";
import {
  renderInvoiceHtml,
  generateInvoicePdfBuffer,
} from "../services/invoice.service.js";
import {
  invoiceEmailBody,
  sendMailWrapped,
} from "../services/emailTemplates.js";

// ---------- List with query ----------
export async function listBookings(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sort = "createdAt_desc",
      from,
      to,
    } = req.query;

    const q = {};
    if (status) q.status = { $in: String(status).split(",") };
    if (search) {
      const s = String(search).trim();
      q.$or = [
        { code: { $regex: s, $options: "i" } },
        { invoiceNumber: { $regex: s, $options: "i" } },
        { "guest.name": { $regex: s, $options: "i" } },
        { "guest.email": { $regex: s, $options: "i" } },
        { "guest.phone": { $regex: s, $options: "i" } },
        { "stay.propertyName": { $regex: s, $options: "i" } },
        { propertyName: { $regex: s, $options: "i" } },
      ];
    }

    if (from || to) {
      const fromDate = from ? new Date(from) : new Date("1970-01-01");
      const toDate = to ? new Date(to) : new Date("2999-12-31");
      q.$or = (q.$or || []).concat([
        {
          $and: [
            { "stay.checkIn": { $lte: toDate } },
            { "stay.checkOut": { $gte: fromDate } },
          ],
        },
        {
          $and: [
            { checkInDate: { $lte: toDate } },
            { checkOutDate: { $gte: fromDate } },
          ],
        },
      ]);
    }

    const sortMap = {
      createdAt_asc: { createdAt: 1 },
      createdAt_desc: { createdAt: -1 },
      amount_asc: { "price.netReceivable": 1, amount: 1 },
      amount_desc: { "price.netReceivable": -1, amount: -1 },
      "stay.checkIn_asc": { "stay.checkIn": 1, checkInDate: 1 },
      "stay.checkIn_desc": { "stay.checkIn": -1, checkInDate: -1 },
      checkInDate_asc: { checkInDate: 1, "stay.checkIn": 1 },
      checkInDate_desc: { checkInDate: -1, "stay.checkIn": -1 },
    };
    const sortSpec = sortMap[sort] || sortMap.createdAt_desc;

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(200, parseInt(limit)));

    const [items, total] = await Promise.all([
      Booking.find(q)
        .sort(sortSpec)
        .skip((p - 1) * l)
        .limit(l),
      Booking.countDocuments(q),
    ]);

    res.json({ items, page: p, limit: l, total, pages: Math.ceil(total / l) });
  } catch (e) {
    next(e);
  }
}

// ---------- Get one ----------
export async function getBooking(req, res, next) {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: "Booking not found" });
    res.json(b);
  } catch (e) {
    next(e);
  }
}

// ---------- Update status ----------
export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: "Booking not found" });

    const ok = validateTransition(b.status, status);
    if (!ok)
      return res
        .status(400)
        .json({ message: `Invalid transition ${b.status} → ${status}` });

    b.status = status;

    // If moving to checked_out and not invoiced, issue invoice number/date
    if (status === "checked_out" && !b.invoiceNumber) {
      const seq = await InvoiceCounter.next();
      const year = new Date().getFullYear();
      const prefix = process.env.INVOICE_PREFIX || "ITW";
      b.invoiceNumber = `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
      b.invoiceDate = new Date();
    }

    await b.save();
    res.json(b);
  } catch (e) {
    next(e);
  }
}

// ---------- Invoice HTML ----------
export async function getInvoiceHtml(req, res, next) {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).send("Not found");

    // ensure financials are consistent
    const updated = computeFinancials(b);
    if (updated) {
      await b.save();
    }

    const html = renderInvoiceHtml(b);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    next(e);
  }
}

// ---------- Invoice PDF ----------
export async function getInvoicePdf(req, res, next) {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).send("Not found");

    const updated = computeFinancials(b);
    if (updated) {
      await b.save();
    }

    const buf = await generateInvoicePdfBuffer(b);
    const filename = (b.invoiceNumber || `invoice-${b.id}`) + ".pdf";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buf);
  } catch (e) {
    next(e);
  }
}

// ---------- Send invoice via email ----------
export async function sendInvoice(req, res, next) {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: "Not found" });
    if (!b.guest?.email)
      return res.status(400).json({ message: "Booking has no guest email" });

    const updated = computeFinancials(b);
    if (updated) {
      await b.save();
    }

    const pdf = await generateInvoicePdfBuffer(b);
    const subject = `Invoice ${b.invoiceNumber || ""} - ${
      process.env.BUSINESS_NAME || "Into The Wild Stays"
    }`;
    const html = invoiceEmailBody(b);

    await sendMailWrapped(b.guest.email, subject, html, [
      {
        filename: (b.invoiceNumber || `invoice-${b.id}`) + ".pdf",
        content: pdf,
        contentType: "application/pdf",
      },
    ]);

    res.json({ sent: true });
  } catch (e) {
    next(e);
  }
}

// Seed two bookings in the next few days (TEST purpose)
export async function seedUpcoming(req, res, next) {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      req.headers["x-allow-seed"] !== "true"
    ) {
      return res
        .status(403)
        .json({ error: "Seeding not allowed in production" });
    }
    const now = new Date();

    const mk = (offsetDays, nights, propertyName, guestName, amount) => {
      const ci = new Date(now);
      ci.setDate(ci.getDate() + offsetDays);
      ci.setHours(14, 0, 0, 0);
      const co = new Date(ci);
      co.setDate(co.getDate() + nights);
      co.setHours(11, 0, 0, 0);
      return {
        status: "confirmed",
        channel: "website",
        guest: {
          name: guestName,
          email: `${guestName.replace(/\s+/g, "").toLowerCase()}@example.com`,
          phone: "9999999999",
        },
        // legacy
        propertyName,
        checkInDate: ci,
        checkOutDate: co,
        amount,
        // stay.*
        stay: { propertyName, checkIn: ci, checkOut: co, nights },
        createdAt: new Date(),
      };
    };

    const docs = await Booking.insertMany([
      mk(1, 2, "Tapovan Cottage", "Seed Guest 1", 4060),
      mk(3, 1, "MenNam Homestay", "Seed Guest 2", 3060),
    ]);

    res.json({ inserted: docs.length, ids: docs.map((d) => d._id) });
  } catch (e) {
    next(e);
  }
}

export async function backfillBookings(req, res, next) {
  try {
    // Stage 1: coalesce fields
    const r1 = await Booking.updateMany(
      {},
      [
        {
          $set: {
            "stay.checkIn": { $ifNull: ["$stay.checkIn", "$checkInDate"] },
            "stay.checkOut": { $ifNull: ["$stay.checkOut", "$checkOutDate"] },
            "stay.propertyName": {
              $ifNull: ["$stay.propertyName", "$propertyName"],
            },
            amount: {
              $ifNull: ["$amount", { $ifNull: ["$price.netReceivable", 0] }],
            },
          },
        },
      ],
      { strict: false, runValidators: false }
    );

    // Stage 2: compute nights if possible
    const r2 = await Booking.updateMany(
      {},
      [
        {
          $set: {
            "stay.nights": {
              $cond: [
                { $and: ["$stay.checkIn", "$stay.checkOut"] },
                {
                  $dateDiff: {
                    startDate: "$stay.checkIn",
                    endDate: "$stay.checkOut",
                    unit: "day",
                  },
                },
                "$stay.nights",
              ],
            },
          },
        },
      ],
      { strict: false, runValidators: false }
    );

    res.json({
      ok: true,
      modified_stage1: r1.modifiedCount,
      modified_stage2: r2.modifiedCount,
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
}

export async function summaryMetrics(req, res, next) {
  try {
    const from = new Date(req.query.from || "1970-01-01");
    const to = new Date(req.query.to || "2999-12-31");

    const summary = await Booking.aggregate([
      { $match: { createdAt: between(from, to) } },
      {
        $project: {
          amount: coalesceAmount,
          ci: coalesceCheckIn,
          co: coalesceCheckOut,
          status: 1,
        },
      },
      {
        $addFields: {
          nights: {
            $dateDiff: { startDate: "$ci", endDate: "$co", unit: "day" },
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$amount" },
          totalBookings: { $sum: 1 },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          checkedIn: {
            $sum: { $cond: [{ $eq: ["$status", "checked_in"] }, 1, 0] },
          },
          checkedOut: {
            $sum: { $cond: [{ $eq: ["$status", "checked_out"] }, 1, 0] },
          },
          nights: { $sum: "$nights" },
        },
      },
    ]);

    const s = summary?.[0] || {};
    res.json({
      revenue: +(s.revenue || 0),
      bookings: +(s.totalBookings || 0),
      cancelled: +(s.cancelled || 0),
      confirmed: +(s.confirmed || 0),
      checkedIn: +(s.checkedIn || 0),
      checkedOut: +(s.checkedOut || 0),
      nights: +(s.nights || 0),
    });
  } catch (e) {
    next(e);
  }
}
