<template>
  <div class="pending">
    <div class="pending__inner">
      <component :is="icon" :size="64" class="pending__icon" />
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      <p v-if="source" class="pending__source">
        Origem no Figma Make: <code>{{ source }}</code>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { Construction } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    title: string;
    message?: string;
    /** arquivo(s) do Figma Make que serão portados para esta rota */
    source?: string;
    icon?: Component;
  }>(),
  { message: 'Módulo em portabilidade para Vue/Quasar.', source: '', icon: () => Construction },
);
</script>

<style scoped lang="scss">
.pending {
  flex: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  &__inner {
    text-align: center;
    max-width: 520px;
  }

  &__icon {
    color: var(--slate-300);
    margin: 0 auto 16px;
    display: block;
  }

  h2 {
    font-size: 24px;
    line-height: 32px;
    font-weight: 700;
    color: var(--slate-900);
    margin: 0 0 8px;
  }

  p {
    color: var(--slate-600);
    margin: 0;
  }

  &__source {
    margin-top: 12px !important;
    font-size: 12px;
    color: var(--slate-400) !important;
    code {
      background: var(--slate-100);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}
</style>
