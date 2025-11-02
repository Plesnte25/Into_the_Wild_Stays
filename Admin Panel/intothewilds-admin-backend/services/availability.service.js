// server/services/availability.service.js
import Booking from "../models/Booking.js";

// Checks overlap against confirmed/checked_in/checked_out and active holds (pending + not expired)
export async function computeAvailability({
  propertyId,
  checkIn,
  checkOut,
  inv,
}) {
  const units = inv.units || 1;

  const overlap = {
    "stay.propertyId": propertyId,
    $or: [
      { "stay.checkIn": { $lt: checkOut }, "stay.checkOut": { $gt: checkIn } }, // basic overlap
    ],
    $and: [
      // status that occupies or holds stock
      {
        $or: [
          { status: "confirmed" },
          { status: "checked_in" },
          { status: "checked_out" },
          { status: "pending", holdExpiresAt: { $gt: new Date() } },
        ],
      },
    ],
  };

  const count = await Booking.countDocuments(overlap);
  const remaining = Math.max(0, units - count);
  if (remaining <= 0)
    return { available: false, reason: "Sold out", remainingUnits: 0 };

  // min-stay & blackouts
  const nights = Math.max(
    1,
    Math.ceil((checkOut - checkIn) / (24 * 3600 * 1000))
  );
  if ((inv.minStay || 1) > nights)
    return {
      available: false,
      reason: "Min-stay not met",
      remainingUnits: remaining,
    };

  const blocked = (inv.blackouts || []).some(
    (b) =>
      (b.from <= checkIn && b.to >= checkIn) ||
      (b.from < checkOut && b.to >= checkOut) ||
      (b.from >= checkIn && b.to <= checkOut)
  );
  if (blocked)
    return { available: false, reason: "Blackout", remainingUnits: remaining };

  return { available: true, remainingUnits: remaining };
}
