<template>
  <div class="sa-page">
    <div class="sa-page__inner">
      <!-- Título -->
      <div class="cl__header">
        <div>
          <h1 class="sa-page__title">Contratos</h1>
          <p class="sa-page__subtitle">Selecione um contrato existente ou crie um novo contrato.</p>
        </div>
        <q-btn v-if="canWrite" unelevated no-caps class="sa-btn sa-btn--primary" @click="router.push({ name: 'contract-create' })">
          <Plus :size="16" class="q-mr-sm" /> Criar Novo Contrato
        </q-btn>
      </div>

      <!-- Filtros -->
      <div class="cl__toolbar">
        <SaInput v-model="search" class="cl__search" placeholder="Buscar contrato por nome, cliente, motor ou código">
          <template #prepend><Search :size="16" /></template>
        </SaInput>

        <div class="cl__filters">
          <SaSelect v-model="clientFilter" size="sm" width="180px" :options="clientOptions">
            <template #prepend><Users :size="16" /></template>
          </SaSelect>
          <SaSelect v-model="logicFilter" size="sm" width="180px" :options="logicOptions">
            <template #prepend><Zap :size="16" /></template>
          </SaSelect>
          <span class="cl__divider" />
          <SaSelect v-model="sortOrder" size="sm" width="200px" :options="sortOptions">
            <template #prepend><ArrowUpDown :size="16" /></template>
          </SaSelect>
          <span class="cl__divider" />
          <div class="cl__dates">
            <SaInput v-model="dateFrom" type="date" class="cl__date" />
            <span>até</span>
            <SaInput v-model="dateTo" type="date" class="cl__date" />
          </div>
        </div>

        <div class="sa-seg" role="group" aria-label="Modo de visualização">
          <button type="button" :class="{ active: viewMode === 'list' }" title="Lista" @click="viewMode = 'list'">
            <List :size="16" />
          </button>
          <button type="button" :class="{ active: viewMode === 'cards' }" title="Cards" @click="viewMode = 'cards'">
            <LayoutGrid :size="16" />
          </button>
        </div>
      </div>

      <!-- Lista -->
      <div v-if="viewMode === 'list'" class="sa-card">
        <div class="cl__table-wrap">
          <table class="sa-table cl__table">
            <thead>
              <tr>
                <th class="cl__th-first" style="width: 300px">Contrato / Cliente</th>
                <th>Motor Principal</th>
                <th>Vigência</th>
                <th>Capital Inicial</th>
                <th class="text-center">Status</th>
                <th style="width: 50px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filtered.length">
                <td colspan="6" class="cl__empty">{{ emptyText }}</td>
              </tr>
              <tr v-for="c in filtered" :key="c.id" class="cl__row" @click="open(c.id)">
                <td class="cl__td-first">
                  <div class="cl__identity">
                    <div class="cl__name-row">
                      <span class="cl__name">{{ c.name }}</span>
                      <span class="cl__id font-mono">{{ c.publicCode }}</span>
                    </div>
                    <div class="cl__clients">
                      <Users :size="14" />
                      <span class="cl__clients-trigger">
                        {{ clientsLabel(c.clientList) }}
                        <q-tooltip class="sa-hovercard" anchor="bottom left" self="top left" :offset="[0, 6]">
                          <ClientsHoverList :clients="c.clientList" />
                        </q-tooltip>
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="cl__logics">
                    <span v-if="c.primaryEngine" class="sa-badge sa-badge--xs sa-badge--indigo">{{ c.primaryEngine.name }}</span>
                    <span v-else class="cl__muted">—</span>
                  </div>
                </td>
                <td>
                  <div class="cl__period">
                    <span class="cl__period-start"><Calendar :size="14" class="text-slate-400" /> {{ formatDate(c.startDate) }}</span>
                    <span class="cl__period-end">até {{ c.endDate ? formatDate(c.endDate) : 'indeterminado' }}</span>
                  </div>
                </td>
                <td>
                  <div class="cl__capital">
                    <span class="cl__capital-base">{{ money(c.capital, c.currencyCode) }}</span>
                    <span class="cl__capital-initial">Capital inicial · {{ c.currencyCode || '—' }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <span class="sa-badge" :class="c.status.cls">{{ c.status.label }}</span>
                </td>
                <td class="text-right cl__td-last">
                  <ChevronRight :size="20" class="cl__chevron" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cards -->
      <div v-else class="cl__grid">
        <div v-if="!filtered.length" class="cl__grid-empty">{{ emptyText }}</div>
        <article v-for="c in filtered" :key="c.id" class="sa-card cl__card" tabindex="0" role="button" @click="open(c.id)" @keydown.enter="open(c.id)">
          <header class="cl__card-head">
            <div class="cl__card-title">
              <div class="cl__card-badges">
                <span class="cl__id font-mono">{{ c.publicCode }}</span>
                <span class="sa-badge" :class="c.status.cls">{{ c.status.label }}</span>
              </div>
              <h3>{{ c.name }}</h3>
            </div>
            <ChevronRight :size="20" class="cl__chevron" />
          </header>
          <div class="cl__card-body">
            <div class="cl__card-clients">
              <Users :size="16" class="text-indigo-600" />
              <span class="cl__card-clients-label">
                {{ clientsLabel(c.clientList) }}
                <q-tooltip class="sa-hovercard" anchor="bottom left" self="top left" :offset="[0, 6]">
                  <ClientsHoverList :clients="c.clientList" />
                </q-tooltip>
              </span>
            </div>
            <div class="cl__card-grid">
              <div>
                <span class="sa-label-xs cl__card-label">Vigência</span>
                <div class="cl__card-date"><Calendar :size="12" class="text-slate-400" /> {{ c.endDate ? formatDate(c.endDate) : 'indeterminado' }}</div>
              </div>
              <div>
                <span class="sa-label-xs cl__card-label">Capital Inicial</span>
                <div class="cl__card-capital">{{ money(c.capital, c.currencyCode) }}</div>
              </div>
            </div>
            <div class="cl__card-logics">
              <span v-if="c.primaryEngine" class="sa-badge sa-badge--xs sa-badge--outline">{{ c.primaryEngine.name }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowUpDown, Calendar, ChevronRight, LayoutGrid, List, Plus, Search, Users, Zap } from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import ClientsHoverList from 'components/contracts/ClientsHoverList.vue';
import { listAllContracts, loadCustomerIndex, participantToClient } from 'src/services/contracts.service';
import { apiErrorMessage } from 'src/services/api-envelope';
import type { ContractListItem } from 'src/types/api';
import type { ContractClient } from 'src/types/contract';
import type { CustomerSummary } from 'src/types/customer';
import { formatCurrencyIn, formatDate } from 'src/utils/format';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const auth = useAuthStore();
const canWrite = computed(() => auth.can('contracts:write'));

const search = ref<string | number | null>('');
const clientFilter = ref<string | number | boolean | null>('all');
const logicFilter = ref<string | number | boolean | null>('all');
const sortOrder = ref<string | number | boolean | null>('newest');
const dateFrom = ref<string | number | null>('');
const dateTo = ref<string | number | null>('');
const viewMode = ref<'list' | 'cards'>('list');

const contracts = ref<ContractListItem[]>([]);
const customers = ref(new Map<string, CustomerSummary>());
const loading = ref(true);
const error = ref<string | null>(null);

/** Cor do status de negócio pelo código do catálogo; rascunhos ainda não têm status de negócio. */
const STATUS_CLS: Record<string, string> = {
  ACTIVE: 'sa-badge--emerald-soft',
  SUSPENDED: 'sa-badge--amber-soft',
  CLOSED: 'sa-badge--slate-soft',
};
function statusOf(c: ContractListItem) {
  if (c.registrationStatus === 'Draft') return { label: 'Rascunho', cls: 'sa-badge--outline' };
  if (!c.businessStatus) return { label: 'Cadastrado', cls: 'sa-badge--indigo' };
  return { label: c.businessStatus.name, cls: STATUS_CLS[c.businessStatus.code] ?? 'sa-badge--indigo' };
}

const rows = computed(() =>
  contracts.value.map((c) => ({
    ...c,
    name: c.name || 'Sem nome',
    status: statusOf(c),
    capital: c.initialContractualCapital == null ? null : Number(c.initialContractualCapital),
    clientList: (c.clients ?? []).map((cl) => participantToClient(cl, customers.value)),
  })),
);

const allClients = computed(() => [...new Set(rows.value.flatMap((c) => c.clientList.map((cl) => cl.name)))].sort());
const allEngines = computed(() => [...new Set(rows.value.flatMap((c) => (c.primaryEngine ? [c.primaryEngine.name] : [])))].sort());

const clientOptions = computed(() => [{ label: 'Todos Clientes', value: 'all' }, ...allClients.value.map((c) => ({ label: c, value: c }))]);
const logicOptions = computed(() => [{ label: 'Todos Motores', value: 'all' }, ...allEngines.value.map((l) => ({ label: l, value: l }))]);
const sortOptions = [
  { label: 'Mais recentes primeiro', value: 'newest' },
  { label: 'Mais antigos primeiro', value: 'oldest' },
  { label: 'Maior Capital Inicial', value: 'highest_val' },
  { label: 'Menor Capital Inicial', value: 'lowest_val' },
];

const filtered = computed(() => {
  const term = String(search.value ?? '').toLowerCase();
  const from = String(dateFrom.value ?? '');
  const to = String(dateTo.value ?? '');
  return rows.value
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(term) ||
        c.publicCode.toLowerCase().includes(term) ||
        c.clientList.some((cl) => cl.name.toLowerCase().includes(term)) ||
        (c.primaryEngine?.name ?? '').toLowerCase().includes(term);
      const matchesClient = clientFilter.value === 'all' || c.clientList.some((cl) => cl.name === clientFilter.value);
      const matchesEngine = logicFilter.value === 'all' || c.primaryEngine?.name === logicFilter.value;
      const start = c.startDate ?? '';
      const matchesFrom = !from || (!!start && start >= from);
      const matchesTo = !to || (!!start && start <= to);
      return matchesSearch && matchesClient && matchesEngine && matchesFrom && matchesTo;
    })
    .sort((a, b) => {
      switch (sortOrder.value) {
        case 'oldest': return (a.createdAtUtc ?? '').localeCompare(b.createdAtUtc ?? '');
        case 'highest_val': return (b.capital ?? 0) - (a.capital ?? 0);
        case 'lowest_val': return (a.capital ?? 0) - (b.capital ?? 0);
        default: return (b.createdAtUtc ?? '').localeCompare(a.createdAtUtc ?? '');
      }
    });
});

