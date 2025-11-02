import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    type: { type: String }, // 'pull' | 'push'
    channel: { type: String },
    mapping: { type: mongoose.Schema.Types.ObjectId, ref: "ChannelMapping" },
    payload: { type: Object },
    response: { type: Object },
    ok: { type: Boolean, default: true },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("SyncLog", schema);
