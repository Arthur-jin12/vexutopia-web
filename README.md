# vexutopia-web

Static checkout instructions site for vexutopia.net, deployed via Cloudflare Pages.

## Tech stack

- Vue 3 + Composition API
- Vue Router (history mode)
- vue-i18n
- Vite (build tool)
- Cloudflare Pages Functions (replaces a separate Worker)

## Develop locally

```bash
npm install
npm run dev
```

Pages Functions also run locally via Wrangler:

```bash
npm run dev:functions
```

## Build

```bash
npm run build
```

Output goes to `dist/`. Cloudflare Pages auto-detects this directory.

## Deploy

Push to `main` — Cloudflare auto-builds and deploys.

## Project layout

```
public/                 static assets, copied as-is to dist/
  _headers              HTTP response headers (CSP, Referrer-Policy, HSTS, …)
  _redirects            SPA fallback so /pay/{id} routes to index.html
functions/              Pages Functions (server-side)
  api/order/[token].js  Order lookup proxy
src/                    Vue source
  views/                Route components (PayView, NotFoundView, …)
  components/           Shared UI components
  composables/          Reusable logic
  i18n/                 Translation setup
  locales/              JSON translation bundles
  router/               Vue Router config
  styles/               Global CSS
```

## Environment variables

None on the frontend side. Backend secrets are configured in the
Cloudflare dashboard for the Pages project (Settings → Environment variables):

- `UPSTREAM_URL` — Order lookup API URL (private)
- `UPSTREAM_SECRET` — Bearer token for upstream auth

These are read by the Pages Function at runtime via `context.env`.

## License

Proprietary.
