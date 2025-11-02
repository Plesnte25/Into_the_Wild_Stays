import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    // 1) Bearer header
    const hdr = req.headers.authorization || "";
    const bearer = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

    // 2) Cookie fallback (name can be what you used when setting it)
    const cookieToken = req.cookies?.itw_admin_token || req.cookies?.token;

    const token = bearer || cookieToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
