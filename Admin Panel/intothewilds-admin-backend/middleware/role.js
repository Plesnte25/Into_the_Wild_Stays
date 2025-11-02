// server/middlewares/role.js
export function requireRole(role = "admin") {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) return res.status(401).json({ message: "Unauthorized" });
    if (userRole !== role)
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
