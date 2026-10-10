<template>
  <div class="wp">
    <div class="sa-topbar wp__top">
      <div class="wp__container">
        <div class="wp__title-row">
          <q-btn flat round dense class="wp__back" aria-label="Voltar" @click="router.push({ name: 'transactions' })"><ArrowLeft :size="20" /></q-btn>
          <div>
            <h1>Carteiras Livres</h1>
            <p>Visão completa das carteiras com saldo livre disponível</p>
          </div>
        </div>
        <div class="wp__toolbar">
          <SaInput v-model="search" placeholder="Buscar por cliente ou ID..." class="wp__search">
            <template #prepend><Search :size="16" /></template>
          </SaInput>
          <div class="sa-seg">
            <button type="button" :class="{ active: viewMode === 'list' }" title="Lista" @click="viewMode = 'list'"><LayoutList :size="16" /></button>
            <button type="button" :class="{ active: viewMode === 'cards' }" title="Cards" @click="viewMode = 'cards'"><LayoutGrid :size="16" /></button>
          </div>
        </div>
      </div>
    </div>

    <div class="wp__container wp__content">
      <div v-if="viewMode === 'cards'" class="wp__grid">
        <article v-for="w in filtered" :key="w.id" class="sa-card wp__card">
          <header class="wp__card-head">
            <div class="wp__card-id">
              <span class="wp__avatar wp__avatar--emerald"><Wallet :size="20" /></span>
              <div>
                <h3>{{ w.name }}</h3>
                <span class="font-mono">{{ w.id }}</span>
              </div>
            </div>
            <span class="sa-badge sa-badge--emerald"><Unlock :size="12" /> Livre</span>
          </header>
          <div class="wp__card-body">
            <div class="wp__owner">
              <Building2 :size="16" class="text-slate-400" />
              <div>
                <span class="wp__owner-label">Cliente Proprietário</span>
                <div class="wp__owner-name">{{ w.clientName }}</div>
                <div class="wp__owner-id font-mono">{{ w.clientId }}</div>
              </div>
            </div>
            <div class="wp__balance">
              <span class="wp__balance-label">Saldo Atual</span>
              <span class="wp__balance-value">{{ formatCurrencyIn(w.balance, w.currency) }}</span>
              <span class="wp__updated">Última atualização: {{ formatDate(w.lastUpdate) }}</span>
            </div>
            <RecentTxList :transactions="w.recentTransactions" />
          </div>
          <footer class="wp__card-foot">
            <q-btn outline no-caps class="sa-btn sa-btn--outline wp__more wp__more--emerald" @click="openWallet(w)">Ver movimentações completas</q-btn>
          </footer>
        </article>
      </div>

      <div v-else class="sa-card">
        <div class="wp__table-wrap">
          <table class="sa-table wp__table">
            <thead>
              <tr>
                <th>Carteira / Cliente</th>
                <th>Status</th>
                <th>Última Atualização</th>
                <th class="text-right">Saldo Atual</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in filtered" :key="w.id">
                <td>
                  <div class="wp__row-name">{{ w.name }}</div>
                  <div class="wp__row-id font-mono">{{ w.id }}</div>
                  <div class="wp__row-owner">
                    <Building2 :size="12" class="text-slate-400" /> {{ w.clientName }}
                    <span class="font-mono text-slate-400">({{ w.clientId }})</span>
                  </div>
                </td>
                <td><span class="sa-badge sa-badge--emerald">Livre</span></td>
                <td class="wp__muted">{{ new Date(w.lastUpdate).toLocaleString('pt-BR') }}</td>
                <td class="text-right wp__strong">{{ formatCurrencyIn(w.balance, w.currency) }}</td>
                <td class="text-right"><q-btn flat no-caps dense class="sa-btn wp__details wp__details--emerald" label="Ver Detalhes" @click="openWallet(w)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <WalletHistoryDialog
      v-if="selected"
      v-model="dialogOpen"
      title="Detalhes da Carteira Livre"
      :subtitle="`${selected.name} - ${selected.clientName} (${selected.clientId})`"
      :balance="selected.balance"
      :currency="selected.currency"
      balance-label="Saldo Disponível"
      :transactions="selected.recentTransactions"
      accent="emerald"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Building2, LayoutGrid, LayoutList, Search, Unlock, Wallet } from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import RecentTxList from 'components/transactions/RecentTxList.vue';
import WalletHistoryDialog from 'components/transactions/WalletHistoryDialog.vue';
import { freeWalletsMock, type FreeWallet } from 'src/mocks/transactions';
import { formatCurrencyIn, formatDate } from 'src/utils/format';

const router = useRouter();
const viewMode = ref<'list' | 'cards'>('cards');
const search = ref<string | number | null>('');
const selected = ref<FreeWallet | null>(null);
const dialogOpen = ref(false);

const filtered = computed(() => {
  const q = String(search.value ?? '').toLowerCase();
  return freeWalletsMock.filter(
    (w) => w.clientName.toLowerCase().includes(q) || w.id.toLowerCase().includes(q) || w.name.toLowerCase().includes(q),
  );
});

function openWallet(w: FreeWallet) {
  selected.value = w;
  dialogOpen.value = true;
}
</script>

<style lang="scss" src="./wallets-page.scss" scoped></style>
