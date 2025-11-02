import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

const coalesceAmount = {
  $cond: [
    { $gt: ["$price.netReceivable", null] },
    "$price.netReceivable",
    { $ifNull: ["$amount", 0] },
  ],
};

const coalesceCheckIn = {
  $cond: [{ $gt: ["$stay.checkIn", null] }, "$stay.checkIn", "$checkInDate"],
};

const coalesceCheckOut = {
  $cond: [{ $gt: ["$stay.checkOut", null] }, "$stay.checkOut", "$checkOutDate"],
};

function between(from, to) {
  return { $gte: from, $lte: to };
}

// SUMMARY
export async function getSummaryMetrics({ from, to }) {
  const summary = await Booking.aggregate([
    { $match: { createdAt: between(from, to) } },
    {
      $project: {
        amount: coalesceAmount,
        ci: coalesceCheckIn,
        co: coalesceCheckOut,
        status: 1,
      },
    },
    {
      $addFields: {
        nights: {
          $dateDiff: { startDate: "$ci", endDate: "$co", unit: "day" },
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: {
          $sum: {
            $cond: [{ $eq: ["$status", "checked_out"] }, "$amount", "$amount"],
          },
        },
        totalBookings: { $sum: 1 },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
        confirmed: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        checkedIn: {
          $sum: { $cond: [{ $eq: ["$status", "checked_in"] }, 1, 0] },
        },
        checkedOut: {
          $sum: { $cond: [{ $eq: ["$status", "checked_out"] }, 1, 0] },
        },
        nights: { $sum: "$nights" },
      },
    },
  ]);

  const s = summary?.[0] || {};
  // Payments capture (if you’ve been saving them)
  const pay = await Payment.aggregate([
    {
      $match: {
        createdAt: between(from, to),
        status: { $in: ["captured", "refunded", "partially_refunded"] },
      },
    },
    { $group: { _id: null, paid: { $sum: "$amount" } } },
  ]);

  const paid = +(pay?.[0]?.paid || 0);
  const avgRate = s.nights ? s.revenue / s.nights : 0;

  return {
    range: { from, to },
    revenue: +(s.revenue || 0),
    avgRate,
    bookings: {
      total: +(s.totalBookings || 0),
      cancelled: +(s.cancelled || 0),
      confirmed: +(s.confirmed || 0),
      checkedIn: +(s.checkedIn || 0),
      checkedOut: +(s.checkedOut || 0),
    },
    payments: { paid },
  };
}

// TRENDS
export async function getTrendsSeries({ from, to, granularity = "day" }) {
  const unit = granularity === "month" ? "month" : "day";
  const rows = await Booking.aggregate([
    { $match: { createdAt: between(from, to) } },
    {
      $project: {
        bucket: { $dateTrunc: { date: "$createdAt", unit } },
        amount: coalesceAmount,
      },
    },
    {
      $group: {
        _id: "$bucket",
        revenue: { $sum: "$amount" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({
    date: r._id,
    revenue: r.revenue,
    bookings: r.bookings,
  }));
}

// TOP LISTS (by propertyName or location if present)
export async function getTopList({ type = "properties", limit = 5 }) {
  let key;
  if (type === "locations") key = { $ifNull: ["$stay.location", "$location"] };
  else key = { $ifNull: ["$stay.propertyName", "$propertyName"] };

  const rows = await Booking.aggregate([
    {
      $project: {
        k: key,
        amount: coalesceAmount,
        nights: {
          $dateDiff: {
            startDate: coalesceCheckIn,
            endDate: coalesceCheckOut,
            unit: "day",
          },
        },
      },
    },
    {
      $group: {
        _id: "$k",
        revenue: { $sum: "$amount" },
        bookings: { $sum: 1 },
        nights: { $sum: "$nights" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({
    key: r._id || "Unknown",
    revenue: r.revenue || 0,
    bookings: r.bookings || 0,
    nights: r.nights || 0,
  }));
}

// HEATMAP (use checkInDate/stay.checkIn)
export async function getHeatmapGrid({ year }) {
  const from = new Date(`${year}-01-01T00:00:00.000Z`);
  const to = new Date(`${year}-12-31T23:59:59.999Z`);
  const rows = await Booking.aggregate([
    { $match: { createdAt: between(from, to) } },
    {
      $project: {
        ci: coalesceCheckIn,
        nights: {
          $dateDiff: {
            startDate: coalesceCheckIn,
            endDate: coalesceCheckOut,
            unit: "day",
          },
        },
      },
    },
    {
      $project: {
        month: { $month: "$ci" },
        dow: { $dayOfWeek: "$ci" },
        nights: 1,
      },
    },
    {
      $group: {
        _id: { m: "$month", d: "$dow" },
        bookedNights: { $sum: "$nights" },
      },
    },
    { $sort: { "_id.m": 1, "_id.d": 1 } },
  ]);

  const grid = Array.from({ length: 12 }, (_, m) => ({
    month: m + 1,
    days: Array.from({ length: 7 }, (_, d) => ({ dow: d + 1, value: 0 })),
  }));
  for (const r of rows) {
    grid[r._id.m - 1].days[r._id.d - 1].value = r.bookedNights || 0;
  }
  return { year, grid };
}
