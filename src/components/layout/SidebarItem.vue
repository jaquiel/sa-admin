<template>
  <button
    type="button"
    class="sb-item"
    :class="{ 'sb-item--active': active, 'sb-item--collapsed': collapsed, [`sb-item--${tone}`]: !!tone }"
    :title="collapsed ? label : undefined"
    @click="$emit('click')"
  >
    <component :is="icon" :size="20" class="sb-item__icon" />
    <span v-if="!collapsed" class="sb-item__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  icon: Component;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  /** variação de cor para ações (Trocar Sistema / Sair) */
  tone?: 'blue' | 'red';
}>();
defineEmits<{ click: [] }>();
</script>

<style scoped lang="scss">
.sb-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font: inherit;
  font-size: 14px;
  line-height: 20px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--slate-600);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &__icon {
    flex-shrink: 0;
    color: var(--slate-400);
  }

  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background: var(--slate-50);
    color: var(--slate-900);
  }

  &--collapsed {
    justify-content: center;
    padding: 8px;
  }

  &--active {
    background: rgba(6, 182, 212, 0.1);
    color: var(--cyan-500);
    font-weight: 500;
    border-color: rgba(255, 255, 255, 0.2);
    .sb-item__icon {
      color: var(--cyan-500);
    }
    &:hover {
      background: rgba(6, 182, 212, 0.1);
      color: var(--cyan-500);
    }
  }

  &--blue {
    color: var(--blue-600);
    .sb-item__icon { color: var(--blue-600); }
    &:hover { background: var(--blue-50); color: var(--blue-600); }
  }

  &--red {
    color: var(--red-600);
    .sb-item__icon { color: var(--red-600); }
    &:hover { background: var(--red-50); color: var(--red-600); }
  }
}
</style>
