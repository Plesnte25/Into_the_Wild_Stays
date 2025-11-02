// src/services/channel/airbnb-ical.js (ESM)
import axios from "axios";
import { parseIcsUrl } from "../../utils/ical.js";

/**
 * Expected creds for this account (ChannelAccount.creds):
 *   { }
 * Expected mapping.remote:
 *   { listingId?: string, icalUrl: string }
 */
export const airbnbIcalAdapter = {
  key: "airbnb_ical",

  async pull({ mapping }) {
    const icalUrl = mapping.remote?.icalUrl;
    if (!icalUrl) {
      console.warn("[airbnb_ical] No iCal URL on mapping.remote.icalUrl");
      return;
    }

    // 1) Download iCal
    const { data: icsText } = await axios.get(icalUrl, { timeout: 15000 });

    // 2) Parse ICS -> array of events { start, end, summary, ... }
    const events = parseIcsUrl(icsText);

    // 3) Translate events to “blocks” in your own PMS (pseudo)
    // Here we only log. In a real integration, upsert reservations/blocks in your DB.
    console.log(
      `[airbnb_ical] Imported ${events.length} events for property ${mapping.property}`
    );

    // Example:
    // await AvailabilityService.blockDates({
    //   propertyId: mapping.property,
    //   source: 'airbnb',
    //   events,
    // });

    return;
  },

  // Not supported by Airbnb iCal
  async pushAvailability() {
    console.log("[airbnb_ical] pushAvailability not supported");
  },
  async pushRates() {
    console.log("[airbnb_ical] pushRates not supported");
  },
  async pushRestrictions() {
    console.log("[airbnb_ical] pushRestrictions not supported");
  },
  async pushContent() {
    console.log("[airbnb_ical] pushContent not supported");
  },
};
