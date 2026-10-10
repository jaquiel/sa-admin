<template>
  <div class="cc">
    <!-- Cabeçalho fixo -->
    <div class="cc__header">
      <div class="cc__container cc__header-inner">
        <div>
          <h1>Novo Contrato</h1>
          <p>Preencha os dados abaixo para formalizar um novo contrato.</p>
        </div>
        <div class="cc__actions">
          <q-btn flat no-caps class="sa-btn" label="Cancelar" :disable="!!saving" @click="cancel" />
          <q-btn outline no-caps class="sa-btn sa-btn--outline" :disable="!contractName || !!saving" :loading="saving === 'draft'" @click="create(false)">
            <Save :size="16" class="q-mr-sm" /> Salvar Rascunho
          </q-btn>
          <q-btn unelevated no-caps class="sa-btn sa-btn--primary" :disable="!isValid || !!saving" :loading="saving === 'final'" @click="create(true)">
            <Check :size="16" class="q-mr-sm" /> Criar Contrato
          </q-btn>
        </div>
      </div>
    </div>

    <div class="cc__container cc__grid">
      <!-- Coluna principal -->
      <div class="cc__main">
        <!-- 1. Identificação e prazo -->
        <section class="sa-card cc__card">
          <header class="cc__card-head">
            <span class="cc__icon cc__icon--indigo"><FileText :size="16" /></span>
            <h2>Identificação e Prazo</h2>
          </header>
          <div class="cc__card-body">
            <SaField label="Nome do Contrato">
              <SaInput v-model="contractName" placeholder="Ex: Contrato de Gestão Patrimonial 2025" />
            </SaField>

            <div class="cc__row">
              <SaField label="Prazo do Contrato">
                <div class="cc__duration">
                  <SaInput v-model="durationValue" type="number" class="cc__duration-value" />
                  <SaSelect v-model="durationUnit" :options="unitOptions" class="cc__duration-unit" />
                </div>
              </SaField>
              <SaField label="Moeda Lastreada">
                <SaSelect v-model="currency" :options="currencyOptions" />
              </SaField>
            </div>

            <div class="cc__row cc__dates">
              <SaField>
                <label class="cc__label"><Calendar :size="14" class="text-slate-400" /> Data de Início</label>
                <SaInput v-model="startDate" type="date" class="cc__input-white" />
              </SaField>
              <SaField class="cc__readonly">
                <label class="cc__label"><Calculator :size="14" class="text-slate-400" /> Fim Previsto (Automático)</label>
                <SaInput :model-value="endDate" type="date" readonly />
              </SaField>
            </div>
          </div>
        </section>

        <!-- 2. Capital inicial -->
        <section class="sa-card cc__card">
          <header class="cc__card-head">
            <span class="cc__icon cc__icon--emerald"><DollarSign :size="16" /></span>
            <h2>Capital Inicial</h2>
          </header>
          <div class="cc__card-body">
            <SaField label="Capital Inicial Contratual">
              <SaInput :model-value="initialCapital" placeholder="0,00" input-class="cc__capital-input" @update:model-value="onCapital">
                <template #prepend><span class="cc__symbol">{{ currencySymbol }}</span></template>
              </SaInput>
              <p class="cc__hint">Valor que será registrado como aporte inicial na criação do contrato.</p>
            </SaField>
          </div>
        </section>
      </div>

      <!-- Coluna lateral -->
      <div class="cc__side">
        <!-- 3. Regras de negócio -->
        <section class="sa-card cc__card">
          <header class="cc__card-head">
            <span class="cc__icon cc__icon--amber"><Calculator :size="16" /></span>
            <h2>Regras de Negócio</h2>
          </header>
          <div class="cc__card-body">
            <SaField label="Motor Principal">
              <SaSelect v-model="engineId" :placeholder="catalogLoading ? 'Carregando...' : 'Selecione...'" :options="engineOptions" />
            </SaField>
            <SaField label="Status Inicial">
              <SaSelect v-model="statusId" :placeholder="catalogLoading ? 'Carregando...' : 'Selecione...'" :options="statusOptions" />
            </SaField>
            <p class="cc__hint">Origem do capital: {{ originName }}. É a única origem que o backend aceita finalizar hoje.</p>
          </div>
        </section>

        <!-- 4. Clientes vinculados -->
        <section class="sa-card cc__card cc__card--visible">
          <header class="cc__card-head">
            <span class="cc__icon cc__icon--blue"><Users :size="16" /></span>
            <h2>Clientes Vinculados</h2>
          </header>
          <div class="cc__card-body">
            <div class="cc__client-search">
              <SaInput v-model="clientSearch" placeholder="Buscar cliente..." @focus="dropdownOpen = true">
                <template #prepend><Search :size="16" /></template>
              </SaInput>
              <div v-if="dropdownOpen && String(clientSearch ?? '').length > 0" class="cc__dropdown">
                <div v-if="!filteredClients.length" class="cc__dropdown-empty">Nenhum cliente encontrado</div>
                <button v-for="c in filteredClients" :key="c.id" type="button" class="cc__dropdown-item" @click="addClient(c)">
                  <div>
                    <span class="cc__dropdown-name">{{ c.name }}</span>
                    <span class="cc__dropdown-doc font-mono">{{ c.document }}</span>
                  </div>
                  <UserPlus :size="16" class="cc__dropdown-add" />
                </button>
              </div>
            </div>

            <div class="cc__selected">
              <div v-if="!selectedClients.length" class="cc__selected-empty">Nenhum cliente vinculado.</div>
              <div v-for="c in selectedClients" :key="c.id" class="cc__selected-item">
                <div class="cc__selected-info">
                  <span class="cc__selected-avatar">
                    <Building2 v-if="c.type === 'PJ'" :size="16" />
                    <User v-else :size="16" />
                  </span>
                  <div>
                    <span class="cc__selected-name">{{ c.name }}</span>
                    <span class="cc__selected-doc font-mono">{{ c.document }}</span>
                  </div>
                </div>
                <SaInput
                  :model-value="allocations[c.id] ?? ''"
                  placeholder="0,00"
                  class="cc__alloc-input"
                  @update:model-value="(v) => onAllocation(c.id, v)"
                >
                  <template #prepend><span class="cc__symbol cc__symbol--sm">{{ currencySymbol }}</span></template>
                </SaInput>
                <button type="button" class="cc__remove" aria-label="Remover cliente" @click="removeClient(c.id)">
                  <X :size="16" />
                </button>
              </div>
            </div>
            <div v-if="selectedClients.length" class="cc__alloc-summary" :class="{ 'cc__alloc-summary--ok': allocationMatches }">
              <span>Alocado {{ formatMoney(allocatedTotal) }} de {{ formatMoney(capitalValue) }}</span>
              <button v-if="capitalValue > 0" type="button" class="cc__alloc-split" @click="splitEvenly">Dividir igualmente</button>
            </div>
            <p class="cc__hint">A soma das alocações precisa ser igual ao capital inicial para criar o contrato.</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { Building2, Calculator, Calendar, Check, DollarSign, FileText, Save, Search, User, UserPlus, Users, X } from 'lucide-vue-next';
