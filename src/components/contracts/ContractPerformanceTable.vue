<template>
  <section class="sa-card cpt">
    <header class="cpt__head">
      <div>
        <h3>Performance Histórica</h3>
        <p>Evolução diária dos indicadores de capital e performance</p>
      </div>
      <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" @click="fullOpen = true">
        Ver histórico completo <ArrowRight :size="16" class="q-ml-sm" />
      </q-btn>
    </header>

    <div class="cpt__scroll">
      <table class="cpt__table">
        <thead>
          <tr>
            <th class="cpt__sticky cpt__indicator">Indicador</th>
            <th v-for="d in summaryDates" :key="d" class="cpt__date">{{ d }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in contractMetrics" :key="m.id">
            <td class="cpt__sticky cpt__metric">
              <span>{{ m.label }}</span>
              <small v-if="m.description">{{ m.description }}</small>
            </td>
            <td v-for="(v, i) in summaryMetricData[m.id]" :key="i" class="cpt__cell">
              <MetricCell :type="m.type" :value="v" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Histórico completo (tela cheia) -->
    <q-dialog v-model="fullOpen" maximized transition-show="fade" transition-hide="fade">
      <div class="cpt-full">
        <div class="cpt-full__head">
          <div class="cpt-full__title">
            <span class="cpt-full__icon"><ArrowUpRight :size="24" /></span>
            <div>
              <h2>Performance Histórica Completa do Contrato</h2>
              <p>Análise detalhada de evolução patrimonial e indicadores</p>
            </div>
          </div>
          <q-btn outline no-caps class="sa-btn sa-btn--outline" @click="fullOpen = false">
            <X :size="16" class="q-mr-sm" /> Fechar histórico completo
          </q-btn>
        </div>

        <div class="cpt-full__toolbar">
          <div class="cpt-full__filters">
            <span class="sa-label-xs cpt-full__filters-label">Período de Análise:</span>
            <button
              v-for="f in timeFilters"
              :key="f.id"
              type="button"
              class="cpt-full__chip"
              :class="{ 'cpt-full__chip--active': timeFilter === f.id }"
              @click="timeFilter = f.id"
            >
              {{ f.label }}
            </button>
            <span class="cpt-full__divider" />
            <q-btn flat no-caps class="sa-btn sa-btn--ghost sa-btn--sm">
              <CalendarIcon :size="14" class="q-mr-sm" /> Intervalo Personalizado
            </q-btn>
          </div>
          <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm">
            <Filter :size="14" class="q-mr-sm" /> Filtros Avançados
          </q-btn>
        </div>

        <div class="cpt-full__content">
          <div class="cpt-full__card">
            <table class="cpt__table cpt__table--full">
              <thead>
                <tr>
                  <th class="cpt__sticky cpt__indicator cpt-full__indicator">Indicador de Performance</th>
                  <th v-for="d in displayDates" :key="d" class="cpt__date cpt-full__date">{{ d }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in contractMetrics" :key="m.id">
                  <td class="cpt__sticky cpt__metric cpt-full__metric">
                    <span>{{ m.label }}</span>
                    <small v-if="m.description">{{ m.description }}</small>
                  </td>
                  <td v-for="(v, i) in displayData[m.id]" :key="i" class="cpt__cell cpt-full__cell">
                    <MetricCell :type="m.type" :value="v" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="cpt-full__foot">
          <span>Mostrando {{ displayDates.length }} registros</span>
          <span class="cpt-full__audit"><Check :size="14" class="text-emerald-600" /> Dados consolidados e auditados pelo sistema</span>
        </div>
      </div>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowRight, ArrowUpRight, Calendar as CalendarIcon, Check, Filter, X } from 'lucide-vue-next';
import MetricCell from './MetricCell.vue';
import {
  contractMetrics,
  fullHistoryDates,
  fullHistoryMetricData,
  summaryDates,
  summaryMetricData,
  type MetricCell as Cell,
} from 'src/mocks/contracts';

const fullOpen = ref(false);
const timeFilter = ref<'30d' | '90d' | '12m' | 'all'>('all');
const timeFilters = [
  { id: '30d' as const, label: 'Últimos 30 dias' },
  { id: '90d' as const, label: 'Últimos 90 dias' },
  { id: '12m' as const, label: 'Últimos 12 meses' },
  { id: 'all' as const, label: 'Período Completo' },
];

const startIndex = computed(() => {
  const len = fullHistoryDates.length;
  const days = { '30d': 30, '90d': 90, '12m': 365, all: len }[timeFilter.value];
  return Math.max(0, len - days);
});

const displayDates = computed(() => fullHistoryDates.slice(startIndex.value));
const displayData = computed(() => {
  const out: Record<string, Cell[]> = {};
  for (const [k, rows] of Object.entries(fullHistoryMetricData)) out[k] = rows.slice(startIndex.value);
  return out;
});
</script>

<style scoped lang="scss">
.cpt {
  &__head {
    padding: 16px 24px;
    border-bottom: 1px solid var(--slate-100);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    @media (min-width: 640px) { flex-direction: row; align-items: center; }
    h3 { margin: 0; font-size: 18px; font-weight: 500; color: var(--slate-800); }
    p { margin: 4px 0 0; font-size: 14px; color: var(--slate-500); }
  }

  &__scroll { overflow-x: auto; padding-bottom: 16px; }

  &__table {
    width: max-content;
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;
    white-space: nowrap;

    thead th { background: var(--slate-50); height: 40px; padding: 0 8px; border-bottom: 1px solid var(--slate-200); }
    tbody tr:nth-child(even) td { background: rgba(248, 250, 252, 0.3); }
    tbody tr:hover td { background: rgba(248, 250, 252, 0.5); }
    tbody td { border-bottom: 1px solid var(--slate-200); }
    tbody tr:last-child td { border-bottom: 0; }
  }

  &__sticky {
    position: sticky;
    left: 0;
    z-index: 2;
    border-right: 1px solid var(--slate-200);
    box-shadow: 4px 0 24px -2px rgba(0, 0, 0, 0.05);
  }

  &__indicator { width: 250px; min-width: 250px; text-align: left; font-weight: 600; color: var(--slate-900); }

  &__date {
    min-width: 140px;
    text-align: center;
    font-weight: 500;
    color: var(--slate-600);
    border-right: 1px solid var(--slate-100);
    &:last-child { border-right: 0; }
  }

  &__metric {
    background: #fff !important;
    padding: 12px 8px;
    vertical-align: top;
    font-weight: 500;
    color: var(--slate-700);
    span, small { display: block; }
    small { font-size: 10px; font-weight: 400; color: var(--slate-400); margin-top: 2px; }
  }

  &__cell {
    text-align: center;
    vertical-align: top;
    padding: 16px;
    border-right: 1px solid var(--slate-100);
    &:last-child { border-right: 0; }
  }
}

.cpt-full {
  background: var(--slate-50);
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  &__head {
    background: #fff;
    border-bottom: 1px solid var(--slate-200);
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 16px;
    h2 { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 700; color: var(--slate-900); letter-spacing: -0.025em; }
    p { margin: 2px 0 0; font-size: 14px; color: var(--slate-500); }
  }

  &__icon { padding: 10px; background: var(--indigo-50); color: var(--indigo-600); border-radius: 8px; display: flex; }

  &__toolbar {
    background: #fff;
    border-bottom: 1px solid var(--slate-200);
    padding: 12px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-shrink: 0;
  }

  &__filters { display: flex; align-items: center; gap: 8px; overflow-x: auto; }
  &__filters-label { color: var(--slate-400); margin-right: 8px; white-space: nowrap; }

  &__chip {
    padding: 8px 16px;
    border-radius: 999px;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid var(--slate-200);
    background: #fff;
    color: var(--slate-600);
    cursor: pointer;
    transition: all 0.15s;
    &:hover { background: var(--slate-50); border-color: var(--slate-300); color: var(--slate-900); }
    &--active, &--active:hover { background: var(--slate-900); color: #fff; border-color: var(--slate-900); }
  }

  &__divider { width: 1px; height: 24px; background: var(--slate-200); margin: 0 12px; }

  &__content { flex: 1; overflow: auto; padding: 32px 32px 80px; }

  &__card {
    width: max-content;
    min-width: 100%;
    border: 1px solid var(--slate-200);
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    overflow: hidden;
  }

  &__indicator {
    width: 320px;
    min-width: 320px;
    padding: 20px 8px 20px 32px !important;
    font-weight: 700;
    color: var(--slate-800);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  &__date { min-width: 180px; padding: 20px 8px !important; font-weight: 600; }

  &__metric {
    padding: 20px 8px 20px 32px;
    span { font-size: 14px; font-weight: 700; color: var(--slate-800); }
    small { font-size: 11px; max-width: 240px; white-space: normal; margin-top: 6px; }
  }

  &__cell { padding: 20px; }

  &__foot {
    background: #fff;
    border-top: 1px solid var(--slate-200);
    padding: 12px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-400);
    flex-shrink: 0;
  }

  &__audit { display: flex; align-items: center; gap: 6px; }
}
</style>
