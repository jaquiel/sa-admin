<template>
  <div class="sa-page">
    <div v-if="loading" class="sa-page__inner">
      <div class="sa-empty cd__notfound"><q-spinner size="40px" /><p>Carregando contrato...</p></div>
    </div>

    <div v-else-if="!contract" class="sa-page__inner">
      <q-btn flat no-caps class="sa-btn sa-btn--ghost cd__back" @click="router.push({ name: 'contracts' })">
        <ArrowLeft :size="16" class="q-mr-sm" /> Voltar para Seleção de Contratos
      </q-btn>
      <div class="sa-empty cd__notfound">
        <FileText :size="48" />
        <p>{{ error ?? `Contrato ${id} não encontrado.` }}</p>
      </div>
    </div>

    <div v-else class="sa-page__inner">
      <q-btn flat no-caps class="sa-btn sa-btn--ghost cd__back" @click="router.push({ name: 'contracts' })">
        <ArrowLeft :size="16" class="q-mr-sm" /> Voltar para Seleção de Contratos
      </q-btn>

      <!-- Cabeçalho institucional -->
      <section class="cd__header" :class="{ 'cd__header--editing': editing }">
        <div class="cd__header-top">
          <div class="cd__header-title">
            <div v-if="editing" class="cd__name-edit">
              <label class="sa-label-xs cd__label--indigo">Nome do Contrato</label>
              <SaInput v-model="draft.name" class="cd__name-input" />
            </div>
            <template v-else>
              <div class="cd__title-row">
                <h1 class="sa-page__title">{{ contract.name || 'Sem nome' }}</h1>
                <span class="cd__code font-mono">{{ contract.publicCode }}</span>
                <span class="sa-badge" :class="status.cls">{{ status.label }}</span>
                <q-btn outline no-caps dense class="sa-btn cd__logic-btn" @click="router.push({ name: 'contract-logic', params: { id } })">
                  <BarChart2 :size="14" class="q-mr-xs" /> Lógica Contratual
                </q-btn>
              </div>
              <p class="sa-page__subtitle">
                {{ isDraft ? 'Rascunho: complete os dados e finalize para ativar o contrato.' : 'Gestão institucional do contrato' }}
              </p>
            </template>
          </div>

          <div class="cd__header-actions">
            <template v-if="editing">
              <span class="cd__edit-pill"><FileEdit :size="14" /> Modo de Edição</span>
              <q-btn flat no-caps class="sa-btn sa-btn--ghost sa-btn--sm" :disable="saving" @click="cancelEdit">
                <X :size="16" class="q-mr-sm" /> Cancelar
              </q-btn>
              <q-btn unelevated no-caps class="sa-btn sa-btn--primary sa-btn--sm" :loading="saving" :disable="!draft.name.trim()" @click="saveEdit">
                <Save :size="16" class="q-mr-sm" /> Salvar Alterações
              </q-btn>
            </template>
            <template v-else-if="canWrite">
              <q-btn v-if="isDraft" unelevated no-caps class="sa-btn sa-btn--primary sa-btn--sm" :loading="saving" @click="finalize">
                <CheckCircle2 :size="14" class="q-mr-sm" /> Finalizar Contrato
              </q-btn>
              <q-btn v-else outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" @click="startEdit">
                <Pencil :size="14" class="q-mr-sm" /> Editar Contrato
              </q-btn>
            </template>
          </div>
        </div>

        <div class="cd__fields">
          <div class="cd__field">
            <label class="sa-label-xs">Início do Contrato</label>
            <div class="cd__value cd__value--locked">{{ contract.startDate ? formatDate(contract.startDate) : '—' }}</div>
          </div>
          <div class="cd__field">
            <label class="sa-label-xs" :class="{ 'cd__label--indigo': editing }">Fim do Contrato</label>
            <SaInput v-if="editing" v-model="draft.endDate" type="date" class="cd__date-input" />
            <div v-else class="cd__value">{{ endText }}</div>
          </div>
          <div class="cd__field">
            <label class="sa-label-xs">Moeda Lastreada</label>
            <div class="cd__value cd__value--icon">
              <span class="cd__currency" :class="`cd__currency--${currency.toLowerCase()}`">
                <DollarSign v-if="currency === 'USD'" :size="12" />
                <template v-else>{{ currency === 'BRL' ? 'R$' : currency === 'EUR' ? '€' : currency }}</template>
              </span>
              {{ contract.currency?.name ?? currency }}
            </div>
          </div>
          <div class="cd__field">
            <label class="sa-label-xs">Capital Inicial Contratual</label>
            <div class="cd__value cd__value--icon">
              <DollarSign :size="14" class="text-slate-400" />
              {{ contract.initialContractualCapital == null ? '—' : formatCurrencyIn(Number(contract.initialContractualCapital), currency) }}
            </div>
          </div>
          <div class="cd__field">
            <label class="sa-label-xs" :class="{ 'cd__label--indigo': editing }">Status do Contrato</label>
            <SaSelect v-if="editing" v-model="draft.statusId" :options="statusOptions" placeholder="Selecione..." />
            <div v-else class="cd__value">{{ status.label }}</div>
          </div>
          <div class="cd__field">
            <label class="sa-label-xs">Motor Principal</label>
            <div class="cd__value cd__value--locked">{{ contract.primaryEngine?.name ?? '—' }}</div>
          </div>
          <div class="cd__field">
            <label class="sa-label-xs">Origem do Capital</label>
            <div class="cd__value cd__value--locked">{{ contract.initialCapitalOrigin?.name ?? '—' }}</div>
          </div>
          <div class="cd__field">
            <label class="sa-label-xs">Prazo</label>
            <div class="cd__value cd__value--locked">{{ termText }}</div>
          </div>
        </div>

        <div v-if="editing || contract.financialNotes" class="cd__field">
          <label class="sa-label-xs" :class="{ 'cd__label--indigo': editing }">Observações Financeiras</label>
          <SaInput v-if="editing" v-model="draft.financialNotes" placeholder="Observações sobre o contrato..." />
          <div v-else class="cd__value">{{ contract.financialNotes }}</div>
        </div>
      </section>

      <!-- Conteúdo -->
      <div class="cd__content">
        <LinkedClientsCard :clients="view.clients" :editing="editing" :currency="currency" @add="addClient" @remove="removeClient" />
        <p class="cd__sample-note">
          <Info :size="14" /> Lógicas, aportes e performance abaixo ainda são dados de exemplo: o backend não tem esses endpoints.
        </p>
        <ContractSummaryCards
          v-model:contract-logic="sampleLogic"
          v-model:dividend-logic="sampleDividend"
          :editing="false"
          :start-date="contract.startDate ?? ''"
          :end-date="contract.expectedEndDate ?? ''"
        />
        <ContributionHistory />
        <ContractPerformanceTable />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { ArrowLeft, BarChart2, CheckCircle2, DollarSign, FileEdit, FileText, Info, Pencil, Save, X } from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import LinkedClientsCard from 'components/contracts/LinkedClientsCard.vue';
