import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { generateJSON } from '@intlify/bundle-utils';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';

// Virtual ID prefix — the \0 tells Rollup this is a virtual module.
// Because it no longer ends in .json, vite:json skips it entirely.
const I18N_PREFIX = '\0i18n-locale:';

/**
 * Pre-compiles locale JSON files to JS message functions at build time.
 * Uses resolveId+load (virtual module) so vite:json never processes these
 * files — otherwise vite:json would receive our JS output and crash trying
 * to JSON.parse it.
 */
function i18nPrecompile() {
  return {
    name: 'i18n-precompile',
    enforce: 'pre',

    resolveId(id, importer) {
      if (!/locales[/\\][^/\\]+\.json$/.test(id)) return;
      const filePath = isAbsolute(id)
        ? id
        : importer
          ? resolve(dirname(importer.split('?')[0]), id)
          : null;
      if (!filePath) return;
      // Strip .json so vite:json's /\.(json|json5)$/ regex never matches this ID.
      return I18N_PREFIX + filePath.replace(/\.json$/, '');
    },

    load(id) {
      if (!id.startsWith(I18N_PREFIX)) return;
      const filePath = id.slice(I18N_PREFIX.length) + '.json';
      this.addWatchFile(filePath);
      const raw = readFileSync(filePath, 'utf-8');
      const isProd = process.env.NODE_ENV === 'production';
      const { code } = generateJSON(raw, {
        type: 'plain',
        jit: false,
        strictMessage: false,
        escapeHtml: false,
        env: isProd ? 'production' : 'development',
      });
      return { code, map: { mappings: '' } };
    },
  };
}

/**
 * Dev-only plugin: intercepts POST /api/order so the Vue app works without
 * deploying the Pages Function or the upstream backend.
 *
 * Switch the mocked status with the ?mock= query param on the page URL, e.g.:
 *   http://localhost:5173/pay/anytoken?lang=zh
 *   http://localhost:5173/pay/anytoken?mock=PARTIAL
 *   http://localhost:5173/pay/anytoken?mock=PAID
 *   http://localhost:5173/pay/anytoken?mock=EXPIRED
 *   http://localhost:5173/pay/anytoken?mock=404      (renders Order Not Found)
 *
 * ?country= mocks the visitor geo that Cloudflare supplies in production, e.g.
 *   http://localhost:5173/pay/anytoken?country=DE     (EEA Step 4 wording)
 *   http://localhost:5173/pay/anytoken?country=CH     (default Step 4 wording)
 *
 * ?p=banxa shows the Banxa steps; the mock returns a USD Banxa link for them.
 *
 * MOCK_UPSTREAM_URL (+ MOCK_UPSTREAM_SECRET) forwards the lookup to a local backend's
 * /internal/v1/o instead, for real order data end to end.
 *
 * The order fixture itself is NOT hard-coded here. Set MOCK_AMOUNT,
 * MOCK_AMOUNT_PARTIAL and MOCK_WALLET in .env.local (gitignored) — see
 * .env.example. Unset means 0.00 and an empty address, which still renders
 * every branch of the page.
 *
 * In production this plugin is inert — Cloudflare Pages Functions handle /api/*.
 */
function mockOrderApi() {
  return {
    name: 'mock-order-api',
    apply: 'serve',
    configureServer(server) {
      // Read once at startup. `loadEnv` picks up .env.local without exposing
      // anything to the client bundle — these never leave the dev server.
      const fixtures = loadEnv(server.config.mode, server.config.root, 'MOCK_');
      const fixtureAmount = (key, fallback) => {
        const n = Number(fixtures[key]);
        return Number.isFinite(n) && fixtures[key] !== '' ? n : fallback;
      };

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname !== '/api/order') return next();

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Allow', 'POST');
          res.end('Method Not Allowed');
          return;
        }

        // Mock control comes from the page URL (the Referer of this fetch).
        let mock = null;
        let country = null;
        if (req.headers.referer) {
          try {
            const params = new URL(req.headers.referer).searchParams;
            mock = params.get('mock');
            country = params.get('country');
          } catch (_) {}
        }
        const status = (mock || 'PENDING').toUpperCase();

        if (fixtures.MOCK_UPSTREAM_URL) {
          let raw = '';
          for await (const chunk of req) raw += chunk;
          try {
            const up = await fetch(fixtures.MOCK_UPSTREAM_URL, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${fixtures.MOCK_UPSTREAM_SECRET || ''}`,
                'Content-Type': 'application/json',
              },
              body: raw,
            });
            res.statusCode = up.ok ? 200 : 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(up.ok ? JSON.stringify({ ...(await up.json()), country: country ? country.toUpperCase() : null }) : 'Not Found');
          } catch (_) {
            res.statusCode = 404;
            res.end('Not Found');
          }
          return;
        }

        if (status === '404') {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }

        const body = {
          amount_owed: fixtureAmount('MOCK_AMOUNT', 0),
          wallet_address: fixtures.MOCK_WALLET || '',
          language_code: '',
          order_status: ['PENDING', 'PARTIAL', 'PAID', 'EXPIRED'].includes(status) ? status : 'PENDING',
          country: country ? country.toUpperCase() : null,
        };
        if (body.order_status === 'PARTIAL') {
          body.amount_owed = fixtureAmount('MOCK_AMOUNT_PARTIAL', body.amount_owed);
        }
        body.banxa_url = 'https://checkout.banxa.com/?fiatType=USD&coinType=USDC&coinAmount='
          + Math.max(body.amount_owed, 5).toFixed(2) + '&blockchain=BASE';

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(body));
      });
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    i18nPrecompile(),
    mockOrderApi(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
});
