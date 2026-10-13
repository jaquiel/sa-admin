<template>
  <div>
    <h4 class="rt__title">Últimas Movimentações</h4>
    <div class="rt__list">
      <div v-for="m in movements" :key="m.transactionId" class="rt__item">
        <div class="rt__row">
          <span class="rt__date" :title="`${movementMeta(m, currency).label} · ${m.requestNumber}`">
            <component :is="movementMeta(m, currency).icon" :size="16" :class="movementMeta(m, currency).cls" /> {{ formatDate(m.occurredAtUtc) }}
          </span>
          <span class="rt__value" :class="movementMeta(m, currency).cls">{{ movementMeta(m, currency).signed }}</span>
        </div>
        <div class="rt__daily">
          <span>Saldo do Dia:</span>
          <span class="font-mono">{{ formatCurrencyIn(Number(m.balanceAfter), currency) }}</span>
        </div>
      </div>
      <p v-if="!movements.length" class="rt__none">Sem movimentações.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminWalletMovement } from 'src/types/api';
import { formatCurrencyIn, formatDate } from 'src/utils/format';
import { movementMeta } from 'src/utils/wallet-labels';

defineProps<{ movements: AdminWalletMovement[]; currency: string }>();
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
