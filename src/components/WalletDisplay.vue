<template>
  <div class="wallet">
    <div class="wallet-label">{{ t('pay.wallet_label') }}</div>
    <div class="wallet-row">
      <code class="wallet-address" :title="address" @click="copy">{{ displayAddress }}</code>
      <button
        type="button"
        class="copy-btn"
        :class="{ 'copy-btn--ok': copied }"
        @click="copy"
      >
        {{ copied ? '✓' : t('pay.copy_button') }}
      </button>
    </div>
    <transition name="toast">
      <p v-if="copied" class="copy-toast">{{ t('pay.copy_success') }}</p>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  address: { type: String, required: true },
});
const { t } = useI18n();
const copied = ref(false);
const isMobile = ref(false);

let mql;
function onMqlChange(e) { isMobile.value = e.matches; }

onMounted(() => {
  mql = window.matchMedia('(max-width: 640px)');
  isMobile.value = mql.matches;
  mql.addEventListener('change', onMqlChange);
});
onUnmounted(() => mql?.removeEventListener('change', onMqlChange));

const displayAddress = computed(() => {
  if (isMobile.value && props.address.length > 20) {
    return props.address.slice(0, 8) + ' **** ' + props.address.slice(-8);
  }
  return props.address;
});

async function copy() {
  try {
    await navigator.clipboard.writeText(props.address);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 1500);
  } catch (_) {
    const tmp = document.createElement('input');
    tmp.value = props.address;
    document.body.appendChild(tmp);
    tmp.select();
    try { document.execCommand('copy'); copied.value = true; } catch (_) {}
    document.body.removeChild(tmp);
    setTimeout(() => { copied.value = false; }, 1500);
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
  gap: 8px;
  align-items: stretch;
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 8px;
}
.wallet-address {
  flex: 1;
  min-width: 0;
  font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 21px;
  font-weight: 700;
  padding: 20px 22px;
  white-space: nowrap;
  overflow-x: auto;
  text-align: center;
  color: #000;
  cursor: pointer;
}
.copy-btn {
  flex: 0 0 88px;
  border: none;
  border-left: 1px solid var(--line);
  background: var(--bg-soft);
  color: var(--ink);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s, color 0.12s;
  border-radius: 0 8px 8px 0;
}
.copy-btn:hover { background: var(--line); }
.copy-btn--ok {
  background: var(--accent);
  color: #fff;
}
.copy-toast {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
  text-align: center;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .wallet-label {
    font-size: 15px;
    margin-bottom: 10px;
  }
  .wallet-address {
    font-size: 17px;
    padding: 16px 18px;
    white-space: normal;
    overflow-x: visible;
  }
  .copy-btn {
    flex: 0 0 72px;
    font-size: 16px;
  }
}
</style>
