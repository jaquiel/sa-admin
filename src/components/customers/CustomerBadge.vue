<template>
  <span class="sa-badge" :class="cfg.cls">
    <component :is="cfg.icon" v-if="cfg.icon" :size="12" />
    {{ cfg.label }}
  </span>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-vue-next';

const props = defineProps<{
  kind: 'status' | 'classification' | 'compliance';
  value: string;
}>();

type Cfg = { label: string; cls: string; icon?: Component };

const cfg = computed<Cfg>(() => {
  if (props.kind === 'status') {
    const map: Record<string, Cfg> = {
      active: { label: 'Ativo', cls: 'sa-badge--emerald sa-badge--xs sa-badge--upper' },
      blocked: { label: 'Bloqueado', cls: 'sa-badge--red sa-badge--xs sa-badge--upper' },
      inactive: { label: 'Inativo', cls: 'sa-badge--slate sa-badge--xs sa-badge--upper' },
    };
    return map[props.value] ?? { label: props.value, cls: 'sa-badge--outline' };
  }

  if (props.kind === 'classification') {
    const map: Record<string, string> = {
      A: 'sa-badge--green',
      B: 'sa-badge--blue',
      C: 'sa-badge--orange',
    };
    return { label: props.value, cls: `${map[props.value] ?? 'sa-badge--outline'} badge-class` };
  }

  const map: Record<string, Cfg> = {
    ok: { label: 'OK', cls: 'sa-badge--green sa-badge--xs', icon: CheckCircle2 },
    pending: { label: 'Pendente', cls: 'sa-badge--amber sa-badge--xs', icon: AlertCircle },
    alert: { label: 'Alerta', cls: 'sa-badge--orange sa-badge--xs', icon: AlertCircle },
    blocked: { label: 'Bloqueado', cls: 'sa-badge--red sa-badge--xs', icon: XCircle },
  };
  return map[props.value] ?? { label: props.value, cls: 'sa-badge--outline' };
});
</script>

<style scoped>
.badge-class {
  font-weight: 700;
  padding: 2px 8px;
}
.sa-badge--xs:has(svg) {
  padding-left: 6px;
}
</style>
