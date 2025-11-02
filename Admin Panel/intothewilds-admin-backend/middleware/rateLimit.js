// server/middlewares/rateLimit.js
// Simple in-memory sliding window (optionally swap to Redis later)
const buckets = new Map();

export function rateLimit({ key = "rl", limit = 60, windowSec = 60 } = {}) {
  return (req, res, next) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "0.0.0.0";
      const k = `${key}:${ip}`;
      const now = Date.now();
      const win = windowSec * 1000;

      let arr = buckets.get(k) || [];
      arr = arr.filter((ts) => now - ts < win);
      if (arr.length >= limit) {
        res.setHeader("Retry-After", Math.ceil((win - (now - arr[0])) / 1000));
        return res.status(429).json({ message: "Too many requests" });
      }
      arr.push(now);
      buckets.set(k, arr);
      next();
    } catch (e) {
      next(e);
    }
  };
}
