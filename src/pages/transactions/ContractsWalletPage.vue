<template>
  <div class="cw">
    <div class="sa-topbar">
      <div class="sa-topbar__inner cw__head">
        <div>
          <q-btn flat no-caps class="sa-btn sa-btn--ghost sa-btn--sm cw__back" @click="router.push({ name: 'transactions' })">
            <ArrowLeft :size="16" class="q-mr-sm" /> Voltar
          </q-btn>
          <h1 class="cw__title"><Briefcase :size="24" class="text-indigo-600" /> Carteira de Contratos</h1>
          <p class="sa-page__subtitle">Visão analítica dos contratos, clientes vinculados e evolução do capital.</p>
        </div>
        <div class="cw__tools">
          <SaInput v-model="search" placeholder="Buscar por nome, código ou cliente..." class="cw__search">
            <template #prepend><Search :size="16" /></template>
          </SaInput>
          <div class="sa-seg sa-seg--neutral">
            <button type="button" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><LayoutList :size="16" /> Lista</button>
            <button type="button" :class="{ active: viewMode === 'cards' }" @click="viewMode = 'cards'"><LayoutGrid :size="16" /> Cards</button>
          </div>
        </div>
      </div>
    </div>

    <div class="cw__body">
      <div v-if="loading || !rows.length" class="sa-card">
        <div class="sa-empty cw__empty">
          <q-spinner v-if="loading" size="32px" />
          <Briefcase v-else :size="32" />
          <p>{{ loading ? 'Carregando contratos...' : (error ?? (search ? 'Nenhum contrato encontrado para a busca.' : 'Nenhum contrato cadastrado.')) }}</p>
        </div>
      </div>

      <!-- Lista -->
      <div v-else-if="viewMode === 'list'" class="sa-card">
        <div class="cw__table-wrap">
          <table class="sa-table cw__table">
            <thead>
              <tr>
                <th class="cw__first" style="width: 350px">Dados do Contrato</th>
                <th style="width: 300px">Capital</th>
                <th style="width: 220px">Vigência / Prazo</th>
                <th class="cw__last">Variação do Capital</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in rows" :key="c.id" :class="{ 'cw__row--expired': c.time.isExpired }">
                <td class="cw__first">
                  <div class="cw__identity">
                    <div>
                      <span class="cw__name" :class="{ 'cw__name--expired': c.time.isExpired }">{{ c.name || 'Sem nome' }}</span>
                      <div class="cw__id-row">
                        <span class="cw__id font-mono">{{ c.publicCode }}</span>
                        <span class="sa-badge sa-badge--xs" :class="c.statusCls">{{ c.statusLabel }}</span>
                        <span v-if="c.time.isExpired" class="sa-badge sa-badge--xs sa-badge--rose">Expirado</span>
                      </div>
                    </div>
                    <span v-if="c.primaryEngine" class="sa-badge sa-badge--indigo cw__account"><Cpu :size="12" /> {{ c.primaryEngine.name }}</span>
                    <ContractClients :clients="c.clients ?? []" />
                  </div>
                </td>
                <td><CapitalBlock :contract="c" /></td>
                <td>
                  <div class="cw__period">
                    <div>
                      <span class="cw__period-label"><Calendar :size="12" /> Período Contratual</span>
                      <span class="cw__period-value">{{ periodText(c) }}</span>
                    </div>
                    <div v-if="c.time.text">
                      <span class="cw__period-label"><Clock :size="12" /> {{ c.time.isExpired ? 'Finalizado há' : 'Tempo Restante' }}</span>
                      <span class="cw__remaining" :class="{ 'cw__remaining--expired': c.time.isExpired }">
                        {{ c.time.isExpired ? c.time.text : `Faltam: ${c.time.text}` }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="cw__last"><VariationBlock :contract="c" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cards -->
      <div v-else class="cw__grid">
        <article v-for="c in rows" :key="c.id" class="sa-card cw__card" :class="{ 'cw__card--expired': c.time.isExpired }">
          <header class="cw__card-head">
            <div>
              <h3 class="cw__name" :class="{ 'cw__name--expired': c.time.isExpired }">{{ c.name || 'Sem nome' }}</h3>
              <div class="cw__id-row">
                <span class="cw__id font-mono">{{ c.publicCode }}</span>
                <span class="sa-badge sa-badge--xs" :class="c.statusCls">{{ c.statusLabel }}</span>
              </div>
            </div>
            <span v-if="c.time.isExpired" class="sa-badge sa-badge--rose">Expirado</span>
          </header>
          <div class="cw__card-body">
            <ContractClients :clients="c.clients ?? []" />
            <CapitalBlock :contract="c" />
            <div>
              <span class="sa-label-xs cw__section-label"><Calendar :size="14" /> Vigência</span>
              <div class="cw__card-period">
                <div>
                  <span class="cw__small-label">Período</span>
                  <span class="cw__small-value">{{ periodText(c) }}</span>
                </div>
                <div v-if="c.time.text">
                  <span class="cw__small-label">{{ c.time.isExpired ? 'Finalizado há' : 'Tempo Restante' }}</span>
                  <span class="cw__remaining cw__remaining--sm" :class="{ 'cw__remaining--expired': c.time.isExpired }">{{ c.time.text }}</span>
                </div>
              </div>
            </div>
            <hr class="sa-separator" />
            <VariationBlock :contract="c" />
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Briefcase, Calendar, Clock, Coins, Cpu, LayoutGrid, LayoutList, Search, Users } from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import { listAllContracts } from 'src/services/contracts.service';
import { apiErrorMessage } from 'src/services/api-envelope';
import type { ContractListItem } from 'src/types/api';
import { formatCurrencyIn, formatDate } from 'src/utils/format';

