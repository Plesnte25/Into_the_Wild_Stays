// server/services/bookingMath.service.js
export function computeFinancials(bookingDoc) {
  const b = bookingDoc;

  // If any field is missing, default to zero
  const f = (n) => (typeof n === "number" && !Number.isNaN(n) ? n : 0);

  const gross = f(b.price?.grossAmount);
  const discount = f(b.price?.discountAmount);
  let tax = f(b.price?.taxAmount);
  let platformFee = f(b.price?.platformFee);
  let channelFee = f(b.price?.channelFee);

  // Apply defaults only if values are absent
  if (b.price?.taxAmount === undefined) {
    const taxRate = Number(process.env.TAX_RATE_DEFAULT || 0.12);
    tax = +(gross - discount) * taxRate;
  }
  if (b.price?.platformFee === undefined) {
    const pf = Number(process.env.PLATFORM_FEE_RATE_DEFAULT || 0.05);
    platformFee = +(gross - discount) * pf;
  }
  if (b.price?.channelFee === undefined) {
    const cf = Number(process.env.CHANNEL_FEE_RATE_DEFAULT || 0);
    channelFee = +(gross - discount) * cf;
  }

  const net = +(gross - discount + tax - platformFee - channelFee);

  // set and mark modified if changed
  const old = b.price?.netReceivable ?? 0;
  const changed =
    b.price?.taxAmount !== tax ||
    b.price?.platformFee !== platformFee ||
    b.price?.channelFee !== channelFee ||
    old !== net;

  b.price = {
    ...b.price,
    taxAmount: round2(tax),
    platformFee: round2(platformFee),
    channelFee: round2(channelFee),
    netReceivable: round2(net),
    currency: b.price?.currency || process.env.CURRENCY || "INR",
    paidAmount: f(b.price?.paidAmount),
    paymentStatus: b.price?.paymentStatus || "unpaid",
  };

  return changed;
}

export function sortToMongo(sort) {
  const map = {
    createdAt_asc: { createdAt: 1 },
    createdAt_desc: { createdAt: -1 },
    amount_asc: { "price.netReceivable": 1 },
    amount_desc: { "price.netReceivable": -1 },
    checkIn_asc: { "stay.checkIn": 1 },
    checkIn_desc: { "stay.checkIn": -1 },
    status_asc: { status: 1 },
    status_desc: { status: -1 },
  };
  return map[sort] || map.createdAt_desc;
}

export function validateTransition(from, to) {
  const allowed = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["checked_in", "cancelled"],
    checked_in: ["checked_out"],
    checked_out: [],
    cancelled: [],
  };
  return Array.isArray(allowed[from]) && allowed[from].includes(to);
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
