<template>
  <span class="sa-badge" :class="status.cls">{{ status.label }}</span>
  <span v-if="logic.performanceYTD > 10" class="sa-badge sa-badge--emerald lb"><Zap :size="12" class="lb__fill lb__fill--emerald" /> Alta Performance</span>
  <span v-if="isStable" class="sa-badge sa-badge--blue lb"><ShieldCheck :size="12" class="lb__fill lb__fill--blue" /> Estabilidade</span>
  <span v-if="logic.contracts.length >= 3" class="sa-badge sa-badge--indigo lb"><Award :size="12" class="lb__fill lb__fill--indigo" /> Alta Adesão</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Award, ShieldCheck, Zap } from 'lucide-vue-next';
import type { LogicStatus, LogicSummary } from 'src/mocks/logics';

const props = defineProps<{ logic: LogicSummary }>();

const STATUS: Record<LogicStatus, { label: string; cls: string }> = {
  Active: { label: 'Ativa', cls: 'sa-badge--emerald-soft' },
  Inactive: { label: 'Inativa', cls: 'sa-badge--slate-soft' },
  Analysis: { label: 'Em Análise', cls: 'sa-badge--amber-soft' },
  Paused: { label: 'Pausada', cls: 'sa-badge--orange-soft' },
};

const status = computed(() => STATUS[props.logic.status]);
const isStable = computed(() => props.logic.performanceYTD > -2 && props.logic.performanceYTD < 5 && props.logic.performanceAllTime > 5);
</script>

<style scoped lang="scss">
.lb { padding-left: 4px; }
.lb__fill--emerald { fill: var(--emerald-200); }
.lb__fill--blue { fill: var(--blue-200); }
.lb__fill--indigo { fill: var(--indigo-200); }
</style>