const router = useRouter();
const viewMode = ref<'list' | 'cards'>('list');
const search = ref<string | number | null>('');
const contracts = ref<ContractListItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

function timeInfo(endIso: string | null) {
  if (!endIso) return { isExpired: false, text: '' };
  const diff = new Date(endIso).getTime() - Date.now();
  const days = Math.ceil(Math.abs(diff) / 86400000);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const rest = (days % 365) % 30;
  let text = '';
  if (years > 0) text += `${years} ${years === 1 ? 'ano' : 'anos'}`;
  if (months > 0) text += `${text ? ', ' : ''}${months} ${months === 1 ? 'mês' : 'meses'}`;
  if (rest > 0 || (!years && !months)) text += `${text ? ' e ' : ''}${rest} ${rest === 1 ? 'dia' : 'dias'}`;
  return { isExpired: diff <= 0, text };
}

function statusOf(c: ContractListItem) {
  if (c.registrationStatus === 'Draft') return { label: 'Rascunho', cls: 'sa-badge--slate' };
  return { label: c.businessStatus?.name ?? 'Cadastrado', cls: 'sa-badge--emerald' };
}

const periodText = (c: ContractListItem) =>
  c.startDate || c.endDate ? `${formatDate(c.startDate)} a ${c.endDate ? formatDate(c.endDate) : 'indeterminado'}` : 'Não definido';

const rows = computed(() => {
  const q = String(search.value ?? '').trim().toLowerCase();
  return contracts.value
    .filter(
      (c) =>
        !q ||
        (c.name ?? '').toLowerCase().includes(q) ||
        c.publicCode.toLowerCase().includes(q) ||
        (c.clients ?? []).some((cl) => cl.displayName.toLowerCase().includes(q)),
    )
    .map((c) => {
      const status = statusOf(c);
      return { ...c, time: timeInfo(c.endDate), statusLabel: status.label, statusCls: status.cls };
    });
});

async function load() {
  loading.value = true;
  error.value = null;
  try {
    contracts.value = await listAllContracts();
  } catch (e) {
    contracts.value = [];
    error.value = apiErrorMessage(e, 'Não foi possível carregar os contratos.');
  } finally {
    loading.value = false;
  }
}
void load();

// ---------- Blocos internos ----------
const money = (v: unknown, currency: string) => (v == null || v === '' ? '—' : formatCurrencyIn(Number(v), currency || 'BRL'));

