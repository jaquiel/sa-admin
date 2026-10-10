<template>
  <section class="sa-card ch">
    <header class="ch__head">
      <div class="ch__title">
        <span class="ch__icon"><History :size="16" /></span>
        <h3>Histórico de Aportes do Capital Base</h3>
      </div>

      <div class="ch__summary">
        <div class="ch__equation">
          <span class="ch__pill ch__pill--slate font-mono">{{ formatBRL(initialCapital) }}</span>
          <Plus :size="16" class="text-slate-400" />
          <span class="ch__pill ch__pill--indigo font-mono">{{ formatBRL(additionalTotal) }}</span>
          <Equal :size="16" class="text-slate-400" />
          <span class="ch__pill ch__pill--emerald font-mono">{{ formatBRL(total) }}</span>
        </div>
        <div class="ch__legend">
          <span><i class="ch__dot ch__dot--slate" /> Capital Inicial Contratual</span>
          <span><i class="ch__dot ch__dot--indigo" /> Aportes adicionais realizados no contrato</span>
          <span class="ch__legend-strong"><i class="ch__dot ch__dot--emerald" /> Capital Base Consolidado (Capital Inicial + Aportes)</span>
        </div>
      </div>
    </header>

    <div class="ch__table-wrap">
      <table class="sa-table ch__table">
        <thead>
          <tr>
            <th class="ch__first" style="width: 120px">Data</th>
            <th>Tipo de Aporte</th>
            <th>Origem / Canal</th>
            <th>Responsável</th>
            <th class="text-right ch__last">Valor (BRL)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in contributions" :key="c.id">
            <td class="ch__first ch__date">{{ c.date }}</td>
            <td><span class="sa-badge" :class="typeCls[c.type]">{{ c.type }}</span></td>
            <td><span class="ch__origin"><CreditCard :size="14" class="text-slate-400" /> {{ c.origin }}</span></td>
            <td class="ch__muted">{{ c.responsible }}</td>
            <td class="text-right ch__last ch__value font-mono">{{ formatBRL(c.value) }}</td>
          </tr>
          <tr class="ch__total-row">
            <td colspan="4" class="text-right ch__total-label">Capital Base Consolidado (Inicial + Aportes)</td>
            <td class="text-right ch__last ch__total font-mono">{{ formatBRL(total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CreditCard, Equal, History, Plus } from 'lucide-vue-next';
import { contributionsMock as contributions, type ContributionType } from 'src/mocks/contracts';
import { formatBRL } from 'src/utils/format';

const total = computed(() => contributions.reduce((acc, c) => acc + c.value, 0));
const initialCapital = computed(() => contributions.find((c) => c.type === 'Aporte Inicial')?.value ?? 0);
const additionalTotal = computed(() => total.value - initialCapital.value);

const typeCls: Record<ContributionType, string> = {
  'Aporte Inicial': 'sa-badge--slate-soft',
  'Aporte Adicional': 'sa-badge--indigo',
  'Reforço de Capital': 'sa-badge--emerald',
};
</script>

<style scoped lang="scss">
.ch {
  &__head {
    padding: 16px 24px;
    border-bottom: 1px solid var(--slate-100);
    background: rgba(248, 250, 252, 0.3);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--slate-700); text-transform: uppercase; letter-spacing: 0.025em; }
  }

  &__icon { padding: 6px; background: var(--indigo-100); color: var(--indigo-600); border-radius: 6px; display: flex; }

  &__summary {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    @media (min-width: 1280px) { flex-direction: row; }
  }

  &__equation {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    @media (min-width: 640px) { flex-direction: row; }
  }

  &__pill {
    padding: 6px 12px;
    border: 1px solid;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    &--slate { background: var(--slate-100); color: var(--slate-800); border-color: var(--slate-200); }
    &--indigo { background: var(--indigo-50); color: var(--indigo-700); border-color: var(--indigo-200); }
    &--emerald { background: var(--emerald-50); color: var(--emerald-700); border-color: var(--emerald-200); }
  }

  &__legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-500);
    width: 100%;
    border-top: 1px solid var(--slate-100);
    padding-top: 12px;
    @media (min-width: 1280px) { width: auto; align-items: flex-end; border-top: 0; padding-top: 0; }
    span { display: flex; align-items: center; gap: 8px; }
  }

  &__legend-strong { color: var(--slate-700); }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid;
    &--slate { background: var(--slate-200); border-color: var(--slate-300); }
    &--indigo { background: var(--indigo-100); border-color: var(--indigo-300); }
    &--emerald { background: var(--emerald-100); border-color: var(--emerald-300); }
  }

  &__table-wrap { overflow-x: auto; }

  &__table {
    thead tr { background: var(--slate-50); }
    th { font-size: 14px; text-transform: none; font-weight: 600; color: var(--slate-600); }
  }

  &__first { padding-left: 24px !important; }
  &__last { padding-right: 24px !important; }
  &__date { font-weight: 500; color: var(--slate-700); }
  &__origin { display: flex; align-items: center; gap: 8px; color: var(--slate-600); }
  &__muted { color: var(--slate-600); }
  &__value { font-weight: 700; color: var(--slate-900); }

  &__total-row {
    background: rgba(248, 250, 252, 0.5);
    border-top: 2px solid var(--slate-100);
  }

  &__total-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-600) !important;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    padding-right: 16px !important;
  }

  &__total {
    font-size: 16px;
    font-weight: 700;
    color: var(--indigo-700) !important;
    background: rgba(238, 242, 255, 0.3);
  }
}
</style>