import ContractSummaryCards from 'components/contracts/ContractSummaryCards.vue';
import ContributionHistory from 'components/contracts/ContributionHistory.vue';
import ContractPerformanceTable from 'components/contracts/ContractPerformanceTable.vue';
import {
  addContractParticipant,
  changeContractStatus,
  finalizeContract,
  getContract,
  listContractStatuses,
  loadCustomerIndex,
  participantToClient,
  removeContractParticipant,
  updateContract,
} from 'src/services/contracts.service';
import { apiErrorMessage } from 'src/services/api-envelope';
import type { ContractCatalogItem, ContractDetail } from 'src/types/api';
import type { ContractClient } from 'src/types/contract';
import type { CustomerSummary } from 'src/types/customer';
import { formatCurrencyIn, formatDate } from 'src/utils/format';
import { useAuthStore } from 'stores/auth';

const props = defineProps<{ id: string }>();

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();
const canWrite = computed(() => auth.can('contracts:write'));

const contract = ref<ContractDetail | null>(null);
const customers = ref(new Map<string, CustomerSummary>());
const statuses = ref<ContractCatalogItem[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);

// Os cards de lógica ainda vêm do mock; estes valores são só para exibição.
const sampleLogic = ref('Growth Alpha V2');
const sampleDividend = ref('Quarterly Yield+');

