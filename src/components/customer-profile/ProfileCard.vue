<template>
  <section class="sa-card">
    <header class="sa-card__header">
      <div class="pc__head">
        <h2 class="sa-card__title">
          <component :is="icon" :size="16" />
          {{ title }}
        </h2>
        <p v-if="subtitle" class="pc__subtitle">{{ subtitle }}</p>
        <slot name="subheader" />
      </div>
      <slot name="actions" />
    </header>
    <div :class="flush ? '' : 'sa-card__body'">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  title: string;
  icon: Component;
  subtitle?: string;
  /** sem padding no corpo (tabelas de borda a borda) */
  flush?: boolean;
}>();
</script>

<style scoped>
.pc__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pc__subtitle {
  font-size: 12px;
  color: var(--slate-500);
  margin: 0;
}
</style>
