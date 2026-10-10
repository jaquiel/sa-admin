<template>
  <section class="ss">
    <div class="ss__head">
      <h3><component :is="icon" :size="16" /> {{ title }}</h3>
      <span v-if="hint" class="ss__hint">{{ hint }}</span>
    </div>
    <div v-if="card" class="ss__card" :class="{ 'ss__card--muted': muted, 'ss__card--fill': fill }">
      <slot />
    </div>
    <slot v-else />
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(
  defineProps<{
    icon: Component;
    title: string;
    hint?: string;
    /** envolve o conteúdo num Card branco */
    card?: boolean;
    muted?: boolean;
    fill?: boolean;
  }>(),
  { card: true, hint: '', muted: false, fill: false },
);
</script>

<style scoped lang="scss">
.ss {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    h3 {
      font-size: 12px;
      font-weight: 700;
      color: var(--slate-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      line-height: 1.4;
    }
  }

  &__hint {
    font-size: 10px;
    color: var(--slate-400);
  }

  &__card {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    padding: 20px;

    &--muted {
      background: rgba(248, 250, 252, 0.5);
    }
    &--fill {
      flex: 1;
    }
  }
}
</style>
