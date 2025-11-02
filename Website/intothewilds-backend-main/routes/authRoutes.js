// intothewilds-backend-main/routes/authRoutes.js     ▼ ADD
// router.post("/debug-login", async (req, res) => {
//   const { emailorphone, password } = req.body;
//   const User = (await import("../models/User.js")).default;

//   // same logic you use in login()
//   const criteria = [
//     { username: emailorphone.toLowerCase() },
//     { email: emailorphone.toLowerCase() },
//     { phone: Number(emailorphone) || -1 },
//   ];

//   const user = await User.findOne({ $or: criteria }).select("+password");

//   return res.json({
//     received: { emailorphone, password },
//     query: { $or: criteria },
//     userFound: !!user,
//     userDoc: user,
//   });
// });


// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController')


// Register Route
router.post('/register',authController.register);
router.post('/google',authController.googleSignup);

// Login Route
router.post('/login', authController.login);

// verify email
router.post('/verify-email', authController.verifyEmail);
router.get('/getAllUsers',authController.getAllUsers);

module.exports = router;
