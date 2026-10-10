<template>
  <div class="sa-card tq">
    <div class="tq__head">
      <div>
        <h3 class="tq__title"><ListChecks :size="18" /> Fila de Solicitações</h3>
        <p class="tq__subtitle">Transações em aberto: validação → aprovação → execução.</p>
      </div>
      <div class="tq__head-actions">
        <SaSelect v-model="statusFilter" size="sm" width="210px" :options="statusOptions" />
        <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" :loading="loading" @click="load">
          <RefreshCw :size="14" class="q-mr-sm" /> Atualizar
        </q-btn>
      </div>
    </div>

    <div class="tq__table-wrap">
      <table class="sa-table tq__table">
        <thead>
          <tr>
            <th class="tq__first" style="width: 130px">Solicitada em</th>
            <th style="width: 220px">Solicitação / Cliente</th>
            <th>Origem / Destino</th>
            <th class="text-right" style="width: 140px">Valor</th>
            <th class="text-center" style="width: 180px">Status</th>
            <th class="text-right tq__last" style="width: 200px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in visible" :key="t.id">
            <td class="tq__first">
              <span class="tq__date">{{ formatDate(t.requestedAtUtc) }}</span>
              <span class="tq__time">{{ timeOf(t.requestedAtUtc) }}</span>
            </td>
            <td>
              <span class="tq__type"><component :is="transactionTypeMeta(t.type).icon" :size="12" /> {{ transactionTypeMeta(t.type).label }}</span>
              <span class="tq__req font-mono">{{ t.requestNumber }}</span>
              <span class="tq__client" :title="t.clientName">{{ t.clientName ?? '—' }}</span>
            </td>
            <td>
              <span class="tq__flow"><b>De</b> {{ endpointLabel(t.source) }}</span>
              <span class="tq__flow"><b>Para</b> {{ endpointLabel(t.destination) }}</span>
            </td>
            <td class="text-right tq__value">{{ formatCurrencyIn(Number(t.amount), t.currencyIsoCode) }}</td>
            <td class="text-center">
              <span class="sa-badge" :class="transactionStatusMeta(t.status).cls">{{ transactionStatusMeta(t.status).label }}</span>
              <span v-if="t.status === 'AwaitingReceipt'" class="tq__hint">Anexe o comprovante para validar</span>
            </td>
            <td class="text-right tq__last">
              <div class="tq__actions">
                <q-btn
                  v-if="primaryAction(t)"
                  unelevated
                  no-caps
                  class="sa-btn sa-btn--primary sa-btn--sm"
                  :loading="busyId === t.id"
                  :disable="!!busyId"
                  :label="TRANSACTION_ACTION[primaryAction(t)!]"
                  @click="act(t, primaryAction(t)!)"
                />
                <q-btn v-if="secondaryActions(t).length" flat round dense :disable="!!busyId" title="Mais ações">
                  <MoreVertical :size="16" />
                  <q-menu auto-close>
                    <q-list dense style="min-width: 180px">
                      <q-item v-for="a in secondaryActions(t)" :key="a" clickable @click="act(t, a)">
                        <q-item-section :class="{ 'text-negative': a === 'Reject' || a === 'Cancel' }">{{ TRANSACTION_ACTION[a] }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </td>
          </tr>
          <tr v-if="loading && !items.length">
            <td colspan="6"><div class="sa-empty tq__empty"><q-spinner size="28px" /><p>Carregando solicitações...</p></div></td>
          </tr>
          <tr v-else-if="!visible.length">
            <td colspan="6"><div class="sa-empty tq__empty"><CheckCircle2 :size="28" /><p>{{ error ?? 'Nenhuma solicitação em aberto.' }}</p></div></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { CheckCircle2, ListChecks, MoreVertical, RefreshCw } from 'lucide-vue-next';
import SaSelect from 'components/ui/SaSelect.vue';
import {
  ACTIONS_BY_STATUS,
  OPEN_STATUSES,
  REASON_REQUIRED,
  applyTransactionAction,
  listOpenTransactions,
  type TransactionAction,
} from 'src/services/transactions.service';
import { apiErrorMessage } from 'src/services/api-envelope';
import type { TransactionSummary } from 'src/types/api';
import { formatCurrencyIn, formatDate } from 'src/utils/format';
import {
  TRANSACTION_ACTION,
  endpointLabel,
  transactionStatusMeta,
  transactionTypeMeta,
} from 'src/utils/transaction-labels';

const emit = defineEmits<{ changed: [] }>();
const $q = useQuasar();

const items = ref<TransactionSummary[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const busyId = ref<string | null>(null);
const statusFilter = ref<string | number | boolean | null>('all');

const statusOptions = [
  { label: 'Todos em aberto', value: 'all' },
  ...OPEN_STATUSES.map((s) => ({ label: transactionStatusMeta(s).label, value: s })),
];

const visible = computed(() => (statusFilter.value === 'all' ? items.value : items.value.filter((t) => t.status === statusFilter.value)));

/** Avança o fluxo (validar, aprovar, executar, retentar); as demais ações ficam no menu. */
const FORWARD: TransactionAction[] = ['Validate', 'Approve', 'Execute', 'RetryExecution'];
const actionsOf = (t: TransactionSummary) => ACTIONS_BY_STATUS[t.status] ?? [];
const primaryAction = (t: TransactionSummary) => actionsOf(t).find((a) => FORWARD.includes(a));
const secondaryActions = (t: TransactionSummary) => actionsOf(t).filter((a) => a !== primaryAction(t));

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

async function load() {
  loading.value = true;
  error.value = null;
  try {
    items.value = await listOpenTransactions();
  } catch (e) {
    items.value = [];
    error.value = apiErrorMessage(e, 'Não foi possível carregar a fila de solicitações.');
    $q.notify({ type: 'negative', message: error.value });
  } finally {
    loading.value = false;
  }
}

const CONFIRM: Partial<Record<TransactionAction, string>> = {
  Validate: 'Confirmar que os dados e documentos da solicitação conferem?',
  Approve: 'Aprovar a solicitação? Ela ficará pronta para execução.',
  Execute: 'Executar agora? Os saldos das carteiras serão movimentados.',
  RetryExecution: 'Tentar executar novamente?',
};

function act(t: TransactionSummary, action: TransactionAction) {
  const title = `${TRANSACTION_ACTION[action]} · ${t.requestNumber}`;
  const amount = formatCurrencyIn(Number(t.amount), t.currencyIsoCode);
  const danger = action === 'Reject' || action === 'Cancel';
  const ok = { label: TRANSACTION_ACTION[action], color: danger ? 'negative' : 'primary', unelevated: true, noCaps: true };
  const cancel = { label: 'Voltar', flat: true, noCaps: true };

  if (REASON_REQUIRED.has(action)) {
    $q.dialog({
      title,
      message: `${t.clientName ?? ''} · ${amount}. Informe o motivo:`,
      prompt: { model: '', type: 'textarea', isValid: (v: string) => v.trim().length > 0 && v.trim().length <= 500 },
      cancel,
      ok,
    }).onOk((reason: string) => void run(t, action, reason.trim()));
  } else {
    $q.dialog({ title, message: `${t.clientName ?? ''} · ${amount}. ${CONFIRM[action] ?? ''}`, cancel, ok }).onOk(() => void run(t, action));
  }
}

async function run(t: TransactionSummary, action: TransactionAction, reason?: string) {
  busyId.value = t.id;
  try {
    const result = await applyTransactionAction(t.id, action, reason);
    const failed = result.status === 'Failed';
    $q.notify({
      type: failed ? 'warning' : 'positive',
      message: `${t.requestNumber}: ${transactionStatusMeta(result.status).label}.${failed ? ' Veja o motivo no detalhe da transação.' : ''}`,
    });
    await load();
    emit('changed');
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e, `Não foi possível ${TRANSACTION_ACTION[action].toLowerCase()} a solicitação.`) });
  } finally {
    busyId.value = null;
  }
}

