const Booking = require("../models/Booking");
const catchSync = require("../utils/catchAsync");

// GET /api/v1/bookings/userbookings?range=week
exports.getUserBookings = catchSync(async (req, res) => {
  const { range = "month" } = req.query; //Current month
  const start = dayjs().startOf(range);
  const end = dayjs().endOf(range);
  const docs = await Booking.find({
    createdAt: { $gte: start.toDate(), $lte: end.toDate() },
  }).populate("property user");
  res
    .status(200)
    .json({ status: "success", results: docs.length, datat: docs });
});

// PATCH /api/v1/bookings/:id
exports.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true,
});
if (!doc)
  return res.status(404).json({ status: "fail", message: "No Booking" });
res.status(200).json({ status: "success", data: doc });

exports.updateBooking = async (req, res) => {
  const { status, checkoutDate } = req.body;
  const update = {};
  if (status) update.status = status;
  if (checkoutDate) update.checkoutDate = checkoutDate;
  const bk = await Booking.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  res.json(bk);
};

// Filter data
exports.getByRange = async (req, res, next) => {
  const { range = "month" } = req.params;
  //bookings range
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
};
