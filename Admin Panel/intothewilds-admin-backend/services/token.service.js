import jwt from "jsonwebtoken";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "15m",
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + "_r",
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
}

export function verifyRefresh(token) {
  return jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + "_r"
  );
}
