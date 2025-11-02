// server/controllers/public.controller.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

import Booking from "../models/Booking.js";
import Quote from "../models/Quote.js";
import Inventory from "../models/Inventory.js";
import { computeAvailability } from "../services/availability.service.js";
import { makePriceQuote, hashQuoteInput } from "../services/pricing.service.js";
import { createOrder, verifyPaymentSignature } from "../services/razorpay.service.js";
import { sendBookingEmails } from "../services/notifications.service.js";
import InvoiceCounter from "../models/InvoiceCounter.js";

const Q_TTL_MIN = Number(process.env.QUOTE_TTL_MIN || 15);
const HOLD_TTL_MIN = Number(process.env.BOOKING_HOLD_TTL_MIN || 15);

// GET /public/availability
export async function checkAvailability(req, res, next) {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
    } = req.query;
    if (!propertyId || !checkIn || !checkOut)
      return res
        .status(400)
        .json({ message: "propertyId, checkIn, checkOut required" });

    const ci = dayjs.utc(checkIn).startOf("day").toDate();
    const co = dayjs.utc(checkOut).startOf("day").toDate();

    const inv = (await Inventory.findOne({ propertyId })) || {
      units: 1,
      minStay: 1,
      blackouts: [],
    };
    const result = await computeAvailability({
      propertyId,
      checkIn: ci,
      checkOut: co,
      inv,
    });

    res.json({
      available: result.available,
      reason: result.reason || null,
      minStay: inv.minStay || 1,
      remainingUnits: result.remainingUnits ?? (inv.units || 1),
      suggestions: result.suggestions || [],
      adults: Number(adults),
      children: Number(children),
    });
  } catch (e) {
    next(e);
  }
}

// POST /public/quote
export async function createQuote(req, res, next) {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
      coupon,
    } = req.body || {};
    if (!propertyId || !checkIn || !checkOut)
      return res
        .status(400)
        .json({ message: "propertyId, checkIn, checkOut required" });

    const ci = dayjs.utc(checkIn).startOf("day").toDate();
    const co = dayjs.utc(checkOut).startOf("day").toDate();

    // availability gate
    const inv = (await Inventory.findOne({ propertyId })) || {
      units: 1,
      minStay: 1,
      blackouts: [],
    };
    const avail = await computeAvailability({
      propertyId,
      checkIn: ci,
      checkOut: co,
      inv,
    });
    if (!avail.available)
      return res
        .status(409)
        .json({ message: "Not available", reason: avail.reason });

    // pricing
    const breakdown = await makePriceQuote({
      propertyId,
      checkIn: ci,
      checkOut: co,
      adults,
      children,
      coupon,
    });

    // persist short-lived quote (TTL index on Quote model)
    const fingerprint = hashQuoteInput({
      propertyId,
      ci,
      co,
      adults,
      children,
      coupon,
    });
    const expiresAt = dayjs().add(Q_TTL_MIN, "minute").toDate();
    const q = await Quote.create({
      propertyId,
      checkIn: ci,
      checkOut: co,
      adults,
      children,
      breakdown,
      fingerprint,
      expiresAt,
    });

    res.json({ quoteId: q.id, breakdown, expiresAt });
  } catch (e) {
    next(e);
  }
}

