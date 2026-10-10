<template>
  <ProfileCard title="Dados Bancários" :icon="Landmark" flush>
    <template #actions>
      <q-btn outline no-caps dense class="sa-btn sa-btn--outline ba__add" @click="openModal(null)">
        <Plus :size="14" class="q-mr-xs" /> Adicionar Conta
      </q-btn>
    </template>

    <div v-if="!rows.length" class="ba__state">
      <CardState
        :loading="loading"
        :error="error"
        :empty="true"
        empty-text="Nenhuma conta bancária cadastrada."
        @retry="profile.reload('bankAccounts')"
      />
    </div>
    <div v-else class="ba__scroll">
      <table class="sa-table">
        <thead>
          <tr class="ba__thead">
            <th class="ba__first">Banco</th>
            <th>Agência / Conta</th>
            <th>Tipo</th>
            <th>Titularidade</th>
            <th>CPF/CNPJ Titular</th>
            <th>Chave PIX</th>
            <th class="text-center">Principal</th>
            <th style="width: 100px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in rows" :key="a.id" class="ba__row">
            <td class="ba__first">
              <div class="ba__bank">
                <span class="ba__initial" :class="`ba__initial--${a.tone}`">{{ a.initial }}</span>
                {{ a.bankName }}
              </div>
            </td>
            <td>{{ a.agencyAccount }}</td>
            <td>{{ a.type }}</td>
            <td>{{ a.ownership }}</td>
            <td class="font-mono ba__mono">{{ a.document }}</td>
            <td class="font-mono ba__mono">{{ a.pix }}</td>
            <td class="text-center"><CheckCircle2 v-if="a.raw.isPrimary" :size="16" class="ba__main" /></td>
            <td class="ba__last">
              <div class="ba__actions">
                <q-btn flat round dense size="sm" class="ba__icon-btn" aria-label="Editar" @click="openModal(a.raw)">
                  <Edit2 :size="14" />
                </q-btn>
                <q-btn flat round dense size="sm" class="ba__icon-btn ba__icon-btn--del" aria-label="Arquivar" @click="remove(a.raw, a.bankName)">
                  <Trash2 :size="14" />
                </q-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <q-dialog v-model="modalOpen">
      <div class="ba-modal">
        <div class="ba-modal__head">
          <h3>{{ editing ? 'Editar Conta Bancária' : 'Adicionar Conta Bancária' }}</h3>
          <p>Insira os dados da conta abaixo. Clique em salvar quando terminar.</p>
        </div>

        <div class="ba-modal__body">
          <div class="ba-modal__row">
            <label class="ba-modal__label">Banco</label>
            <SaSelect v-model="form.bankId" :options="bankOptions" placeholder="Selecione o banco" />
          </div>
          <div class="ba-modal__row">
            <label class="ba-modal__label">Tipo</label>
            <SaSelect v-model="form.accountType" :options="typeOptions" placeholder="Tipo de conta" />
          </div>
          <div class="ba-modal__row">
            <label class="ba-modal__label">Agência</label>
            <SaInput v-model="form.branch" placeholder="0000" />
          </div>
          <div class="ba-modal__row">
            <label class="ba-modal__label">Conta / Dígito</label>
            <div class="ba-modal__pair">
              <SaInput v-model="form.accountNumber" placeholder="00000" />
              <SaInput v-model="form.accountDigit" placeholder="0" class="ba-modal__digit" />
            </div>
          </div>
          <div class="ba-modal__row">
            <label class="ba-modal__label">Titularidade</label>
            <SaSelect v-model="form.holderType" :options="holderOptions" />
          </div>
          <div class="ba-modal__row">
            <label class="ba-modal__label">Nome Titular</label>
            <SaInput v-model="form.holderName" />
          </div>
          <div class="ba-modal__row">
            <label class="ba-modal__label">CPF/CNPJ</label>
            <SaInput v-model="form.holderDocument" :placeholder="editing ? 'Em branco mantém o atual' : '000.000.000-00'" />
          </div>
          <div class="ba-modal__row">
            <label class="ba-modal__label">Chave PIX</label>
            <SaInput v-model="form.pixKey" :placeholder="editing ? 'Em branco mantém a atual' : 'Opcional'" />
          </div>
          <div class="ba-modal__row">
            <label class="ba-modal__label">Principal</label>
            <q-toggle v-model="form.isPrimary" color="dark" label="Definir como conta principal" class="ba-modal__toggle" />
          </div>
        </div>

        <div class="ba-modal__foot">
          <q-btn outline no-caps class="sa-btn sa-btn--outline" label="Cancelar" @click="modalOpen = false" />
          <q-btn
            unelevated
            no-caps
            class="sa-btn ba-modal__save"
            :loading="saving"
            :disable="!canSave"
            :label="editing ? 'Salvar Alterações' : 'Salvar Conta'"
            @click="save"
          />
        </div>
      </div>
    </q-dialog>
  </ProfileCard>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { CheckCircle2, Edit2, Landmark, Plus, Trash2 } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import CardState from './CardState.vue';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect, { type SaOption } from 'components/ui/SaSelect.vue';
