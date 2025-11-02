import dayjs from "dayjs";
import {
  getSummaryMetrics,
  getTrendsSeries,
  getTopList,
  getHeatmapGrid,
} from "../services/analytics.service.js";
import { withCache } from "../services/cache.service.js";
import { exportCSV, exportPDF } from "../services/export.service.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Property from "../models/Property.js";

const ttl = Number(process.env.DASHBOARD_CACHE_TTL || 900); // seconds

const coalesceAmount = {
  $cond: [
    { $gt: ["$price.netReceivable", null] },
    "$price.netReceivable",
    { $ifNull: ["$amount", 0] },
  ],
};

const ci = {
  $cond: [{ $gt: ["$stay.checkIn", null] }, "$stay.checkIn", "$checkInDate"],
};
const co = {
  $cond: [{ $gt: ["$stay.checkOut", null] }, "$stay.checkOut", "$checkOutDate"],
};

const toDate = (s, fallback) => (s ? new Date(s) : fallback);
const between = (from, to) => ({ $gte: from, $lte: to });

export async function getSummary(req, res, next) {
  try {
    const from = toDate(req.query.from, new Date("1970-01-01"));
    const to = toDate(req.query.to, new Date("2999-12-31"));

    // 1) bookings summary
    const summary = await Booking.aggregate([
      { $match: { createdAt: between(from, to) } },
      { $project: { amount: coalesceAmount, ci, co, status: 1 } },
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
          revenue: { $sum: "$amount" },
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
          bookedNights: { $sum: "$nights" },
        },
      },
    ]);
    const s = summary?.[0] || {
      revenue: 0,
      totalBookings: 0,
      cancelled: 0,
      confirmed: 0,
      checkedIn: 0,
      checkedOut: 0,
      bookedNights: 0,
    };

    // 2) payments (captured/refunds)
    const payAgg = await Payment.aggregate([
      { $match: { createdAt: between(from, to) } },
      {
        $group: {
          _id: "$status",
          amount: { $sum: "$amount" },
        },
      },
    ]);
    const paid = +(payAgg.find((r) => r._id === "captured")?.amount || 0);
    const refunds = +(
      payAgg.find((r) => (r._id || "").includes("refund"))?.amount || 0
    );
    const net = paid - refunds;

    // 3) sellable nights (rooms * daysInRange)
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysInRange = Math.max(1, Math.round((to - from) / msPerDay) + 1);

    let sellableNights = 0;
    try {
      const props = await Property.aggregate([
        { $project: { rooms: { $ifNull: ["$rooms", 1] } } },
        { $group: { _id: null, totalRooms: { $sum: "$rooms" } } },
      ]);
      const totalRooms = +(props?.[0]?.totalRooms || 0);
      sellableNights = totalRooms * daysInRange;
    } catch {
      // if Property model not available, assume 1 room total
      sellableNights = 1 * daysInRange;
    }

    const occupancy = sellableNights ? s.bookedNights / sellableNights : 0;
    const adr = s.bookedNights ? s.revenue / s.bookedNights : 0;
    const cancellationRate = s.totalBookings
      ? s.cancelled / s.totalBookings
      : 0;

    res.json({
      range: { from, to, daysInRange },
      revenue: s.revenue,
      netRevenue: net,
      bookings: {
        total: s.totalBookings,
        cancelled: s.cancelled,
        confirmed: s.confirmed,
        checkedIn: s.checkedIn,
        checkedOut: s.checkedOut,
      },
      nights: { booked: s.bookedNights, sellable: sellableNights, occupancy },
      adr,
      cancellationRate,
      payments: { captured: paid, refunds, net },
    });
  } catch (e) {
    next(e);
  }
}

export async function getTrends(req, res, next) {
  try {
    const from = toDate(req.query.from, new Date("1970-01-01"));
    const to = toDate(req.query.to, new Date("2999-12-31"));
    const gran = (req.query.gran || "day").toLowerCase(); // 'day' | 'month'
    const unit = gran === "month" ? "month" : "day";

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

    res.json(
      rows.map((r) => ({
        date: r._id,
        revenue: r.revenue,
        bookings: r.bookings,
      }))
    );
  } catch (e) {
    next(e);
  }
}

export async function getTop(req, res, next) {
  try {
    const type = (req.query.type || "properties").toLowerCase(); // 'properties' | 'locations'
    const limit = Math.max(
      1,
      Math.min(20, parseInt(req.query.limit || "5", 10))
    );
    const key =
      type === "locations"
        ? { $ifNull: ["$stay.location", "$location"] }
        : { $ifNull: ["$stay.propertyName", "$propertyName"] };

    const rows = await Booking.aggregate([
      {
        $project: {
          k: key,
          amount: coalesceAmount,
          nights: { $dateDiff: { startDate: ci, endDate: co, unit: "day" } },
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

    res.json(
      rows.map((r) => ({
        key: r._id || "Unknown",
        revenue: r.revenue || 0,
        bookings: r.bookings || 0,
        nights: r.nights || 0,
      }))
    );
  } catch (e) {
    next(e);
  }
}

export async function getHeatmap(req, res, next) {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear());
    const key = `heatmap:${year}`;
    const data = await withCache(key, ttl, () => getHeatmapGrid({ year }));
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function getExport(req, res, next) {
  try {
    const format = (req.query.format || "csv").toLowerCase(); // csv|pdf
    const from = req.query.from
      ? dayjs(req.query.from)
      : dayjs().subtract(30, "day");
    const to = req.query.to ? dayjs(req.query.to) : dayjs();

    const [summary, trends] = await Promise.all([
      getSummaryMetrics({ from: from.toDate(), to: to.toDate() }),
      getTrendsSeries({
        from: from.toDate(),
        to: to.toDate(),
        granularity: "day",
      }),
    ]);

    if (format === "pdf") {
      const buf = await exportPDF({
        summary,
        trends,
        from: from.toDate(),
        to: to.toDate(),
      });
      const fname = `itw-dashboard-${from.format("YYYYMMDD")}-${to.format(
        "YYYYMMDD"
      )}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${fname}"`);
      return res.send(buf);
    }

    const csv = exportCSV({
      summary,
      trends,
      from: from.toDate(),
      to: to.toDate(),
    });
    const fname = `itw-dashboard-${from.format("YYYYMMDD")}-${to.format(
      "YYYYMMDD"
    )}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fname}"`);
    res.send(csv);
  } catch (e) {
    next(e);
  }
}
