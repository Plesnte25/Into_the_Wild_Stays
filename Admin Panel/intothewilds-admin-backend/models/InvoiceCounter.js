import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "invoice" },
  seq: { type: Number, default: 0 },
});

counterSchema.statics.next = async function () {
  const doc = await this.findOneAndUpdate(
    { key: "invoice" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return doc.seq;
};

export default mongoose.model("InvoiceCounter", counterSchema);
