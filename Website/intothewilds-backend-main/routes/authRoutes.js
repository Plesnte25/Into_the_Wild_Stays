// server/routes/authRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controller/authController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Tighter throttle than the global limiter — these endpoints are the
// classic brute-force / credential-stuffing / OTP-spam targets.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many auth attempts from this IP, please try again after 15 minutes',
});

// Register Route
router.post('/register', authLimiter, authController.register);
router.post('/google', authLimiter, authController.googleSignup);

// Login Route
router.post('/login', authLimiter, authController.login);

// verify email
router.post('/verify-email', authLimiter, authController.verifyEmail);

// Admin-only: lists every user in the system.
router.get(
  '/getAllUsers',
  authenticateToken,
  authorizeRole('admin'),
  authController.getAllUsers
);

module.exports = router;