// POST /public/checkout
export async function checkout(req, res, next) {
  try {
    const { quoteId, guest, idempotencyKey } = req.body || {};
    if (!quoteId || !guest?.email || !guest?.name || !idempotencyKey)
      return res
        .status(400)
        .json({
          message: "quoteId, guest(name,email), idempotencyKey required",
        });

    const quote = await Quote.findById(quoteId);
    if (!quote || quote.expiresAt < new Date())
      return res.status(410).json({ message: "Quote expired" });

    // Idempotency: reuse existing pending booking for the same idempotencyKey
    const existing = await Booking.findOne({
      "meta.idempotencyKey": idempotencyKey,
    });
    if (existing) {
      return res.json({
        bookingId: existing.id,
        bookingCode: existing.code,
        razorpay: existing.meta?.razorpayOrder || null,
      });
    }

    // availability re-check just before holding
    const inv = (await Inventory.findOne({ propertyId: quote.propertyId })) || {
      units: 1,
      minStay: 1,
      blackouts: [],
    };
    const avail = await computeAvailability({
      propertyId: quote.propertyId,
      checkIn: quote.checkIn,
      checkOut: quote.checkOut,
      inv,
    });
    if (!avail.available)
      return res.status(409).json({ message: "Not available anymore" });

    // create pending booking (hold)
    const holdExpiresAt = dayjs().add(HOLD_TTL_MIN, "minute").toDate();
    const code = shortCode();
    const b = await Booking.create({
      code,
      guest: { name: guest.name, email: guest.email, phone: guest.phone || "" },
      stay: {
        checkIn: quote.checkIn,
        checkOut: quote.checkOut,
        nights: breakdownNights(quote.checkIn, quote.checkOut),
        adults: quote.adults,
        children: quote.children,
        propertyId: quote.propertyId,
        propertyName: quote.breakdown?.propertyName || "",
      },
      price: {
        currency: quote.breakdown.currency,
        grossAmount: quote.breakdown.gross,
        discountAmount: quote.breakdown.discount,
        taxAmount: quote.breakdown.tax,
        platformFee: quote.breakdown.platformFee,
        channelFee: quote.breakdown.channelFee || 0,
        netReceivable: quote.breakdown.net,
        paidAmount: 0,
        paymentStatus: "unpaid",
      },
      status: "pending",
      meta: { idempotencyKey },
      holdExpiresAt,
    });

    // create razorpay order with server-authoritative amount
    const order = await createOrder({
      amount: b.price.netReceivable,
      currency: b.price.currency,
      receipt: b.id,
      notes: { code: b.code },
    });

    b.meta = {
      ...b.meta,
      razorpayOrder: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    };
    await b.save();

    res.json({
      bookingId: b.id,
      bookingCode: b.code,
      razorpay: {
        orderId: order.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (e) {
    next(e);
  }
}

// POST /public/confirm
export async function confirmPayment(req, res, next) {
  try {
    const { bookingId, orderId, paymentId, signature } = req.body || {};
    if (!bookingId || !orderId || !paymentId || !signature)
      return res
        .status(400)
        .json({ message: "bookingId, orderId, paymentId, signature required" });

    const b = await Booking.findById(bookingId);
    if (!b) return res.status(404).json({ message: "Booking not found" });
    if (b.status !== "pending" && b.status !== "confirmed") {
      return res.json({ ok: true, bookingCode: b.code }); // idempotent
    }

    const ok = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
    });
    if (!ok)
      return res.status(400).json({ message: "Invalid payment signature" });

    // Mark confirmed, update payment fields
    b.status = "confirmed";
    b.price.paidAmount = b.price.netReceivable;
    b.price.paymentStatus = "paid";

    // assign invoice number/date (reuse counter)
    if (!b.invoiceNumber) {
      const seq = await InvoiceCounter.next();
      const year = new Date().getFullYear();
      const prefix = process.env.INVOICE_PREFIX || "ITW";
      b.invoiceNumber = `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
      b.invoiceDate = new Date();
    }

    await b.save();

    // send email/SMS confirmations (non-blocking)
    sendBookingEmails(b).catch(() => {});

    res.json({ ok: true, bookingCode: b.code });
  } catch (e) {
    next(e);
  }
}

// GET /public/booking/:code
export async function getPublicBooking(req, res, next) {
  try {
    const { code } = req.params;
    const b = await Booking.findOne({ code });
    if (!b) return res.status(404).json({ message: "Not found" });

    res.json({
      code: b.code,
      status: b.status,
      guest: { name: b.guest?.name || "" },
      stay: b.stay,
      amount: b.price?.netReceivable,
      currency: b.price?.currency || "INR",
      createdAt: b.createdAt,
    });
  } catch (e) {
    next(e);
  }
}

// POST /public/cancel-request
export async function submitCancelRequest(req, res, next) {
  try {
    const { code, email, reason } = req.body || {};
    if (!code || !email)
      return res.status(400).json({ message: "code and email required" });
    // Minimal: email admin; you can store a CancelRequest model later
    const msg = `Cancel request for ${code} from ${email}${
      reason ? `\nReason: ${reason}` : ""
    }`;
    console.log("[CANCEL REQUEST]", msg);
    res.json({ received: true });
  } catch (e) {
    next(e);
  }
}

// helpers
function shortCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
function breakdownNights(ci, co) {
  const d1 = dayjs(ci);
  const d2 = dayjs(co);
  return Math.max(1, d2.diff(d1, "day"));
}
