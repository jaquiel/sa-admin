<template>
  <component :is="cfg.icon" :size="16" :style="{ color: cfg.color }" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Activity, ArrowDownLeft, ArrowRightLeft, ArrowUpRight, TrendingUp } from 'lucide-vue-next';
import type { WalletTxType } from 'src/mocks/transactions';

const props = withDefaults(defineProps<{ type: WalletTxType; profitIcon?: 'trend' | 'activity' }>(), { profitIcon: 'trend' });

const cfg = computed(() => {
  switch (props.type) {
    case 'Deposit': return { icon: ArrowDownLeft, color: 'var(--emerald-600)' };
    case 'Profit': return { icon: props.profitIcon === 'trend' ? TrendingUp : Activity, color: 'var(--emerald-600)' };
    case 'Withdraw': return { icon: ArrowUpRight, color: 'var(--rose-600)' };
    case 'Fee': return { icon: Activity, color: 'var(--amber-600)' };
    default: return { icon: ArrowRightLeft, color: 'var(--blue-600)' };
  }
});
</script>
