<template>
  <div class="sa-form-field" :class="{ 'sa-form-field--full': full }">
    <label v-if="label" class="sa-form-field__label">{{ label }}</label>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string; full?: boolean }>();
</script>

<style scoped lang="scss">
.sa-form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  &--full {
    grid-column: 1 / -1;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-900);
    line-height: 1.4;
  }
}
</style>
