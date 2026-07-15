# Known Issues / Unfinished Features

This file tracks work that was intentionally left unfinished during the
`fix/audit-and-hardening` pass because it needs real third-party credentials
or a product decision that isn't ours to make — as opposed to being silently
broken. Everything else found in the original audit (bugs, missing auth,
hardcoded secrets, broken imports, etc.) was fixed directly in code.

## 1. Payments are not live (Razorpay)

`controller/bookingController.js` (`newBooking`) does not call the Razorpay
API. It creates a fake local order (`order_test_<timestamp>`) and persists
the booking as `status: "pending"` — no money is ever actually charged.

To finish this:
1. Obtain real Razorpay `key_id` / `key_secret` and set `RAZORPAY_KEY_ID` /
   `RAZORPAY_KEY_SECRET` in the environment (see `.env.example`).
2. In `newBooking`, replace the fake `order` object with a real
   `new Razorpay({ key_id, key_secret }).orders.create({...})` call.
3. Add a payment-confirmation endpoint that verifies the Razorpay signature
   (HMAC over `order_id|payment_id` with the key secret) before flipping
   `Booking.status` from `"pending"` to `"paid"`. Right now nothing ever
   transitions a booking out of `"pending"`.
4. Decide whether/how to send the booking-confirmation email — see
   `utils/email.js` (`sendBookingEmail`), which exists but is not currently
   called from anywhere.

## 2. Reservations feature is unmounted

`routes/reservationRoute.js` and `controller/reservationController.js`
exist but `server.js` never does `app.use(".../reservations", reservationRoute)`,
so none of this is reachable over HTTP.

Additionally, the controller's exported function names
(`getUserBookings`, `updateBooking`, `getByRange`) don't match what the
route file looks for (`listReservations`, `getReservation`,
`createReservation`) — the route file has a defensive `try/catch` around the
`require()` specifically to fall back to `501 Not Implemented` stubs when
this happens, so requests to it (once mounted) will mostly 501 rather than
crash. The previous fatal syntax errors in the controller (a require of a
nonexistent `utils/catchAsync`, an undeclared `dayjs` call, and a dangling
top-level code fragment) have been cleaned up so the file at least loads
correctly, but the feature itself has not been built out.

To finish this: settle on one controller API, implement it, add
auth middleware (list/detail probably need at least `authenticateToken`),
and mount the router in `server.js`.

## 3. Airbnb iCal sync is unmounted

`routes/calendarRoutes.js` and `controller/calendarController.js` implement
pulling bookings from an Airbnb iCal feed, but this router is also never
mounted in `server.js`. Its endpoints (`addIcalLink`, `bookings` refresh)
also have no auth middleware at all — before mounting it, at minimum gate
the write endpoints behind `authenticateToken` + `authorizeRole("admin")`,
the same pattern used in `routes/inventoryRoute.js`.

## 4. No automated test suite

`npm test` currently just echoes a placeholder. There is no test framework
configured (no Jest/Mocha/etc.) and no test files anywhere in the repo. This
was out of scope for this pass but is worth flagging for future work,
especially around the booking/pricing math in `utils/checkoutMath.js` and
`controller/bookingController.js`.
