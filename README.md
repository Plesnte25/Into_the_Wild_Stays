# Into The Wild Stays

A full-stack MERN hospitality platform built under **Plesnte.io**: a
customer-facing booking website plus an internal admin back-office for
managing properties, bookings, pricing, and reviews.

## Contents

- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts reference](#scripts-reference)
- [Docker](#docker)
- [CI](#ci)
- [Deployment](#deployment)
- [Known gaps / roadmap](#known-gaps--roadmap)
- [Security](#security)
- [License](#license)

## Architecture

Four independent apps live in this one repository. Each has its own
`package.json`, `.env.example`, and dependency lockfile — they're deployed
and versioned separately, but share a MongoDB deployment (two separate
databases: one per backend) and, in production, a common domain
(`intothewildstays.com` for the website, an `admin.` sub-domain for the
back-office).

| App | Path | Stack | Dev port | API prefix |
|---|---|---|---|---|
| Website — frontend | `Website/intoTheWilds-frontend-main` | React 18 + Vite + Tailwind | `5173` | proxies `/api` → website backend |
| Website — backend | `Website/intothewilds-backend-main` | Node.js + Express 4 + MongoDB/Mongoose | `5000` | `/api/v1/*` |
| Admin Panel — frontend | `Admin Panel/intothewilds-admin-frontend` | React 18 + Vite + Tailwind | `5174`* | proxies `/api` → admin backend |
| Admin Panel — backend | `Admin Panel/intothewilds-admin-backend` | Node.js + Express 5 + MongoDB/Mongoose | `5001` | `/api/*` |

\* Vite's default dev port is `5173`; if the website frontend is already
running, Vite auto-picks the next free port (`5174`) for the admin
frontend. Both are hardcoded to `5173` in `vite.config.js` — run them one
at a time, or override with `--port` if you need both simultaneously.

```
Browser ──▶ Website frontend (5173) ──/api──▶ Website backend (5000) ──▶ MongoDB (website DB)
Browser ──▶ Admin frontend  (5174) ──/api──▶ Admin backend   (5001) ──▶ MongoDB (admin DB)
```

Third-party integrations: MongoDB Atlas, Cloudinary (image hosting),
Razorpay (payments — see [Known gaps](#known-gaps--roadmap)), Google OAuth,
SMTP (transactional email), Fast2SMS (OTP), and OTA channel APIs
(Booking.com/GoMMT wired, others stubbed).

## Repository layout

```
Into_the_Wild_Stays/
├── Website/
│   ├── intoTheWilds-frontend-main/   # customer-facing React app
│   └── intothewilds-backend-main/    # customer-facing REST API
├── Admin Panel/
│   ├── intothewilds-admin-frontend/  # internal back-office React app
│   └── intothewilds-admin-backend/   # internal back-office REST API
├── KNOWN_ISSUES.md                   # tracked stubs/gaps across all 4 apps
├── LICENSE
└── .github/workflows/ci.yml          # install/lint/build per app
```

## Prerequisites

- **Node.js 20.x LTS** and npm (all four apps target Node 20; the website
  backend's `package.json` enforces this via `engines`)
- A **MongoDB** instance (Atlas or self-hosted) — use two separate
  databases/URIs, one per backend, so website and admin data don't collide
- Accounts/API keys for whichever integrations you're testing:
  [Cloudinary](https://cloudinary.com), [Razorpay](https://razorpay.com),
  [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  (OAuth client), an SMTP provider, [Fast2SMS](https://www.fast2sms.com)

## Quick start

Each app is set up the same way — copy the env template, install, run:

```bash
cd "Website/intothewilds-backend-main"
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET at minimum
npm install
npm run dev                # nodemon-style watch mode (node --watch server.js)
```

Repeat for the other three apps. To run the full customer-facing stack
locally, start the website backend and website frontend together (and
likewise the admin pair). Minimum required env vars to get each backend to
boot at all (they fail fast with a clear error if these are missing):

- Website backend: `MONGO_URI`, `JWT_SECRET`
- Admin backend: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_RESET_SECRET`

Everything else (payments, email, Cloudinary, OAuth) degrades gracefully
in dev — features that need them just log a warning and no-op, per
`KNOWN_ISSUES.md`.

## Environment variables

Every app has its own `.env.example` listing every variable its code
actually reads, grouped by concern, with placeholder values:

- [`Website/intothewilds-backend-main/.env.example`](Website/intothewilds-backend-main/.env.example) — Mongo, JWT, CORS, Google OAuth, SMTP, Razorpay, Cloudinary, admin-seed credentials
- [`Website/intoTheWilds-frontend-main/.env.example`](Website/intoTheWilds-frontend-main/.env.example) — API base URL, Google OAuth client ID, Razorpay publishable key
- [`Admin Panel/intothewilds-admin-backend/.env.example`](Admin%20Panel/intothewilds-admin-backend/.env.example) — Mongo, JWT (access/refresh/reset), CORS, Cloudinary, Razorpay + webhook secret, SMTP, business/invoicing settings, Redis, admin-seed credentials
- [`Admin Panel/intothewilds-admin-frontend/.env.example`](Admin%20Panel/intothewilds-admin-frontend/.env.example) — API base URL

Copy each to `.env` in the same directory and fill in real values.
**Never commit a real `.env` file** — it's git-ignored, but `.env.example`
files are intentionally tracked so required configuration stays
discoverable for the next person.

## Scripts reference

| App | `dev` | `build` | `start` | `lint` | `test` |
|---|---|---|---|---|---|
| Website backend | `node --watch server.js` | *(runs the admin-seed script — see note below)* | `node server.js` | — | placeholder |
| Website frontend | `vite` | `vite build` | — (`preview`) | `eslint .` | — |
| Admin backend | `nodemon server.js` | — | `node server.js` | — | — |
| Admin frontend | `vite` | `vite build` | — (`preview`) | `eslint .` | — |

> ⚠️ The website backend's `npm run build` is aliased to
> `npm run seed:admin` (a one-off script that creates/promotes an admin
> user via `ADMIN_EMAIL`/`ADMIN_PASSWORD`) — it is **not** a bundling
> step. `.github/workflows/ci.yml` deliberately skips the "build" step
> for both backends for this reason; don't wire a generic build tool to
> run `npm run build` here without checking `package.json` first.

Useful one-offs: `npm run seed:admin` (either backend) provisions/promotes
an admin login on a fresh database; `npm run seed:inventory` (website
backend) seeds sample property data.

## Docker

The two website apps ship Dockerfiles:

```bash
cd "Website/intothewilds-backend-main"
docker build -t itw-website-backend .
docker run --env-file .env -p 5000:5000 itw-website-backend
```

```bash
cd "Website/intoTheWilds-frontend-main"
docker build -t itw-website-frontend .
docker run -p 8080:80 itw-website-frontend   # multi-stage build, served by nginx
```

The admin panel apps don't have Dockerfiles yet (deployed directly on the
target VPS — see below).

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: for each of
the four apps it does `npm ci`, then `npm run lint --if-present`, then
(frontends only) `npm run build`. It's intentionally minimal — no test
step runs anything yet, since none of the four apps has an automated test
suite (tracked in `KNOWN_ISSUES.md`).

## Deployment

Target environment is a **Hostinger VPS**. The website (frontend + backend)
serves the primary domain; the admin panel is deployed on its own
sub-domain (e.g. `admin.intothewildstays.com`) rather than a sub-path of
the main site — the admin frontend's Vite `base` and router `basename`
are both set to `/` on that assumption (see the comment in
`Admin Panel/intothewilds-admin-frontend/vite.config.js` if that plan
ever changes to a sub-path instead, both values need to move together).

## Known gaps / roadmap

See [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) for the full, maintained list.
Headline items:

- **Payments**: Razorpay order creation is stubbed (returns a fake test
  order) on the website backend; the admin backend's Razorpay settings
  endpoints are commented out. Needs real API keys + uncommenting the
  integration.
- **OTA channel sync**: only a GoMMT adapter is wired up; Agoda,
  Booking.com, and MakeMyTrip adapters exist as stubs pending real API
  credentials/contracts.
- **No automated tests** in any of the four apps.
- **Auth tokens live in `localStorage`** on both frontends rather than
  httpOnly cookies — a known XSS-exposure tradeoff that needs a
  coordinated frontend+backend change to fix properly.

## Security

If you discover a security issue, report it privately to the repository
owner rather than opening a public issue. A few operational notes:

- Every backend fails fast at startup if a required secret
  (`MONGO_URI`, `JWT_SECRET`, and — for the admin backend —
  `JWT_REFRESH_SECRET`/`JWT_RESET_SECRET`) is missing, rather than
  booting into a broken/insecure state.
- Commit history prior to the `fix/audit-and-hardening` merge (2026-07)
  contains real MongoDB/Cloudinary/Razorpay credentials that were removed
  from source but not from git history. Treat anything visible in an old
  clone, fork, or pre-merge commit as compromised — rotate it if that
  hasn't already been done, and don't reuse it.

## License

Proprietary — see [`LICENSE`](./LICENSE). All rights reserved by
Plesnte.io.
