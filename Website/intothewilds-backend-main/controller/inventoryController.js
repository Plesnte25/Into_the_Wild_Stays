const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Inventory = require("../models/Inventory");
const Properties = require("../models/Properties");

function startOfDayUTC(d) {
  const dt = new Date(d);
  return new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
  );
}

function enumerateDays(start, end) {
  const out = [];
  let cursor = startOfDayUTC(start);
  const last = startOfDayUTC(end);
  while (cursor < last) {
    out.push(cursor);
    cursor = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() + 1
      )
    );
  }
  return out;
}

// GET /inventory/availability?propertyId&start&end&rooms
exports.checkAvailability = async (req, res) => {
  try {
    const { propertyId, start, end, rooms = 1 } = req.query;
    if (!propertyId || !start || !end) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing propertyId/start/end" });
    }

    const startDate = startOfDayUTC(new Date(start));
    const endDate = startOfDayUTC(new Date(end));
    if (!(startDate < endDate)) {
      return res.status(400).json({ ok: false, message: "Invalid date range" });
    }

    const days = enumerateDays(startDate, endDate);
    if (days.length === 0) {
      return res.json({
        ok: false,
        message: "Zero nights selected",
        dates: [],
      });
    }

    // Determine default total rooms from property (fallback to 4 to avoid 500s)
    const prop = await Properties.findById(propertyId).lean().exec();
    const defaultTotalRooms =
      prop && prop.maximumCapacity && prop.guestCapacity
        ? Math.max(1, Math.ceil(prop.maximumCapacity / prop.guestCapacity))
        : 4;

    // Ensure inventory docs exist (idempotent upsert per day)
    for (const day of days) {
      await Inventory.updateOne(
        { property: propertyId, date: day },
        { $setOnInsert: { totalRooms: defaultTotalRooms, bookedRooms: 0 } },
        { upsert: true }
      );
    }

    // Load fresh inventory window and evaluate availability
    const windowInv = await Inventory.find({
      property: propertyId,
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    // Guarantee we return an entry per requested day
    const map = new Map(
      windowInv.map((i) => [startOfDayUTC(i.date).getTime(), i])
    );
    const availability = days.map((day) => {
      const i = map.get(day.getTime());
      const available =
        (i?.totalRooms || defaultTotalRooms) - (i?.bookedRooms || 0);
      return { date: day, available };
    });

    const need = Number(rooms) || 1;
    const ok = availability.every((a) => a.available >= need);

    return res.json({ ok, dates: availability });
  } catch (e) {
    console.error("[availability] error:", e);
    return res
      .status(500)
      .json({ ok: false, message: e.message || "Server error" });
  }
};

// Create a room
exports.createRoom = async (req, res) => {
  try {
    const { type, capacity, price, availability } = req.body;
    const newRoom = new Room({ type, capacity, price, availability });
    await newRoom.save();
    res
      .status(201)
      .json({ message: "Room added successfully!", room: newRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get-inventory
exports.getInventory = async (req, res) => {
  try {
    const { userId } = req.query;
    const inventory = await Room.find();
    if (!userId) {
      return res.status(200).json(inventory);
    }
    const bookings = await Booking.find({
      user: userId,
      room: { $exists: true },
    });
    // Filter out rooms that are in bookings
    const availableRooms = inventory.filter((room) => {
      return !bookings.some(
        (booking) => booking.room.toString() === room._id.toString()
      );
    });

    res.status(200).json(availableRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update inventory
exports.updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const updates = req.body;

    const room = await Room.findByIdAndUpdate(roomId, updates, { new: true });
    if (!room) return res.status(404).json({ error: "Room not found." });

    res.status(200).json({ message: "Room updated successfully!", room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove room
exports.removeRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByIdAndDelete(roomId);
    if (!room) return res.status(404).json({ error: "Room not found." });

    res.status(200).json({ message: "Room removed successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
