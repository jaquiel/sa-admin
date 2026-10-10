<template>
  <q-dialog v-model="open">
    <div class="sa-dialog sa-dialog--lg wh">
      <div class="wh__head">
        <div>
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>
        <div class="wh__balance">
          <div class="wh__balance-value">{{ formatCurrencyIn(balance, currency) }}</div>
          <div class="wh__balance-label">{{ balanceLabel }}</div>
        </div>
        <q-btn flat round dense class="wh__close" aria-label="Fechar" @click="open = false"><X :size="18" /></q-btn>
      </div>

      <div class="wh__body">
        <h4 class="wh__title"><Activity :size="16" :class="accent === 'emerald' ? 'text-emerald-600' : 'text-indigo-600'" /> Histórico Completo de Transações</h4>
        <div class="wh__table-wrap">
          <table class="sa-table wh__table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Hash</th>
                <th>Tipo</th>
                <th>Origem</th>
                <th>Destino</th>
                <th class="text-right">Valor</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!transactions.length">
                <td colspan="7" class="wh__empty">Nenhum registro encontrado.</td>
              </tr>
              <tr v-for="t in transactions" :key="t.id">
                <td class="wh__date font-mono">
                  <div>{{ new Date(t.date).toLocaleString('pt-BR') }}</div>
                  <div class="wh__daily">Saldo: <strong>{{ formatCurrencyIn(t.dailyBalance, t.currency) }}</strong></div>
                </td>
                <td><span class="wh__hash"><Hash :size="12" class="text-slate-400" /> <span class="font-mono">{{ t.hash }}</span></span></td>
                <td>
                  <span class="wh__type"><WalletTxIcon :type="t.type" /> {{ TX_LABEL[t.type] }}</span>
                </td>
                <td class="wh__small">{{ t.origin || '-' }}</td>
                <td class="wh__small">{{ t.destination || '-' }}</td>
                <td class="text-right wh__value" :class="t.type === 'Withdraw' ? 'text-rose-600' : 'text-emerald-600'">
                  {{ t.type === 'Withdraw' ? '-' : '+' }}{{ formatCurrencyIn(t.value, t.currency) }}
                </td>
                <td class="text-center"><span class="sa-badge" :class="TX_STATUS[t.status].cls">{{ TX_STATUS[t.status].label }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { Activity, Hash, X } from 'lucide-vue-next';
import WalletTxIcon from './WalletTxIcon.vue';
import type { WalletTransaction, WalletTxType } from 'src/mocks/transactions';
import { formatCurrencyIn } from 'src/utils/format';

defineProps<{
  title: string;
  subtitle: string;
  balance: number;
  currency: string;
  balanceLabel: string;
  transactions: WalletTransaction[];
  accent?: 'indigo' | 'emerald';
}>();
const open = defineModel<boolean>({ default: false });

const TX_LABEL: Record<WalletTxType, string> = {
  Profit: 'Rendimento',
  Fee: 'Taxa',
  Deposit: 'Depósito',
  Withdraw: 'Saque',
  Transfer: 'Transferência',
};

const TX_STATUS: Record<WalletTransaction['status'], { label: string; cls: string }> = {
  Completed: { label: 'Concluída', cls: 'sa-badge--emerald-soft' },
  Processing: { label: 'Processando', cls: 'sa-badge--blue-soft' },
  Failed: { label: 'Falha', cls: 'sa-badge--rose-soft' },
};
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

  &__close { position: absolute; top: 12px; right: 12px; color: var(--slate-400); }
  &__balance { text-align: right; }
  &__balance-value { font-size: 24px; font-weight: 700; color: var(--slate-900); }
  &__balance-label { font-size: 12px; color: var(--slate-500); }

  &__body { flex: 1; overflow: auto; padding: 24px; }
  &__title { margin: 0 0 16px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }

  &__table-wrap { border: 1px solid var(--slate-200); border-radius: 8px; overflow-x: auto; }
  &__table thead tr { background: var(--slate-50); }
  &__table th { text-transform: none; font-size: 14px; font-weight: 500; color: var(--slate-500); }

  &__empty { height: 96px; text-align: center; color: var(--slate-500) !important; }
  &__date { font-size: 12px; color: var(--slate-500) !important; }
  &__daily { margin-top: 2px; color: var(--slate-400); strong { font-weight: 500; } }
  &__hash { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--indigo-600); }
  &__type { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--slate-700); }
  &__small { font-size: 12px; color: var(--slate-600) !important; }
  &__value { font-weight: 500; }
}
</style>