const STATUS_CLS: Record<string, string> = {
  ACTIVE: 'sa-badge--emerald-soft',
  SUSPENDED: 'sa-badge--amber-soft',
  CLOSED: 'sa-badge--slate-soft',
};
const TERM_UNIT: Record<string, [string, string]> = { Day: ['dia', 'dias'], Month: ['mês', 'meses'], Year: ['ano', 'anos'] };

const isDraft = computed(() => contract.value?.registrationStatus === 'Draft');
const currency = computed(() => contract.value?.currency?.isoCode ?? 'BRL');
const status = computed(() => {
  const c = contract.value;
  if (!c || c.registrationStatus === 'Draft') return { label: 'Rascunho', cls: 'sa-badge--outline' };
  if (!c.businessStatus) return { label: 'Cadastrado', cls: 'sa-badge--indigo' };
  return { label: c.businessStatus.name, cls: STATUS_CLS[c.businessStatus.code] ?? 'sa-badge--indigo' };
});
const endText = computed(() => (contract.value?.expectedEndDate ? formatDate(contract.value.expectedEndDate) : 'Indeterminado'));
const termText = computed(() => {
  const t = contract.value?.term;
  if (!t) return '—';
  const [one, many] = TERM_UNIT[t.unit] ?? [t.unit, t.unit];
  return `${t.value} ${t.value === 1 ? one : many}`;
});
const statusOptions = computed(() => statuses.value.map((s) => ({ label: s.name, value: s.id })));

const clientsOf = (c: ContractDetail) => c.participants.map((p) => participantToClient(p, customers.value));

interface FormData {
  name: string;
  endDate: string;
  financialNotes: string;
  statusId: string | number | boolean | null;
  clients: ContractClient[];
}

const editing = ref(false);
const draft = reactive<FormData>({ name: '', endDate: '', financialNotes: '', statusId: null, clients: [] });
const view = computed(() => (editing.value ? draft : { clients: contract.value ? clientsOf(contract.value) : [] }));

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const [detail, index, catalog] = await Promise.all([
      getContract(props.id),
      loadCustomerIndex().catch(() => new Map<string, CustomerSummary>()),
      listContractStatuses().catch(() => [] as ContractCatalogItem[]),
    ]);
    contract.value = detail;
    customers.value = index;
    statuses.value = catalog;
  } catch (e) {
    contract.value = null;
    const notFound = (e as { response?: { status?: number } })?.response?.status === 404;
    error.value = notFound ? null : apiErrorMessage(e, 'Não foi possível carregar o contrato.');
  } finally {
    loading.value = false;
  }
}
void load();

function startEdit() {
  const c = contract.value;
  if (!c) return;
  Object.assign(draft, {
    name: c.name ?? '',
    endDate: c.expectedEndDate ?? '',
    financialNotes: c.financialNotes ?? '',
    statusId: c.businessStatus?.id ?? null,
    clients: clientsOf(c),
  });
  editing.value = true;
}

function cancelEdit() {
  editing.value = false;
}

/** Aplica as diferenças: dados cadastrais (PATCH), status (POST /status) e vínculos (POST/DELETE participants). */
async function saveEdit() {
  const c = contract.value;
  if (!c) return;
  saving.value = true;
  try {
    const name = draft.name.trim();
    const notes = draft.financialNotes.trim() || null;
    const endDate = String(draft.endDate || '') || null;
    const endChanged = endDate !== (c.expectedEndDate ?? null);
    if (name !== (c.name ?? '') || notes !== (c.financialNotes ?? null) || endChanged) {
      await updateContract(c.id, { name, financialNotes: notes, ...(endChanged && endDate ? { endDate } : {}) });
    }
    if (typeof draft.statusId === 'string' && draft.statusId !== c.businessStatus?.id) {
      await changeContractStatus(c.id, draft.statusId);
    }
    const before = new Set(c.participants.map((p) => p.clientId));
    const after = new Set(draft.clients.map((cl) => cl.id));
    for (const id of after) if (!before.has(id)) await addContractParticipant(c.id, id);
    for (const id of before) if (!after.has(id)) await removeContractParticipant(c.id, id);
    $q.notify({ type: 'positive', message: 'Contrato atualizado.' });
    editing.value = false;
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e, 'Não foi possível salvar todas as alterações.') });
  } finally {
    saving.value = false;
    contract.value = await getContract(c.id).catch(() => contract.value);
  }
}

