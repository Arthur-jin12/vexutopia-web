<template>
  <footer class="app-footer">
    <p class="disclaimer">{{ t('footer.disclaimer') }}</p>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.app-footer {
  border-top: 1px solid var(--line);
  padding: 18px 20px;
  text-align: center;
  font-size: 11px;
  color: var(--muted);
}
.disclaimer {
  margin: 0;
}
</style>