import SaField from 'components/ui/SaField.vue';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import {
  CONTRACT_CURRENCIES,
  createContractDraft,
  finalizeContract,
  listCapitalOrigins,
  listContractEngines,
  listContractStatuses,
  loadCustomerIndex,
  toContractClient,
} from 'src/services/contracts.service';
import { apiErrorMessage } from 'src/services/api-envelope';
import type { ContractCatalogItem } from 'src/types/api';
import type { ContractClient } from 'src/types/contract';
import { formatCurrencyIn } from 'src/utils/format';

const router = useRouter();
const $q = useQuasar();

const toIso = (d: Date) => d.toISOString().split('T')[0] ?? '';

const durationValue = ref<string | number | null>('5');
const durationUnit = ref<string | number | boolean | null>('years');
const startDate = ref<string | number | null>(toIso(new Date()));
const currency = ref<string | number | boolean | null>('BRL');
const initialCapital = ref('');
const contractName = ref<string | number | null>('');
const engineId = ref<string | number | boolean | null>(null);
const statusId = ref<string | number | boolean | null>(null);
const clientSearch = ref<string | number | null>('');
const selectedClients = ref<ContractClient[]>([]);
const allocations = reactive<Record<string, string>>({});
const dropdownOpen = ref(false);
const saving = ref<false | 'draft' | 'final'>(false);

