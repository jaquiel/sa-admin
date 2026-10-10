<template>
  <div class="wp">
    <div class="sa-topbar wp__top">
      <div class="wp__container">
        <div class="wp__title-row">
          <q-btn flat round dense class="wp__back" aria-label="Voltar" @click="router.push({ name: 'transactions' })"><ArrowLeft :size="20" /></q-btn>
          <div>
            <h1>Carteiras Aplicadas</h1>
            <p>Visão detalhada das carteiras aplicadas no sistema</p>
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
              <span class="wp__avatar wp__avatar--indigo"><Wallet :size="20" /></span>
              <div>
                <h3>{{ w.clientName }}</h3>
                <span class="font-mono">{{ w.id }}</span>
              </div>
            </div>
            <span class="sa-badge" :class="w.status === 'Active' ? 'sa-badge--emerald-soft' : 'sa-badge--slate'">{{ w.status === 'Active' ? 'Ativa' : 'Inativa' }}</span>
          </header>
          <div class="wp__card-body">
            <div class="wp__balance">
              <span class="wp__balance-label">Valor Consolidado</span>
              <div class="wp__balance-row">
                <span class="wp__balance-value">{{ formatCurrencyIn(w.balance, w.currency) }}</span>
                <span class="wp__perf">{{ w.performance }}</span>
              </div>
            </div>
            <RecentTxList :transactions="w.recentTransactions" />
          </div>
          <footer class="wp__card-foot">
            <q-btn outline no-caps class="sa-btn sa-btn--outline wp__more" @click="openWallet(w)">Ver movimentações completas</q-btn>
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
                <th>Performance</th>
                <th class="text-right">Saldo Consolidado</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in filtered" :key="w.id">
                <td>
                  <div class="wp__row-name">{{ w.clientName }}</div>
                  <div class="wp__row-id font-mono">{{ w.id }}</div>
                </td>
                <td><span class="sa-badge" :class="w.status === 'Active' ? 'sa-badge--emerald-soft' : 'sa-badge--slate'">{{ w.status === 'Active' ? 'Ativa' : 'Inativa' }}</span></td>
                <td class="wp__muted">{{ new Date(w.lastUpdate).toLocaleString('pt-BR') }}</td>
                <td><span class="wp__perf wp__perf--strong">{{ w.performance }}</span></td>
                <td class="text-right wp__strong">{{ formatCurrencyIn(w.balance, w.currency) }}</td>
                <td class="text-right"><q-btn flat no-caps dense class="sa-btn wp__details" label="Ver Detalhes" @click="openWallet(w)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <WalletHistoryDialog
      v-if="selected"
      v-model="dialogOpen"
      title="Detalhes da Carteira"
      :subtitle="`${selected.clientName} (${selected.id})`"
      :balance="selected.balance"
      :currency="selected.currency"
      balance-label="Saldo Atual"
      :transactions="selected.recentTransactions"
      accent="indigo"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, LayoutGrid, LayoutList, Search, Wallet } from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import RecentTxList from 'components/transactions/RecentTxList.vue';
import WalletHistoryDialog from 'components/transactions/WalletHistoryDialog.vue';
import { appliedWalletsMock, type AppliedWallet } from 'src/mocks/transactions';
import { formatCurrencyIn } from 'src/utils/format';

const router = useRouter();
const viewMode = ref<'list' | 'cards'>('cards');
const search = ref<string | number | null>('');
const selected = ref<AppliedWallet | null>(null);
const dialogOpen = ref(false);

const filtered = computed(() => {
  const q = String(search.value ?? '').toLowerCase();
  return appliedWalletsMock.filter((w) => w.clientName.toLowerCase().includes(q) || w.id.toLowerCase().includes(q));
});

function openWallet(w: AppliedWallet) {
  selected.value = w;
  dialogOpen.value = true;
}
</script>

<style lang="scss" src="./wallets-page.scss" scoped></style>
