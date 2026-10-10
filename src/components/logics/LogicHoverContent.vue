<template>
  <div class="lh">
    <div>
      <h4>{{ logic.name }}</h4>
      <p class="lh__desc">{{ logic.description }}</p>
    </div>

    <div class="lh__trend">
      <div class="lh__row">
        <span class="lh__muted">Tendência Recente</span>
        <strong :class="positive ? 'text-emerald-600' : 'text-rose-600'">{{ positive ? '+' : '' }}{{ logic.performanceYTD }}%</strong>
      </div>
      <div class="lh__bars">
        <i v-for="(p, i) in trendPoints" :key="i" :class="positive ? 'lh__bar--up' : 'lh__bar--down'" :style="{ height: `${p}%` }" />
      </div>
    </div>

    <hr class="sa-separator" />

    <div class="lh__info">
      <div class="lh__row"><span class="lh__muted">Moeda Firmada</span><span class="font-mono lh__strong">{{ logic.currency }}</span></div>
      <div class="lh__row"><span class="lh__muted">Reset Parâmetros</span><span class="font-mono lh__strong">{{ logic.lastOscillationReset }}</span></div>
    </div>

    <div class="lh__contracts">
      <span class="lh__contracts-title"><LinkIcon :size="12" /> Contratos ({{ logic.contracts.length }})</span>
      <div class="lh__contracts-list">
        <div v-for="c in logic.contracts" :key="c.id" class="lh__contract">{{ c.name }}</div>
        <p v-if="!logic.contracts.length" class="lh__none">Nenhum contrato vinculado.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Link as LinkIcon } from 'lucide-vue-next';
import type { LogicSummary } from 'src/mocks/logics';

const props = defineProps<{ logic: LogicSummary }>();
const positive = computed(() => props.logic.performanceYTD >= 0);
const trendPoints = [40, 55, 45, 60, 75, 65, 80, 70, 85, 90];
</script>

<style scoped lang="scss">
.lh {
  width: 288px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 12px;

  h4 { margin: 0; font-size: 14px; font-weight: 600; color: var(--slate-900); }
  &__desc { margin: 4px 0 0; color: var(--slate-500); line-height: 1.35; }
  &__trend { display: flex; flex-direction: column; gap: 6px; }
  &__row { display: flex; align-items: center; justify-content: space-between; }
  &__muted { color: var(--slate-500); }
  &__strong { font-weight: 500; color: var(--slate-700); }

  &__bars {
    height: 40px;
    display: flex;
    align-items: flex-end;
    gap: 4px;
    border-bottom: 1px solid var(--slate-100);
    padding-bottom: 4px;
    i { flex: 1; border-radius: 2px 2px 0 0; opacity: 0.8; }
  }
  &__bar--up { background: var(--emerald-400); }
  &__bar--down { background: var(--rose-400); }

  &__info { display: flex; flex-direction: column; gap: 8px; }
  &__contracts { display: flex; flex-direction: column; gap: 8px; }
  &__contracts-title { display: flex; align-items: center; gap: 6px; font-weight: 600; color: var(--slate-900); }
  &__contracts-list { max-height: 100px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }

  &__contract {
    font-size: 11px;
    background: var(--slate-50);
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid var(--slate-100);
    color: var(--slate-600);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__none { margin: 0; color: var(--slate-400); font-style: italic; }
}
</style>
