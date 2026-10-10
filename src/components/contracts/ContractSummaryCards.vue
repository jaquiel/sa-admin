<template>
  <div class="cs">
    <div class="cs__top">
      <!-- Vigência + remanescente -->
      <section class="sa-card cs__card cs__validity">
        <div>
          <div class="cs__label-row">
            <p class="sa-label-xs">Período de Vigência</p>
            <Calendar :size="14" class="text-slate-400" />
          </div>
          <div class="cs__period">
            {{ shortDate(startDate) }} <span>até</span> {{ shortDate(endDate) }}
          </div>
        </div>
        <hr class="sa-separator cs__sep" />
        <div>
          <div class="cs__label-row">
            <p class="sa-label-xs">Vigência Remanescente</p>
            <Clock :size="14" class="text-slate-400" />
          </div>
          <div class="cs__remaining">
            <h3>{{ remainingDays.toLocaleString('pt-BR') }} dias</h3>
            <p>(~ {{ (remainingDays / 365).toFixed(1) }} anos)</p>
          </div>
        </div>
      </section>

      <!-- Lógicas -->
      <section class="sa-card cs__card cs__logics" :class="{ 'cs__logics--editing': editing }">
        <div class="cs__logic">
          <div class="cs__label-row">
            <p class="sa-label-xs">Lógica Contratual</p>
            <Link2 :size="14" class="text-slate-400" />
          </div>
          <SaSelect v-if="editing" :model-value="contractLogic" size="sm" :options="contractLogicOptions" @update:model-value="emit('update:contractLogic', String($event))" />
          <div v-else>
            <h3 class="cs__logic-name">{{ contractLogic }}</h3>
            <p class="cs__logic-sub">Perfil Agressivo</p>
          </div>
        </div>
        <div class="cs__logic">
          <div class="cs__label-row">
            <p class="sa-label-xs">Lógica de Dividendos</p>
            <Activity :size="14" class="text-slate-400" />
          </div>
          <SaSelect v-if="editing" :model-value="dividendLogic" size="sm" :options="dividendLogicOptions" @update:model-value="emit('update:dividendLogic', String($event))" />
          <div v-else>
            <h3 class="cs__logic-name">{{ dividendLogic }}</h3>
            <p class="cs__logic-sub">Distribuição Trimestral</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Saldo e desempenho -->
    <section class="sa-card cs__perf">
      <div class="cs__perf-body">
        <div class="cs__perf-title">
          <span class="cs__perf-icon"><Wallet :size="16" /></span>
          <h3>Saldo e Desempenho do Contrato</h3>
        </div>

        <div class="cs__perf-grid">
          <div class="cs__balance">
            <p class="cs__perf-label">Saldo Atual Consolidado</p>
            <span class="cs__balance-value">R$ 1.250.000,00</span>
            <div class="cs__realtime"><Activity :size="12" class="text-emerald-600" /> Atualizado em tempo real</div>
          </div>
          <div class="cs__metrics">
            <p class="cs__perf-label">Indicadores de Valorização</p>
            <div v-for="m in perfRows" :key="m.label" class="cs__metric">
              <div class="cs__metric-left">
                <span class="cs__metric-label">{{ m.label }}</span>
                <span class="cs__metric-sub">vs anterior</span>
              </div>
              <div class="cs__metric-right">
                <span class="cs__metric-value">{{ m.value }}</span>
                <span class="cs__metric-pct" :class="m.percent > 0 ? 'cs__metric-pct--up' : m.percent < 0 ? 'cs__metric-pct--down' : ''">
                  <ArrowUp v-if="m.percent > 0" :size="10" />
                  <ArrowDown v-else-if="m.percent < 0" :size="10" />
                  <Minus v-else :size="10" />
                  {{ Math.abs(m.percent) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="cs__expand">
          <q-btn flat no-caps class="sa-btn cs__expand-btn" @click="chartOpen = !chartOpen">
            {{ chartOpen ? 'Ocultar Gráfico' : 'Ver Gráfico de Performance' }}
            <ChevronUp v-if="chartOpen" :size="16" class="q-ml-sm" />
            <ChevronDown v-else :size="16" class="q-ml-sm" />
          </q-btn>
        </div>
      </div>

      <transition name="fade-slide">
        <div v-if="chartOpen" class="cs__chart">
          <apexchart type="line" height="300" :options="chartOptions" :series="chartSeries" />
          <div class="cs__legend">
            <span><i class="cs__legend-line" /> Performance Histórica</span>
            <span class="cs__legend-muted"><i class="cs__legend-line cs__legend-line--dashed" /> Projeção até 2029</span>
          </div>
        </div>
      </transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Activity, ArrowDown, ArrowUp, Calendar, ChevronDown, ChevronUp, Clock, Link2, Minus, Wallet } from 'lucide-vue-next';
import SaSelect from 'components/ui/SaSelect.vue';
import { performanceChart } from 'src/mocks/contracts';

const props = defineProps<{
  editing: boolean;
  contractLogic: string;
  dividendLogic: string;
  startDate: string;
  endDate: string;
}>();
const emit = defineEmits<{ 'update:contractLogic': [v: string]; 'update:dividendLogic': [v: string] }>();

const chartOpen = ref(false);

// Opções do modo de edição (as mesmas do Figma)
const contractLogicOptions = ['Growth Alpha V2', 'Income Beta V1', 'Hedge Protection', props.contractLogic]
  .filter((v, i, a) => a.indexOf(v) === i)
  .map((v) => ({ label: v, value: v }));
const dividendLogicOptions = ['Quarterly Yield+', 'Monthly Income', 'Reinvestment Only', props.dividendLogic]
  .filter((v, i, a) => a.indexOf(v) === i)
  .map((v) => ({ label: v, value: v }));

const perfRows = [
  { label: '30 dias', value: 'R$ 12.450,00', percent: 2.4 },
  { label: '90 dias', value: 'R$ 38.900,20', percent: 6.1 },
  { label: '1 ano', value: 'R$ 156.780,50', percent: 18.5 },
];

const shortDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]?.slice(2)}` : iso;
};

const remainingDays = computed(() => {
  const diff = new Date(props.endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
});

const chartSeries = [
  { name: 'Histórico', data: performanceChart.history },
  { name: 'Projeção', data: performanceChart.projection },
];

const chartOptions = {
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif', animations: { enabled: false } },
  colors: ['#4f46e5', '#94a3b8'],
  stroke: { curve: 'smooth', width: 2, dashArray: [0, 4] },
  grid: { borderColor: '#e2e8f0', strokeDashArray: 3, xaxis: { lines: { show: false } } },
  legend: { show: false },
  dataLabels: { enabled: false },
  markers: { size: 0, hover: { size: 4 } },
  xaxis: {
    categories: performanceChart.history.map((_, i) => `M${i}`),
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '10px' },
      formatter: (v: number) => `R$ ${(v / 1000000).toFixed(1)}M`,
    },
  },
  tooltip: {
    shared: false,
    x: { show: false },
    y: { formatter: (v: number) => `R$ ${v.toLocaleString('pt-BR')}`, title: { formatter: () => '' } },
  },
  annotations: {
    xaxis: [
      {
        x: `M${performanceChart.todayIndex}`,
        strokeDashArray: 3,
        borderColor: '#94a3b8',
        label: { text: 'Hoje', orientation: 'horizontal', borderWidth: 0, style: { color: '#64748b', fontSize: '10px', background: 'transparent' } },
      },
    ],
  },
};
</script>

<style scoped lang="scss">
.cs {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__top {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
  }

  &__validity {
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }

  &__label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    p { margin: 0; }
  }

  &__period {
    font-size: 14px;
    font-weight: 700;
    color: var(--slate-900);
    span { color: var(--slate-400); font-weight: 400; margin: 0 4px; }
  }

  &__sep { background: var(--slate-100); }

  &__remaining {
    display: flex;
    align-items: baseline;
    gap: 8px;
    h3 { margin: 0; font-size: 16px; font-weight: 700; line-height: 1; color: var(--slate-900); letter-spacing: -0.025em; }
    p { margin: 0; font-size: 10px; font-weight: 500; line-height: 1; color: var(--slate-400); }
  }

  &__logics {
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s;
    &--editing { border-color: var(--indigo-200); box-shadow: 0 0 0 1px var(--indigo-50); }
  }

  &__logic {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:first-child { border-bottom: 1px solid var(--slate-100); }
  }

  &__logic-name { margin: 0; font-size: 14px; font-weight: 700; line-height: 1.25; color: var(--slate-900); }
  &__logic-sub { margin: 4px 0 0; font-size: 10px; font-weight: 500; line-height: 1; color: var(--slate-400); }

  // ---------- Saldo e desempenho ----------
  &__perf-body { padding: 20px; }

  &__perf-title {
    display: flex;
    align-items: center;
    gap: 8px;
    h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--slate-700); text-transform: uppercase; letter-spacing: 0.025em; }
  }

  &__perf-icon { padding: 6px; background: var(--indigo-50); color: var(--indigo-600); border-radius: 6px; display: flex; }

  &__perf-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    margin-top: 24px;
    @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
  }

  &__perf-label {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__balance {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: 16px;
    @media (min-width: 768px) { border-right: 1px solid var(--slate-100); }
  }

  &__balance-value { font-size: 30px; font-weight: 700; color: var(--slate-900); letter-spacing: -0.025em; }

  &__realtime { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 12px; color: var(--slate-500); }

  &__metrics { display: flex; flex-direction: column; justify-content: center; gap: 2px; }

  &__metric {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--slate-100);
    font-size: 14px;
    &:last-child { border-bottom: 0; }
  }

  &__metric-left { display: flex; flex-direction: column; }
  &__metric-label { font-size: 10px; font-weight: 600; color: var(--slate-600); text-transform: uppercase; letter-spacing: 0.025em; }
  &__metric-sub { font-size: 10px; color: var(--slate-400); }
  &__metric-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  &__metric-value { font-weight: 700; color: var(--slate-900); }

  &__metric-pct {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 999px;
    color: var(--slate-600);
    background: var(--slate-100);
    &--up { color: var(--emerald-700); background: var(--emerald-50); }
    &--down { color: var(--rose-700); background: var(--rose-50); }
  }

  &__expand {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--slate-50);
    display: flex;
    justify-content: center;
  }

  &__expand-btn {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: var(--slate-500);
    &:hover { color: var(--indigo-600); background: rgba(238, 242, 255, 0.5); }
  }

  &__chart {
    border-top: 1px solid var(--slate-100);
    background: rgba(248, 250, 252, 0.3);
    padding: 20px;
  }

  &__legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-top: 16px;
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-600);
    span { display: flex; align-items: center; gap: 8px; }
  }

  &__legend-muted { color: var(--slate-500) !important; }

  &__legend-line {
    width: 12px;
    height: 2px;
    border-radius: 999px;
    background: var(--indigo-600);
    &--dashed { background: transparent; border-top: 2px dashed var(--slate-400); height: 0; }
  }
}
</style>
