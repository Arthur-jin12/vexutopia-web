import { defineConfig } from 'vite';
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
 * In production this plugin is inert — Cloudflare Pages Functions handle /api/*.
 */
function mockOrderApi() {
  return {
    name: 'mock-order-api',
    apply: 'serve',
    configureServer(server) {
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
        if (req.headers.referer) {
          try {
            mock = new URL(req.headers.referer).searchParams.get('mock');
          } catch (_) {}
        }
        const status = (mock || 'PENDING').toUpperCase();

        if (status === '404') {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }

        const body = {
          amount_owed: 19.99,
          wallet_address: '0x85d3073A666F608715ae0cff0E9fA57d526Fe420',
          language_code: '',
          order_status: ['PENDING', 'PARTIAL', 'PAID', 'EXPIRED'].includes(status) ? status : 'PENDING',
        };
        if (body.order_status === 'PARTIAL') body.amount_owed = 7.01;

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
