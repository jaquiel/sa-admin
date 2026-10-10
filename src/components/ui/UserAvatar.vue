<template>
  <q-avatar :size="`${size}px`" class="ua" :class="{ 'ua--bordered': bordered }">
    <img v-if="src && !failed" :src="src" alt="" @error="failed = true" />
    <span v-else-if="initials" class="ua__initials">{{ initials }}</span>
    <component :is="fallbackIcon" v-else :size="Math.round(size * 0.45)" />
  </q-avatar>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue';
import { UserCircle } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    src?: string | null | undefined;
    size?: number;
    initials?: string;
    fallbackIcon?: Component;
    bordered?: boolean;
  }>(),
  { size: 32, src: null, initials: '', fallbackIcon: () => UserCircle, bordered: false },
);

const failed = ref(false);
</script>

<style scoped lang="scss">
.ua {
  background: var(--slate-100);
  color: var(--slate-600);
  flex-shrink: 0;

  &--bordered {
    border: 2px solid var(--slate-200);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  &__initials {
    font-size: 0.4em;
    font-weight: 600;
  }
}
</style>
