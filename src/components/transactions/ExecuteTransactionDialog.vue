<template>
  <q-dialog v-model="open" @show="onShow">
    <div class="sa-dialog et">
      <div class="et__head">
        <h2>Executar Transação</h2>
        <p>Configure os detalhes da movimentação financeira. A solicitação é criada aguardando validação.</p>
      </div>

      <div class="et__body">
        <div class="et__row">
          <SaField label="Tipo de Movimentação">
            <SaSelect v-model="type" :options="typeOptions" />
          </SaField>
          <SaField label="Cliente">
            <SaSelect
              v-model="clientId"
              :placeholder="customersLoading ? 'Carregando...' : 'Selecione o cliente...'"
              :options="clientOptions"
              :disable="customersLoading"
            />
          </SaField>
        </div>

        <div v-if="clientId && loadingAccounts" class="et__hint"><q-spinner size="14px" /> Carregando carteiras e contas...</div>

        <template v-else-if="clientId">
          <div class="et__row">
            <SaField label="Valor">
              <SaInput v-model="amount" type="number" placeholder="0.00">
                <template #prepend><span class="et__prefix">{{ currencyIso ?? '' }}</span></template>
              </SaInput>
            </SaField>
            <SaField v-if="type !== 'ContractOperation'" label="Moeda">
              <SaSelect v-model="currencyId" placeholder="Selecione..." :options="currencyOptions" :disable="!currencyOptions.length" />
            </SaField>
            <SaField v-else label="Contrato">
              <SaSelect v-model="contractId" placeholder="Selecione o contrato..." :options="contractOptions" :disable="!contractOptions.length" />
            </SaField>
          </div>

          <div v-if="type !== 'ContractOperation'" class="et__row">
            <SaField label="Origem">
              <SaSelect v-if="type === 'Deposit'" v-model="bankAccountId" placeholder="Conta bancária do cliente..." :options="bankOptions" :disable="!bankOptions.length" />
              <SaSelect v-else-if="type === 'WalletTransfer'" v-model="sourceWallet" :options="sourceWalletOptions" />
              <SaInput v-else :model-value="walletText('Free')" readonly />
            </SaField>
            <SaField label="Destino">
              <SaSelect v-if="type === 'Withdrawal'" v-model="bankAccountId" placeholder="Conta bancária do cliente..." :options="bankOptions" :disable="!bankOptions.length" />
              <SaSelect v-else-if="type === 'WalletTransfer' && sourceWallet === 'Applied'" v-model="transferDestination" :options="appliedDestinationOptions" />
              <SaInput v-else-if="type === 'WalletTransfer'" :model-value="walletText('Applied')" readonly />
              <SaInput v-else :model-value="walletText('Free')" readonly />
            </SaField>
          </div>

          <SaField v-if="type === 'WalletTransfer' && sourceWallet === 'Applied' && transferDestination === 'Contract'" label="Contrato de Destino">
            <SaSelect v-model="contractId" placeholder="Selecione o contrato..." :options="contractOptions" :disable="!contractOptions.length" />
          </SaField>

          <SaField label="Observação (Opcional)">
            <SaInput v-model="observation" placeholder="Referência, motivo ou detalhes..." />
          </SaField>

          <p v-for="w in warnings" :key="w" class="et__warn"><AlertTriangle :size="14" /> {{ w }}</p>
        </template>
      </div>

      <div class="et__foot">
        <q-btn outline no-caps class="sa-btn sa-btn--outline" label="Cancelar" :disable="submitting" @click="open = false" />
        <q-btn
          unelevated
          no-caps
          class="sa-btn sa-btn--primary"
          label="Confirmar Transação"
          :loading="submitting"
          :disable="!canSubmit"
          @click="confirm"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { AlertTriangle } from 'lucide-vue-next';
import SaField from 'components/ui/SaField.vue';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import { useCustomerAccounts } from 'src/composables/useCustomerAccounts';
import { listContracts } from 'src/services/customer-profile.service';
import {
  createContractOperation,
  createDeposit,
  createWalletTransfer,
  createWithdrawal,
  type CreatedTransaction,
} from 'src/services/transactions.service';
import { apiErrorMessage } from 'src/services/api-envelope';
import type { ContractListItem } from 'src/types/api';
import { formatCurrencyIn } from 'src/utils/format';