void load();
defineExpose({ load });
</script>

<style scoped lang="scss">
.tq {
  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--slate-200);
  }
  &__title { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: var(--slate-900); }
  &__subtitle { margin: 4px 0 0; font-size: 13px; color: var(--slate-500); }
  &__head-actions { display: flex; align-items: center; gap: 8px; }

  &__table-wrap { overflow-x: auto; }
  &__table {
    thead tr { background: rgba(248, 250, 252, 0.8); }
    th { height: 44px; font-weight: 700; color: var(--slate-600); letter-spacing: 0.05em; }
    td { padding: 12px 8px; vertical-align: middle; }
  }
  &__first { padding-left: 24px !important; }
  &__last { padding-right: 24px !important; }

  &__date { display: block; font-size: 14px; font-weight: 500; color: var(--slate-700); }
  &__time { display: block; font-size: 12px; color: var(--slate-400); }
  &__type { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.04em; }
  &__req { display: block; font-size: 12px; color: var(--slate-500); }
  &__client { display: block; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; color: var(--slate-700); }
  &__flow {
    display: block;
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    color: var(--slate-700);
    b { display: inline-block; width: 36px; font-size: 10px; color: var(--slate-500); text-transform: uppercase; }
  }
  &__value { font-size: 14px; font-weight: 700; color: var(--slate-700); white-space: nowrap; }
  &__hint { display: block; margin-top: 4px; font-size: 11px; color: var(--slate-400); }
  &__actions { display: inline-flex; align-items: center; gap: 4px; }
  &__empty { height: 140px; opacity: 0.6; p { margin: 0; } }
}
</style>
