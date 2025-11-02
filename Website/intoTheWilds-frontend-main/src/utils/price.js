exports.makeNights = (checkIn, checkOut) => {
  const nights = [];
  let d = new Date(checkIn);
  while (d < checkOut) {
    nights.push(new Date(d));
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  }
  return nights;
};

exports.roomsNeeded = (adults, children, perRoomCapacity /* e.g. 3 */) => {
  const totalGuests = adults + children;
  return Math.max(1, Math.ceil(totalGuests / perRoomCapacity));
};

exports.buildPricing = ({ price, nights, rooms }) => {
  const perNight = nights.map((date) => ({ date, rate: price, rooms }));
  const subtotal = perNight.reduce((t, n) => t + n.rate * n.rooms, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  const payNow = Math.round(total * 0.2); // 20% advance
  return { perNight, subtotal, tax, total, payNow };
};
