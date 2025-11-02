// server/controllers/webhooks.controller.js
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { verifyWebhookSignature } from "../services/razorpay.service.js";

export async function razorpayWebhook(req, res) {
  // raw body already captured by server.js
  const valid = verifyWebhookSignature(
    req.rawBodyString,
    req.headers["x-razorpay-signature"]
  );
  if (!valid) return res.status(400).json({ message: "Invalid signature" });

  const event = req.body;
  try {
    if (event.event?.startsWith("payment.")) {
      const p = event.payload?.payment?.entity;
      if (p) {
        // upsert payment record
        const doc = await Payment.findOneAndUpdate(
          { provider: "razorpay", paymentId: p.id },
          {
            provider: "razorpay",
            paymentId: p.id,
            orderId: p.order_id || null,
            amount: Number(p.amount || 0) / 100,
            currency: p.currency || "INR",
            status: p.status,
            raw: p,
          },
          { upsert: true, new: true }
        );

        // reconcile booking using receipt if present on order or notes
        const receipt =
          event.payload?.order?.entity?.receipt || p?.notes?.receipt;
        if (receipt) {
          const b = await Booking.findById(receipt);
          if (b) {
            const agg = await Payment.aggregate([
              {
                $match: {
                  provider: "razorpay",
                  orderId: doc.orderId,
                  status: {
                    $in: ["captured", "refunded", "partially_refunded"],
                  },
                },
              },
              { $group: { _id: null, paid: { $sum: "$amount" } } },
            ]);
            const paid = agg?.[0]?.paid || doc.amount || 0;
            b.price.paidAmount = paid;
            b.price.paymentStatus =
              paid + 1e-6 >= (b.price.netReceivable || 0) ? "paid" : "partial";
            await b.save();
          }
        }
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    // still 200 to avoid excessive retries
  }
  res.json({ received: true });
}
