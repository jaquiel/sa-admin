<template>
  <div class="lp">
    <!-- Barra executiva -->
    <div class="sa-topbar">
      <div class="sa-topbar__inner">
        <div class="lp__title-row">
          <div>
            <h1 class="lp__title">Painel de Lógicas</h1>
            <p class="sa-page__subtitle">Visão executiva e controle operacional das lógicas contratuais.</p>
          </div>
          <q-btn v-if="canWrite" unelevated no-caps class="sa-btn sa-btn--primary" @click="router.push({ name: 'logic-create' })">
            <Plus :size="16" class="q-mr-sm" /> Criar Nova Lógica
          </q-btn>
        </div>

        <div class="lp__stats">
          <div class="lp__stat">
            <span class="lp__stat-label">Total de Lógicas</span>
            <span class="lp__stat-value">{{ stats.total }}</span>
          </div>
          <div class="lp__stat">
            <span class="lp__stat-label lp__stat-label--emerald">Ativas</span>
            <span class="lp__stat-value lp__stat-value--emerald">{{ stats.active }}</span>
          </div>
          <div class="lp__stat">
            <span class="lp__stat-label lp__stat-label--orange">Pausadas</span>
            <span class="lp__stat-value lp__stat-value--orange">{{ stats.paused }}</span>
          </div>
          <div class="lp__stat">
            <span class="lp__stat-label">Perf. Média (YTD)</span>
            <div class="lp__stat-row">
              <span class="lp__stat-value" :class="{ 'text-rose-600': stats.avgPerf < 0 }">{{ stats.avgPerf.toFixed(2) }}%</span>
              <TrendingUp v-if="stats.avgPerf >= 0" :size="16" class="lp__up" />
              <TrendingDown v-else :size="16" class="lp__down" />
            </div>
          </div>
          <div class="lp__stat">
            <span class="lp__stat-label">Contratos Vinculados</span>
            <span class="lp__stat-value">{{ stats.totalContracts }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lp__body">
      <!-- Toolbar -->
      <div class="lp__toolbar">
        <div class="lp__toolbar-left">
          <SaInput v-model="search" placeholder="Buscar..." class="lp__search">
            <template #prepend><Search :size="16" /></template>
          </SaInput>
          <SaSelect v-model="statusFilter" size="sm" width="140px" :options="statusOptions" />
          <SaSelect v-model="contractFilter" size="sm" width="150px" :options="contractOptions" />
        </div>
        <div class="lp__toolbar-right">
          <SaSelect v-model="sortOrder" size="sm" width="240px" :options="sortOptions">
            <template #prepend><ArrowUpDown :size="14" /></template>
          </SaSelect>
          <div class="sa-seg">
            <button type="button" :class="{ active: viewMode === 'list' }" title="Lista" @click="viewMode = 'list'"><List :size="16" /></button>
            <button type="button" :class="{ active: viewMode === 'grid' }" title="Cards" @click="viewMode = 'grid'"><LayoutGrid :size="16" /></button>
          </div>
        </div>
      </div>

      <!-- Lista -->
      <div v-if="viewMode === 'list'" class="sa-card">
        <div class="lp__table-wrap">
          <table class="sa-table lp__table">
            <thead>
              <tr>
                <th class="lp__first" style="width: 25%">Lógica / ID</th>
                <th style="width: 15%">Configuração</th>
                <th style="width: 15%">Performance</th>
                <th style="width: 25%">Contratos Vinculados</th>
                <th style="width: 10%">Reset</th>
                <th style="width: 10%"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in processed" :key="l.id" class="lp__row" @click="open(l.id)">
                <td class="lp__first">
                  <div class="lp__identity">
                    <div class="lp__name"><CircuitBoard :size="16" class="lp__name-icon" /> {{ l.name }}</div>
                    <div class="lp__badges"><LogicBadges :logic="l" /></div>
                    <span class="lp__id font-mono">{{ l.id }}</span>
                  </div>
                  <q-tooltip class="sa-hovercard" anchor="center right" self="center left" :offset="[16, 0]" :delay="200">
                    <LogicHoverContent :logic="l" />
                  </q-tooltip>
                </td>
                <td>
                  <div class="lp__kv"><span>Retorno Dia</span><strong>{{ l.dailyReturn.toFixed(2) }}%</strong></div>
                  <div class="lp__kv"><span>Intervalo</span><em>{{ l.operationalInterval }}</em></div>
                </td>
                <td>
                  <div class="lp__kv lp__kv--sm">
                    <span>YTD</span><strong :class="l.performanceYTD > 0 ? 'text-emerald-600' : 'text-rose-600'">{{ signed(l.performanceYTD) }}</strong>
                  </div>
                  <div class="lp__kv lp__kv--sm">
                    <span>Total</span><em :class="l.performanceAllTime > 0 ? 'text-emerald-600' : 'text-rose-600'">{{ signed(l.performanceAllTime) }}</em>
                  </div>
                </td>
                <td>
                  <div class="lp__contracts">
                    <span class="lp__contracts-count">{{ l.contracts.length }} Contrato{{ l.contracts.length !== 1 ? 's' : '' }}</span>
                    <div class="lp__contracts-chips">
                      <span v-for="c in l.contracts.slice(0, 2)" :key="c.id" class="sa-badge sa-badge--xs sa-badge--slate lp__chip">{{ c.name }}</span>
                      <span v-if="l.contracts.length > 2" class="sa-badge sa-badge--xs sa-badge--slate lp__chip lp__chip--more">+{{ l.contracts.length - 2 }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="lp__reset"><Clock :size="14" class="text-slate-400" /> <span class="font-mono">{{ l.lastOscillationReset }}</span></span>
                </td>
                <td class="lp__last" @click.stop>
                  <div class="lp__row-actions">
                    <q-btn flat no-caps dense class="sa-btn lp__open" label="Abrir" @click="open(l.id)" />
                    <LogicActionMenu :logic="l" @open="open(l.id)" @duplicate="duplicate(l)" @toggle="toggle(l)" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!processed.length" class="sa-empty lp__empty">
          <Search :size="32" class="lp__empty-icon" />
          <p>Nenhum resultado encontrado</p>
        </div>
      </div>

      <!-- Grade -->
      <div v-else class="lp__grid">
        <article v-for="l in processed" :key="l.id" class="sa-card lp__card" @click="open(l.id)">
          <i class="lp__card-bar" :class="{ 'lp__card-bar--active': l.status === 'Active' }" />
          <header class="lp__card-head">
            <div class="lp__card-top">
              <div>
                <h3>{{ l.name }}</h3>
                <span class="lp__id font-mono">{{ l.id }}</span>
              </div>
              <div @click.stop><LogicActionMenu :logic="l" @open="open(l.id)" @duplicate="duplicate(l)" @toggle="toggle(l)" /></div>
            </div>
            <div class="lp__badges lp__card-badges"><LogicBadges :logic="l" /></div>
          </header>
          <div class="lp__card-body">
            <div class="lp__card-metrics">
              <div>
                <span class="lp__card-label">YTD</span>
                <div class="lp__card-value" :class="l.performanceYTD > 0 ? 'text-emerald-600' : 'text-rose-600'">{{ signed(l.performanceYTD) }}</div>
              </div>
              <div>
                <span class="lp__card-label">Retorno Dia</span>
                <div class="lp__card-value lp__card-value--slate">{{ l.dailyReturn.toFixed(2) }}%</div>
              </div>
            </div>
            <hr class="sa-separator" />
            <div class="lp__card-foot">
              <span><Clock :size="14" /> Int: {{ l.operationalInterval }}</span>
              <span><LinkIcon :size="14" /> {{ l.contracts.length }} Vínculos</span>
            </div>
          </div>
          <q-tooltip class="sa-hovercard" anchor="center right" self="center left" :offset="[8, 0]" :delay="400">
            <LogicHoverContent :logic="l" />
          </q-tooltip>
        </article>
        <div v-if="!processed.length" class="sa-empty lp__grid-empty">
          <Search :size="32" class="lp__empty-icon" />
          <p>Nenhum resultado encontrado</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  ArrowUpDown,
  CircuitBoard,
  Clock,
  LayoutGrid,
  Link as LinkIcon,
  List,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import LogicBadges from 'components/logics/LogicBadges.vue';
import LogicHoverContent from 'components/logics/LogicHoverContent.vue';
import LogicActionMenu from 'components/logics/LogicActionMenu.vue';
import { logicsMock, type LogicSummary } from 'src/mocks/logics';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();
const canWrite = computed(() => auth.can('logics:write'));

const search = ref<string | number | null>('');
const statusFilter = ref('all');
const contractFilter = ref('all');
const sortOrder = ref('ytd_desc');
const viewMode = ref<'list' | 'grid'>('list');

const statusOptions = [
  { label: 'Todos Status', value: 'all' },
  { label: 'Ativa', value: 'Active' },
  { label: 'Pausada', value: 'Paused' },
  { label: 'Em Análise', value: 'Analysis' },
  { label: 'Inativa', value: 'Inactive' },
];
const contractOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Com Vínculos', value: 'yes' },
  { label: 'Sem Vínculos', value: 'no' },
];
const sortOptions = [
  { label: 'Maior Performance YTD', value: 'ytd_desc' },
  { label: 'Melhor Performance (Total)', value: 'alltime_desc' },
  { label: 'Maior Adesão (Contratos)', value: 'contracts_desc' },
  { label: 'Maior Retorno Diário', value: 'daily_desc' },
  { label: 'Menor Intervalo Op.', value: 'interval_asc' },
  { label: 'Atualização Recente', value: 'updated_desc' },
  { label: 'Criação (Recente)', value: 'newest' },
  { label: 'Criação (Antiga)', value: 'oldest' },
];

const processed = computed(() => {
  const term = String(search.value ?? '').toLowerCase();
  const list = logicsMock.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(term) || l.id.toLowerCase().includes(term) || l.description.toLowerCase().includes(term);
    const matchesStatus = statusFilter.value === 'all' || l.status === statusFilter.value;
    const matchesContract =
      contractFilter.value === 'all' || (contractFilter.value === 'yes' ? l.contracts.length > 0 : l.contracts.length === 0);
    return matchesSearch && matchesStatus && matchesContract;
  });
  const sorters: Record<string, (a: LogicSummary, b: LogicSummary) => number> = {
    ytd_desc: (a, b) => b.performanceYTD - a.performanceYTD,
    alltime_desc: (a, b) => b.performanceAllTime - a.performanceAllTime,
    contracts_desc: (a, b) => b.contracts.length - a.contracts.length,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
    daily_desc: (a, b) => b.dailyReturn - a.dailyReturn,
    interval_asc: (a, b) => a.operationalIntervalSeconds - b.operationalIntervalSeconds,
    updated_desc: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  };
  return [...list].sort(sorters[sortOrder.value]);
});

