import { useState, useEffect } from "react";
import { useContext } from "react";
import { useBooking } from "@/context/BookingContext";
import {
  FaCalendarAlt,
  FaUserFriends,
  FaMinus,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import { motion } from "framer-motion";

const LOCATIONS = ["Dhanolti", "Goa", "Majuli", "Rishikesh", "Tehri"];

export default function BookingBar({ onSearch, compact = false }) {
  const { booking, updateBooking } = useBooking();
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateBooking({ [name]: value });
  };

  const today = new Date().toISOString().split("T")[0];
  const [guestOpen, setGuestOpen] = useState(false);

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 w-full"
    >
      <div className="hidden md:grid grid-cols-12 gap-3 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-2xl">
        {/* Location */}
        <div className="col-span-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Location
          </label>
          <select
            name="location"
            value={booking.location}
            onChange={handleChange}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select Location</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Check-in
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              name="checkIn"
              min={booking.checkIn || today}
              value={booking.checkIn}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Check-out
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              name="checkOut"
              min={booking.checkOut}
              value={booking.checkOut}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Guests (Adults + Children) */}
        <div className="col-span-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Guests
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setGuestOpen((s) => !s)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              <span className="inline-flex items-center gap-2 text-gray-700">
                <FaUserFriends className="text-gray-400" />
                {`${booking.adults} Adult${booking.adults > 1 ? "s" : ""}, ${
                  booking.children
                } Child${booking.children !== 1 ? "ren" : ""}`}
              </span>
              <span className="text-sm text-gray-500">Edit</span>
            </button>

            {guestOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl p-4">
                {/* Adults row */}
                <div className="flex items-center justify-between py-2">
                  <div className="font-semibold text-gray-700">
                    Adults (12+)
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                      onClick={() =>
                        updateBooking({
                          adults: Math.max(1, booking.adults - 1),
                        })
                      }
                    >
                      <FaMinus />
                    </button>
                    <span className="w-6 text-center">{booking.adults}</span>
                    <button
                      type="button"
                      className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                      onClick={() =>
                        updateBooking({
                          adults: Math.min(10, booking.adults + 1),
                        })
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Children row */}
                <div className="flex items-center justify-between py-2">
                  <div className="font-semibold text-gray-700">
                    Children (Under 12)
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                      onClick={() =>
                        updateBooking({
                          children: Math.max(0, booking.children - 1),
                        })
                      }
                    >
                      <FaMinus />
                    </button>
                    <span className="w-6 text-center">{booking.children}</span>
                    <button
                      type="button"
                      className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                      onClick={() =>
                        updateBooking({
                          children: Math.min(10, booking.children + 1),
                        })
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      updateBooking({
                        adults: 1,
                        children: 0,
                      });
                      setGuestOpen(false);
                    }}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700"
                    onClick={() => setGuestOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="col-span-2 flex items-end">
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md"
          >
            Search
          </button>
        </div>
      </div>
    </motion.form>
  );
}
