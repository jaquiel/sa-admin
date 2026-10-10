<template>
  <div class="tp">
    <!-- Cabeçalho + KPIs -->
    <div class="sa-topbar">
      <div class="sa-topbar__inner">
        <div class="tp__title-row">
          <div>
            <h1 class="tp__title">Transações do Sistema</h1>
            <p class="sa-page__subtitle">Acompanhe todas as movimentações financeiras e realize operações internas.</p>
          </div>
          <SaInput v-model="search" placeholder="Buscar por cliente, contrato ou ID..." class="tp__search">
            <template #prepend><Search :size="16" /></template>
          </SaInput>
        </div>

        <div class="tp__kpis">
          <div class="tp__kpi tp__kpi--total">
            <span class="tp__kpi-title"><Landmark :size="16" /> Carteira Total</span>
            <KpiValues :data="financialSummary.total" />
          </div>
          <button type="button" class="tp__kpi tp__kpi--free" @click="router.push({ name: 'transactions-free-wallets' })">
            <span class="tp__kpi-title"><Wallet :size="16" class="tp__ico-emerald" /> Carteira Livre</span>
            <KpiValues :data="financialSummary.free" />
          </button>
          <button type="button" class="tp__kpi tp__kpi--applied" @click="router.push({ name: 'transactions-applied-wallets' })">
            <span class="tp__kpi-title">
              <span class="tp__kpi-title-main"><PieChartIcon :size="16" class="tp__ico-indigo" /> Carteira Aplicada</span>
              <span class="tp__trend">{{ financialSummary.invested.trend }}</span>
            </span>
            <KpiValues :data="financialSummary.invested" />
          </button>
          <button type="button" class="tp__kpi tp__kpi--contracts" @click="router.push({ name: 'transactions-contracts-wallet' })">
            <Briefcase :size="64" class="tp__kpi-bg" />
            <span class="tp__kpi-title tp__kpi-title--indigo">
              <span class="tp__kpi-title-main"><Briefcase :size="16" /> Carteira de Contratos</span>
              <ArrowUpRight :size="16" class="tp__kpi-arrow" />
            </span>
            <KpiValues :data="financialSummary.contracts" />
            <span class="tp__kpi-link">Ver visão analítica</span>
          </button>
        </div>
      </div>
    </div>

    <div class="tp__body">
      <!-- Filtros e ações -->
      <div class="tp__actions">
        <div class="tp__filters">
          <SaSelect v-model="typeFilter" size="sm" width="160px" :options="typeOptions" />
          <SaSelect v-model="statusFilter" size="sm" width="180px" :options="statusOptions" />
          <SaSelect v-model="periodFilter" size="sm" width="170px" :options="periodOptions">
            <template #prepend><Calendar :size="14" /></template>
          </SaSelect>
          <span class="tp__divider" />
          <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" @click="showTable = !showTable">
            <EyeOff v-if="showTable" :size="16" class="q-mr-sm" />
            <Eye v-else :size="16" class="q-mr-sm" />
            {{ showTable ? 'Esconder Tabela' : 'Exibir Tabela' }}
          </q-btn>
        </div>
        <q-btn unelevated no-caps class="sa-btn sa-btn--primary" @click="modalOpen = true">
          <Plus :size="16" class="q-mr-sm" /> Executar Transação
        </q-btn>
      </div>

      <!-- Tabela de transações -->
      <transition name="fade-slide">
        <div v-if="showTable" class="sa-card">
          <div class="tp__table-wrap">
            <table class="sa-table tp__table">
              <thead>
                <tr>
                  <th class="tp__first" style="width: 140px">Data / Hora</th>
                  <th style="width: 140px">Tipo</th>
                  <th style="width: 220px">Solicitação / Cliente</th>
                  <th>Origem / Destino</th>
                  <th class="text-right" style="width: 140px">Valor</th>
                  <th class="text-center" style="width: 160px">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in rows" :key="t.id">
                  <td class="tp__first">
                    <span class="tp__date">{{ formatDate(t.requestedAtUtc) }}</span>
                    <span class="tp__time"><Clock :size="12" /> {{ timeOf(t.requestedAtUtc) }}</span>
                  </td>
                  <td>
                    <span class="tp__type">
                      <span class="tp__type-icon" :class="`tp__type-icon--${typeMeta(t.type).cls}`"><component :is="typeMeta(t.type).icon" :size="16" /></span>
                      {{ typeMeta(t.type).label }}
                    </span>
                  </td>
                  <td>
                    <span class="tp__req font-mono">{{ t.requestNumber }}</span>
                    <span class="tp__client" :title="t.clientName">{{ t.clientName ?? '—' }}</span>
                  </td>
                  <td>
                    <div v-if="t.type === 'WalletTransfer'" class="tp__transfer">
                      <span>{{ endpointLabel(t.source) }}</span>
                      <ArrowRightLeft :size="12" class="text-slate-400" />
                      <span>{{ endpointLabel(t.destination) }}</span>
                    </div>
                    <div v-else class="tp__flow">
                      <div><span class="tp__flow-label">De</span><span class="tp__flow-value" :title="endpointLabel(t.source)">{{ endpointLabel(t.source) }}</span></div>
                      <div><span class="tp__flow-label">Para</span><span class="tp__flow-value" :title="endpointLabel(t.destination)">{{ endpointLabel(t.destination) }}</span></div>
                    </div>
                  </td>
                  <td class="text-right">
                    <span class="tp__value" :class="`tp__value--${typeMeta(t.type).cls}`">
                      {{ t.type === 'Deposit' ? '+' : t.type === 'Withdrawal' ? '-' : '' }} {{ formatCurrencyIn(Number(t.amount), t.currencyIsoCode) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="sa-badge" :class="statusMeta(t.status).cls">{{ statusMeta(t.status).label }}</span>
                    <AlertTriangle v-if="t.attentionRequired" :size="14" class="tp__attention" title="Requer atenção" />
                  </td>
                </tr>
                <tr v-if="loading && !rows.length">
                  <td colspan="6"><div class="sa-empty tp__empty"><q-spinner size="32px" /><p>Carregando transações...</p></div></td>
                </tr>
                <tr v-else-if="!rows.length">
                  <td colspan="6">
                    <div class="sa-empty tp__empty"><Search :size="32" /><p>{{ error ?? 'Nenhuma transação encontrada.' }}</p></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalItems > 0" class="tp__pager">
            <span>{{ rangeLabel }}</span>
            <div class="tp__pager-btns">
              <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" :disable="page <= 1 || loading" @click="page--">Anterior</q-btn>
              <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" :disable="!hasNextPage || loading" @click="page++">Próxima</q-btn>
            </div>
          </div>
        </div>
      </transition>

      <TransactionQueue ref="queue" @changed="load" />

      <OperationalPanel />
    </div>

    <ExecuteTransactionDialog v-model="modalOpen" @created="onCreated" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpRight,
  Briefcase,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Landmark,
  PieChart as PieChartIcon,
  Plus,
  Search,
  Wallet,
} from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import OperationalPanel from 'components/transactions/OperationalPanel.vue';
import ExecuteTransactionDialog from 'components/transactions/ExecuteTransactionDialog.vue';
import TransactionQueue from 'components/transactions/TransactionQueue.vue';
// KPIs ainda vêm do mock: o backend não tem um endpoint de saldos consolidados de todas as carteiras.
import { financialSummary } from 'src/mocks/transactions';
import { listAllTransactions } from 'src/services/transactions.service';
import { apiErrorMessage } from 'src/services/api-envelope';
import type { TransactionSummary } from 'src/types/api';
import { formatCurrencyIn, formatDate } from 'src/utils/format';
import {
  TRANSACTION_STATUS,
  endpointLabel,
  transactionStatusMeta as statusMeta,
  transactionTypeMeta as typeMeta,
} from 'src/utils/transaction-labels';

const router = useRouter();
const $q = useQuasar();

const PAGE_SIZE = 20;

const search = ref<string | number | null>('');
const typeFilter = ref('all');
const statusFilter = ref('all');
const periodFilter = ref('30d');
const showTable = ref(true);
const modalOpen = ref(false);

const rows = ref<TransactionSummary[]>([]);
const page = ref(1);
const totalItems = ref(0);
const hasNextPage = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const typeOptions = [
  { label: 'Todos Tipos', value: 'all' },
  { label: 'Depósitos', value: 'Deposit' },
  { label: 'Saques', value: 'Withdrawal' },
  { label: 'Transferências', value: 'WalletTransfer' },
  { label: 'Op. de Contrato', value: 'ContractOperation' },
];

const statusOptions = [
  { label: 'Todos Status', value: 'all' },
  ...Object.entries(TRANSACTION_STATUS).map(([value, s]) => ({ label: s.label, value })),
];
const periodOptions = [
  { label: 'Hoje', value: 'today' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Todo o período', value: 'all' },
];

/** Data UTC (yyyy-MM-dd) de início do período selecionado. */
function periodStart(period: string): string | undefined {
  const days = { today: 0, '7d': 6, '30d': 29 }[period];
  if (days === undefined) return undefined;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

const rangeLabel = computed(() => {
  const first = (page.value - 1) * PAGE_SIZE + 1;
  return `${first}–${first + rows.value.length - 1} de ${totalItems.value}`;
});

let requestSeq = 0;
async function load() {
  const seq = ++requestSeq;
  loading.value = true;
  error.value = null;
  try {
    const result = await listAllTransactions({
      page: page.value,
      pageSize: PAGE_SIZE,
      search: String(search.value ?? '').trim(),
      type: typeFilter.value === 'all' ? undefined : typeFilter.value,
      status: statusFilter.value === 'all' ? undefined : statusFilter.value,
      requestedFrom: periodStart(periodFilter.value),
    });
    if (seq !== requestSeq) return;
    rows.value = result.items;
    totalItems.value = result.totalItems;
    hasNextPage.value = result.hasNextPage;
  } catch (e) {
    if (seq !== requestSeq) return;
    rows.value = [];
    totalItems.value = 0;
    hasNextPage.value = false;
    error.value = apiErrorMessage(e, 'Não foi possível carregar as transações.');
    $q.notify({ type: 'negative', message: error.value });
  } finally {
    if (seq === requestSeq) loading.value = false;
  }
}

// Filtros voltam para a página 1; a busca espera o usuário parar de digitar.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => (page.value === 1 ? void load() : (page.value = 1)), 350);
});
watch([typeFilter, statusFilter, periodFilter], () => (page.value === 1 ? void load() : (page.value = 1)));
watch(page, () => void load());
onBeforeUnmount(() => clearTimeout(searchTimer));

void load();

const queue = ref<InstanceType<typeof TransactionQueue> | null>(null);
function onCreated() {
  if (page.value === 1) void load();
  else page.value = 1;
  void queue.value?.load();
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** Valores USD + BRL + cotação de um card de KPI. */
const KpiValues = defineComponent({
  props: { data: { type: Object as PropType<{ usd: number; brl: number; rate: number }>, required: true } },
  setup(p) {
    return () => [
      h('div', { class: 'tp-kpi__usd' }, formatCurrencyIn(p.data.usd, 'USD')),
      h('div', { class: 'tp-kpi__brl' }, formatCurrencyIn(p.data.brl, 'BRL')),
      h('div', { class: 'tp-kpi__rate font-mono' }, `(Cotação USD → BRL = ${p.data.rate.toFixed(2)})`),
    ];
  },
});
</script>

<style scoped lang="scss">
.tp {
  flex: 1;
  min-height: 100vh;
  background: rgba(248, 250, 252, 0.5);
  padding-bottom: 80px;

  &__title-row {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
    @media (min-width: 768px) { flex-direction: row; align-items: center; }
  }

  &__title { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; color: var(--slate-900); }
  &__search { width: 100%; @media (min-width: 768px) { width: 320px; } }

  &__kpis {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: 1280px) { grid-template-columns: repeat(4, 1fr); }
  }

  &__kpi {
    position: relative;
    overflow: hidden;
    padding: 16px;
    text-align: left;
    font: inherit;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;

    &--total { background: rgba(248, 250, 252, 0.5); cursor: default; .tp__kpi-title { color: var(--slate-600); } }
    &--free:hover { border-color: var(--emerald-300); .tp__kpi-title { color: var(--emerald-600); } }
    &--applied:hover { border-color: var(--indigo-300); .tp__kpi-title-main { color: var(--indigo-600); } }
    &--contracts:hover {
      border-color: var(--indigo-300);
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1);
      .tp__kpi-bg { opacity: 0.2; }
      .tp__kpi-arrow { color: var(--indigo-600); }
      .tp__kpi-link { text-decoration: underline; }
    }
  }

  &__kpi-title {
    position: relative;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.15s;
    &--indigo { color: var(--indigo-600); }
  }

  &__kpi-title-main { display: flex; align-items: center; gap: 8px; transition: color 0.15s; }
  &__ico-emerald { color: var(--emerald-500); }
  &__ico-indigo { color: var(--indigo-500); }

  &__trend { font-size: 10px; font-weight: 700; color: var(--emerald-600); background: var(--emerald-50); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--emerald-100); }

  &__kpi-bg { position: absolute; top: -4px; right: -4px; color: var(--indigo-600); opacity: 0.1; transition: opacity 0.15s; }
  &__kpi-arrow { color: var(--indigo-400); transition: color 0.15s; }
  &__kpi-link { position: relative; margin-top: 8px; font-size: 10px; font-weight: 500; color: var(--indigo-500); }

  :deep(.tp-kpi__usd) { position: relative; font-size: 20px; font-weight: 700; color: var(--slate-900); }
  :deep(.tp-kpi__brl) { position: relative; margin-top: 4px; font-size: 14px; font-weight: 600; color: var(--slate-600); }
  :deep(.tp-kpi__rate) { position: relative; margin-top: 2px; font-size: 10px; color: var(--slate-400); }

  &__body {
    max-width: 1600px;
    margin: 0 auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    @media (min-width: 768px) { padding: 32px; }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    @media (min-width: 1280px) { flex-direction: row; align-items: center; }
  }

  &__filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  &__divider { width: 1px; height: 24px; background: var(--slate-200); margin: 0 4px; }

  &__table-wrap { overflow-x: auto; }
  &__table {
    thead tr { background: rgba(248, 250, 252, 0.8); }
    th { height: 48px; font-weight: 700; color: var(--slate-600); letter-spacing: 0.05em; }
    td { padding: 16px 8px; }
  }
  &__first { padding-left: 24px !important; }

  &__date { display: block; font-size: 14px; font-weight: 500; color: var(--slate-700); }
  &__time { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--slate-400); }

  &__type { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--slate-700); }
  &__type-icon {
    padding: 6px;
    border-radius: 50%;
    display: flex;
    flex-shrink: 0;
    &--deposit { background: var(--emerald-100); color: var(--emerald-600); }
    &--withdraw { background: var(--rose-100); color: var(--rose-600); }
    &--transfer { background: var(--blue-100); color: var(--blue-600); }
    &--contract { background: var(--indigo-100); color: var(--indigo-600); }
  }

  &__req { display: block; font-size: 12px; color: var(--slate-500); }
  &__client { display: block; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; color: var(--slate-700); }
  &__attention { margin-left: 6px; vertical-align: middle; color: var(--rose-500); }

  &__pager {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 24px;
    border-top: 1px solid var(--slate-200);
    font-size: 13px;
    color: var(--slate-500);
  }
  &__pager-btns { display: flex; gap: 8px; }

  &__transfer {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 250px;
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-700);
    span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }

  &__flow {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 250px;
    font-size: 14px;
    > div { display: flex; align-items: center; gap: 6px; }
  }

  &__flow-label { width: 32px; flex-shrink: 0; font-size: 10px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.05em; }
  &__flow-value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; color: var(--slate-700); }

  &__value {
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    &--deposit { color: var(--emerald-600); }
    &--withdraw { color: var(--rose-600); }
    &--transfer, &--contract { color: var(--slate-700); }
  }

  &__empty { height: 192px; opacity: 0.6; p { margin: 0; } }
}
</style>
