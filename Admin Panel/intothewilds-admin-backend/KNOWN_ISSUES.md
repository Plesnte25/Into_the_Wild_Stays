# Known Issues / Deliberately Incomplete Features

These are documented gaps left as stubs on purpose — finishing them requires
real third-party credentials, API contracts, or business decisions that
can't be made in a code audit. Each is safe to leave as-is for now (nothing
here is reachable/exploitable in normal operation), but should be tracked as
follow-up work.

## 1. OTA channel adapters (Agoda, Booking.com, MakeMyTrip)

Files: `services/channel/agoda.js`, `services/channel/booking.js`,
`services/channel/makemytrip.js`

These adapters are fully stubbed with `// TODO:` markers for:
- Pulling live availability per day from the PMS for the next N days
- Pulling live rates (base rate, min/max length-of-stay) from the PMS
- Gathering restrictions (closed-to-arrival / closed-to-departure)
- Persisting inbound reservations from the OTA into this app's DB

They are currently **unreachable dead code** — `services/channel/index.js`
only dispatches the `"gommt"` (Go-MMT) provider, so these three adapters are
never invoked by `controller/channel.controller.js`.

**To finish:** obtain real API credentials/contracts from each OTA, then
implement `pushAvailability` / `pushRates` / `pushRestrictions` /
`pullReservations` per their respective specs, and register each provider
in `services/channel/index.js#getChannelAdapter`.

## 2. Admin-editable Razorpay settings

Files: `routes/settings.routes.js` (commented-out routes), and the
corresponding commented-out `updateRazorpaySettings` / `checkRazorpay`
functions in `controller/settings.controller.js`.

Currently Razorpay keys are **env-only** (`RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`) and read-only from the admin UI's perspective —
`GET /api/settings/razorpay/status` reports whether they're configured, but
there's no way to set/rotate them through the admin panel itself.

**To finish:** this needs a product decision — do admins rotate Razorpay
keys through the UI (storing the secret in the `Setting` collection, which
has real security implications for at-rest encryption of that secret) or
strictly via env vars/secret manager on deploy? If the former, un-comment
and finish the two functions with proper encryption-at-rest for the stored
secret.

## 3. Channel sync queue is in-memory only

File: `jobs/syncQueue.js`

The current implementation is a plain in-process FIFO array
(`const queue = []`) processed via `setImmediate` — it has no persistence,
no retry-on-failure, and is lost entirely on process restart or crash mid-job.
It also only runs on-demand (triggered by `POST /api/channels/mappings/:id/sync`),
not on any schedule/cron.

`bullmq` and `ioredis` are already installed dependencies, strongly
suggesting a persistent queue was the original intent.

**To finish:** replace the in-memory array with a real BullMQ `Queue` +
`Worker` backed by `ioredis`/`REDIS_URL` (see `services/cache.service.js`
for the existing `ioredis` connection pattern to mirror), and optionally add
a scheduled/repeatable BullMQ job for periodic OTA syncs instead of relying
solely on manual triggers.

## 4. `properties.controller.js#uploadPropertyImage` is unwired

Not wired into `routes/properties.routes.js` because it expects
`req.files.image.tempFilePath` — the `express-fileupload` middleware
contract — while the rest of this app uploads via `multer` +
Cloudinary buffer-streaming (`middleware/upload.js`,
`services/cloudinary.service.js#uploadBuffer`/`#uploadLogoBuffer`). Adding
`express-fileupload` alongside the existing `multer` usage risks
double-parsing multipart request bodies elsewhere in the app.

**To finish:** rewrite this handler to accept a multer-parsed buffer (like
`controller/media.controller.js#uploadAsset` does) and call
`uploadBuffer()` instead, then wire it into the properties routes with the
existing `upload.single(...)` middleware.
