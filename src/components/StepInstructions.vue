<template>
  <!-- Banxa: the amount is already in the link, so three steps and no Mercuryo screens. -->
  <ol v-if="isBanxa" class="steps" :data-amount="amount">
    <li class="step">
      <span class="step-marker">1</span>
      <span class="step-body" v-html="banxaStep1Html" />
    </li>
    <li class="step">
      <span class="step-marker">2</span>
      <div class="step-body">
        <p class="step-prompt" v-html="banxaStep2Html" />
        <slot name="step3-extra" />
      </div>
    </li>
    <li class="step">
      <span class="step-marker">3</span>
      <span class="step-body" v-html="banxaStep3Html" />
    </li>
  </ol>
  <ol v-else class="steps" :data-amount="amount">
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
import { isEeaCountry } from '@/utils/eea';

const props = defineProps({
  amount: { type: [String, Number], required: true },
  // ISO 3166-1 alpha-2 of the visitor, from the order API. Null when unknown.
  country: { type: String, default: null },
  // 'banxa' shows the Banxa steps with banxaUrl (from the order API); anything else Mercuryo.
  provider: { type: String, default: 'mercuryo' },
  banxaUrl: { type: String, default: '' },
});

const { t } = useI18n();
const amountStr = computed(() => {
  const n = Number(props.amount);
  return Number.isFinite(n) ? n.toFixed(2) : String(props.amount);
});

// Only ever a Banxa checkout link: anything else falls back to the Mercuryo steps.
const BANXA_ORIGIN = 'https://checkout.banxa.com/';
const isBanxa = computed(() => props.provider === 'banxa' && props.banxaUrl.startsWith(BANXA_ORIGIN));
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
  // "Non-custodial" — Mercuryo wallet-type option, localized per language.
  // Only ever rendered for EEA visitors (see step4Html below).
  'Non-custodial',
  '非托管',
  '非カストディアル',
  '비수탁형',
  'Không lưu ký',
  'ไม่รับฝากทรัพย์สิน',
  'غير احتجازية',
  'Nicht-verwahrend',
  'No custodial',
  'Non-dépositaire',
  'Nem letétkezelt',
  'Non custodiale',
  'Niepowierniczy',
  'Não custodial',
  'Fără custodie',
  'Некастодиальный',
  'Saklamasız',
  'Некастодіальний',
  // Mercuryo UI labels (English in all locales)
  'USDC BASE',
  'BTC',
  'You get',
  'USDC',
];
// "Your wallet address" — Banxa field label, localized per language. Kept apart
// from BOLD_TERMS: the ja/ko wording also occurs in the Mercuryo step3 text.
const BANXA_BOLD_TERMS = [
  'Your wallet address',
  '您的钱包地址',
  'ウォレットアドレス',
  '지갑 주소',
  'Địa chỉ ví của bạn',
  'ที่อยู่กระเป๋าเงินของคุณ',
  'عنوان محفظتك',
  'Ihre Wallet-Adresse',
  'Su dirección de billetera',
  'Votre adresse de portefeuille',
  'Az Ön tárcacíme',
  'Il tuo indirizzo wallet',
  'Adres Twojego portfela',
  'Seu endereço de carteira',
  'Adresa portofelului dvs.',
  'Адрес вашего кошелька',
  'Cüzdan adresiniz',
  'Адреса вашого гаманця',
];

function markBold(text, exclude = [], terms = BOLD_TERMS) {
  let result = text;
  for (const term of terms) {
    if (exclude.includes(term)) continue;
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
  return markBold(raw, ['USDC']);
});

const step3Html = computed(() => markBold(t('pay.step3')));

const banxaStep1Html = computed(() => {
  const href = props.banxaUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const link = `<a href="${href}" target="_blank" rel="noopener noreferrer">Banxa</a>`;
  return t('pay.banxa_step1', { banxa: '__BANXA__' }).replace('__BANXA__', link);
});
const banxaStep2Html = computed(() => markBold(t('pay.banxa_step2'), [], BANXA_BOLD_TERMS));
const banxaStep3Html = computed(() => t('pay.banxa_step3'));

// EEA visitors get the wallet-type instruction; everyone else keeps the
// Boost Points opt-out warning.
const step4Html = computed(() =>
  markBold(t(isEeaCountry(props.country) ? 'pay.step4_eea' : 'pay.step4'))
);
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
