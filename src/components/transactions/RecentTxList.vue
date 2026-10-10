<template>
  <div>
    <h4 class="rt__title">Últimas Movimentações</h4>
    <div class="rt__list">
      <div v-for="t in transactions.slice(0, 3)" :key="t.id" class="rt__item">
        <div class="rt__row">
          <span class="rt__date"><WalletTxIcon :type="t.type" /> {{ formatDate(t.date) }}</span>
          <span class="rt__value" :class="t.type === 'Withdraw' ? 'text-rose-600' : 'text-emerald-600'">
            {{ t.type === 'Withdraw' ? '-' : '+' }}{{ formatCurrencyIn(t.value, t.currency) }}
          </span>
        </div>
        <div class="rt__daily">
          <span>Saldo do Dia:</span>
          <span class="font-mono">{{ formatCurrencyIn(t.dailyBalance, t.currency) }}</span>
        </div>
      </div>
      <p v-if="!transactions.length" class="rt__none">Nenhuma movimentação recente.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import WalletTxIcon from './WalletTxIcon.vue';
import type { WalletTransaction } from 'src/mocks/transactions';
import { formatCurrencyIn, formatDate } from 'src/utils/format';

defineProps<{ transactions: WalletTransaction[] }>();
</script>

<style scoped lang="scss">
.rt {
  &__title { margin: 0 0 12px; font-size: 12px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.05em; }
  &__list { display: flex; flex-direction: column; gap: 12px; }
  &__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--slate-50);
    &:last-child { border-bottom: 0; padding-bottom: 0; }
  }
  &__row { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
  &__date { display: flex; align-items: center; gap: 8px; color: var(--slate-600); }
  &__value { font-weight: 500; }
  &__daily { display: flex; align-items: center; justify-content: space-between; padding-left: 24px; font-size: 12px; span:first-child { color: var(--slate-400); } span:last-child { color: var(--slate-500); } }
  &__none { margin: 0; font-size: 14px; font-style: italic; color: var(--slate-400); }
}
</style>
