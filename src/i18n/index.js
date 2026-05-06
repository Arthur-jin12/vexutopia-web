import { createI18n } from 'vue-i18n';

// Eagerly include all locale files. Vite turns these into static imports
// and bundles them into the final build — no runtime fetch, no CORS, no CDN.
const messages = Object.fromEntries(
  Object.entries(import.meta.glob('../locales/*.json', { eager: true })).map(
    ([path, mod]) => {
      const code = path.match(/\/([^/]+)\.json$/)[1];
      return [code, mod.default || mod];
    }
  )
);

export const SUPPORTED_LANGS = Object.keys(messages);

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  warnHtmlMessage: false,
});

export function setLocale(code) {
  if (SUPPORTED_LANGS.includes(code)) {
    i18n.global.locale.value = code;
    try {
      document.documentElement.setAttribute('lang', code);
    } catch (_) {}
  }
}

export default i18n;
