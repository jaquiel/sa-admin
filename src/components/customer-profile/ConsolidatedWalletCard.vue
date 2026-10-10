<template>
  <section class="sa-card cw">
    <header class="cw__header">
      <h2 class="sa-card__title cw__title"><PieChart :size="16" /> Visão Consolidada (Carteira)</h2>
      <div class="cw__header-right">
        <q-btn-toggle
          v-if="currencyOptions.length > 1"
          v-model="currency"
          dense
          no-caps
          unelevated
          toggle-color="dark"
          :options="currencyOptions"
          class="cw__currency"
        />
        <span v-if="portfolio?.isAutomaticallyCalculated" class="sa-badge sa-badge--blue cw__auto">Calculado Automaticamente</span>
      </div>
    </header>

    <div class="sa-card__body">
      <CardState
        :loading="profile.loading.portfolio"
        :error="profile.errors.portfolio"
        :empty="!current"
        empty-text="Carteira ainda não calculada para este cliente."
        :rows="2"
        @retry="profile.reload('portfolio')"
      >
        <!-- KPIs -->
        <div v-if="current" class="cw__kpis">
          <div class="cw__kpi">
            <div class="cw__kpi-top">
              <span class="cw__kpi-label">Saldo Base (Patrimônio)</span>
              <span v-if="walletOf('BaseEquity')" class="cw__code font-mono">{{ walletCode('BaseEquity') }}</span>
            </div>
            <div class="cw__kpi-value">{{ money(current.baseEquity, true) }}</div>
          </div>

          <button
            type="button"
            class="cw__kpi cw__kpi--interactive"
            :class="{ 'cw__kpi--open': expanded }"
            :aria-expanded="expanded"
            @click="expanded = !expanded"
          >
            <div class="cw__kpi-row">
              <div class="cw__kpi-main">
                <div class="cw__kpi-top">
                  <span class="cw__kpi-label">Saldo Investido</span>
                  <span v-if="walletOf('Invested')" class="cw__code font-mono">{{ walletCode('Invested') }}</span>
                </div>
                <div class="cw__kpi-value">{{ money(current.invested, true) }}</div>
              </div>
              <ChevronUp v-if="expanded" :size="16" class="cw__chev cw__chev--on" />
              <ChevronDown v-else :size="16" class="cw__chev" />
            </div>
            <span class="cw__kpi-bar" />
          </button>

          <div class="cw__kpi">
            <div class="cw__kpi-top">
              <span class="cw__kpi-label">Saldo Investível</span>
              <span v-if="walletOf('Investable')" class="cw__code font-mono">{{ walletCode('Investable') }}</span>
            </div>
            <div class="cw__kpi-value">{{ money(current.investable, true) }}</div>
          </div>

          <div class="cw__kpi cw__kpi--total">
            <PieChart :size="64" class="cw__total-bg" />
            <div class="cw__kpi-label cw__kpi-label--light">Carteira Total</div>
            <div class="cw__total-value">{{ money(current.total, true) }}</div>
          </div>
        </div>
      </CardState>

      <!-- Contratos atrelados -->
      <transition name="fade-slide">
        <div v-if="expanded" class="cw__linked">
          <div class="cw__linked-head">
            <h4><FileText :size="14" /> Contratos atrelados à carteira</h4>
            <span class="sa-badge sa-badge--blue cw__white">{{ contracts.length }} Contratos</span>
          </div>
          <CardState
            :loading="profile.loading.contracts"
            :error="profile.errors.contracts"
            :empty="!contracts.length"
            empty-text="Nenhum contrato vinculado."
            @retry="profile.reload('contracts')"
          >
            <div class="cw__linked-list">
              <div v-for="c in contracts" :key="c.id" class="cw__contract">
                <div class="cw__contract-head">
                  <div class="cw__contract-icon"><FileText :size="20" /></div>
                  <div>
                    <div class="cw__contract-name">{{ c.name }}</div>
                    <div class="cw__contract-badges">
                      <span class="sa-badge sa-badge--outline sa-badge--xs font-mono">ID: {{ c.publicCode || c.id }}</span>
                      <span class="sa-badge sa-badge--xs cw__active">{{ c.businessStatus?.name ?? c.registrationStatus }}</span>
                    </div>
                    <div class="cw__contract-period">
                      <Calendar :size="12" /> Vigência: {{ formatDate(c.startDate) }} a {{ formatDate(c.endDate) }}
                    </div>
                  </div>
                </div>
                <div class="cw__contract-grid">
                  <DataField label="Valor Inicial" :value="formatMoney(c.initialContractualCapital, c.currencyCode)" />
                  <DataField label="Valor Atual">
                    <span class="cw__green">{{ formatMoney(c.currentCapital, c.currencyCode) }}</span>
                  </DataField>
                </div>
                <q-btn outline no-caps class="sa-btn cw__view" @click="viewContract(c.id)">
                  <Eye :size="12" class="q-mr-xs" /> Ver contrato
                </q-btn>
              </div>
            </div>
          </CardState>
        </div>
      </transition>

      <!-- Composição -->
      <div class="cw__box">
        <div class="cw__box-head">Composição da Carteira</div>
        <div v-if="!composition.length" class="cw__pad">
          <CardState
            :loading="profile.loading.composition"
            :error="profile.errors.composition"
            :empty="true"
            empty-text="Sem composição registrada."
            @retry="profile.reload('composition')"
          />
        </div>
        <table v-else class="sa-table">
          <thead>
            <tr>
              <th>Tipo de Carteira / Classe</th>
              <th>Valor</th>
              <th>Origem</th>
              <th class="text-right">Última Atualização</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in composition" :key="row.classCode">
              <td class="cw__strong">{{ row.className }}</td>
              <td>{{ money(row.value) }}</td>
              <td><span class="sa-badge sa-badge--slate cw__origin">{{ row.origin }}</span></td>
              <td class="text-right cw__muted">{{ formatDateTime(row.lastUpdatedAtUtc) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr class="sa-separator cw__sep" />

      <!-- Extrato -->
      <div class="cw__statement">
        <div class="cw__statement-head">
          <h4 class="sa-card__title cw__statement-title"><History :size="16" /> Extrato da Conta</h4>
          <q-btn outline no-caps dense class="sa-btn sa-btn--outline cw__export" label="Exportar" :loading="exporting" @click="exportCsv" />
        </div>
        <div class="cw__box cw__box--flush">
          <div v-if="!statement.length" class="cw__pad">
            <CardState
              :loading="profile.loading.transactions"
              :error="profile.errors.transactions"
              :empty="true"
              empty-text="Nenhuma movimentação."
              @retry="profile.reload('transactions')"
            />
          </div>
          <q-scroll-area v-else style="height: 340px">
            <table class="sa-table">
              <thead class="cw__sticky">
                <tr>
                  <th style="width: 160px">Data e Hora</th>
                  <th style="width: 140px">Tipo</th>
                  <th>Carteira</th>
                  <th>Descrição</th>
                  <th class="text-right">Valor</th>
                  <th class="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in statement" :key="t.id">
                  <td>
                    <div class="cw__when font-mono">{{ t.when }}</div>
                    <div class="cw__tx font-mono">{{ t.code }}</div>
                  </td>
                  <td>
                    <span class="sa-badge sa-badge--xs" :class="t.meta.cls">
                      <component :is="t.meta.icon" :size="12" /> {{ t.label }}
                    </span>
                  </td>
                  <td class="cw__xs">{{ t.wallet }}</td>
                  <td class="cw__xs cw__desc">{{ t.description }}</td>
                  <td class="text-right cw__xs cw__amount" :class="t.meta.amountCls">{{ t.amount }}</td>
                  <td class="text-right cw__xs">{{ t.status }}</td>
                </tr>
              </tbody>
            </table>
          </q-scroll-area>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { exportFile, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Ban,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  History,
  PieChart,
} from 'lucide-vue-next';
import DataField from './DataField.vue';
import CardState from './CardState.vue';
import { useCustomerProfileStore } from 'stores/customer-profile';
import { exportStatement } from 'src/services/customer-profile.service';
import type { TransactionSummary } from 'src/types/api';
import { formatDate, formatDateTime, formatMoney } from 'src/utils/format';
import { transactionStatusLabel, transactionTypeLabel, walletTypeLabel } from 'src/utils/labels';

const router = useRouter();
const $q = useQuasar();
const profile = useCustomerProfileStore();
const expanded = ref(false);

const portfolio = computed(() => profile.data.portfolio);

// Uma visão por moeda; começa na moeda primária do cliente (ou BRL).
const currency = ref('BRL');
const currencyOptions = computed(() => (portfolio.value?.currencies ?? []).map((c) => ({ label: c.currencyIsoCode, value: c.currencyIsoCode })));
watch(
  portfolio,
  (p) => {
    const codes = (p?.currencies ?? []).map((c) => c.currencyIsoCode);
    const preferred = profile.data.overview?.preferences?.primaryCurrencyCode ?? 'BRL';
    currency.value = codes.includes(preferred) ? preferred : (codes[0] ?? 'BRL');
  },
  { immediate: true },
);
const current = computed(() => portfolio.value?.currencies.find((c) => c.currencyIsoCode === currency.value) ?? null);

const money = (v: number | string | null | undefined, compact = false) => formatMoney(v, currency.value, compact);
const walletOf = (type: string) => current.value?.wallets.find((w) => w.type.toLowerCase() === type.toLowerCase());
// UUIDs viram um código curto; ids já curtos (ex.: CART-0001) ficam como estão
const walletCode = (type: string) => {
  const id = walletOf(type)!.id;
  return (id.length > 12 ? id.slice(0, 8) : id).toUpperCase();
};

const contracts = computed(() => profile.data.contracts ?? []);

const composition = computed(
  () => profile.data.composition?.currencies.find((c) => c.currencyIsoCode === currency.value)?.items ?? [],
);

const TYPE_META = {
  in: { icon: ArrowDownRight, cls: 'sa-badge--blue', amountCls: 'cw__amt--blue' },
  out: { icon: ArrowUpRight, cls: 'sa-badge--red', amountCls: 'cw__amt--red' },
  yield: { icon: ArrowUpRight, cls: 'sa-badge--green', amountCls: 'cw__amt--green' },
  transfer: { icon: ArrowRightLeft, cls: 'sa-badge--purple', amountCls: 'cw__amt--slate' },
  other: { icon: Ban, cls: 'sa-badge--slate', amountCls: 'cw__amt--muted' },
} as const;

function direction(t: TransactionSummary): keyof typeof TYPE_META {
  const type = t.type.toLowerCase();
  if (/yield|interest|income/.test(type)) return 'yield';
  if (/deposit/.test(type)) return 'in';
  if (/withdraw|redemption/.test(type)) return 'out';
  if (/transfer/.test(type)) return 'transfer';
  return 'other';
}

const endpoint = (e: TransactionSummary['source']) =>
  e ? (e.walletType ? walletTypeLabel(e.walletType) : (e.contractName ?? e.kind)) : null;

const statement = computed(() =>
  (profile.data.transactions ?? []).map((t) => {
    const dir = direction(t);
    const from = endpoint(t.source);
    const to = endpoint(t.destination);
    const sign = dir === 'out' ? '- ' : dir === 'in' || dir === 'yield' ? '+ ' : '';
    return {
      id: t.id,
      code: t.requestNumber || t.id.slice(0, 8),
      when: formatDateTime(t.requestedAtUtc),
      label: transactionTypeLabel(t.type),
      meta: TYPE_META[dir],
      wallet: from && to ? `${from} → ${to}` : (to ?? from ?? '—'),
      description: t.destination?.contractName ?? t.source?.contractName ?? transactionTypeLabel(t.type),
      amount: sign + formatMoney(t.amount, t.currencyIsoCode),
      status: transactionStatusLabel(t.status),
    };
  }),
);

function viewContract(id: string) {
  void router.push({ name: 'contract-detail', params: { id } });
}

const exporting = ref(false);

async function exportCsv() {
  const id = profile.customerId;
  if (!id) return;
  exporting.value = true;
  try {
    const blob = await exportStatement(id);
    const ok = exportFile(`extrato-${id.slice(0, 8)}.csv`, blob, 'text/csv');
    if (ok !== true) $q.notify({ type: 'negative', message: 'O navegador bloqueou o download.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Não foi possível exportar o extrato.' });
  } finally {
    exporting.value = false;
  }
}
</script>

<style scoped lang="scss">
.cw {
  background: rgba(248, 250, 252, 0.3);

  &__header {
    padding: 24px 24px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__title {
    color: var(--slate-800);
  }

  &__auto {
    font-weight: 400;
  }

  &__kpis {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 32px;
    @media (min-width: 768px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__kpi {
    position: relative;
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--slate-200);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    text-align: left;
    font: inherit;
    overflow: hidden;

    &--interactive {
      cursor: pointer;
      transition: all 0.15s;
      &:hover {
        border-color: var(--blue-300);
      }
      &:hover .cw__kpi-label {
        color: var(--blue-600);
      }
      &:hover .cw__code {
        border-color: var(--blue-100);
        color: var(--blue-400);
      }
      &:hover .cw__chev {
        color: var(--blue-400);
      }
      &:hover .cw__kpi-bar {
        opacity: 1;
      }
    }

    &--open {
      border-color: var(--blue-400);
      box-shadow: 0 0 0 2px var(--blue-100);
      &:hover {
        border-color: var(--blue-400);
      }
    }

    &--total {
      background: var(--slate-900);
      border-color: var(--slate-800);
      color: #fff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  }

  &__kpi-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  &__kpi-main {
    width: 100%;
  }

  &__kpi-top {
    display: flex;
    flex-wrap: wrap-reverse;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    gap: 8px;
  }

  &__kpi-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--slate-400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.15s;

    &--light {
      color: var(--slate-300);
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
  }

  &__code {
    font-size: 10px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    padding: 0 6px;
    border-radius: 6px;
    border: 1px solid var(--slate-100);
    background: var(--slate-50);
    color: var(--slate-400);
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  &__kpi-value {
    white-space: nowrap;
    font-size: 18px;
    font-weight: 700;
    color: var(--slate-700);
  }

  &__chev {
    margin-left: 8px;
    color: var(--slate-300);
    flex-shrink: 0;
    &--on {
      color: var(--blue-500);
    }
  }

  &__kpi-bar {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--blue-400), var(--blue-600));
    opacity: 0;
    transition: opacity 0.15s;
  }

  &__total-bg {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0.1;
  }

  &__total-value {
    white-space: nowrap;
    font-size: 20px;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }

  /* Contratos atrelados */
  &__linked {
    margin-bottom: 32px;
    background: #fff;
    border: 1px solid var(--blue-200);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  &__linked-head {
    background: rgba(239, 246, 255, 0.5);
    padding: 12px 16px;
    border-bottom: 1px solid var(--blue-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
    h4 {
      font-size: 12px;
      font-weight: 700;
      color: var(--blue-800);
      text-transform: uppercase;
      letter-spacing: 0.025em;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
  }

  &__white {
    background: #fff;
  }

  &__linked-list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__contract {
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    padding: 16px;
    background: rgba(248, 250, 252, 0.3);
    transition: border-color 0.15s;
    &:hover {
      border-color: var(--blue-300);
    }
  }

  &__contract-head {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__contract-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--blue-50);
    color: var(--blue-600);
    border: 1px solid var(--blue-100);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__contract-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--slate-900);
    margin-bottom: 4px;
  }

  &__contract-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__active {
    background: var(--green-100);
    color: var(--green-700);
    border-color: var(--green-200);
  }

  &__contract-period {
    font-size: 12px;
    color: var(--slate-500);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__contract-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid var(--slate-100);
    margin-bottom: 12px;
    @media (min-width: 768px) {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  &__green {
    color: var(--green-600);
    font-weight: 700;
  }
  &__blue {
    color: var(--blue-600);
    font-weight: 700;
  }
  &__blocked {
    color: var(--amber-600);
    display: flex;
    align-items: center;
    gap: 4px;
    svg {
      color: var(--amber-500);
    }
  }

  &__view {
    width: 100%;
    height: 32px;
    min-height: 32px;
    font-size: 12px;
    color: var(--blue-600);
    &:before {
      border-color: var(--blue-200);
    }
    &:hover {
      background: var(--blue-50);
    }
  }

  &__debt-wrap {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--slate-200);
  }

  &__debt {
    background: rgba(255, 251, 235, 0.5);
    border: 1px solid var(--amber-200);
    border-radius: 8px;
    padding: 12px;
  }

  &__debt-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__debt-title {
    font-size: 10px;
    font-weight: 700;
    color: var(--amber-700);
    text-transform: uppercase;
    letter-spacing: 0.025em;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__debt-status {
    background: #fff;
    color: var(--amber-700);
    border-color: var(--amber-300);
    font-size: 10px;
    padding: 0 6px;
  }

  &__debt-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--slate-800);
    margin-bottom: 6px;
  }

  &__debt-grid {
    display: grid;
    gap: 8px;
    font-size: 10px;
    &--3 {
      grid-template-columns: repeat(3, 1fr);
    }
    &--2 {
      grid-template-columns: repeat(2, 1fr);
      padding-top: 4px;
    }
  }

  &__dl {
    color: var(--slate-500);
  }
  &__dv {
    font-weight: 500;
    color: var(--slate-700);
    &--red {
      color: var(--red-600);
    }
  }

  &__debt-btn {
    width: 100%;
    font-size: 10px;
    min-height: 24px;
    margin-top: 8px;
    color: var(--amber-700);
    &:hover {
      background: #fef3c7;
    }
  }

  /* Tabelas */
  &__box {
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    margin-bottom: 32px;
    overflow-x: auto;

    &--flush {
      margin-bottom: 0;
    }
  }

  &__box-head {
    background: var(--slate-50);
    padding: 8px 16px;
    border-bottom: 1px solid var(--slate-200);
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__strong {
    font-weight: 500;
    color: var(--slate-700);
  }

  &__origin {
    font-weight: 400;
    border-color: transparent;
  }

  &__muted {
    color: var(--slate-500);
    font-size: 12px;
  }

  &__sep {
    margin: 32px 0;
  }

  &__statement {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__statement-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__statement-title {
    color: var(--slate-800);
  }

  &__export {
    height: 28px;
    min-height: 28px;
    font-size: 12px;
    padding: 0 10px;
  }

  &__sticky {
    position: sticky;
    top: 0;
    z-index: 1;
    tr {
      background: var(--slate-50);
    }
  }

  &__when {
    font-size: 12px;
    color: var(--slate-500);
  }

  &__tx {
    font-size: 10px;
    color: var(--slate-400);
    margin-top: 2px;
  }

  &__xs {
    font-size: 12px;
    color: var(--slate-600);
  }

  &__desc {
    color: var(--slate-700);
  }

  &__amount {
    font-weight: 500;
    color: var(--slate-700);
    white-space: nowrap;
  }

  &__amt--green { color: var(--green-600); }
  &__amt--blue { color: var(--blue-600); }
  &__amt--muted { color: var(--slate-500); }
  &__amt--slate { color: var(--slate-600); }
  &__amt--red { color: var(--red-600); }
}

.cw__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cw__currency {
  font-size: 11px;
}
.cw__pad {
  padding: 16px;
}
</style>
