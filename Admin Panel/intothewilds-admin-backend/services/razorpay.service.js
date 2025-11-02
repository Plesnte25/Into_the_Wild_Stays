import crypto from "crypto";

let RazorpayCtor = null;
async function getRazorpayCtor() {
  if (!RazorpayCtor) {
    const mod = await import("razorpay");
    RazorpayCtor = mod.default || mod; // CJS/ESM compat
  }
  return RazorpayCtor;
}

export function loadRazorpayConfig() {
  const key_id = process.env.RAZORPAY_KEY_ID || "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
  return { key_id, key_secret, ok: !!(key_id && key_secret) };
}

export async function getClient() {
  const { key_id, key_secret, ok } = loadRazorpayConfig();
  if (!ok)
    throw new Error(
      "Razorpay not configured (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)"
    );
  const Razorpay = await getRazorpayCtor();
  return new Razorpay({ key_id, key_secret });
}

export async function createOrder({
  amount,
  currency = process.env.CURRENCY || "INR",
  receipt,
  notes,
}) {
  const client = await getClient();
  return client.orders.create({
    amount: Math.round(Number(amount) * 100), // paise
    currency,
    receipt,
    notes,
  });
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const { key_secret } = loadRazorpayConfig();
  const h = crypto.createHmac("sha256", key_secret);
  h.update(`${orderId}|${paymentId}`);
  return h.digest("hex") === signature;
}

export function verifyWebhookSignature(rawBodyString, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBodyString)
    .digest("hex");
  return expected === signature;
}

export async function refundPayment({ paymentId, amount }) {
  const client = await getClient();
  const payload = {};
  if (amount != null) payload.amount = Math.round(Number(amount) * 100);
  return client.payments.refund(paymentId, payload);
}