function finalize() {
  const c = contract.value;
  if (!c) return;
  $q.dialog({
    title: 'Finalizar contrato',
    message: `Finalizar ${c.publicCode}? O rascunho vira um contrato cadastrado e deixa de ser editável como rascunho.`,
    cancel: { label: 'Voltar', flat: true, noCaps: true },
    ok: { label: 'Finalizar', color: 'primary', unelevated: true, noCaps: true },
  }).onOk(async () => {
    saving.value = true;
    try {
      contract.value = await finalizeContract(c.id);
      $q.notify({ type: 'positive', message: `Contrato ${c.publicCode} finalizado.` });
    } catch (e) {
      $q.notify({ type: 'negative', message: apiErrorMessage(e, 'Não foi possível finalizar o contrato.') });
    } finally {
      saving.value = false;
    }
  });
}

function addClient(client: ContractClient) {
  draft.clients = [client, ...draft.clients];
}

function removeClient(id: string) {
  draft.clients = draft.clients.filter((c) => c.id !== id);
}
</script>

<style scoped lang="scss">
.cd {
  &__back { width: fit-content; margin: 0 0 -24px -8px; padding: 0 8px; }

  &__notfound { padding: 64px 0; p { margin: 0; } }

  &__header {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    transition: all 0.3s;

    &--editing {
      border-color: var(--indigo-200);
      box-shadow: 0 0 0 4px rgba(238, 242, 255, 0.5), 0 4px 6px -1px rgba(15, 23, 42, 0.1);
    }
  }

  &__header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--slate-100);
  }

  &__header-title { flex: 1; min-width: 0; }
  &__title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

  &__logic-btn {
    height: 28px;
    font-size: 12px;
    font-weight: 600;
    color: var(--indigo-600);
    background: var(--indigo-50);
    &:before { border-color: var(--indigo-200) !important; }
    &:hover { background: var(--indigo-100); color: var(--indigo-700); }
  }

  &__name-edit {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    @media (min-width: 768px) { width: 50%; }
  }

  &__name-input :deep(.q-field__control) {
    height: auto !important;
    min-height: 48px !important;
    background: rgba(238, 242, 255, 0.3);
    &:before { border-color: var(--indigo-200) !important; }
  }
  &__name-input :deep(.q-field__native) { font-size: 24px; font-weight: 700; }

  &__label--indigo { color: var(--indigo-600) !important; }

  &__header-actions { display: flex; align-items: center; gap: 12px; }

  &__edit-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 16px;
    padding: 6px 12px;
    background: var(--indigo-50);
    color: var(--indigo-700);
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    animation: cd-pulse 2s ease-in-out infinite;
  }

  &__fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
  }

  &__field { display: flex; flex-direction: column; gap: 6px; }

  &__value {
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-900);
    padding: 8px 12px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 6px;

    &--locked { color: var(--slate-700); background: var(--slate-50); border-color: var(--slate-100); cursor: not-allowed; opacity: 0.8; }
    &--icon { display: flex; align-items: center; gap: 8px; }
  }

  &__date-input :deep(.q-field__control) { background: #fff; &:before { border-color: var(--indigo-200) !important; } }

  &__currency {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    background: var(--slate-100);
    color: var(--slate-700);
    border-color: var(--slate-200);
    &--brl { background: var(--emerald-100); color: var(--emerald-700); border-color: var(--emerald-200); }
    &--usd { background: var(--sky-100); color: var(--sky-700); border-color: var(--sky-200); }
  }

  &__content { display: flex; flex-direction: column; gap: 24px; }
  &__code { font-size: 12px; color: var(--slate-500); background: var(--slate-100); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--slate-200); }
  &__sample-note { margin: 0; display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--amber-700); background: var(--amber-50); border: 1px solid var(--amber-100); border-radius: 6px; padding: 8px 12px; }
}

@keyframes cd-pulse {
  50% { opacity: 0.6; }
}
</style>
