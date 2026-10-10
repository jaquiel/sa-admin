<template>
  <div class="sa-field">
    <div class="sa-field__label">
      <component :is="icon" v-if="icon" :size="14" />
      {{ label }}
    </div>
    <div class="sa-field__value" :class="{ 'df--masked': masked }">
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  label: string;
  value?: string;
  icon?: Component;
  masked?: boolean;
}>();
</script>

<style scoped>
.df--masked {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.1em;
}
</style>
