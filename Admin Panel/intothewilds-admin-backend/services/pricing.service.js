// server/services/pricing.service.js
import crypto from "crypto";
import dayjs from "dayjs";
import Setting from "../models/Setting.js";
import Property from "../models/Property.js"; // if you have this model; otherwise remove propertyName lookup

export function hashQuoteInput({
  propertyId,
  ci,
  co,
  adults,
  children,
  coupon,
}) {
  const payload = `${propertyId}|${dayjs(ci).toISOString()}|${dayjs(
    co
  ).toISOString()}|${adults}|${children}|${coupon || ""}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

// Compute authoritative quote using business defaults + seasonal overrides (if present in settings)
// You can later extend to look up property-specific seasonal pricing arrays.
export async function makePriceQuote({
  propertyId,
  checkIn,
  checkOut,
  adults = 1,
  children = 0,
  coupon,
}) {
  // base nightly rate from settings (fallback 4000)
  const site = await Setting.findOne({ scope: "business", key: "baseNightly" });
  const base = Number(site?.value || 4000);

  // simple seasonal % (optional; set in settings.business.seasonalPercent e.g., { "12": 1.15 })
  const seasonal = await Setting.findOne({
    scope: "business",
    key: "seasonalPercent",
  });
  const seasonMap = seasonal?.value || {}; // key=month ("1"..."12"), val=multiplier

  const nights = Math.max(
    1,
    Math.ceil((checkOut - checkIn) / (24 * 3600 * 1000))
  );
  const months = new Set();
  for (let d = dayjs(checkIn); d.isBefore(checkOut); d = d.add(1, "day"))
    months.add(String(d.month() + 1));

  let nightly = base;
  for (const m of months) {
    if (seasonMap[m]) nightly = nightly * Number(seasonMap[m]); // naive blend; feel free to average
  }

  const gross = nightly * nights;
  let discount = 0;

  // basic coupon: PCT10 => 10% off, FLAT500 => ₹500 off (demo)
  if (coupon) {
    const c = String(coupon).trim().toUpperCase();
    if (c.startsWith("PCT")) {
      const pct = Number(c.replace("PCT", "")) || 0;
      discount = (gross * pct) / 100;
    } else if (c.startsWith("FLAT")) {
      discount = Number(c.replace("FLAT", "")) || 0;
    }
  }

  const taxRate = Number(process.env.TAX_RATE_DEFAULT || 0.12);
  const platformRate = Number(process.env.PLATFORM_FEE_RATE_DEFAULT || 0.05);

  const tax = (gross - discount) * taxRate;
  const platformFee = (gross - discount) * platformRate;

  const net = +(gross - discount + tax - platformFee);

  let propertyName = "";
  try {
    const prop = await Property.findById(propertyId).select("name");
    propertyName = prop?.name || "";
  } catch {}

  return {
    currency: process.env.CURRENCY || "INR",
    gross: round2(gross),
    discount: round2(Math.max(0, discount)),
    tax: round2(tax),
    platformFee: round2(platformFee),
    channelFee: 0,
    net: round2(net),
    nights,
    propertyName,
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
