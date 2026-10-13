<template>
  <div class="wp">
    <div class="sa-topbar wp__top">
      <div class="wp__container">
        <div class="wp__title-row">
          <q-btn flat round dense class="wp__back" aria-label="Voltar" @click="router.push({ name: 'transactions' })"><ArrowLeft :size="20" /></q-btn>
          <div>
            <h1>{{ title }}</h1>
            <p>{{ subtitle }}</p>
          </div>
        </div>
        <div class="wp__toolbar">
          <SaInput v-model="search" placeholder="Buscar por cliente ou ID..." class="wp__search" :maxlength="WALLET_SEARCH_MAX">
            <template #prepend><Search :size="16" /></template>
          </SaInput>
          <div class="wp__toolbar-right">
            <SaSelect v-model="sort" size="sm" width="200px" :options="sortOptions" />
            <div class="sa-seg">
              <button type="button" :class="{ active: viewMode === 'list' }" title="Lista" @click="viewMode = 'list'"><LayoutList :size="16" /></button>
              <button type="button" :class="{ active: viewMode === 'cards' }" title="Cards" @click="viewMode = 'cards'"><LayoutGrid :size="16" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="wp__container wp__content">
      <div v-if="!items.length" class="sa-card">
        <div class="sa-empty wp__empty">
          <template v-if="loading"><q-spinner size="32px" /><p>Carregando carteiras...</p></template>
          <template v-else-if="error"><AlertCircle :size="32" class="text-rose-500" /><p>{{ error }}</p></template>
          <template v-else><Search :size="32" /><p>Nenhuma carteira encontrada.</p></template>
        </div>
      </div>

      <div v-else-if="viewMode === 'cards'" class="wp__grid" :class="{ 'wp__busy': loading }">
        <article v-for="w in items" :key="w.id" class="sa-card wp__card">
          <header class="wp__card-head">
            <div class="wp__card-id">
              <span class="wp__avatar" :class="`wp__avatar--${accent}`"><Wallet :size="20" /></span>
              <div>
                <h3>{{ walletLabel(w) }}</h3>
                <span class="font-mono" :title="w.id">{{ shortId(w.id) }}</span>
              </div>
            </div>
            <span class="sa-badge" :class="type === 'Free' ? 'sa-badge--emerald' : 'sa-badge--indigo'">
              <Unlock v-if="type === 'Free'" :size="12" /> {{ WALLET_TYPE_LABEL[type] }}
            </span>
          </header>
          <div class="wp__card-body">
            <div class="wp__owner">
              <Building2 :size="16" class="text-slate-400" />
              <div>
                <span class="wp__owner-label">Cliente Proprietário</span>
                <div class="wp__owner-name">{{ w.client.name }}</div>
                <div class="wp__owner-id font-mono" :title="w.client.id">{{ shortId(w.client.id) }}</div>
              </div>
            </div>
            <div class="wp__balance">
              <span class="wp__balance-label">{{ balanceLabel }}</span>
              <span class="wp__balance-value">{{ money(w.balance, w) }}</span>
              <span v-if="Number(w.reserved)" class="wp__split">Disponível {{ money(w.available, w) }} · Reservado {{ money(w.reserved, w) }}</span>
              <span class="wp__updated">{{ lastUpdate(w) }}</span>
            </div>
            <RecentTxList :movements="w.recentMovements" :currency="w.currencyIsoCode" />
          </div>
          <footer class="wp__card-foot">
            <q-btn outline no-caps class="sa-btn sa-btn--outline wp__more" :class="`wp__more--${accent}`" @click="openWallet(w)">Ver movimentações completas</q-btn>
          </footer>
        </article>
      </div>

      <div v-else class="sa-card" :class="{ 'wp__busy': loading }">
        <div class="wp__table-wrap">
          <table class="sa-table wp__table">
            <thead>
              <tr>
                <th>Carteira / Cliente</th>
                <th>Tipo</th>
                <th>Última Atualização</th>
                <th class="text-right">{{ balanceLabel }}</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in items" :key="w.id">
                <td>
                  <div class="wp__row-name">{{ walletLabel(w) }}</div>
                  <div class="wp__row-id font-mono" :title="w.id">{{ shortId(w.id) }}</div>
                  <div class="wp__row-owner"><Building2 :size="12" class="text-slate-400" /> {{ w.client.name }}</div>
                </td>
                <td><span class="sa-badge" :class="type === 'Free' ? 'sa-badge--emerald' : 'sa-badge--indigo'">{{ WALLET_TYPE_LABEL[type] }}</span></td>
                <td class="wp__muted">{{ w.lastMovementAtUtc ? formatDateTime(w.lastMovementAtUtc) : 'Sem movimentações' }}</td>
                <td class="text-right">
                  <div class="wp__strong">{{ money(w.balance, w) }}</div>
                  <div v-if="Number(w.reserved)" class="wp__split">Disp. {{ money(w.available, w) }}</div>
                </td>
                <td class="text-right">
                  <q-btn flat no-caps dense class="sa-btn wp__details" :class="`wp__details--${accent}`" label="Ver Detalhes" @click="openWallet(w)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="totalItems > 0" class="wp__pager">
        <span>{{ rangeLabel }}</span>
        <div class="wp__pager-btns">
          <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" :disable="page <= 1 || loading" @click="page--">Anterior</q-btn>
          <q-btn outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" :disable="!hasNextPage || loading" @click="page++">Próxima</q-btn>
        </div>
      </div>
    </div>

    <WalletHistoryDialog v-if="selected" v-model="dialogOpen" :title="dialogTitle" :wallet="selected" :accent="accent" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { AlertCircle, ArrowLeft, Building2, LayoutGrid, LayoutList, Search, Unlock, Wallet } from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import RecentTxList from './RecentTxList.vue';