const emptyText = computed(() =>
  loading.value ? 'Carregando contratos...' : (error.value ?? (contracts.value.length ? 'Nenhum contrato encontrado para os filtros selecionados.' : 'Nenhum contrato cadastrado.')),
);

const money = (v: number | null, currency: string) => (v == null ? '—' : formatCurrencyIn(v, currency || 'BRL'));
const clientsLabel = (clients: ContractClient[]) =>
  !clients.length ? 'Sem clientes' : clients.length > 1 ? `${clients[0]!.name} + ${clients.length - 1}` : clients[0]!.name;

async function load() {
  loading.value = true;
  error.value = null;
  try {
    // O cadastro só completa documento e status dos clientes; sem ele a lista segue com o que o contrato traz.
    const [list, index] = await Promise.all([listAllContracts(), loadCustomerIndex().catch(() => new Map<string, CustomerSummary>())]);
    contracts.value = list;
    customers.value = index;
  } catch (e) {
    contracts.value = [];
    error.value = apiErrorMessage(e, 'Não foi possível carregar os contratos.');
  } finally {
    loading.value = false;
  }
}
void load();

function open(id: string) {
  void router.push({ name: 'contract-detail', params: { id } });
}
</script>

<style scoped lang="scss">
.cl {
  &__header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    @media (min-width: 768px) { flex-direction: row; align-items: center; }
  }

  &__toolbar {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    @media (min-width: 1280px) { flex-direction: row; }
  }

  &__search {
    width: 100%;
    @media (min-width: 1280px) { max-width: 448px; }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  &__divider {
    width: 1px;
    height: 32px;
    background: var(--slate-200);
    margin: 0 4px;
  }

  &__dates {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--slate-400);
  }

  &__date { width: 150px; }

  &__table-wrap { overflow-x: auto; }

  &__table {
    thead tr { background: var(--slate-50); }
    th { font-size: 14px; text-transform: none; font-weight: 600; color: var(--slate-700); }
    td { padding: 16px 8px; }
  }

  &__th-first, &__td-first { padding-left: 24px !important; }
  &__td-last { padding-right: 24px !important; }

  &__row {
    cursor: pointer;
    &:hover .cl__chevron { color: var(--indigo-600); }
  }

  &__empty {
    height: 128px;
    text-align: center;
    color: var(--slate-500);
  }

  &__identity { display: flex; flex-direction: column; gap: 4px; }
  &__name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  &__name { font-size: 16px; font-weight: 700; color: var(--slate-900); }

  &__id {
    font-size: 12px;
    color: var(--slate-400);
    background: var(--slate-100);
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }

  &__clients {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--slate-500);
  }

  &__clients-trigger {
    cursor: help;
    text-decoration: underline dotted var(--slate-300);
    text-underline-offset: 2px;
    transition: color 0.15s;
    &:hover { color: var(--indigo-600); text-decoration-color: var(--indigo-300); }
  }

  &__muted { font-size: 13px; color: var(--slate-400); }
  &__logics { display: flex; flex-direction: column; gap: 6px; }
  &__badge-slate { color: var(--slate-600); background: var(--slate-50); }

  &__period {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    color: var(--slate-600);
  }
  &__period-start { display: flex; align-items: center; gap: 8px; }
  &__period-end { font-size: 12px; color: var(--slate-400); padding-left: 22px; }

  &__capital { display: flex; flex-direction: column; gap: 4px; }
  &__capital-base {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: var(--slate-900);
    small { font-size: 12px; font-weight: 400; color: var(--slate-400); }
  }
  &__capital-initial { font-size: 12px; color: var(--slate-500); }

  &__chevron { color: var(--slate-300); transition: color 0.15s; }

  // ---------- Cards ----------
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: 1280px) { grid-template-columns: repeat(3, 1fr); }
  }

  &__grid-empty {
    grid-column: 1 / -1;
    height: 128px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--slate-500);
    background: #fff;
    border: 1px dashed var(--slate-200);
    border-radius: 8px;
  }

  &__card {
    cursor: pointer;
    transition: box-shadow 0.15s, border-color 0.15s;
    &:hover {
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1);
      border-color: var(--indigo-200);
      .cl__chevron { color: var(--indigo-600); }
    }
  }

  &__card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 20px 12px;
  }

  &__card-title {
    display: flex;
    flex-direction: column;
    gap: 6px;
    h3 { margin: 0; font-size: 16px; line-height: 1.25; font-weight: 700; color: var(--slate-900); }
  }

  &__card-badges { display: flex; align-items: center; gap: 8px; }

  &__card-body {
    padding: 0 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__card-clients {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--slate-600);
    background: var(--slate-50);
    padding: 8px;
    border-radius: 6px;
    border: 1px solid var(--slate-100);
  }

  &__card-clients-label {
    font-weight: 500;
    cursor: help;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover { color: var(--indigo-700); }
  }

  &__card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  &__card-label { color: var(--slate-400); display: block; margin-bottom: 4px; }
  &__card-date { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--slate-700); }
  &__card-capital { font-size: 14px; font-weight: 700; color: var(--slate-900); }

  &__card-logics {
    padding-top: 12px;
    border-top: 1px solid var(--slate-100);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
