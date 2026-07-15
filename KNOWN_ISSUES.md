# Known Issues & Unfinished Features

This file tracks work that was deliberately left incomplete during the
2026-07 audit/hardening pass, because finishing it requires real third-party
credentials or a product decision, not just code. Everything else found in
that audit (crashes, security holes, missing config) was fixed directly in
the codebase — see each sub-project's `.env.example` and git history on
branch `fix/audit-and-hardening` for details.

## Website backend (`Website/intothewilds-backend-main`)
- **Razorpay payments are stubbed.** `bookingController.js` returns a fake
  `order_test_*` id instead of creating a real Razorpay order. The real
  integration is present but commented out. To finish: obtain live/test
  Razorpay API keys, set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, and
  uncomment the real order-creation call.
- **Reservation system and Airbnb iCal sync are unreachable.**
  `routes/reservationRoute.js` and `routes/calendarRoutes.js` exist but are
  never mounted in `server.js`. Decide whether this feature is still wanted
  before wiring it in.
- **Booking confirmation emails are not sent.** `utils/email.js` exists but
  is never called from the booking flow.

## Admin backend (`Admin Panel/intothewilds-admin-backend`)
- **OTA channel manager adapters are stubs.** `services/channel/agoda.js`,
  `booking.js`, and `makemytrip.js` are unimplemented; only a `"gommt"`
  adapter is wired up in `services/channel/index.js`. Finishing these
  requires real API credentials/contracts with each OTA.
- **Razorpay settings endpoints are commented out** in
  `routes/settings.routes.js` / `settings.controller.js`.
- **Sync queue is in-memory only.** `jobs/syncQueue.js` has no persistence
  or retry, despite `bullmq` + `ioredis` already being installed
  dependencies — a real queue was never wired up.

## Admin frontend (`Admin Panel/intothewilds-admin-frontend`)
- **Notifications panel and "Connected OTAs" widget are hardcoded mock
  data** in `src/ui/Topbar.jsx` — there is no real notifications backend
  yet.
- **Settings page** (Admin Profile / Site Information / Business Settings
  tabs) is placeholder UI pending real endpoints.
- **Channel mapping "Preview"** in `ChannelMappingDrawer.jsx` just logs to
  the console instead of showing a real preview.

## Website frontend (`Website/intoTheWilds-frontend-main`)
- **Instagram gallery is mock data**, not a live Instagram Graph API feed
  (`InstagramGallery.jsx`).

## Cross-cutting
- **Auth tokens are stored in `localStorage`** on both frontends rather
  than httpOnly cookies. This is a standard XSS-exfiltration risk. Moving
  to httpOnly cookies is a coordinated frontend+backend change and was not
  done as part of this pass — flagged for a future security-hardening
  iteration.
- **No automated test suite** exists in any of the four sub-projects.
  Recommend adding at minimum integration tests for auth and booking flows
  before further feature work.
