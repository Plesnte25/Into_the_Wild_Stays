// intothewilds-backend-main/routes/reservationRoute.js
//
// TODO(unfinished): This router is NOT mounted in server.js — the
// reservations feature is unreachable over HTTP. controller/reservationController.js
// exports getUserBookings/updateBooking/getByRange, none of which match the
// listReservations/getReservation/createReservation names this file looks
// for, so every route below currently falls through to the `ok`/`notImpl`
// stubs. To finish this feature: decide on the real controller API, wire
// auth middleware (list/detail probably need at least authenticateToken),
// and mount it in server.js. See KNOWN_ISSUES.md for more.
const express = require("express");
const router = express.Router();

// Try to import real controllers (if/when you add them)
let listReservations, getReservation, createReservation;

try {
  const ctrl = require("../controller/reservationController");
  listReservations = ctrl.listReservations;
  getReservation = ctrl.getReservation;
  createReservation = ctrl.createReservation;
} catch (e) {
  // No controller? We'll provide safe fallbacks so the server still boots.
  console.warn(
    "[reservationRoute] reservationController not found or has no exports. Using fallbacks."
  );
}

// Fallback handlers if any controller fn is missing
const ok = (req, res) => res.json({ ok: true });
const notImpl = (name) => (req, res) =>
  res.status(501).json({ ok: false, message: `${name} not implemented` });

router.get(
  "/",
  listReservations || ok // list all reservations (or just 200 {ok:true})
);

router.get("/:id", getReservation || notImpl("getReservation"));

router.post("/", createReservation || notImpl("createReservation"));

module.exports = router;