import WalletHistoryDialog from './WalletHistoryDialog.vue';
import { WALLET_SEARCH_MAX, listAdminWallets } from 'src/services/wallets.service';
import type { AdminWalletListItem, WalletListSort, WalletType } from 'src/types/api';
import { formatCurrencyIn, formatDateTime } from 'src/utils/format';
import { WALLET_TYPE_LABEL, shortId, walletErrorMessage, walletLabel } from 'src/utils/wallet-labels';

/** Listagem de carteiras de um tipo (GET /admin/wallets?type=...), compartilhada por Carteiras Livres e Aplicadas. */
const props = defineProps<{
  type: WalletType;
  title: string;
  subtitle: string;
  balanceLabel: string;
  dialogTitle: string;
  accent: 'indigo' | 'emerald';
}>();

const router = useRouter();
const PAGE_SIZE = 12;

const viewMode = ref<'list' | 'cards'>('cards');
const search = ref<string | number | null>('');
const sort = ref<WalletListSort>('ClientName');
const sortOptions: { label: string; value: WalletListSort }[] = [
  { label: 'Cliente (A–Z)', value: 'ClientName' },
  { label: 'Maior saldo', value: 'HighestBalance' },
  { label: 'Menor saldo', value: 'LowestBalance' },
  { label: 'Movimentação recente', value: 'RecentlyMoved' },
];

const items = ref<AdminWalletListItem[]>([]);
const page = ref(1);
const totalItems = ref(0);
const hasNextPage = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const selected = ref<AdminWalletListItem | null>(null);
const dialogOpen = ref(false);

const money = (v: number | string, w: AdminWalletListItem) => formatCurrencyIn(Number(v), w.currencyIsoCode);
const lastUpdate = (w: AdminWalletListItem) =>
  w.lastMovementAtUtc ? `Última atualização: ${formatDateTime(w.lastMovementAtUtc)}` : 'Sem movimentações';

const rangeLabel = computed(() => {
  const first = (page.value - 1) * PAGE_SIZE + 1;
  return `${first}–${first + items.value.length - 1} de ${totalItems.value}`;
});

let requestSeq = 0;
async function load() {
  const seq = ++requestSeq;
  loading.value = true;
  error.value = null;
  try {
    const result = await listAdminWallets({
      type: props.type,
      search: String(search.value ?? '').trim().slice(0, WALLET_SEARCH_MAX) || undefined,
      sort: sort.value,
      page: page.value,
      pageSize: PAGE_SIZE,
    });
    if (seq !== requestSeq) return;
    items.value = result.items;
    totalItems.value = result.totalItems;
    hasNextPage.value = result.hasNextPage;
  } catch (e) {
    if (seq !== requestSeq) return;
    items.value = [];
    totalItems.value = 0;
    hasNextPage.value = false;
    error.value = walletErrorMessage(e, 'Não foi possível carregar as carteiras.');
  } finally {
    if (seq === requestSeq) loading.value = false;
  }
}

// Busca e ordenação voltam para a página 1; a busca espera o usuário parar de digitar.
const reset = () => (page.value === 1 ? void load() : (page.value = 1));
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(reset, 350);
});
watch(sort, reset);
watch(page, () => void load());
onBeforeUnmount(() => clearTimeout(searchTimer));

void load();

function openWallet(w: AdminWalletListItem) {
  selected.value = w;
  dialogOpen.value = true;
}
</script>

<style lang="scss" src="./wallets-list.scss" scoped></style>
