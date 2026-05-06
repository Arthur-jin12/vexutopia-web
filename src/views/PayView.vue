<template>
  <div class="pay-page">
    <!-- Top bar: language selector on the right -->
    <header class="pay-header">
      <LanguageSelector />
    </header>

    <section class="pay-body">
      <!-- "Please close this tab" fallback when window.close() is denied -->
      <div v-if="showCloseHint" class="pay-state">
        <div class="check-mark check-mark--neutral">✕</div>
        <h1>{{ t('pay.close_hint_title') }}</h1>
        <p>{{ t('pay.close_hint_msg') }}</p>
      </div>

      <!-- Loading skeleton -->
      <div v-else-if="loading" class="pay-loading">
        <div class="spinner" />
        <p>{{ t('pay.loading') }}</p>
      </div>

      <!-- Order not found / invalid token -->
      <div v-else-if="error === 'not_found'" class="pay-state">
        <h1>{{ t('pay.notfound_title') }}</h1>
        <p>{{ t('pay.notfound_msg') }}</p>
      </div>

      <!-- Expired -->
      <div
        v-else-if="data?.order_status === 'EXPIRED'"
        class="pay-state"
      >
        <h1>{{ t('pay.expired_title') }}</h1>
        <p>{{ t('pay.expired_msg') }}</p>
      </div>

      <!-- Paid — auto-close handled by watcher below -->
      <div
        v-else-if="data?.order_status === 'PAID'"
        class="pay-state pay-state--success"
      >
        <div class="check-mark">✓</div>
        <h1>{{ t('pay.success_title') }}</h1>
        <p>{{ t('pay.success_msg') }}</p>
      </div>

      <!-- Pending — main instructions -->
      <div v-else-if="data" class="pay-content">
        <div class="pay-title-row">
          <button
            type="button"
            class="return-btn"
            @click="returnToCheckout"
          >
            <span class="return-btn__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </span>
            <span class="return-btn__label">{{ t('pay.return_button') }}</span>
          </button>
          <h1 class="pay-title">{{ t('pay.title') }}</h1>
        </div>

        <StepInstructions :amount="data.amount_owed">
          <template #step3-extra>
            <WalletDisplay :address="data.wallet_address" />
          </template>
        </StepInstructions>

        <a
          class="pay-tutorial"
          href="https://exchange.mercuryo.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/crypto_tutorial.gif" alt="" loading="lazy" />
        </a>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useOrderStatus } from '@/composables/useOrderStatus';
import { setLocale } from '@/i18n';
import LanguageSelector from '@/components/LanguageSelector.vue';
import StepInstructions from '@/components/StepInstructions.vue';
import WalletDisplay from '@/components/WalletDisplay.vue';
import AppFooter from '@/components/AppFooter.vue';

const props = defineProps({
  token: { type: String, required: true },
});

const { t } = useI18n();
const route = useRoute();
const sandboxEnv = route.query.env === 'sandbox' ? 'sandbox' : undefined;
const { loading, data, error } = useOrderStatus(props.token, sandboxEnv);

// "Tab cannot self-close" fallback hint
const showCloseHint = ref(false);

// Language is taken solely from the ?lang URL param (carried from Page 1
// by design, since localStorage cannot cross domains).
onMounted(() => {
  const fromUrl = String(route.query.lang || '').trim();
  if (fromUrl) setLocale(fromUrl);
});

// NOTE: this page does not poll. Order status changes (paid / underpaid /
// expired) are detected by the original checkout tab via its own polling.
// The user closes this tab via the Return button when they're done.

// Closing the tab. window.close() only succeeds when the tab was opened by
// script (window.open from Page 1), which is the expected flow. If the user
// opened the URL directly — by typing it, a bookmark, or paste — close() is
// blocked and we show a polite "you can close this tab now" hint instead.
function returnToCheckout() {
  try {
    window.close();
  } catch (_) {}
  // If we're still here a moment later, the browser denied close().
  setTimeout(() => {
    if (!document.hidden) {
      showCloseHint.value = true;
    }
  }, 200);
}
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--ink);
}

.pay-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 24px;
}

.pay-body {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 20px 72px;
}

.pay-content {
  width: 100%;
  max-width: 720px;
}

.pay-title-row {
  position: relative;
  margin: 0 0 40px;
}
.pay-title-row .pay-title {
  margin: 0;
}

.return-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 22px;
  margin: 0 0 16px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  font-size: 18px;
  font-weight: 500;
  font-family: inherit;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}

/* When the viewport is wide enough to leave a left margin outside the
   720px content column, float the button absolutely into that margin so
   the title keeps its natural full-width position on a single line. */
@media (min-width: 980px) {
  .return-btn {
    position: absolute;
    top: 4px;
    right: calc(100% + 20px);
    margin: 0;
  }
}
.return-btn:hover {
  background: var(--bg-soft);
  border-color: var(--ink);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}
.return-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.return-btn__icon {
  display: inline-flex;
  align-items: center;
  transition: transform 0.15s ease;
}
.return-btn__icon svg {
  width: 18px;
  height: 18px;
}
.return-btn:hover .return-btn__icon {
  transform: translateX(-2px);
}

.pay-title {
  font-size: 42px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1.2;
}


.pay-loading {
  text-align: center;
  padding-top: 80px;
  color: var(--muted);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.pay-state {
  text-align: center;
  padding: 100px 20px;
  max-width: 440px;
  margin: 0 auto;
}
.pay-state h1 {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 10px;
}
.pay-state p {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.pay-state--success .check-mark {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 30px;
  line-height: 56px;
  margin: 0 auto 18px;
}
.check-mark--neutral {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--bg-soft);
  color: var(--muted);
  font-size: 26px;
  line-height: 56px;
  margin: 0 auto 18px;
  border: 1px solid var(--line);
}

.pay-tutorial {
  display: block;
  margin: 24px 0 28px;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
}
.pay-tutorial:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 16px rgba(15, 118, 110, 0.18);
}
.pay-tutorial:active {
  transform: translateY(1px);
}
.pay-tutorial:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.pay-tutorial img {
  width: 100%;
  height: auto;
  display: block;
}

@media (max-width: 640px) {
  .pay-header {
    padding: 12px 16px;
  }
  .pay-body {
    padding: 16px 14px 56px;
  }
  .pay-title {
    font-size: 28px;
    line-height: 1.25;
  }
  .pay-title-row {
    margin: 0 0 26px;
  }
  .return-btn {
    padding: 9px 14px;
    font-size: 14px;
    gap: 6px;
    margin: 0 0 14px;
  }
  .return-btn__label {
    display: none;
  }
  .return-btn__icon svg {
    width: 18px;
    height: 18px;
  }
  .pay-tutorial {
    margin: 20px 0 24px;
  }
}
</style>
