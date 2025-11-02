// src/models/channel.js  (ESM)
import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const ChannelAccountSchema = new Schema(
  {
    channel: { type: String, required: true }, // 'booking', 'airbnb_ical', etc.
    name: String,
    creds: Object, // API keys / credentials
  },
  { timestamps: true }
);

const ChannelMappingSchema = new Schema(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "ChannelAccount",
      required: true,
    },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    remote: {
      hotelId: String,
      roomTypeId: String,
      ratePlanId: String,
      listingId: String, // Airbnb listing id
      icalUrl: String, // Airbnb inbound iCal
    },
    sync: {
      rates: { type: Boolean, default: true },
      availability: { type: Boolean, default: true },
      restrictions: { type: Boolean, default: false },
      content: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Export or reuse compiled models (prevents OverwriteModelError)
export const ChannelAccount =
  models.ChannelAccount || model("ChannelAccount", ChannelAccountSchema);

export const ChannelMapping =
  models.ChannelMapping || model("ChannelMapping", ChannelMappingSchema);
