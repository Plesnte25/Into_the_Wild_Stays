// utils/checkoutMath.js

// Safe days diff (00:00 times, no TZ drift)
function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn),
    b = new Date(checkOut);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = (b - a) / 86400000;
  return Number.isFinite(diff) && diff > 0 ? diff : 0;
}

/**
 * Rooms rule:
 * - If capacityPerRoom provided (e.g. property.guestCapacity), use:
 *     ceil((adults + children) / capacityPerRoom)
 * - Otherwise default hotel rule: 2 adults + 1 child per room
 */
function calcRoomsNeeded(opts = {}) {
  const adults = Number(opts.adults ?? 1);
  const children = Number(opts.children ?? 0);
  const cap = Number(opts.capacityPerRoom || 0);

  if (cap > 0) {
    return Math.max(1, Math.ceil((adults + children) / cap));
  }

  const adultsPerRoom = Number(opts.adultsPerRoom ?? 2);
  const childrenPerRoom = Number(opts.childrenPerRoom ?? 1);

  const adultRooms = Math.ceil(adults / adultsPerRoom);
  const childRooms = Math.ceil(
    Math.max(0, children - adultRooms * childrenPerRoom) / childrenPerRoom
  );
  return Math.max(1, adultRooms + childRooms);
}

function calcSubtotal({ pricePerNight = 0, nights = 0, roomsNeeded = 1 }) {
  return Math.max(
    0,
    Math.round(Number(pricePerNight) * Number(nights) * Number(roomsNeeded))
  );
}

function calcTaxesAndFees(subtotal = 0) {
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + tax;
  const payNow = Math.round(total * 0.2); // 20% advance
  return { tax, total, payNow };
}

module.exports = {
  nightsBetween,
  calcRoomsNeeded,
  calcSubtotal,
  calcTaxesAndFees,
};
