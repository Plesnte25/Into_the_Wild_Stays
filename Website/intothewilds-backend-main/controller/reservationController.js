// controller/reservationController.js
//
// NOTE: This controller backs routes/reservationRoute.js, which is NOT
// mounted in server.js — the "reservations" feature is unfinished and
// unreachable over HTTP. This file previously had fatal syntax errors
// (a require() for a nonexistent "../utils/catchAsync" module, a use of the
// undeclared "dayjs" package, and a dangling top-level code fragment left
// over from an unfinished handler) that would throw immediately if the file
// were ever required. Those have been cleaned up below so the module loads
// safely, but the feature itself is still not wired up or product-complete.
// See KNOWN_ISSUES.md before mounting these routes.

const Booking = require("../models/Booking");

// GET /api/v1/bookings/userbookings?range=week|month|year
exports.getUserBookings = async (req, res) => {
  try {
    const { range = "month" } = req.query;
    const now = new Date();
    let start;
    switch (range) {
      case "week":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case "year":
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    const docs = await Booking.find({
      createdAt: { $gte: start, $lte: now },
    }).populate("property");
    res.status(200).json({ status: "success", results: docs.length, data: docs });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// PATCH /api/v1/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const { status, checkoutDate } = req.body;
    const update = {};
    if (status) update.status = status;
    if (checkoutDate) update.checkoutDate = checkoutDate;
    const bk = await Booking.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!bk) {
      return res.status(404).json({ status: "fail", message: "No Booking" });
    }
    res.status(200).json({ status: "success", data: bk });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api/v1/bookings/range/:range
exports.getByRange = async (req, res) => {
  try {
    const { range = "month" } = req.params;
    const now = new Date();
    let from;
    switch (range) {
      case "week":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case "year":
        from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    const bookings = await Booking.find({
      createdAt: { $gte: from },
    })
      .populate("property", "name location")
      .lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
