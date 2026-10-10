<template>
  <q-dialog v-model="open">
    <div class="sa-dialog sa-dialog--xl lfh">
      <div class="lfh__head">
        <h2>
          <BarChart3 :size="20" class="text-indigo-600" />
          Histórico Completo da Lógica
          <span class="sa-badge sa-badge--outline font-mono lfh__name">{{ logicName }}</span>
        </h2>
        <div class="lfh__filters">
          <div class="lfh__period">
            <Filter :size="14" class="text-slate-400" />
            <SaSelect v-model="period" size="sm" width="160px" :options="periodOptions" />
          </div>
          <span class="lfh__divider" />
          <span class="lfh__count">Exibindo <strong>{{ filtered.length }}</strong> registros</span>
          <q-btn flat round dense aria-label="Fechar" @click="open = false"><X :size="18" /></q-btn>
        </div>
      </div>

      <div class="lfh__body">
        <div class="sa-card lfh__card">
          <table class="lfh__table">
            <thead>
              <tr>
                <th class="lfh__sticky">Indicador / Parâmetro</th>
                <th v-for="r in filtered" :key="r.date">{{ r.date }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="lfh__section">
                <td :colspan="filtered.length + 1"><span>Indicadores de Performance</span></td>
              </tr>
              <tr>
                <td class="lfh__sticky">Variação Diária [%]</td>
                <td v-for="r in filtered" :key="r.date" :class="tone(r.variation)">{{ r.variation.toFixed(2) }}%</td>
              </tr>
              <tr>
                <td class="lfh__sticky">Osc. Máx. Negativa</td>
                <td v-for="r in filtered" :key="r.date" :class="tone(r.maxNegOsc)">{{ r.maxNegOsc.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="lfh__sticky">Osc. Máx. Positiva</td>
                <td v-for="r in filtered" :key="r.date" :class="tone(r.maxPosOsc)">{{ r.maxPosOsc.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="lfh__sticky">Média de Oscilação</td>
                <td v-for="r in filtered" :key="r.date" class="lfh__muted">{{ r.avgOsc.toFixed(2) }}</td>
              </tr>

              <tr class="lfh__section lfh__section--indigo">
                <td :colspan="filtered.length + 1"><span>Parâmetros Estruturais (Snapshot Diário)</span></td>
              </tr>
              <tr>
                <td class="lfh__sticky">Intervalo Operacional</td>
                <td v-for="r in filtered" :key="r.date" class="lfh__param lfh__plain">{{ r.params.interval }}</td>
              </tr>
              <tr>
                <td class="lfh__sticky">Teto Sup / Faixa Mín Sup</td>
                <td v-for="r in filtered" :key="r.date" class="lfh__param text-emerald-600">{{ fmt(r.params.upperMax) }} / {{ fmt(r.params.upperMin) }}</td>
              </tr>
              <tr>
                <td class="lfh__sticky">Teto Inf / Faixa Mín Inf</td>
                <td v-for="r in filtered" :key="r.date" class="lfh__param text-rose-600">{{ fmt(r.params.lowerMax) }} / {{ fmt(r.params.lowerMin) }}</td>
              </tr>
              <tr>
                <td class="lfh__sticky">Retorno Diário</td>
                <td v-for="r in filtered" :key="r.date" class="lfh__param lfh__indigo">{{ r.params.dailyFactor.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { BarChart3, Filter, X } from 'lucide-vue-next';
import SaSelect from 'components/ui/SaSelect.vue';
import type { HistoryRow } from 'src/mocks/logics';

const props = defineProps<{ history: HistoryRow[]; logicName: string }>();
const open = defineModel<boolean>({ default: false });

const period = ref<string | number | boolean | null>('30');
const periodOptions = [
  { label: 'Últimos 7 dias', value: '7' },
  { label: 'Últimos 30 dias', value: '30' },
  { label: 'Últimos 60 dias', value: '60' },
  { label: 'Todo o período', value: 'all' },
];

const filtered = computed(() => {
  if (period.value === 'all') return props.history;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(period.value));
  return props.history.filter((r) => r.dateObj >= cutoff);
});

const tone = (v: number) => (v >= 0 ? 'text-emerald-700' : 'text-rose-700');
const fmt = (v: number | null) => (v !== null ? v.toFixed(1) : '∞');
</script>

<style scoped lang="scss">
.lfh {
  &__head {
    padding: 16px 24px;
    border-bottom: 1px solid var(--slate-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-shrink: 0;
    flex-wrap: wrap;
    h2 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; color: var(--slate-900); }
  }

  &__name { margin-left: 8px; font-weight: 400; color: var(--slate-500); }
  &__filters { display: flex; align-items: center; gap: 16px; }

  &__period {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 4px 2px 8px;
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: 6px;
  }

  &__divider { width: 1px; height: 16px; background: var(--slate-200); }
  &__count { font-size: 12px; font-weight: 500; color: var(--slate-500); strong { color: var(--slate-900); font-weight: 500; } }

  &__body { flex: 1; overflow: hidden; padding: 24px; background: rgba(248, 250, 252, 0.5); }
  &__card { height: 100%; overflow: auto; }

  &__table {
    width: max-content;
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;
    white-space: nowrap;

    thead th {
      position: sticky;
      top: 0;
      z-index: 2;
      background: #fff;
      min-width: 140px;
      padding: 16px 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--slate-600);
      border-bottom: 1px solid var(--slate-100);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    }

    td {
      padding: 8px;
      text-align: center;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
      border-bottom: 1px solid var(--slate-100);
    }
  }

  &__sticky {
    position: sticky;
    left: 0;
    z-index: 1;
    width: 250px;
    min-width: 250px !important;
    background: #fff;
    border-right: 1px solid var(--slate-100);
    padding-left: 24px !important;
    text-align: left !important;
    font-family: inherit !important;
    font-size: 14px !important;
    font-weight: 500;
    color: var(--slate-700);
  }
  thead th.lfh__sticky { z-index: 3; font-weight: 700; color: var(--slate-800); }

  &__section td {
    background: rgba(248, 250, 252, 0.5);
    padding: 8px 24px;
    text-align: left;
    font-family: inherit;
    span {
      position: sticky;
      left: 24px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--slate-400);
    }
  }

  &__section--indigo td { border-top: 1px solid var(--slate-200); span { color: var(--indigo-400); } }

  &__muted { color: var(--slate-500); }
  &__param { background: rgba(248, 250, 252, 0.2); }
  &__plain { font-family: inherit !important; font-weight: 500; color: var(--slate-600); }
  &__indigo { color: var(--indigo-600); font-weight: 700; }
}
</style>
