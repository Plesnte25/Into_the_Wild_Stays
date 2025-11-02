const Property = require("../models/Properties.js");
const {
  nightsBetween,
  calcRoomsNeeded,
  calcSubtotal,
  calcTaxesAndFees,
} = require("../utils/checkoutMath"); // <-- FIXED import

async function getCheckoutSummary(req, res, next) {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
    } = req.query;

    const property = await Property.findById(propertyId).lean();
    if (!property) return res.status(404).json({ error: "Property not found" });

    const nights = nightsBetween(checkIn, checkOut);
    if (nights <= 0)
      return res.status(400).json({ error: "Invalid date range" });

    const a = Number(adults);
    const c = Number(children);

    // Prefer property.guestCapacity (capacity per room) if present
    const roomsNeeded = calcRoomsNeeded({
      adults: a,
      children: c,
      capacityPerRoom: property.guestCapacity, // falls back to default rule if falsy
    });

    const subtotal = calcSubtotal({
      pricePerNight: property.price || 0,
      nights,
      roomsNeeded,
    });

    const { tax, total, payNow } = calcTaxesAndFees(subtotal);

    return res.json({
      property: {
        _id: property._id,
        name: property.name,
        location: property.location,
        price: property.price,
      },
      inputs: {
        checkIn,
        checkOut,
        adults: a,
        children: c,
        guests: a + c,
        nights,
        roomsNeeded,
      },
      money: { subtotal, tax, total, payNow },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getCheckoutSummary };