import { useCustomerProfileStore } from 'stores/customer-profile';
import * as service from 'src/services/customer-profile.service';
import type { BankAccountRequest, CustomerBankAccount } from 'src/types/api';
import { accountTypeLabel, holderTypeLabel } from 'src/utils/labels';

const $q = useQuasar();
const profile = useCustomerProfileStore();
const loading = computed(() => profile.loading.bankAccounts);
const error = computed(() => profile.errors.bankAccounts);

const TONES = ['purple', 'orange', 'slate'] as const;
const bankById = computed(() => new Map((profile.data.banks ?? []).map((b) => [b.id, b])));

const rows = computed(() =>
  (profile.data.bankAccounts ?? [])
    .filter((a) => !/archiv/i.test(a.status))
    .map((a, i) => {
      const bankName = bankById.value.get(a.bankId)?.name ?? 'Banco';
      const account = [a.accountNumberMasked ?? a.accountNumber, a.accountDigit].filter(Boolean).join('-');
      return {
        id: a.id,
        raw: a,
        bankName,
        initial: bankName.substring(0, 2).toUpperCase(),
        tone: TONES[i % TONES.length]!,
        agencyAccount: `${a.branch} / ${account}`,
        type: accountTypeLabel(a.accountType),
        ownership: holderTypeLabel(a.holderType),
        document: a.holderDocumentMasked ?? a.holderDocument ?? '—',
        pix: a.pixKeyMasked ?? a.pixKey ?? '—',
      };
    }),
);

const bankOptions = computed<SaOption[]>(() =>
  (profile.data.banks ?? []).map((b) => ({ label: b.code ? `${b.code} - ${b.name}` : b.name, value: b.id })),
);
// Valores da API: "Checking" e "Individual" vêm da collection; os demais seguem o mesmo padrão.
const typeOptions: SaOption[] = ['Checking', 'Savings', 'Payment', 'Investment'].map((v) => ({ label: accountTypeLabel(v), value: v }));
const holderOptions: SaOption[] = ['Individual', 'Company', 'Joint'].map((v) => ({ label: holderTypeLabel(v), value: v }));

const modalOpen = ref(false);
const editing = ref<CustomerBankAccount | null>(null);
const saving = ref(false);

const blank = () => ({
  bankId: '',
  accountType: 'Checking',
  branch: '',
  accountNumber: '',
  accountDigit: '',
  holderType: 'Individual',
  holderName: profile.data.overview?.header.primaryName ?? '',
  holderDocument: '',
  pixKey: '',
  isPrimary: false,
});
const form = reactive(blank());

const canSave = computed(() => !!form.bankId && !!form.branch.trim() && !!form.accountNumber.trim());

function openModal(account: CustomerBankAccount | null) {
  editing.value = account;
  Object.assign(
    form,
    account
      ? {
          bankId: account.bankId,
          accountType: account.accountType,
          branch: account.branch,
          accountNumber: account.accountNumber ?? '',
          accountDigit: account.accountDigit ?? '',
          holderType: account.holderType,
          holderName: account.holderName ?? '',
          holderDocument: '',
          pixKey: '',
          isPrimary: account.isPrimary,
        }
      : blank(),
  );
  modalOpen.value = true;
}

const onlyDigits = (v: string) => v.replace(/\D/g, '');