/** Variação do capital atual sobre o capital contratual inicial (a API não traz performance por pontos nem YTD). */
const VariationBlock = defineComponent({
  props: { contract: { type: Object as PropType<ContractListItem>, required: true } },
  setup(p) {
    return () => {
      // A API ainda devolve currentCapital = null (não há saldo do contrato); sem ele não há variação.
      const { initialContractualCapital: rawInitial, currentCapital: rawCurrent } = p.contract;
      const initial = Number(rawInitial);
      const current = Number(rawCurrent);
      if (rawInitial == null || rawCurrent == null || !initial || Number.isNaN(current)) {
        return h('div', { class: 'cw-perf' }, [h('span', { class: 'cw-perf__label' }, 'Desde o Início'), h('span', { class: 'cw-perf__na' }, 'Capital atual ainda não disponível')]);
      }
      const delta = current - initial;
      const pct = (delta / initial) * 100;
      const up = delta >= 0;
      return h('div', { class: 'cw-perf' }, [
        h('span', { class: 'cw-perf__label' }, 'Desde o Início'),
        h('span', { class: ['cw-perf__points', up ? 'cw-perf--up' : 'cw-perf--down'] }, `${up ? '+' : ''}${money(delta, p.contract.currencyCode)}`),
        h('span', { class: ['cw-perf__pct', up ? 'cw-perf--up-soft' : 'cw-perf--down-soft'] }, `${up ? '+' : ''}${pct.toFixed(2)}%`),
      ]);
    };
  },
});

