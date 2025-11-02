export const notFound = (req, res, next) => {
  next({ status: 404, message: `Route ${req.originalUrl} not found` });
};

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const msg = err.message || "Server error";
  if (status >= 500) console.error(err);
  res.status(status).json({ ok: false, message: msg });
};
