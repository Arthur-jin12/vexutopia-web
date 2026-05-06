<template>
  <div class="notfound">
    <h1>{{ t('pay.notfound_title') }}</h1>
    <p>{{ t('pay.notfound_msg') }}</p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.notfound {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
}
.notfound h1 {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 10px;
}
.notfound p {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
  max-width: 420px;
}
</style>
