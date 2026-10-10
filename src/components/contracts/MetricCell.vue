<template>
  <span v-if="type === 'currency'" class="mc__currency font-mono">{{ formatBRL(value.val) }}</span>

  <div v-else-if="type === 'percent_badge'" class="mc__stack">
    <span class="mc__badge">{{ value.label }}</span>
    <span class="mc__pct" :class="value.val >= 0 ? 'mc--up' : 'mc--down'">{{ value.val > 0 ? '+' : '' }}{{ value.val }}%</span>
  </div>

  <div v-else class="mc__stack mc__diff" :class="value.val >= 0 ? 'mc--up' : 'mc--down'">
    <span v-if="type === 'diff_badge' && value.label" class="mc__badge">{{ value.label }}</span>
    <span class="mc__diff-value">
      <ArrowUp v-if="value.val >= 0" :size="12" />
      <ArrowDown v-else :size="12" />
      {{ formatBRL(Math.abs(value.val)) }}
    </span>
    <span class="mc__diff-pct">({{ (value.pct ?? 0) > 0 ? '+' : '' }}{{ value.pct ?? 0 }}%)</span>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp } from 'lucide-vue-next';
import type { MetricCell, MetricType } from 'src/mocks/contracts';
import { formatBRL } from 'src/utils/format';

defineProps<{ type: MetricType; value: MetricCell }>();
</script>

<style scoped lang="scss">
.mc {
  &__currency { color: var(--slate-700); }
  &__stack { display: flex; flex-direction: column; align-items: center; }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--slate-100);
    color: var(--slate-500);
    border: 1px solid rgba(226, 232, 240, 0.6);
    margin-bottom: 6px;
    white-space: nowrap;
  }

  &__pct { font-weight: 500; }
  &__diff { font-size: 14px; }
  &__diff-value { font-weight: 700; display: flex; align-items: center; gap: 4px; }
  &__diff-pct { font-size: 12px; opacity: 0.8; }

  &--up { color: var(--emerald-600); }
  &--down { color: var(--rose-600); }
}
</style>
