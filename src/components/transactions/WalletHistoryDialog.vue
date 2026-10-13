<template>
  <q-dialog v-model="open">
    <div class="sa-dialog sa-dialog--lg wh">
      <div class="wh__head">
        <div>
          <h2>{{ title }}</h2>
          <p>
            {{ walletLabel(wallet) }} · {{ wallet.client.name }}
            <span class="font-mono wh__id" :title="wallet.id">({{ shortId(wallet.id) }})</span>
          </p>
        </div>
        <div class="wh__balance">
          <div class="wh__balance-value">{{ formatCurrencyIn(Number(wallet.balance), wallet.currencyIsoCode) }}</div>
          <div class="wh__balance-label">Saldo Atual</div>
          <div v-if="Number(wallet.reserved)" class="wh__balance-sub">
            Disponível {{ formatCurrencyIn(Number(wallet.available), wallet.currencyIsoCode) }} · Reservado {{ formatCurrencyIn(Number(wallet.reserved), wallet.currencyIsoCode) }}
          </div>
        </div>
        <q-btn flat round dense class="wh__close" aria-label="Fechar" @click="open = false"><X :size="18" /></q-btn>
      </div>

      <div class="wh__body">
        <div class="wh__toolbar">
          <h4 class="wh__title"><Activity :size="16" :class="accent === 'emerald' ? 'text-emerald-600' : 'text-indigo-600'" /> Extrato da Carteira</h4>
          <div class="wh__period">
            <SaInput v-model="dateFrom" type="date" class="wh__date-input" aria-label="Data inicial" />
            <span>até</span>
            <SaInput v-model="dateTo" type="date" class="wh__date-input" aria-label="Data final" />
            <q-btn v-if="dateFrom || dateTo" flat dense no-caps class="sa-btn sa-btn--sm" label="Limpar" @click="dateFrom = ''; dateTo = ''" />
          </div>
        </div>

        <div class="wh__table-wrap">
          <table class="sa-table wh__table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Solicitação</th>
                <th>Tipo</th>
                <th class="text-right">Valor</th>
                <th class="text-right">Saldo Após</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading && !items.length">
                <td colspan="5" class="wh__empty"><q-spinner size="20px" /> Carregando extrato...</td>
              </tr>
              <tr v-else-if="error">
                <td colspan="5" class="wh__empty wh__empty--error">{{ error }}</td>
              </tr>
              <tr v-else-if="!items.length">
                <td colspan="5" class="wh__empty">{{ dateFrom || dateTo ? 'Nenhuma movimentação no período.' : 'Sem movimentações.' }}</td>
              </tr>
              <template v-else>
                <tr v-for="m in items" :key="m.transactionId">
                  <td class="wh__date font-mono">{{ formatDateTime(m.occurredAtUtc) }}</td>
                  <td><span class="wh__hash"><Hash :size="12" class="text-slate-400" /> <span class="font-mono">{{ m.requestNumber }}</span></span></td>
                  <td>
                    <span class="wh__type">
                      <component :is="movementMeta(m, wallet.currencyIsoCode).icon" :size="16" :class="movementMeta(m, wallet.currencyIsoCode).cls" />
                      {{ movementMeta(m, wallet.currencyIsoCode).label }}
                    </span>
                  </td>
                  <td class="text-right wh__value" :class="movementMeta(m, wallet.currencyIsoCode).cls">{{ movementMeta(m, wallet.currencyIsoCode).signed }}</td>
                  <td class="text-right wh__small font-mono">{{ formatCurrencyIn(Number(m.balanceAfter), wallet.currencyIsoCode) }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-if="totalItems > 0" class="wh__pager">
          <span>{{ rangeLabel }}</span>
          <div class="wh__pager-btns">
            <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" :disable="page <= 1 || loading" @click="page--">Anterior</q-btn>
            <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" :disable="!hasNextPage || loading" @click="page++">Próxima</q-btn>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Activity, Hash, X } from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import { getWalletStatement } from 'src/services/wallets.service';
import type { AdminWalletListItem, AdminWalletMovement } from 'src/types/api';
import { formatCurrencyIn, formatDateTime } from 'src/utils/format';
import { movementMeta, shortId, walletErrorMessage, walletLabel } from 'src/utils/wallet-labels';

/** O extrato não traz cliente, moeda nem saldo: o cabeçalho reaproveita o card de onde o usuário clicou. */
const props = defineProps<{
  title: string;
  wallet: AdminWalletListItem;
  accent?: 'indigo' | 'emerald';
}>();
const open = defineModel<boolean>({ default: false });

const PAGE_SIZE = 20;

const items = ref<AdminWalletMovement[]>([]);
const page = ref(1);
const totalItems = ref(0);
const hasNextPage = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const dateFrom = ref<string | number | null>('');
const dateTo = ref<string | number | null>('');

const rangeLabel = computed(() => {
  const first = (page.value - 1) * PAGE_SIZE + 1;
  return `${first}–${first + items.value.length - 1} de ${totalItems.value}`;
});

let seq = 0;
async function load() {
  const current = ++seq;
  loading.value = true;
  error.value = null;
  try {
    const result = await getWalletStatement(props.wallet.id, {
      page: page.value,
      pageSize: PAGE_SIZE,
      dateFrom: String(dateFrom.value ?? '') || undefined,
      dateTo: String(dateTo.value ?? '') || undefined,
    });
    if (current !== seq) return;
    items.value = result.items;
    totalItems.value = result.totalItems;
    hasNextPage.value = result.hasNextPage;
  } catch (e) {
    if (current !== seq) return;
    items.value = [];
    totalItems.value = 0;
    hasNextPage.value = false;
    error.value = walletErrorMessage(e, 'Não foi possível carregar o extrato.');
  } finally {
    if (current === seq) loading.value = false;
  }
}

const reset = () => (page.value === 1 ? void load() : (page.value = 1));

// Ao abrir (ou trocar de carteira) o extrato recomeça sem filtro de período.
watch(
  () => [open.value, props.wallet.id] as const,
  ([isOpen]) => {
    if (!isOpen) return;
    items.value = [];
    // Limpar as datas já dispara o recarregamento pelo watch abaixo.
    if (dateFrom.value || dateTo.value) {
      dateFrom.value = '';
      dateTo.value = '';
    } else reset();
  },
  { immediate: true },
);
watch([dateFrom, dateTo], () => open.value && reset());
watch(page, () => open.value && void load());
</script>

<style scoped lang="scss">
.wh {
  &__head {
    position: relative;
    padding: 24px 56px 8px 24px;
    border-bottom: 1px solid var(--slate-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--slate-900); }
    p { margin: 4px 0 8px; font-size: 14px; color: var(--slate-500); }
  }

  &__id { font-size: 12px; color: var(--slate-400); }
  &__close { position: absolute; top: 12px; right: 12px; color: var(--slate-400); }
  &__balance { text-align: right; }
  &__balance-value { font-size: 24px; font-weight: 700; color: var(--slate-900); }
  &__balance-label { font-size: 12px; color: var(--slate-500); }
  &__balance-sub { margin-top: 2px; font-size: 11px; color: var(--slate-400); }

  &__body { flex: 1; overflow: auto; padding: 24px; }
  &__toolbar { margin-bottom: 16px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
  &__title { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
  &__period { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--slate-500); }
  &__date-input { width: 150px; }

  &__table-wrap { border: 1px solid var(--slate-200); border-radius: 8px; overflow-x: auto; }
  &__table thead tr { background: var(--slate-50); }
  &__table th { text-transform: none; font-size: 14px; font-weight: 500; color: var(--slate-500); }

  &__empty { height: 96px; text-align: center; color: var(--slate-500) !important; &--error { color: var(--rose-600) !important; } }
  &__date { font-size: 12px; color: var(--slate-500) !important; }
  &__hash { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--indigo-600); }
  &__type { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--slate-700); }
  &__small { font-size: 12px; color: var(--slate-600) !important; }
  &__value { font-weight: 500; }

  &__pager { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; color: var(--slate-500); }
  &__pager-btns { display: flex; gap: 8px; }
}
</style>
