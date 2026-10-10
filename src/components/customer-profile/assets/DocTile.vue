<template>
  <button v-if="state === 'empty'" type="button" class="dt dt--empty">
    <span class="dt__plus"><Plus :size="20" /></span>
    <span>
      <span class="dt__empty-name">{{ name }}</span>
      <span class="dt__empty-hint">{{ hint }}</span>
    </span>
  </button>

  <div v-else class="dt" :class="`dt--${state}`">
    <div class="dt__top">
      <span class="dt__icon"><component :is="icon" :size="20" /></span>
      <span class="sa-badge dt__badge">
        <component :is="state === 'pending' ? AlertCircle : CheckCircle2" :size="12" /> {{ badge }}
      </span>
    </div>
    <div class="dt__text">
      <p class="dt__name">{{ name }}</p>
      <p class="dt__file" :title="hint">{{ hint }}</p>
    </div>
    <div class="dt__actions">
      <template v-if="state === 'pending'">
        <q-btn outline no-caps dense class="sa-btn dt__send"><Upload :size="14" class="q-mr-xs" /> Enviar</q-btn>
      </template>
      <template v-else>
        <q-btn outline no-caps dense class="sa-btn sa-btn--outline dt__view"><Eye :size="14" class="q-mr-xs" /> Ver</q-btn>
        <q-btn flat round dense class="dt__del" aria-label="Remover"><Trash2 :size="14" /></q-btn>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { AlertCircle, CheckCircle2, Eye, FileText, Plus, Trash2, Upload } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    state: 'sent' | 'pending' | 'empty';
    name: string;
    /** nome do arquivo (sent), descrição (pending) ou dica (empty) */
    hint: string;
    badge?: string;
    icon?: Component;
  }>(),
  { badge: 'Enviado', icon: () => FileText },
);
</script>

<style scoped lang="scss">
.dt {
  --dt-bg: var(--blue-50);
  --dt-fg: var(--blue-600);
  --dt-hover: var(--blue-300);

  border: 1px solid var(--slate-200);
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s;

  &:hover {
    border-color: var(--dt-hover);
  }

  &--pending {
    --dt-bg: var(--amber-50);
    --dt-fg: var(--amber-600);
    --dt-hover: var(--amber-300);
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  &__icon {
    padding: 8px;
    background: var(--dt-bg);
    color: var(--dt-fg);
    border-radius: 6px;
    display: flex;
  }

  &__badge {
    font-size: 10px;
    height: 20px;
    background: var(--green-100);
    color: var(--green-700);
    border-color: var(--green-200);
  }

  &--pending &__badge {
    background: #fef3c7;
    color: var(--amber-700);
    border-color: var(--amber-200);
  }

  &__text {
    margin-bottom: 16px;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--slate-800);
    margin: 0;
  }

  &__file {
    font-size: 12px;
    color: var(--slate-500);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__view,
  &__send {
    flex: 1;
    height: 32px;
    min-height: 32px;
    font-size: 12px;
  }

  &__send {
    color: var(--amber-700);
    &:before {
      border-color: var(--amber-200);
    }
    &:hover {
      background: var(--amber-50);
    }
  }

  &__del {
    width: 32px;
    height: 32px;
    color: var(--slate-400);
    &:hover {
      color: var(--red-500);
    }
  }

  &--empty {
    border: 2px dashed var(--slate-300);
    background: var(--slate-50);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 12px;
    font: inherit;
    box-shadow: none;

    &:hover {
      background: var(--slate-100);
      border-color: var(--blue-400);
    }
  }

  &__plus {
    padding: 12px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 50%;
    color: var(--slate-400);
    display: flex;
    transition: transform 0.15s, color 0.15s;
  }

  &--empty:hover &__plus {
    transform: scale(1.1);
    color: var(--blue-500);
  }

  &__empty-name {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-700);
  }

  &--empty:hover &__empty-name {
    color: var(--blue-700);
  }

  &__empty-hint {
    display: block;
    font-size: 11px;
    color: var(--slate-400);
  }
}
</style>