const unitOptions = [
  { label: 'Meses', value: 'months' },
  { label: 'Anos', value: 'years' },
];
const currencyOptions = CONTRACT_CURRENCIES.map((c) => ({ label: `${c.symbol} · ${c.name}`, value: c.code }));
const currencySymbol = computed(() => CONTRACT_CURRENCIES.find((c) => c.code === currency.value)?.symbol ?? '$');

// ---- catálogos e clientes (API) ----
const engines = ref<ContractCatalogItem[]>([]);
const statuses = ref<ContractCatalogItem[]>([]);
const contractValueOrigin = ref<ContractCatalogItem | null>(null);
const customers = ref<ContractClient[]>([]);
const catalogLoading = ref(true);

const engineOptions = computed(() => engines.value.map((e) => ({ label: e.name, value: e.id })));
const statusOptions = computed(() => statuses.value.map((s) => ({ label: s.name, value: s.id })));
const originName = computed(() => contractValueOrigin.value?.name ?? 'Valor do contrato');

async function loadCatalogs() {
  try {
    const [eng, sts, origins, index] = await Promise.all([listContractEngines(), listContractStatuses(), listCapitalOrigins(), loadCustomerIndex()]);
    engines.value = eng;
    statuses.value = sts;
    contractValueOrigin.value = origins.find((o) => o.code === 'CONTRACT_VALUE') ?? null;
    customers.value = [...index.values()].map((c) => toContractClient(c)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (eng.length === 1) engineId.value = eng[0]!.id;
    statusId.value = sts.find((s) => s.code === 'ACTIVE')?.id ?? sts[0]?.id ?? null;
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e, 'Não foi possível carregar motores, status e clientes.') });
  } finally {
    catalogLoading.value = false;
  }
}
void loadCatalogs();

// Fim previsto = início + prazo
const endDate = computed(() => {
  const duration = parseInt(String(durationValue.value ?? ''), 10);
  if (!startDate.value || Number.isNaN(duration)) return '';
  const end = new Date(String(startDate.value));
  if (durationUnit.value === 'months') end.setMonth(end.getMonth() + duration);
  else end.setFullYear(end.getFullYear() + duration);
  return Number.isNaN(end.getTime()) ? '' : toIso(end);
});

const filteredClients = computed(() => {
  const term = String(clientSearch.value ?? '').toLowerCase();
  return customers.value.filter(
    (c) =>
      !selectedClients.value.some((s) => s.id === c.id) &&
      (c.name.toLowerCase().includes(term) || c.document.toLowerCase().includes(term)),
  );
});

