import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import {
  createOrder,
  verifyPaymentSignature,
  refundPayment,
  loadRazorpayConfig,
} from "../services/razorpay.service.js";

function computeDue(b) {
  const net = Number(b?.price?.netReceivable || 0);
  const paid = Number(b?.price?.paidAmount || 0);
  return Math.max(0, net - paid);
}

// POST /api/payments/order
export async function createOrderForBooking(req, res, next) {
  try {
    const { bookingId, amount, currency, notes } = req.body || {};
    let payAmount = Number(amount || 0);
    let receipt;

    if (bookingId) {
      const b = await Booking.findById(bookingId);
      if (!b) return res.status(404).json({ message: "Booking not found" });
      payAmount = payAmount > 0 ? payAmount : computeDue(b);
      receipt = String(b._id);
    }
    if (!payAmount) return res.status(400).json({ message: "Amount required" });

    const order = await createOrder({
      amount: payAmount,
      currency,
      receipt,
      notes,
    });

    await Payment.create({
      provider: "razorpay",
      orderId: order.id,
      bookingId: bookingId || null,
      amount: payAmount,
      currency: order.currency,
      status: "created",
      raw: order,
    });

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
}

// POST /api/payments/verify
export async function verifyCapture(req, res, next) {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body || {};
    if (!orderId || !paymentId || !signature)
      return res
        .status(400)
        .json({ message: "Missing orderId/paymentId/signature" });

    const ok = verifyPaymentSignature({ orderId, paymentId, signature });
    if (!ok) return res.status(400).json({ message: "Invalid signature" });

    const pay = await Payment.findOneAndUpdate(
      { provider: "razorpay", orderId },
      { paymentId, status: "captured" },
      { new: true }
    );

    const bid = bookingId || pay?.bookingId;
    if (bid) {
      const b = await Booking.findById(bid);
      if (b) {
        const agg = await Payment.aggregate([
          {
            $match: {
              provider: "razorpay",
              bookingId: b._id,
              status: { $in: ["captured", "refunded", "partially_refunded"] },
            },
          },
          { $group: { _id: null, paid: { $sum: "$amount" } } },
        ]);
        const paid = agg?.[0]?.paid || pay.amount || 0;
        b.price.paidAmount = paid;
        b.price.paymentStatus =
          paid + 1e-6 >= (b.price.netReceivable || 0) ? "paid" : "partial";
        await b.save();
      }
    }
    res.json({ verified: true });
  } catch (e) {
    next(e);
  }
}

// POST /api/payments/refund
export async function issueRefund(req, res, next) {
  try {
    const { paymentId, amount } = req.body || {};
    if (!paymentId)
      return res.status(400).json({ message: "paymentId required" });

    const r = await refundPayment({ paymentId, amount });

    await Payment.create({
      provider: "razorpay",
      paymentId,
      refundId: r.id,
      amount: (Number(amount ?? r.amount) || 0) / 100,
      currency: r.currency || "INR",
      status: "refunded",
      raw: r,
    });

    res.json({ ok: true, refundId: r.id });
  } catch (e) {
    next(e);
  }
}

// GET /api/payments/transactions
export async function listPayments(req, res, next) {
  try {
    const { page = 1, limit = 50, sort = "createdAt_desc", status } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(200, parseInt(limit)));
    const q = {};
    if (status) q.status = { $in: String(status).split(",") };

    const sortMap = {
      createdAt_desc: { createdAt: -1 },
      createdAt_asc: { createdAt: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 },
    };
    const sortSpec = sortMap[sort] || sortMap.createdAt_desc;

    const [items, total] = await Promise.all([
      Payment.find(q)
        .sort(sortSpec)
        .skip((p - 1) * l)
        .limit(l),
      Payment.countDocuments(q),
    ]);
    res.json({ items, page: p, limit: l, total, pages: Math.ceil(total / l) });
  } catch (e) {
    next(e);
  }
}

// GET /api/payments/summary
export async function getSummary(_req, res, next) {
  try {
    const total = await Payment.countDocuments({ provider: "razorpay" });
    const byStatus = await Payment.aggregate([
      { $match: { provider: "razorpay" } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);
    const map = Object.fromEntries(
      byStatus.map((x) => [x._id || "unknown", x])
    );
    const successful = map.captured?.count || 0;
    const failed = map.failed?.count || 0;
    const pending = (map.created?.count || 0) + (map.authorized?.count || 0);
    const totalAmount = byStatus.reduce((s, x) => s + (x.amount || 0), 0);
    res.json({ total, successful, failed, pending, totalAmount });
  } catch (e) {
    next(e);
  }
}

// GET /api/payments/key
export async function getPublicKey(_req, res) {
  const { key_id } = loadRazorpayConfig();
  res.json({ keyId: key_id || null });
}
