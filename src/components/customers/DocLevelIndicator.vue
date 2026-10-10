<template>
  <div class="dl" :title="`Nível documental ${level} de 3`">
    <FileCheck :size="14" class="dl__icon" />
    <div class="dl__bars">
      <span v-for="i in 3" :key="i" class="dl__bar" :class="{ 'dl__bar--on': i <= level }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileCheck } from 'lucide-vue-next';

defineProps<{ level: number }>();
</script>

<style scoped lang="scss">
.dl {
  display: flex;
  align-items: center;
  gap: 6px;

  &__icon {
    color: var(--slate-400);
  }

  &__bars {
    display: flex;
    gap: 2px;
  }

  &__bar {
    width: 6px;
    height: 12px;
    border-radius: 2px;
    background: var(--slate-200);

    &--on {
      background: var(--blue-500);
    }
  }
}
</style>
