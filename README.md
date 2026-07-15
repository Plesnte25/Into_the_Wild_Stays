# Into The Wild Stays

A full-stack MERN hospitality platform built under **Plesnte.io**, covering
both the customer-facing booking website and the internal admin back-office.

## Architecture

This is a monorepo containing four independent applications:

| App | Path | Stack | Purpose |
|---|---|---|---|
| Website — frontend | `Website/intoTheWilds-frontend-main` | React + Vite + Tailwind | Property listings, booking, payment (customer-facing) |
| Website — backend | `Website/intothewilds-backend-main` | Node.js + Express + MongoDB | REST API for the customer website |
| Admin Panel — frontend | `Admin Panel/intothewilds-admin-frontend` | React + Vite + Tailwind | Bookings, pricing, reviews, analytics, settings (internal) |
| Admin Panel — backend | `Admin Panel/intothewilds-admin-backend` | Node.js + Express + MongoDB | REST API for the admin panel |

Each app has its own `package.json`, `.env.example`, and (for the website
apps) `Dockerfile` — they are deployed and versioned independently, though
they share the codebase and, in production, a MongoDB deployment.

## Prerequisites

- Node.js 20.x LTS and npm
- A MongoDB instance (Atlas or self-hosted) — separate databases/URIs are
  recommended for the website and admin backends
- Accounts/API keys for the third-party services each app integrates with
  (see each app's `.env.example`): Cloudinary, Razorpay, Google OAuth,
  SMTP/email, Fast2SMS

## Getting started

Each app is set up the same way:

```bash
cd "Website/intothewilds-backend-main"   # or any of the other 3 app dirs
cp .env.example .env                     # fill in real values
npm install
npm run dev    # or: npm start
```

Frontend apps (`Website/intoTheWilds-frontend-main`,
`Admin Panel/intothewilds-admin-frontend`) are Vite projects:

```bash
npm run dev       # local dev server
npm run build     # production build
npm run preview   # preview a production build locally
```

Backend apps (`Website/intothewilds-backend-main`,
`Admin Panel/intothewilds-admin-backend`) are Express servers:

```bash
npm run dev     # nodemon (admin backend) 
npm start       # node server.js
```

Run the website backend and website frontend together for local
end-to-end testing of the customer flow (and likewise for the admin pair).

## Environment variables

Every app has an `.env.example` at its root listing every environment
variable its code actually reads, with placeholder values — copy it to
`.env` and fill in real credentials. **Never commit a real `.env` file** —
it's git-ignored by default, but `.env.example` files are intentionally
tracked so the required configuration is discoverable.

## Docker

The two website apps (`Website/intothewilds-backend-main`,
`Website/intoTheWilds-frontend-main`) include Dockerfiles for
containerized builds. Build and run each independently, e.g.:

```bash
cd "Website/intothewilds-backend-main"
docker build -t itw-website-backend .
docker run --env-file .env -p 5000:5000 itw-website-backend
```

## Deployment

Target environment is a **Hostinger VPS**, with the admin panel served on
a dedicated sub-domain separate from the main customer-facing site.

## Known gaps / unfinished work

See [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) for a tracked list of features
that are intentionally stubbed pending real third-party credentials or a
product decision (payment processing, OTA channel sync, notifications,
etc.), plus known architectural follow-ups (token storage strategy, test
coverage).

## Security

If you discover a security issue, please report it privately to the
repository owner rather than opening a public issue. Credentials must
never be committed to source — use the `.env.example` files as the
template for local `.env` files, which are git-ignored.

## License

Proprietary — see [`LICENSE`](./LICENSE). All rights reserved by
Plesnte.io.
