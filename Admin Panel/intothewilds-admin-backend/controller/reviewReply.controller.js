import mongoose from "mongoose";
import ReviewReply from "../models/ReviewReply.js";

export async function listReplies(req, res, next) {
  try {
    const { id: reviewId } = req.params;
    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }
    const items = await ReviewReply.find(
      { reviewId, hidden: { $ne: true } },
      {}
    )
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (e) {
    next(e);
  }
}

export async function createReply(req, res, next) {
  try {
    const { id: reviewId } = req.params;
    const { message } = req.body || {};
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }
    const doc = await ReviewReply.create({
      reviewId,
      message: message.trim(),
      createdBy: {
        _id: req.user?._id, // if you attach user in auth middleware
        name: req.user?.name || "Admin",
      },
    });
    res.status(201).json(doc.toObject());
  } catch (e) {
    next(e);
  }
}

export async function deleteReply(req, res, next) {
  try {
    const { replyId } = req.params;
    if (!mongoose.isValidObjectId(replyId)) {
      return res.status(400).json({ message: "Invalid reply id" });
    }
    await ReviewReply.deleteOne({ _id: replyId });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
