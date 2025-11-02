import ical from "node-ical";
import axios from "axios";

export async function parseIcsUrl(url) {
  const res = await axios.get(url);
  const data = ical.parseICS(res.data);
  const events = [];
  for (const k in data) {
    const e = data[k];
    if (e.type === "VEVENT") {
      events.push({
        uid: e.uid,
        summary: e.summary,
        start: e.start,
        end: e.end,
        nights: Math.max(
          1,
          Math.ceil((e.end - e.start) / (1000 * 60 * 60 * 24))
        ),
      });
    }
  }
  return events;
}
