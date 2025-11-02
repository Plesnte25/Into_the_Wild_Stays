import os from "os";
import process from "process";
import bcrypt from "bcryptjs";
import Setting from "../models/Setting.js";
import User from "../models/User.js";
import {
  uploadLogoBuffer,
  getCloudinaryStatsSafely,
} from "../services/cloudinary.service.js";

// ---------- helpers ----------
const getBool = (v, d = false) => {
  if (v === undefined || v === null) return d;
  if (typeof v === "boolean") return v;
  return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
};

async function getScope(scope) {
  const docs = await Setting.find({ scope });
  const out = {};
  for (const d of docs) out[d.key] = d.value;
  return out;
}
async function setScope(scope, payload = {}) {
  const entries = Object.entries(payload);
  const ops = entries.map(([key, value]) =>
    Setting.findOneAndUpdate(
      { scope, key },
      { scope, key, value },
      { upsert: true, new: true }
    )
  );
  await Promise.all(ops);
  return getScope(scope);
}

// ---------- System Info ----------
export async function getSystemInfo(_req, res) {
  const mem = process.memoryUsage();
  const uptime = process.uptime();
  const dbState = res.app.get("mongoose")?.connection?.readyState ?? 1; // 1=connected
  res.json({
    node: process.version,
    env: process.env.NODE_ENV || "development",
    uptimeSec: Math.round(uptime),
    platform: `${os.type()} ${os.release()} ${os.arch()}`,
    memoryMb: {
      rss: Math.round(mem.rss / 1e6),
      heapUsed: Math.round(mem.heapUsed / 1e6),
      heapTotal: Math.round(mem.heapTotal / 1e6),
    },
    dbState,
    config: {
      cloudinaryConfigured: !!(
        process.env.CLOUDINARY_NAME &&
        process.env.CLOUDINARY_KEY &&
        process.env.CLOUDINARY_SECRET
      ),
      razorpayDefaultConfigured: !!(
        process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
      ),
    },
  });
}

// ---------- Cloudinary ----------
export async function getcloudinaryStats(_req, res, next) {
  try {
    const stats = await getCloudinaryStatsSafely();
    res.json(stats);
  } catch (e) {
    next(e);
  }
}

export async function getCloudinarySignature(_req, res, next) {
  try {
    const signed = buildSignedParams({ resource_type: "image" });
    res.json(signed);
  } catch (e) {
    next(e);
  }
}

// ---------- Site ----------
export async function getSiteSettings(_req, res) {
  const site = await getScope("site");
  res.json(site);
}
export async function updateSiteSettings(req, res) {
  const { name, contactEmail, contactPhone, socials } = req.body || {};
  const site = await setScope("site", {
    name,
    contactEmail,
    contactPhone,
    socials,
  });
  res.json(site);
}
export async function uploadSiteLogo(req, res, next) {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ message: "No file uploaded (field name: logo)" });
    const { buffer, originalname, mimetype } = req.file;
    const result = await uploadLogoBuffer(buffer, { originalname, mimetype });
    // store in settings
    const site = await setScope("site", { logo: result });
    res.json({ uploaded: result, site });
  } catch (e) {
    next(e);
  }
}

// ---------- Business ----------
export async function getBusinessSettings(_req, res) {
  const biz = await getScope("business");
  res.json(biz);
}
export async function updateBusinessSettings(req, res) {
  const { seasonalPricingEnabled, bank } = req.body || {};
  const payload = {
    seasonalPricingEnabled: getBool(seasonalPricingEnabled, false),
    bank,
  };
  const biz = await setScope("business", payload);
  res.json(biz);
}

// ---------- Razorpay ----------
// export async function updateRazorpaySettings(req, res) {
//   const { keyId, secret, test } = req.body || {};
//   const config = {
//     keyId: keyId || process.env.RAZORPAY_KEY_ID || "",
//     secret: secret || process.env.RAZORPAY_KEY_SECRET || "",
//     test: getBool(test, true),
//   };
//   await setScope("razorpay", { config });
//   res.json({ saved: true });
// }
// export async function checkRazorpay(_req, res, next) {
//   try {
//     const ok = await tryRazorpayPing();
//     res.json({ ok });
//   } catch (e) {
//     next(e);
//   }
// }
export async function getRazorpayStatus(_req, res) {
  const key_id = process.env.RAZORPAY_KEY_ID || "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
  const configured = !!(key_id && key_secret);

  if (!configured) {
    return res.json({
      ok: false,
      configured,
      message: "RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET missing",
    });
  }
  try {
    const mod = await import("razorpay");
    const Razorpay = mod.default || mod;
    const client = new Razorpay({ key_id, key_secret });
    await client.orders.all({ count: 1 }); // light validity check
    return res.json({
      ok: true,
      configured,
      keyIdMasked: key_id.replace(/.(?=.{4})/g, "•"),
    });
  } catch (e) {
    return res.json({
      ok: false,
      configured,
      message: e?.error?.description || e.message || "Razorpay error",
    });
  }
}

// ---------- Admin Users ----------
export async function listAdminUsers(_req, res) {
  const admins = await User.find({ role: "admin" }).select(
    "name email phone role isActive createdAt"
  );
  res.json(admins);
}
export async function createAdminUser(req, res) {
  const { name, email, phone, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: "email and password required" });
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing)
    return res.status(409).json({ message: "Email already exists" });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = await User.create({
    name: name || "Admin",
    email: email.toLowerCase(),
    phone,
    role: "admin",
    passwordHash,
    isActive: true,
  });
  res.status(201).json({ id: user.id, email: user.email });
}
export async function deleteAdminUser(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "id required" });
  const self = req.user?.id?.toString();
  if (self === id)
    return res.status(400).json({ message: "Cannot delete yourself" });
  await User.findByIdAndDelete(id);
  res.status(204).end();
}
