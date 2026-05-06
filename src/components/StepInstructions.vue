<template>
  <ol class="steps" :data-amount="amount">
    <li class="step">
      <span class="step-marker">1</span>
      <i18n-t keypath="pay.step1" tag="span" class="step-body">
        <template #mercuryo>
          <a href="https://exchange.mercuryo.io" target="_blank" rel="noopener noreferrer">Mercuryo</a>
        </template>
      </i18n-t>
    </li>
    <li class="step">
      <span class="step-marker">2</span>
      <i18n-t keypath="pay.step2" tag="span" class="step-body">
        <template #amount><strong>{{ amountStr }}</strong></template>
      </i18n-t>
    </li>
    <li class="step">
      <span class="step-marker">3</span>
      <div class="step-body">
        <p class="step-prompt">{{ t('pay.step3') }}</p>
        <slot name="step3-extra" />
      </div>
    </li>
    <li class="step">
      <span class="step-marker">4</span>
      <span class="step-body">{{ t('pay.step4') }}</span>
    </li>
  </ol>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  amount: { type: [String, Number], required: true },
});

const { t } = useI18n();
const amountStr = computed(() => {
  const n = Number(props.amount);
  return Number.isFinite(n) ? n.toFixed(2) : String(props.amount);
});
</script>

<style scoped>
.steps {
  list-style: none;
  padding: 0;
  margin: 0 0 8px;
  border-top: 1px solid var(--line);
}
.step {
  display: flex;
  gap: 22px;
  padding: 26px 0;
  border-bottom: 1px solid var(--line);
  align-items: flex-start;
}
.step-marker {
  flex: 0 0 34px;
  font-size: 21px;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  margin-top: 1px;
}
.step-body {
  flex: 1;
  font-size: 23px;
  line-height: 1.5;
  color: var(--ink);
}
.step-body :deep(strong) {
  font-weight: 600;
  color: var(--ink-strong);
}
.step-body :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.step-prompt {
  margin: 0 0 14px;
}
.step-body :deep(.wallet) {
  margin: 0;
}

@media (max-width: 640px) {
  .step {
    gap: 16px;
    padding: 20px 0;
  }
  .step-marker {
    flex: 0 0 28px;
    font-size: 18px;
  }
  .step-body {
    font-size: 20px;
    line-height: 1.5;
  }
}
</style>
