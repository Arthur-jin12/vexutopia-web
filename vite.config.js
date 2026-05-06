import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { fileURLToPath, URL } from 'node:url';

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
    VueI18nPlugin({
      include: [fileURLToPath(new URL('./src/locales/*.json', import.meta.url))],
      strictMessage: false,
      escapeHtml: false,
    }),
    mockOrderApi(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
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