const stats = computed(() => {
  const total = logicsMock.length;
  return {
    total,
    active: logicsMock.filter((l) => l.status === 'Active').length,
    paused: logicsMock.filter((l) => l.status === 'Paused').length,
    avgPerf: total ? logicsMock.reduce((acc, l) => acc + l.performanceYTD, 0) / total : 0,
    totalContracts: logicsMock.reduce((acc, l) => acc + l.contracts.length, 0),
  };
});

const signed = (v: number) => `${v > 0 ? '+' : ''}${v}%`;

function open(id: string) {
  void router.push({ name: 'logic-detail', params: { id } });
}

function duplicate(l: LogicSummary) {
  const id = `LOG-${Math.floor(10000 + Math.random() * 90000)}`;
  logicsMock.push({ ...l, id, name: `${l.name} (cópia)`, status: 'Analysis', contracts: [], createdAt: new Date().toISOString().slice(0, 10) });
  $q.notify({ type: 'positive', message: `Lógica duplicada como ${id}.` });
}

function toggle(l: LogicSummary) {
  l.status = l.status === 'Active' ? 'Paused' : 'Active';
}
</script>

<style scoped lang="scss">
.lp {
  flex: 1;
  min-height: 100vh;
  background: rgba(248, 250, 252, 0.5);
  padding-bottom: 80px;

  &__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  &__title { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; color: var(--slate-900); }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    @media (min-width: 768px) { grid-template-columns: repeat(5, 1fr); }
  }

  &__stat {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: rgba(248, 250, 252, 0.5);
    border: 1px solid var(--slate-100);
    border-radius: 10px;
  }

  &__stat-label {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--slate-500);
    &--emerald { color: var(--emerald-600); }
    &--orange { color: var(--orange-600); }
  }

  &__stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--slate-900);
    &--emerald { color: var(--emerald-700); }
    &--orange { color: var(--orange-700); }
  }

  &__stat-row { display: flex; align-items: center; gap: 8px; }
  &__up { color: var(--emerald-500); }
  &__down { color: var(--rose-500); }

  &__body {
    max-width: 1600px;
    margin: 0 auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    @media (min-width: 768px) { padding: 32px; }
  }

  &__toolbar {
    position: sticky;
    top: 16px;
    z-index: 10;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    @media (min-width: 1280px) { flex-direction: row; }
  }

  &__toolbar-left, &__toolbar-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  &__search { width: 320px; max-width: 100%; }

  &__table-wrap { overflow-x: auto; }

  &__table {
    thead tr { background: rgba(248, 250, 252, 0.8); }
    th { height: 48px; font-weight: 700; color: var(--slate-600); letter-spacing: 0.05em; }
    td { padding: 16px 8px; vertical-align: top; }
  }

  &__first { padding-left: 24px !important; }
  &__last { padding-right: 24px !important; vertical-align: middle !important; }

  &__row {
    cursor: pointer;
    &:hover .lp__open { display: inline-flex; }
  }

  &__identity { display: flex; flex-direction: column; gap: 8px; }
  &__name { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; line-height: 1.25; color: var(--slate-800); }
  &__name-icon { color: var(--indigo-500); flex-shrink: 0; }
  &__badges { display: flex; flex-wrap: wrap; gap: 8px; }
  &__id { font-size: 12px; color: var(--slate-400); margin-top: 2px; }

  &__kv {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 120px;
    margin-bottom: 4px;
    span { font-size: 12px; color: var(--slate-400); }
    strong { font-size: 14px; font-weight: 600; color: var(--slate-700); }
    em { font-style: normal; font-size: 14px; font-weight: 500; color: var(--slate-600); }
    &--sm { max-width: 100px; strong { font-weight: 700; } em { font-size: 12px; } }
  }

  &__contracts { display: flex; flex-direction: column; gap: 6px; }
  &__contracts-count { font-size: 12px; font-weight: 500; color: var(--slate-500); }
  &__contracts-chips { display: flex; flex-wrap: wrap; gap: 4px; }
  &__chip { font-weight: 400; color: var(--slate-600); &--more { background: var(--slate-50); color: var(--slate-400); } }

  &__reset { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 14px; color: var(--slate-500); }

  &__row-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
  &__open { display: none; padding: 0 8px; color: var(--slate-500); &:hover { color: var(--indigo-600); } }

  &__empty { height: 192px; p { margin: 0; font-weight: 500; } }
  &__empty-icon { opacity: 0.2; }

  // ---------- Grade ----------
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
  }

  &__grid-empty {
    grid-column: 1 / -1;
    height: 192px;
    background: #fff;
    border: 1px dashed var(--slate-200);
    border-radius: 8px;
    p { margin: 0; font-weight: 500; }
  }

  &__card {
    position: relative;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    &:hover { border-color: var(--indigo-300); box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1); }
  }

  &__card-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--slate-300);
    &--active { background: var(--emerald-500); }
  }

  &__card-head { padding: 20px 16px 8px 24px; }

  &__card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    h3 { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: var(--slate-900); }
  }

  &__card-badges { padding-top: 8px; }

  &__card-body {
    padding: 0 16px 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__card-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  &__card-label { font-size: 12px; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.025em; }
  &__card-value { font-size: 18px; font-weight: 700; &--slate { color: var(--slate-700); } }

  &__card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--slate-500);
    span { display: flex; align-items: center; gap: 6px; }
  }
}
</style>
