<template>
  <div class="di">
    <div class="di__info">
      <span class="di__icon" :class="`di__icon--${tone}`"><component :is="icon" :size="16" /></span>
      <div class="di__text">
        <div class="di__name" :title="name">{{ name }}</div>
        <div class="di__date">{{ date ? `Enviado em ${date}` : 'Aguardando envio' }}</div>
      </div>
    </div>
    <q-btn v-if="status === 'Pendente'" outline no-caps dense class="sa-btn di__upload">
      <Upload :size="12" class="q-mr-xs" /> Upload
    </q-btn>
    <div v-else class="di__actions">
      <q-btn flat round dense size="sm" aria-label="Visualizar"><Eye :size="14" class="text-slate-500" /></q-btn>
      <q-btn flat round dense size="sm" aria-label="Baixar"><Download :size="14" class="text-slate-500" /></q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertCircle, AlertTriangle, CheckCircle2, Download, Eye, FileText, Upload } from 'lucide-vue-next';

export interface DocItemProps {
  name: string;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado' | string;
  date?: string;
}

const props = defineProps<DocItemProps>();

const tone = computed(() =>
  props.status === 'Aprovado' ? 'green' : props.status === 'Pendente' ? 'amber' : props.status === 'Rejeitado' ? 'red' : 'slate',
);
const icon = computed(() =>
  props.status === 'Aprovado'
    ? CheckCircle2
    : props.status === 'Pendente'
      ? AlertCircle
      : props.status === 'Rejeitado'
        ? AlertTriangle
        : FileText,
);
</script>

<style scoped lang="scss">
.di {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--slate-100);
  border-radius: 8px;
  background: #fff;
  margin-bottom: 8px;
  transition: border-color 0.15s;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: var(--blue-200);
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid;

    &--green {
      color: var(--green-600);
      background: var(--green-50);
      border-color: var(--green-100);
    }
    &--amber {
      color: var(--amber-600);
      background: var(--amber-50);
      border-color: #fef3c7;
    }
    &--red {
      color: var(--red-600);
      background: var(--red-50);
      border-color: #fee2e2;
    }
    &--slate {
      color: var(--slate-600);
      background: var(--slate-50);
      border-color: var(--slate-100);
    }
  }

  &__text {
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    font-size: 10px;
    color: var(--slate-500);
  }

  &__upload {
    height: 28px;
    min-height: 28px;
    font-size: 12px;
    padding: 0 8px;
    color: var(--blue-700);
    flex-shrink: 0;
    &:before {
      border-color: var(--blue-200);
    }
    &:hover {
      background: var(--blue-50);
    }
  }

  &__actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover &__actions,
  &:focus-within &__actions {
    opacity: 1;
  }
}
</style>
