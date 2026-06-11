<template>
  <div class="wallet">
    <div class="wallet-label">{{ t('pay.wallet_label') }}</div>
    <div class="wallet-row">
      <button
        type="button"
        class="copy-btn"
        :class="{ 'copy-btn--ok': copied }"
        :title="address"
        @click="copy"
      >
        {{ copied ? t('pay.copy_success') : t('pay.copy_button') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  address: { type: String, required: true },
});
const { t } = useI18n();
const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.address);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 4000);
  } catch (_) {
    const tmp = document.createElement('input');
    tmp.value = props.address;
    document.body.appendChild(tmp);
    tmp.select();
    try { document.execCommand('copy'); copied.value = true; } catch (_) {}
    document.body.removeChild(tmp);
    setTimeout(() => { copied.value = false; }, 4000);
  }
}
</script>

<style scoped>
.wallet {
  margin: 28px 0;
}
.wallet-label {
  font-size: 17px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
  font-weight: 600;
}
.wallet-row {
  display: flex;
  border-radius: 8px;
}
.copy-btn {
  flex: 1;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  padding: 20px 22px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s, color 0.12s, opacity 0.12s;
  border-radius: 8px;
}
.copy-btn:hover { opacity: 0.9; }
.copy-btn--ok {
  background: var(--accent);
  color: #fff;
}

@media (max-width: 640px) {
  .wallet-label {
    font-size: 15px;
    margin-bottom: 10px;
  }
  .copy-btn {
    font-size: 16px;
    padding: 16px 18px;
  }
}
</style>
