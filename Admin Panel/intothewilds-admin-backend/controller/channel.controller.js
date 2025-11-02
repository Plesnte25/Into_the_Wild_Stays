// src/controller/channel.controller.js
import mongoose from "mongoose";
import { getChannelAdapter } from "../services/channel/index.js";

const { Schema } = mongoose;

// === Models (declare once) ===
const AccountSchema =
  mongoose.models.ChannelAccount?.schema ||
  new Schema(
    {
      provider: { type: String, required: true }, // 'gommt'
      channel: { type: String, default: "go-mmt" },
      name: { type: String },
      credentials: {
        hotelCode: String,
        accessToken: String,
        baseUrl: String,
      },
    },
    { timestamps: true }
  );

const MappingSchema =
  mongoose.models.ChannelMapping?.schema ||
  new Schema(
    {
      provider: { type: String, required: true }, // 'gommt'
      property: {
        type: Schema.Types.ObjectId,
        ref: "Property",
        required: true,
      },
      account: {
        type: Schema.Types.ObjectId,
        ref: "ChannelAccount",
        required: true,
      },
      remote: {
        hotelId: String,
        roomTypeId: String,
        ratePlanId: String,
      },
      sync: {
        rates: { type: Boolean, default: true },
        availability: { type: Boolean, default: true },
        restrictions: { type: Boolean, default: true },
        content: { type: Boolean, default: false },
      },
    },
    { timestamps: true }
  );

export const ChannelAccount =
  mongoose.models.ChannelAccount ||
  mongoose.model("ChannelAccount", AccountSchema);
export const ChannelMapping =
  mongoose.models.ChannelMapping ||
  mongoose.model("ChannelMapping", MappingSchema);

// === Accounts ===
export async function listAccounts(req, res) {
  const docs = await ChannelAccount.find().lean();
  res.json({ ok: true, data: docs });
}

export async function createAccount(req, res) {
  const { provider, channel = "go-mmt", name, credentials } = req.body || {};
  if (!provider || provider !== "gommt")
    return res
      .status(400)
      .json({ ok: false, message: "provider must be 'gommt'" });
  if (!credentials?.hotelCode || !credentials?.accessToken)
    return res
      .status(400)
      .json({ ok: false, message: "hotelCode and accessToken required" });

  const doc = await ChannelAccount.create({
    provider,
    channel,
    name,
    credentials,
  });
  res.json({ ok: true, data: doc });
}

// === Mappings ===
export async function listMappings(req, res) {
  const q = {};
  if (req.query.property) q.property = req.query.property;
  const docs = await ChannelMapping.find(q).populate("account").lean();
  res.json({ ok: true, data: docs });
}

export async function createMapping(req, res) {
  const {
    provider,
    property,
    account,
    remote = {},
    sync = {},
  } = req.body || {};
  if (!provider || !property) {
    return res
      .status(400)
      .json({ ok: false, message: "property and provider required" });
  }
  const acc = await ChannelAccount.findById(account);
  if (!acc)
    return res.status(400).json({ ok: false, message: "account not found" });

  const doc = await ChannelMapping.create({
    provider,
    property,
    account,
    remote: {
      hotelId: remote.hotelId || acc.credentials?.hotelCode || "",
      roomTypeId: remote.roomTypeId || "",
      ratePlanId: remote.ratePlanId || "",
    },
    sync: {
      rates: !!sync.rates,
      availability: !!sync.availability,
      restrictions: !!sync.restrictions,
      content: !!sync.content,
    },
  });
  const populated = await ChannelMapping.findById(doc._id)
    .populate("account")
    .lean();
  res.json({ ok: true, data: populated });
}

export async function updateMapping(req, res) {
  const { id } = req.params;
  const patch = req.body || {};
  const updated = await ChannelMapping.findByIdAndUpdate(id, patch, {
    new: true,
  })
    .populate("account")
    .lean();
  res.json({ ok: true, data: updated });
}

export async function deleteMapping(req, res) {
  const { id } = req.params;
  await ChannelMapping.findByIdAndDelete(id);
  res.json({ ok: true, data: true });
}

// === Sync (queue-less direct fire, we still call queue facade) ===
import { addSyncJob } from "../jobs/syncQueue.js";

export async function syncOneMapping(req, res) {
  const { id } = req.params;
  const scope = req.body?.scope || { rates: true, availability: true };
  await addSyncJob({ mappingId: id, scope });
  res.json({ ok: true, data: { queued: true } });
}

// Helper used by the queue
export async function performSyncJob({ mappingId, scope }) {
  const mapping = await ChannelMapping.findById(mappingId)
    .populate("account")
    .lean();
  if (!mapping) throw new Error("Mapping not found");

  const adapter = getChannelAdapter(mapping.provider, mapping.account);

  // For demo: push availability today..+1
  const today = new Date();
  const dates = [today.toISOString().slice(0, 10)];
  if (scope?.availability && mapping.sync?.availability) {
    await adapter.pushAvailability(mapping, { dates, allotment: 3 });
  }
  if (scope?.rates && mapping.sync?.rates) {
    await adapter.pushRates(mapping, { dates, rate: 5000 });
  }
  if (scope?.restrictions && mapping.sync?.restrictions) {
    await adapter.pushRestrictions(mapping, { dates, closed: false });
  }
}

// Preveiw Mapping (Mock Test)
export async function previewMapping(req, res) {
  const { id } = req.params;
  const mapping = await ChannelMapping.findById(id).populate("account").lean();
  if (!mapping)
    return res.status(404).json({ ok: false, message: "Mapping not found" });

  // Only available for mock baseUrl; in production this will be disabled or return OTA data if API supports it.
  const baseUrl = mapping.account?.credentials?.baseUrl || "";
  if (!/localhost:5009|gommt-mock/i.test(baseUrl)) {
    return res.json({
      ok: true,
      data: { note: "Preview available only in mock mode." },
    });
  }

  const adapter = getChannelAdapter2(mapping.provider, mapping.account);
  const debug = await adapter.debugState(); // { ok, data: state }
  res.json({ ok: true, data: debug?.data || {} });
}