const ContractClients = defineComponent({
  props: { clients: { type: Array as PropType<NonNullable<ContractListItem['clients']>>, required: true } },
  setup(p) {
    return () =>
      h('div', { class: 'cw-clients' }, [
        h('span', { class: 'cw-clients__label' }, [h(Users, { size: 12 }), `Clientes Vinculados (${p.clients.length})`]),
        h(
          'div',
          { class: 'cw-clients__list' },
          p.clients.length
            ? p.clients.map((c) =>
                h(
                  'a',
                  {
                    class: 'cw-clients__item',
                    key: c.clientId,
                    onClick: () => void router.push({ name: 'customer-profile', params: { id: c.clientId } }),
                  },
                  [h('span', { class: 'cw-clients__name' }, c.displayName), h('span', { class: 'cw-clients__wallet' }, c.personType === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física')],
                ),
              )
            : [h('span', { class: 'cw-clients__wallet' }, 'Nenhum cliente vinculado')],
        ),
      ]);
  },
});

const CapitalBlock = defineComponent({
  props: { contract: { type: Object as PropType<ContractListItem>, required: true } },
  setup(p) {
    return () => {
      const c = p.contract;
      return h('div', { class: 'cw-value' }, [
        h('div', { class: 'cw-value__head' }, [h(Coins, { size: 14 }), h('span', `Capital (${c.currencyCode || '—'})`)]),
        h('div', { class: 'cw-value__item' }, [
          h('span', { class: 'cw-value__code' }, 'Atual'),
          h('span', { class: 'cw-value__main' }, money(c.currentCapital, c.currencyCode)),
        ]),
        h('div', { class: 'cw-value__item' }, [
          h('span', { class: 'cw-value__code' }, 'Inicial contratado'),
          h('span', { class: 'cw-value__sub' }, money(c.initialContractualCapital, c.currencyCode)),
        ]),
      ]);
    };
  },
});
</script>

<style scoped lang="scss">
.cw {
  flex: 1;
  min-height: 100vh;
  background: rgba(248, 250, 252, 0.5);
  padding-bottom: 80px;

  &__head {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    @media (min-width: 768px) { flex-direction: row; align-items: center; }
  }

  &__back { margin: 0 0 8px -8px; }
  &__tools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  &__search { width: 100%; @media (min-width: 768px) { width: 300px; } }
  &__empty { height: 220px; opacity: 0.6; p { margin: 0; } }

  &__title { margin: 0; display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; color: var(--slate-900); }

  &__body { max-width: 1600px; margin: 0 auto; padding: 24px; @media (min-width: 768px) { padding: 32px; } }

  &__table-wrap { overflow-x: auto; }
  &__table {
    thead tr { background: rgba(248, 250, 252, 0.8); }
    th { height: 56px; font-weight: 700; color: var(--slate-600); letter-spacing: 0.05em; }
    td { padding: 24px 8px; vertical-align: top; }
  }
  &__first { padding-left: 24px !important; }
  &__last { padding-right: 24px !important; }
  &__row--expired td { background: rgba(248, 250, 252, 0.5); }

  &__identity { display: flex; flex-direction: column; gap: 16px; }
  &__name { margin: 0; font-size: 14px; font-weight: 700; color: var(--slate-900); &--expired { color: var(--slate-500); text-decoration: line-through var(--slate-300); } }
  h3.cw__name { font-size: 16px; line-height: 1.25; }
  &__id-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  &__id { font-size: 12px; color: var(--slate-500); background: var(--slate-100); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--slate-200); }
  &__account { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; font-weight: 400; }

  &__period { display: flex; flex-direction: column; gap: 12px; > div { display: flex; flex-direction: column; } }
  &__period-label { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; font-size: 12px; font-weight: 500; color: var(--slate-500); }
  &__period-value { font-size: 14px; font-weight: 500; color: var(--slate-700); }

  &__remaining {
    font-size: 14px;
    font-weight: 700;
    color: var(--indigo-600);
    &--expired { color: var(--rose-600); }
    &--sm { display: block; font-size: 12px; line-height: 1.25; }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: 1280px) { grid-template-columns: repeat(3, 1fr); }
    @media (min-width: 1536px) { grid-template-columns: repeat(4, 1fr); }
  }

  &__card { transition: box-shadow 0.15s; &:hover { box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1); } &--expired { background: rgba(248, 250, 252, 0.8); } }
  &__card-head { padding: 20px 20px 12px; border-bottom: 1px solid var(--slate-100); display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  &__card-body { padding: 20px; display: flex; flex-direction: column; gap: 24px; }
  &__section-label { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; color: var(--slate-400); }
  &__card-period { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  &__small-label { display: block; margin-bottom: 4px; font-size: 12px; color: var(--slate-500); }
  &__small-value { display: block; font-size: 12px; font-weight: 500; color: var(--slate-700); }
  &__card-perf { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  // Sub-blocos renderizados via h(): usam :deep pois não carregam o data-v do escopo
  :deep(.cw-perf) { display: flex; flex-direction: column; }
  :deep(.cw-perf__label) { margin-bottom: 4px; font-size: 10px; font-weight: 600; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.05em; }
  :deep(.cw-perf__points) { font-size: 14px; font-weight: 700; }
  :deep(.cw-perf__pct) { font-size: 12px; font-weight: 500; }
  :deep(.cw-perf__na) { font-size: 13px; color: var(--slate-400); }
  :deep(.cw-perf--up) { color: var(--emerald-600); }
  :deep(.cw-perf--down) { color: var(--rose-600); }
  :deep(.cw-perf--up-soft) { color: var(--emerald-500); }
  :deep(.cw-perf--down-soft) { color: var(--rose-500); }

  :deep(.cw-clients) { display: flex; flex-direction: column; gap: 8px; }
  :deep(.cw-clients__label) { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.05em; }
  :deep(.cw-clients__list) { display: flex; flex-direction: column; gap: 8px; padding: 2px 0 2px 12px; border-left: 2px solid var(--slate-200); }
  :deep(.cw-clients__item) { display: flex; flex-direction: column; cursor: pointer; &:hover .cw-clients__name { color: var(--indigo-600); text-decoration: underline; } }
  :deep(.cw-clients__name) { font-size: 12px; font-weight: 600; line-height: 1.25; color: var(--slate-700); }
  :deep(.cw-clients__wallet) { display: flex; align-items: center; gap: 4px; margin-top: 2px; font-size: 11px; color: var(--slate-500); svg { color: var(--slate-400); } }

  :deep(.cw-value) { display: flex; flex-direction: column; gap: 16px; padding: 12px; background: rgba(248, 250, 252, 0.5); border: 1px solid var(--slate-100); border-radius: 8px; }
  :deep(.cw-value__head) { display: flex; align-items: center; gap: 6px; padding-bottom: 8px; margin-bottom: 4px; border-bottom: 1px solid var(--indigo-100); color: var(--indigo-600); span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; } }
  :deep(.cw-value__item) { display: flex; flex-direction: column; }
  :deep(.cw-value__item--signed) { border-top: 1px dashed var(--slate-200); padding-top: 8px; margin-top: 4px; }
  :deep(.cw-value__code) { margin-bottom: 2px; font-size: 12px; font-weight: 700; color: var(--slate-500); }
  :deep(.cw-value__code--amber) { color: var(--amber-700); }
  :deep(.cw-value__main) { font-size: 16px; font-weight: 700; color: var(--slate-900); }
  :deep(.cw-value__sub) { font-size: 14px; font-weight: 600; color: var(--slate-700); }
  :deep(.cw-value__rate) { margin-top: 4px; font-size: 10px; color: var(--slate-400); }
}
</style>
