# Into The Wild Stays — Admin Panel (Frontend)

Back-office admin dashboard for **Into The Wild Stays**, a hospitality/booking
platform. This React app is used internally to manage properties, bookings,
reviews, payments, channel-manager (OTA) mappings, and platform settings.

This is a **private, proprietary** application — it is not a public template
or open-source project.

## Tech Stack

- [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/)
- [Vite 7](https://vitejs.dev/) (build tool / dev server)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Axios](https://axios-http.com/) for API calls
- [Recharts](https://recharts.org/) for dashboard charts
- [Zustand](https://github.com/pmndrs/zustand) (available for state management)
- [dayjs](https://day.js.org/), [lucide-react](https://lucide.dev/) / [react-icons](https://react-icons.github.io/react-icons/)

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm (this project's committed lockfile is `package-lock.json` — see
  "Package manager" below)
- The Into The Wild Stays backend API running and reachable

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set VITE_API_BASE for your environment
```

## Environment Variables

See [`.env.example`](./.env.example) for the full list with descriptions.
At minimum:

| Variable        | Required | Description                                                                                                                                                                                          |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE` | No       | Base URL of the backend API. Defaults to the relative path `/api` (same-origin, reverse-proxied). Set to an absolute URL (e.g. `https://api.intothewildstays.com/api`) if the API is hosted on a different domain/sub-domain than this admin app. |

**Important:** if `VITE_API_BASE` is left unset, every API client in this app
falls back to a relative `/api` path (not `localhost`), so a missing env var
fails safely rather than silently pointing a production build at a
developer's machine.

## Scripts

```bash
npm run dev       # start Vite dev server with hot reload (proxies /api -> http://localhost:5001 in dev)
npm run build     # production build, output to dist/
npm run preview   # locally preview the production build
npm run lint      # run ESLint
```

There is currently no automated test suite for this project.

## Package Manager

This repo standardizes on **npm** (`package-lock.json`) for consistency with
the other Into The Wild Stays sub-projects. Do not commit a `yarn.lock` or
`pnpm-lock.yaml` alongside it.

## Deployment (Hostinger sub-domain)

This admin panel is intended to be deployed as its **own sub-domain**
(e.g. `admin.intothewildstays.com`), separate from the main guest-facing
site, on a Hostinger VPS — **not** as a sub-path (`/admin/`) of the main
site's domain.

Because it's served from the web root of its own sub-domain:

- `vite.config.js` sets `base: "/"`.
- `src/main.jsx` sets `<BrowserRouter basename="/">`.

These two must always match. If the deployment plan ever changes to a
sub-path instead (e.g. `intothewildstays.com/admin/`), update **both** the
Vite `base` and the router `basename` together, or asset URLs and
client-side routing will break.

Typical deploy steps:

```bash
npm install
npm run build
# upload dist/ to the sub-domain's document root on the Hostinger VPS
# configure the web server (Nginx/Apache) to:
#   - serve dist/index.html for all non-file routes (SPA fallback)
#   - reverse-proxy /api to the backend API service
```

## Known Limitations / Follow-ups

- **No Content-Security-Policy is configured** in `index.html`. Given the
  admin auth token is stored in `localStorage` (readable by any injected
  script), adding a CSP is a recommended follow-up — deferred here because it
  needs to be coordinated with an audit of every external resource/script
  actually loaded, to avoid breaking the app.
- A few dashboard/settings widgets are intentionally left as documented
  stubs pending backend work — see the `TODO:` comments in
  `src/ui/Topbar.jsx` (notifications + OTA connection status),
  `src/pages/Settings.jsx` (Admin Profile / Site Information / Business
  Settings tabs), and `src/components/ChannelMappingDrawer.jsx` (channel
  mapping "Preview" action).
