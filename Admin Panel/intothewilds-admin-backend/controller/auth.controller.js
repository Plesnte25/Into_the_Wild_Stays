import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OtpToken from "../models/OtpToken.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../services/token.service.js";
import { sendMail } from "../utils/mailer.js";


const ACCESS_COOKIE = "itw_admin_token";

const minutesFromNow = (m) => new Date(Date.now() + m * 60 * 1000);

// --- Session ---
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !user.passwordHash)
      return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    // Set httpOnly refresh cookie
    res.cookie(ACCESS_COOKIE, refreshToken, {
      httpOnly: true,
      secure: !!process.env.COOKIE_SECURE,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token, refreshToken, user: sanitizeUser(user) });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

export async function refresh(req, res, next) {
  try {
    const tokenInCookie = req.cookies?.[ACCESS_COOKIE];
    const tokenInBody = req.body?.refreshToken;
    const token = tokenInCookie || tokenInBody;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Invalid refresh" });

    const newAccess = signAccessToken({ sub: user.id, role: user.role });
    res.json({ token: newAccess });
  } catch (e) {
    next(e);
  }
}

export async function logout(_req, res) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.status(204).end();
}

// --- OTP flows (2FA reset) ---
export async function sendEmailOtp(req, res, next) {
  try {
    const { email, purpose } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user)
      return res.status(404).json({ message: "No account with that email" });

    const code = generateCode();
    await OtpToken.create({
      email: user.email,
      purpose,
      channel: "email",
      code,
      expiresAt: minutesFromNow(10),
    });

    const subject = "Your ITW password reset code";
    const text = `Your verification code is ${code}. It expires in 10 minutes.`;
    await sendMail(user.email, subject, text);

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function sendSmsOtp(req, res, next) {
  try {
    const { phone, purpose } = req.body; // expects +91XXXXXXXXXX
    const user = await User.findOne({ phone });
    if (!user)
      return res.status(404).json({ message: "No account with that phone" });

    const code = generateCode();
    await OtpToken.create({
      phone: user.phone,
      purpose,
      channel: "sms",
      code,
      expiresAt: minutesFromNow(10),
    });

    // Stub SMS send: log to server; integrate Twilio/etc later
    console.log(`[SMS OTP] to ${phone}: ${code}`);

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function verifyEmailOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const token = await OtpToken.findOne({
      email: email?.toLowerCase(),
      channel: "email",
    }).sort({ createdAt: -1 });
    if (!token || token.code !== otp || token.expiresAt < new Date())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    token.verified = true;
    await token.save();
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function verifySmsOtp(req, res, next) {
  try {
    const { phone, otp } = req.body;
    const token = await OtpToken.findOne({ phone, channel: "sms" }).sort({
      createdAt: -1,
    });
    if (!token || token.code !== otp || token.expiresAt < new Date())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    token.verified = true;
    await token.save();
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, phone, newPassword, confirmPassword } = req.body;
    if (!newPassword || newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    // Ensure both last tokens are verified
    const emailOk = await OtpToken.findOne({
      email: email?.toLowerCase(),
      channel: "email",
    }).sort({ createdAt: -1 });
    const smsOk = await OtpToken.findOne({ phone, channel: "sms" }).sort({
      createdAt: -1,
    });

    const valid = (t) => t && t.verified && t.expiresAt >= new Date();
    if (!valid(emailOk) || !valid(smsOk)) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    const user = await User.findOne({ email: email?.toLowerCase(), phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Invalidate OTPs (optional hard delete)
    await OtpToken.deleteMany({
      $or: [{ email: user.email }, { phone: user.phone }],
    });

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

// --- Optional email-link flow (not required by UI) ---
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(204).end(); // do not leak

    const token = jwt.sign(
      { sub: user.id },
      process.env.RESET_TOKEN_SECRET || "reset_secret",
      { expiresIn: "15m" }
    );
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5174"
    }/reset?token=${token}`;
    await sendMail(
      user.email,
      "Reset your password",
      `Open this link: ${resetUrl}`
    );

    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function resetPasswordWithToken(req, res, next) {
  try {
    const { token, password } = req.body;
    const payload = jwt.verify(
      token,
      process.env.RESET_TOKEN_SECRET || "reset_secret"
    );
    const user = await User.findById(payload.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();

    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

// --- Helpers ---
function sanitizeUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isActive: u.isActive,
  };
}
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}
