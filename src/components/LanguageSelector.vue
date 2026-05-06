<template>
  <label class="lang">
    <span class="lang-label">{{ t('nav.language') }}</span>
    <select v-model="current" class="lang-select" @change="onChange">
      <option v-for="code in SUPPORTED_LANGS" :key="code" :value="code">
        {{ LANG_NAMES[code] || code }}
      </option>
    </select>
  </label>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { SUPPORTED_LANGS, setLocale } from '@/i18n';

const LANG_NAMES = {
  en: 'English',
  zh: '简体中文',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ja: '日本語',
  de: 'Deutsch',
  ar: 'العربية',
  ru: 'Русский',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  ko: '한국어',
  it: 'Italiano',
  th: 'ไทย',
  pl: 'Polski',
  uk: 'Українська',
  ro: 'Română',
  hu: 'Magyar',
};

const { t, locale } = useI18n();
const current = ref(locale.value);

watchEffect(() => {
  current.value = locale.value;
});

function onChange() {
  setLocale(current.value);
}
</script>

<style scoped>
.lang {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 22px;
  color: var(--muted);
}
.lang-label {
  font-weight: 500;
}
.lang-select {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 44px 14px 20px;
  font-family: inherit;
  font-size: 22px;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='10' viewBox='0 0 14 10'%3E%3Cpath fill='%23666' d='M7 10 0 0h14z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 14px 10px;
  transition: border-color 0.12s;
}
.lang-select:hover {
  border-color: var(--ink);
}
.lang-select:focus {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

@media (max-width: 640px) {
  .lang-label {
    display: none;
  }
  .lang-select {
    font-size: 19px;
    padding: 12px 38px 12px 16px;
  }
}
</style>