type Sel = string | number | boolean | null;

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{ created: [tx: CreatedTransaction] }>();
const $q = useQuasar();
const { customers, customersLoading, accounts, loadCustomers, loadAccounts, walletLabel, accountLabel } = useCustomerAccounts();

const type = ref<Sel>('Deposit');
const clientId = ref<Sel>(null);
const amount = ref<string | number | null>('');
const currencyId = ref<Sel>(null);
const bankAccountId = ref<Sel>(null);
const sourceWallet = ref<Sel>('Free');
const transferDestination = ref<Sel>('Wallet');
const contractId = ref<Sel>(null);
const observation = ref<string | number | null>('');
const contracts = ref<ContractListItem[]>([]);
const loadingAccounts = ref(false);
const submitting = ref(false);

const typeOptions = [
  { label: 'Depósito (Entrada)', value: 'Deposit' },
  { label: 'Saque (Saída)', value: 'Withdrawal' },
  { label: 'Transferência entre Carteiras', value: 'WalletTransfer' },
  { label: 'Aporte em Contrato', value: 'ContractOperation' },
];
const sourceWalletOptions = [
  { label: 'Carteira Livre', value: 'Free' },
  { label: 'Carteira Aplicada', value: 'Applied' },
];
const appliedDestinationOptions = [
  { label: 'Carteira Livre', value: 'Wallet' },
  { label: 'Contrato', value: 'Contract' },
];

const clientOptions = computed(() => customers.value.map((c) => ({ label: c.name, value: c.id })));
const current = computed(() => (typeof clientId.value === 'string' ? accounts[clientId.value] : undefined));
const wallets = computed(() => current.value?.wallets ?? []);

// Não há endpoint de moedas: as opções vêm das carteiras que o cliente já tem.
const currencyOptions = computed(() => {
  const seen = new Map<string, string>();
  for (const w of wallets.value) if (w.currencyId) seen.set(w.currencyId, w.currencyIsoCode);
  return [...seen].map(([value, label]) => ({ label, value }));
});
const bankOptions = computed(() => (current.value?.bankAccounts ?? []).map((a) => ({ label: accountLabel(a), value: a.id })));
const contractOptions = computed(() => contracts.value.map((c) => ({ label: `${c.publicCode} · ${c.name}`, value: c.id })));

const selectedContract = computed(() => contracts.value.find((c) => c.id === contractId.value));
const currencyIso = computed(() =>
  type.value === 'ContractOperation'
    ? selectedContract.value?.currencyCode
    : currencyOptions.value.find((o) => o.value === currencyId.value)?.label,
);

const walletOf = (kind: 'Free' | 'Applied') => wallets.value.find((w) => w.type === kind && w.currencyId === currencyId.value);
function walletText(kind: 'Free' | 'Applied') {
  const w = walletOf(kind);
  if (!w) return kind === 'Free' ? 'Carteira Livre' : 'Carteira Aplicada';
  return `${walletLabel(w)} · disponível ${formatCurrencyIn(Number(w.available), w.currencyIsoCode)}`;
}

const value = computed(() => Number(amount.value) || 0);
const needsBank = computed(() => type.value === 'Deposit' || type.value === 'Withdrawal');
const needsContract = computed(
  () => type.value === 'ContractOperation' || (type.value === 'WalletTransfer' && sourceWallet.value === 'Applied' && transferDestination.value === 'Contract'),
);

const warnings = computed(() => {
  const out: string[] = [];
  if (type.value !== 'ContractOperation' && !currencyOptions.value.length) {
    out.push('O cliente ainda não tem carteira, então não há moeda disponível (a API não expõe a lista de moedas).');
  }
  if (needsBank.value && !bankOptions.value.length) out.push('O cliente não tem conta bancária ativa cadastrada.');
  if (needsContract.value && !contractOptions.value.length) out.push('O cliente não está vinculado a nenhum contrato.');
  const debit = type.value === 'Withdrawal' ? walletOf('Free') : type.value === 'WalletTransfer' ? walletOf(sourceWallet.value === 'Applied' ? 'Applied' : 'Free') : undefined;
  if (debit && value.value > Number(debit.available)) out.push('Valor maior que o saldo disponível na carteira de origem.');
  return out;
});

