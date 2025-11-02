// src/context/BookingContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
export const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [criteria, setCriteria] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("itw.booking")) || {
          location: "",
          checkIn: "",
          checkOut: "",
          adults: 1,
          children: 0,
        }
      );
    } catch {
      return {
        location: "",
        checkIn: "",
        checkOut: "",
        adults: 1,
        children: 0,
      };
    }
  });
  useEffect(() => {
    sessionStorage.setItem("itw.booking", JSON.stringify(criteria));
  }, [criteria]);

  const booking = criteria;
  const updateBooking = (updates) =>
    setCriteria((prev) => ({ ...prev, ...updates }));

  return (
    <BookingContext.Provider
      value={{ criteria, setCriteria, booking, updateBooking }}
    >
      {children}
    </BookingContext.Provider>
  );
}
export const useBooking = () => useContext(BookingContext);
