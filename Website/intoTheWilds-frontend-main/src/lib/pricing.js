import dayjs from "dayjs";

export function nightsBetween(checkIn, checkOut) {
  return Math.max(1, dayjs(checkOut).diff(dayjs(checkIn), "day"));
}

export function calcRoomsNeeded({ guests, capacityPerRoom }) {
  // ceil guests/capacity (adults+children count as guests; tweak if children rules differ)
  return Math.max(1, Math.ceil(guests / capacityPerRoom));
}

export function calcSubtotal({ pricePerNight, nights, roomsNeeded }) {
  return pricePerNight * nights * roomsNeeded;
}

export function calcTaxesAndFees(subtotal) {
  // example: 9% CGST + 9% SGST + flat convenience ₹99
  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);
  const fee = 99;
  return { cgst, sgst, fee, total: subtotal + cgst + sgst + fee };
}