const canSubmit = computed(() => {
  if (submitting.value || typeof clientId.value !== 'string' || value.value <= 0) return false;
  if (type.value !== 'ContractOperation' && !currencyId.value) return false;
  if (needsBank.value && !bankAccountId.value) return false;
  if (needsContract.value && !contractId.value) return false;
  return true;
});

function onShow() {
  loadCustomers().catch((e: unknown) => $q.notify({ type: 'negative', message: apiErrorMessage(e, 'Não foi possível carregar os clientes.') }));
}

watch(clientId, async (id) => {
  currencyId.value = null;
  bankAccountId.value = null;
  contractId.value = null;
  contracts.value = [];
  if (typeof id !== 'string') return;
  loadingAccounts.value = true;
  try {
    const [, list] = await Promise.all([loadAccounts(id), listContracts(id)]);
    if (clientId.value !== id) return;
    contracts.value = list;
    if (currencyOptions.value.length === 1) currencyId.value = currencyOptions.value[0]!.value;
    const primary = current.value?.bankAccounts.find((a) => a.isPrimary);
    if (primary) bankAccountId.value = primary.id;
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e, 'Não foi possível carregar as carteiras e contas do cliente.') });
  } finally {
    if (clientId.value === id) loadingAccounts.value = false;
  }
});

function reset() {
  type.value = 'Deposit';
  clientId.value = null;
  amount.value = '';
  sourceWallet.value = 'Free';
  transferDestination.value = 'Wallet';
  observation.value = '';
}

async function confirm() {
  if (!canSubmit.value || typeof clientId.value !== 'string') return;
  const client = clientId.value;
  const obs = String(observation.value ?? '').trim() || null;
  const currency = String(currencyId.value);
  submitting.value = true;
  try {
    let tx: CreatedTransaction;
    if (type.value === 'Deposit') {
      tx = await createDeposit({ clientId: client, currencyId: currency, sourceBankAccountId: String(bankAccountId.value), amount: value.value, observation: obs });
    } else if (type.value === 'Withdrawal') {
      tx = await createWithdrawal({ clientId: client, currencyId: currency, destinationBankAccountId: String(bankAccountId.value), amount: value.value, observation: obs });
    } else if (type.value === 'WalletTransfer') {
      const toContract = needsContract.value;
      tx = await createWalletTransfer({
        clientId: client,
        currencyId: currency,
        sourceWallet: sourceWallet.value === 'Applied' ? 'Applied' : 'Free',
        destinationType: toContract ? 'Contract' : 'Wallet',
        destinationContractId: toContract ? String(contractId.value) : null,
        amount: value.value,
        observation: obs,
      });
    } else {
      tx = await createContractOperation({ clientId: client, destinationContractId: String(contractId.value), amount: value.value, observation: obs });
    }
    $q.notify({ type: 'positive', message: `Solicitação ${tx.requestNumber} criada. Aguardando validação.` });
    emit('created', tx);
    void loadAccounts(client, true).catch(() => undefined);
    reset();
    open.value = false;
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e, 'Não foi possível criar a transação.') });
  } finally {
    submitting.value = false;
  }
}

</script>

<style scoped lang="scss">
.et {
  &__head {
    padding: 24px 24px 0;
    h2 { margin: 0; font-size: 18px; font-weight: 600; color: var(--slate-900); }
    p { margin: 6px 0 0; font-size: 14px; color: var(--slate-500); }
  }

  &__body { padding: 16px 24px; display: flex; flex-direction: column; gap: 20px; }
  &__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  &__prefix { font-size: 14px; color: var(--slate-500); }
  &__hint { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--slate-500); }
  &__warn { margin: -8px 0 0; display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--rose-600); }

  &__foot { padding: 0 24px 24px; display: flex; justify-content: flex-end; gap: 8px; }
}
</style>