// ---- valores (máscara pt-BR em centavos) ----
const parseMoney = (v: string | undefined) => Number(String(v ?? '').replace(/\./g, '').replace(',', '.')) || 0;
const maskMoney = (v: string | number | null) => {
  const digits = String(v ?? '').replace(/\D/g, '');
  return digits ? (Number(digits) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
};
const toCents = (n: number) => Math.round(n * 100);
const formatMoney = (n: number) => formatCurrencyIn(n, String(currency.value ?? 'BRL'));

const capitalValue = computed(() => parseMoney(initialCapital.value));
const allocatedTotal = computed(() => selectedClients.value.reduce((sum, c) => sum + parseMoney(allocations[c.id]), 0));
const allocationMatches = computed(() => capitalValue.value > 0 && toCents(allocatedTotal.value) === toCents(capitalValue.value));

const isValid = computed(
  () =>
    !!String(contractName.value ?? '').trim() &&
    capitalValue.value > 0 &&
    !!startDate.value &&
    parseInt(String(durationValue.value ?? ''), 10) > 0 &&
    !!engineId.value &&
    !!statusId.value &&
    !!contractValueOrigin.value &&
    selectedClients.value.length > 0 &&
    selectedClients.value.every((c) => parseMoney(allocations[c.id]) > 0) &&
    allocationMatches.value,
);

function onCapital(v: string | number | null) {
  initialCapital.value = maskMoney(v);
}

function onAllocation(id: string, v: string | number | null) {
  allocations[id] = maskMoney(v);
}

/** Divide o capital igualmente, jogando os centavos que sobram no primeiro cliente. */
function splitEvenly() {
  const n = selectedClients.value.length;
  if (!n) return;
  const total = toCents(capitalValue.value);
  const each = Math.floor(total / n);
  selectedClients.value.forEach((c, i) => {
    const cents = each + (i === 0 ? total - each * n : 0);
    allocations[c.id] = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  });
}

function addClient(c: ContractClient) {
  if (!selectedClients.value.some((s) => s.id === c.id)) selectedClients.value.push(c);
  if (selectedClients.value.length === 1 && capitalValue.value > 0) allocations[c.id] = initialCapital.value;
  clientSearch.value = '';
  dropdownOpen.value = false;
}

function removeClient(id: string) {
  selectedClients.value = selectedClients.value.filter((c) => c.id !== id);
  delete allocations[id];
}

function cancel() {
  void router.push({ name: 'contracts' });
}

/** Cria o rascunho e, em `finalize`, finaliza em seguida. Se a finalização falhar, o rascunho fica salvo. */
async function create(finalize: boolean) {
  if (finalize ? !isValid.value : !String(contractName.value ?? '').trim()) return;
  saving.value = finalize ? 'final' : 'draft';
  const duration = parseInt(String(durationValue.value ?? ''), 10);
  let draftId: string | null = null;
  try {
    const draft = await createContractDraft({
      name: String(contractName.value).trim(),
      term: duration > 0 ? { value: duration, unit: durationUnit.value === 'months' ? 'Month' : 'Year' } : null,
      startDate: startDate.value ? String(startDate.value) : null,
      currencyId: CONTRACT_CURRENCIES.find((c) => c.code === currency.value)?.id ?? null,
      initialContractualCapital: capitalValue.value > 0 ? capitalValue.value : null,
      initialCapitalOriginId: contractValueOrigin.value?.id ?? null,
      financialNotes: null,
      primaryEngineId: typeof engineId.value === 'string' ? engineId.value : null,
      initialContractStatusId: typeof statusId.value === 'string' ? statusId.value : null,
      clientAllocations: selectedClients.value.map((c) => {
        const amount = parseMoney(allocations[c.id]);
        return { clientId: c.id, allocatedAmount: amount > 0 ? amount : null };
      }),
    });
    draftId = draft.id;
    if (finalize) {
      const created = await finalizeContract(draft.id);
      $q.notify({ type: 'positive', message: `Contrato ${created.publicCode} criado.` });
    } else {
      $q.notify({ type: 'positive', message: `Rascunho ${draft.publicCode} salvo.` });
    }
    void router.push({ name: 'contract-detail', params: { id: draft.id } });
  } catch (e) {
    const fallback = draftId ? 'O rascunho foi salvo, mas não foi possível finalizar o contrato.' : 'Não foi possível criar o contrato.';
    $q.notify({ type: 'negative', message: apiErrorMessage(e, fallback) });
    if (draftId) void router.push({ name: 'contract-detail', params: { id: draftId } });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.cc {
  flex: 1;
  min-height: 100vh;
  background: rgba(248, 250, 252, 0.5);
  padding-bottom: 80px;

  &__container {
    max-width: 1024px;
    margin: 0 auto;
    padding: 0 24px;
  }

  &__header {
    background: #fff;
    border-bottom: 1px solid var(--slate-200);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  &__header-inner {
    padding-top: 16px;
    padding-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    h1 { margin: 0; font-size: 20px; line-height: 28px; font-weight: 700; color: var(--slate-900); }
    p { margin: 0; font-size: 14px; color: var(--slate-500); }
  }

  &__actions { display: flex; align-items: center; gap: 12px; }

  &__grid {
    padding-top: 32px;
    padding-bottom: 32px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    @media (min-width: 1024px) { grid-template-columns: 8fr 4fr; }
  }

  &__main, &__side { display: flex; flex-direction: column; gap: 24px; min-width: 0; }

  &__card--visible { overflow: visible; }

  &__card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 24px 24px 16px;
    h2 { margin: 0; font-size: 16px; font-weight: 600; color: var(--slate-900); }
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    &--indigo { background: var(--indigo-50); color: var(--indigo-600); }
    &--emerald { background: var(--emerald-50); color: var(--emerald-600); }
    &--amber { background: var(--amber-50); color: var(--amber-600); }
    &--blue { background: var(--blue-50); color: var(--blue-600); }
  }

  &__card-body {
    padding: 0 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
  }

  &__duration { display: flex; gap: 8px; }
  &__duration-value { width: 96px; }
  &__duration-unit { flex: 1; }

  &__dates {
    padding: 16px;
    background: var(--slate-50);
    border: 1px solid var(--slate-100);
    border-radius: 8px;
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-700);
  }

  &__input-white :deep(.q-field__control) { background: #fff; }

  &__readonly {
    opacity: 0.8;
    :deep(.q-field__control) { background: var(--slate-100); cursor: not-allowed; }
    :deep(.q-field__native) { color: var(--slate-500); }
  }

  &__symbol { font-size: 14px; font-weight: 500; color: var(--slate-500); }
  :deep(.cc__capital-input) { font-size: 18px; font-weight: 600; }

  &__hint { margin: 0; font-size: 12px; color: var(--slate-500); }

  // ---------- Busca de clientes ----------
  &__client-search { position: relative; }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1);
    z-index: 20;
    max-height: 240px;
    overflow-y: auto;
  }

  &__dropdown-empty { padding: 12px; font-size: 12px; color: var(--slate-500); text-align: center; }

  &__dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    text-align: left;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--slate-50);
    font: inherit;
    cursor: pointer;
    &:last-child { border-bottom: 0; }
    &:hover { background: var(--slate-50); .cc__dropdown-add { opacity: 1; } }
    > div { display: flex; flex-direction: column; gap: 2px; }
  }

  &__dropdown-name { font-size: 14px; font-weight: 500; color: var(--slate-700); }
  &__dropdown-doc { font-size: 10px; color: var(--slate-400); }
  &__dropdown-add { color: var(--indigo-600); opacity: 0; transition: opacity 0.15s; }

  &__selected { display: flex; flex-direction: column; gap: 8px; }

  &__selected-empty {
    text-align: center;
    padding: 24px 0;
    border: 1px dashed var(--slate-200);
    border-radius: 8px;
    font-size: 12px;
    color: var(--slate-400);
  }

  &__selected-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: var(--slate-50);
    border: 1px solid var(--slate-100);
    border-radius: 8px;
  }

  &__selected-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    > div { display: flex; flex-direction: column; min-width: 0; }
  }

  &__selected-avatar {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: #fff;
    border: 1px solid var(--slate-200);
    color: var(--slate-500);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__selected-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__selected-doc { font-size: 10px; color: var(--slate-500); }

  // Coluna lateral é estreita: o valor alocado fica numa linha própria, abaixo do nome.
  &__selected-item { flex-wrap: wrap; gap: 8px; }
  &__selected-info { flex: 1; }
  &__alloc-input { order: 3; width: 100%; :deep(.q-field__native) { text-align: right; } }
  &__symbol--sm { font-size: 12px; }

  &__alloc-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--rose-600);
    &--ok { color: var(--emerald-600); }
  }
  &__alloc-split {
    background: transparent;
    border: 0;
    padding: 0;
    font: inherit;
    font-weight: 500;
    color: var(--indigo-600);
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }

  &__remove {
    background: transparent;
    border: 0;
    color: var(--slate-300);
    cursor: pointer;
    display: flex;
    transition: color 0.15s;
    &:hover { color: var(--rose-500); }
  }
}
</style>
