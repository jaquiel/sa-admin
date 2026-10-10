<template>
  <div class="sdr" :class="`sdr--${status}`">
    <div class="sdr__info">
      <span class="sdr__icon"><component :is="cfg.icon" :size="16" /></span>
      <div>
        <div class="sdr__name">{{ name }}</div>
        <div class="sdr__status">
          <span class="sdr__status-text">{{ cfg.text }}</span>
          <span v-if="date" class="sdr__date">• {{ date }}</span>
        </div>
      </div>
    </div>
    <q-btn outline no-caps dense class="sa-btn sa-btn--outline sdr__btn">
      <component :is="cfg.actionIcon" :size="14" class="q-mr-xs" /> {{ cfg.actionLabel }}
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertCircle, AlertTriangle, CheckCircle2, Eye, RefreshCw, Upload } from 'lucide-vue-next';

export type DocStatus = 'missing' | 'approved' | 'pending' | 'rejected';

const props = defineProps<{ name: string; status: DocStatus; date?: string }>();

const CONFIG = {
  approved: { icon: CheckCircle2, text: 'Enviado · Aprovado', actionLabel: 'Visualizar', actionIcon: Eye },
  pending: { icon: AlertCircle, text: 'Enviado · Pendente', actionLabel: 'Visualizar', actionIcon: Eye },
  rejected: { icon: AlertTriangle, text: 'Enviado · Rejeitado', actionLabel: 'Substituir', actionIcon: RefreshCw },
  missing: { icon: Upload, text: 'Aguardando envio', actionLabel: 'Upload', actionIcon: Upload },
} as const;

const cfg = computed(() => CONFIG[props.status]);
</script>

<style scoped lang="scss">
.sdr {
  --c-border: var(--green-200);
  --c-border-h: #86efac;
  --c-icon-bg: var(--green-50);
  --c-icon: var(--green-600);
  --c-text: var(--green-700);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: #fff;
  transition: all 0.15s;

  &:hover {
    border-color: var(--c-border-h);
  }

  &--pending {
    --c-border: var(--amber-200);
    --c-border-h: var(--amber-300);
    --c-icon-bg: var(--amber-50);
    --c-icon: var(--amber-600);
    --c-text: var(--amber-700);
  }

  &--rejected {
    --c-border: var(--red-200);
    --c-border-h: #fca5a5;
    --c-icon-bg: var(--red-50);
    --c-icon: var(--red-600);
    --c-text: var(--red-700);
  }

  &--missing {
    --c-border: var(--slate-300);
    --c-border-h: var(--slate-400);
    --c-icon-bg: var(--slate-200);
    --c-icon: var(--slate-400);
    --c-text: var(--slate-500);
    background: var(--slate-50);
    border-style: dashed;
    &:hover {
      background: var(--slate-100);
    }
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--c-icon-bg);
    color: var(--c-icon);
    border: 1px solid var(--c-border);
    flex-shrink: 0;
  }

  &--missing &__icon {
    border-color: var(--slate-300);
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--slate-900);
  }

  &__status {
    font-size: 11px;
    font-weight: 500;
    color: var(--c-text);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__status-text {
    white-space: nowrap;
  }

  &__status {
    flex-wrap: wrap;
    row-gap: 0;
  }

  &__date {
    white-space: nowrap;
    color: var(--slate-400);
    font-weight: 400;
  }

  &__btn {
    height: 32px;
    min-height: 32px;
    font-size: 12px;
    padding: 0 12px;
    flex-shrink: 0;
  }
}
</style>
