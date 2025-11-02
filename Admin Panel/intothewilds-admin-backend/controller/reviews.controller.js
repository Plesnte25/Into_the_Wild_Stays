import mongoose from "mongoose";
import Review from "../models/Review.js";
import Property from "../models/Property.js";
import ReviewReply from "../models/ReviewReply.js";

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};

const buildMatch = ({ search, property, rating, visibility }) => {
  const match = {};
  // visibility: visible | hidden | all
  if (visibility === "hidden") match.hidden = true;
  else if (visibility === "visible" || !visibility)
    match.hidden = { $ne: true };
  // property
  if (property && property !== "all") {
    const pid = toObjectId(property);
    if (pid) match.property = pid;
  }
  // rating
  if (rating && rating !== "all") {
    const r = Number(rating);
    if (!Number.isNaN(r)) match.rating = r;
  }
  // search on comment + userName (regex)
  if (search && search.trim()) {
    match.$or = [
      { comment: { $regex: search.trim(), $options: "i" } },
      { userName: { $regex: search.trim(), $options: "i" } },
    ];
  }
  return match;
};

// -------- List (paged) --------
export const listReviews = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "12", 10), 1);
    const skip = (page - 1) * limit;

    const filters = {
      search: req.query.search || "",
      property: req.query.property || "all",
      rating: req.query.rating || "all",
      visibility: req.query.visibility || "visible", // NEW
    };
    const match = buildMatch(filters);

    const [items, total] = await Promise.all([
      Review.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "property", select: "name" })
        .lean(),
      Review.countDocuments(match),
    ]);

    return res.json({ items, total });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to load reviews" });
  }
};

// -------- Stats (all props, default 3.0) --------
export const reviewsStats = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || "",
      property: req.query.property || "all",
      rating: req.query.rating || "all",
      // For stats, default to visible reviews; you can pass visibility=all/hidden if you want.
      visibility: req.query.visibility || "visible",
    };
    const match = buildMatch(filters);

    // Aggregate over matched reviews
    const [agg] = await Review.aggregate([
      { $match: match },
      {
        $facet: {
          meta: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                overall: { $avg: "$rating" },
              },
            },
          ],
          distribution: [{ $group: { _id: "$rating", count: { $sum: 1 } } }],
          perProperty: [
            {
              $group: {
                _id: "$property",
                average: { $avg: "$rating" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // Distribution 1..5
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of agg?.distribution || []) {
      if (r?._id) dist[r._id] = r.count;
    }
    const total = Number(agg?.meta?.[0]?.total || 0);
    const overall = Number(agg?.meta?.[0]?.overall || 0);

    // Merge with ALL properties; default average 3.0 if no reviews
    const props = await Property.find({}, { name: 1 }).sort({ name: 1 }).lean();
    const byId = new Map(
      (agg?.perProperty || []).map((x) => [String(x._id), x])
    );

    const propertyAverages = props.map((p) => {
      const hit = byId.get(String(p._id));
      return {
        property: { _id: p._id, name: p.name },
        average: hit ? Number(hit.average || 0) : 3.0,
        count: hit ? Number(hit.count || 0) : 0,
      };
    });

    return res.json({
      overall,
      total,
      ratingDistribution: dist,
      propertyAverages,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to compute stats" });
  }
};

// -------- Patch/Hide/Show --------
export const patchReview = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const doc = await Review.findByIdAndUpdate(id, update, { new: true })
      .populate({ path: "property", select: "name" })
      .lean();
    if (!doc) return res.status(404).json({ message: "Review not found" });
    return res.json(doc);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to update review" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    await ReviewReply.deleteMany({ reviewId: id }); // cascade
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to delete review" });
  }
};

// -------- Replies --------
export const listReplies = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await ReviewReply.find({ reviewId: id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to load replies" });
  }
};

export const createReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }
    const createdBy = {
      _id: req.user?._id || undefined,
      name: req.user?.name || req.user?.email || "Admin",
    };
    const reply = await ReviewReply.create({
      reviewId: id,
      message: message.trim(),
      createdBy,
    });
    return res.status(201).json(reply);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to create reply" });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;
    const reply = await ReviewReply.findOneAndDelete({
      _id: replyId,
      reviewId: id,
    });
    if (!reply) return res.status(404).json({ message: "Reply not found" });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to delete reply" });
  }
};