function guessPixType(key: string) {
  if (key.includes('@')) return 'Email';
  const d = onlyDigits(key);
  if (/[a-z]/i.test(key)) return 'Random';
  if (key.startsWith('+')) return 'Phone';
  if (d.length === 11) return 'Cpf';
  if (d.length === 14) return 'Cnpj';
  return 'Random';
}

function toRequest(): BankAccountRequest {
  const prev = editing.value;
  const pix = form.pixKey.trim();
  return {
    bankId: form.bankId,
    branch: form.branch.trim(),
    accountNumber: form.accountNumber.trim(),
    accountDigit: form.accountDigit.trim() || null,
    accountType: form.accountType,
    holderType: form.holderType,
    holderName: form.holderName.trim() || null,
    // campos sensíveis em branco na edição = manter o valor atual
    holderDocument: form.holderDocument ? onlyDigits(form.holderDocument) : (prev?.holderDocument ?? null),
    pixKey: pix || (prev?.pixKey ?? null),
    pixKeyType: pix ? guessPixType(pix) : (prev?.pixKeyType ?? null),
    isPrimary: form.isPrimary,
    status: prev?.status ?? 'Active',
  };
}

async function save() {
  const id = profile.customerId;
  if (!id) return;
  saving.value = true;
  try {
    const body = toRequest();
    if (editing.value) await service.updateBankAccount(id, editing.value.id, body);
    else await service.createBankAccount(id, body);
    await profile.reload('bankAccounts');
    modalOpen.value = false;
    $q.notify({ type: 'positive', message: 'Conta bancária salva.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Não foi possível salvar a conta bancária.' });
  } finally {
    saving.value = false;
  }
}

function remove(a: CustomerBankAccount, bankName: string) {
  $q.dialog({
    title: 'Arquivar conta',
    message: `Arquivar a conta ${bankName} ${a.branch} / ${a.accountNumberMasked ?? ''}?`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Arquivar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    const id = profile.customerId;
    if (!id) return;
    try {
      await service.archiveBankAccount(id, a.id);
      await profile.reload('bankAccounts');
    } catch {
      $q.notify({ type: 'negative', message: 'Não foi possível arquivar a conta.' });
    }
  });
}
</script>

<style scoped lang="scss">
.ba {
  &__add {
    height: 32px;
    min-height: 32px;
    font-size: 12px;
    padding: 0 10px;
  }

  &__scroll {
    overflow-x: auto;
  }

  &__thead {
    background: var(--slate-50);
  }

  &__first {
    padding-left: 24px !important;
    font-weight: 500;
  }

  &__last {
    padding-right: 24px !important;
  }

  &__bank {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__initial {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;

    &--purple {
      background: var(--purple-100);
      color: var(--purple-700);
    }
    &--orange {
      background: var(--orange-100);
      color: var(--orange-700);
    }
    &--slate {
      background: var(--slate-100);
      color: var(--slate-700);
    }
  }

  &__mono {
    font-size: 12px;
    color: var(--slate-500);
  }

  &__main {
    color: var(--green-600);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &__row:hover &__actions,
  &__row:focus-within &__actions {
    opacity: 1;
  }

  &__icon-btn {
    color: var(--slate-500);
    &:hover {
      color: var(--blue-600);
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    &--del {
      color: var(--slate-400);
      &:hover {
        color: var(--red-500);
      }
    }
  }
}

.ba-modal {
  width: 500px;
  max-width: 95vw;
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      line-height: 1.4;
    }
    p {
      font-size: 14px;
      color: #717182;
      margin: 6px 0 0;
    }
  }

  &__body {
    display: grid;
    gap: 16px;
    padding: 16px 0;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 3fr;
    align-items: center;
    gap: 16px;
    .ba-modal__label {
      text-align: right;
      font-size: 12px;
      text-transform: uppercase;
      color: var(--slate-500);
      font-weight: 700;
    }
  }

  &__toggle {
    font-size: 14px;
    color: var(--slate-600);
  }

  &__foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  &__save {
    background: #030213;
    color: #fff;
  }
}

.ba__state {
  padding: 16px 24px;
}
.ba-modal__pair {
  display: flex;
  gap: 8px;
  min-width: 0;
}
.ba-modal__digit {
  max-width: 72px;
}
</style>
