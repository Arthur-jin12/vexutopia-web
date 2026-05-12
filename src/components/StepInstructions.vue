<template>
  <ol class="steps" :data-amount="amount">
    <li class="step">
      <span class="step-marker">1</span>
      <span class="step-body" v-html="step1Html" />
    </li>
    <li class="step">
      <span class="step-marker">2</span>
      <span class="step-body" v-html="step2Html" />
    </li>
    <li class="step">
      <span class="step-marker">3</span>
      <div class="step-body">
        <p class="step-prompt" v-html="step3Html" />
        <slot name="step3-extra" />
      </div>
    </li>
    <li class="step">
      <span class="step-marker">4</span>
      <span class="step-body" v-html="step4Html" />
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

const MERCURYO_LINK = '<a href="https://exchange.mercuryo.io" target="_blank" rel="noopener noreferrer">Mercuryo</a>';
const BOLD_TERMS = [
  // "I don't need Boost Points" — Mercuryo checkbox label, localized per language
  "I don't need Boost Points",
  "我不需要 Boost Points",
  "Boost Points は必要ありません",
  "Boost Points가 필요하지 않습니다",
  "Tôi không cần Boost Points",
  "ฉันไม่ต้องการ Boost Points",
  "لست بحاجة إلى Boost Points",
  "Ich brauche keine Boost Points",
  "No necesito Boost Points",
  "Je n'ai pas besoin de Boost Points",
  "Nincs szükségem Boost Pointsra",
  "Non ho bisogno di Boost Points",
  "Nie potrzebuję Boost Points",
  "Não preciso de Boost Points",
  "Nu am nevoie de Boost Points",
  "Мне не нужны Boost Points",
  "Boost Points'e ihtiyacım yok",
  "Мені не потрібні Boost Points",
  // Mercuryo UI labels (English in all locales)
  'USDC BASE',
  'BTC',
  'You get',
  'USDC',
];

function markBold(text) {
  let result = text;
  for (const term of BOLD_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), `<strong class="bold-term">${term}</strong>`);
  }
  return result;
}

const step1Html = computed(() => {
  const raw = t('pay.step1', { mercuryo: '__MERCURYO__' });
  return markBold(raw).replace('__MERCURYO__', MERCURYO_LINK);
});

const step2Html = computed(() => {
  const raw = t('pay.step2', { amount: `<strong>${amountStr.value}</strong>` });
  return markBold(raw);
});

const step3Html = computed(() => markBold(t('pay.step3')));
const step4Html = computed(() => markBold(t('pay.step4')));
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
.step-body :deep(.bold-term) {
  font-weight: 700;
  color: #000;
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
    gap: 10px;
    padding: 18px 0;
  }
  .step-marker {
    flex: 0 0 22px;
    font-size: 17px;
  }
  .step-body {
    font-size: 18px;
    line-height: 1.5;
  }
}
</style>
