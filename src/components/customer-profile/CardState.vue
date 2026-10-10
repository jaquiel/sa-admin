<template>
  <div v-if="loading && empty" class="cs cs--loading">
    <q-skeleton v-for="n in rows" :key="n" type="text" :width="`${90 - n * 12}%`" />
  </div>
  <div v-else-if="error && empty" class="cs cs--error">
    <AlertTriangle :size="16" />
    <span>Não foi possível carregar estes dados.</span>
    <q-btn flat dense no-caps class="sa-btn cs__retry" label="Tentar novamente" @click="$emit('retry')" />
  </div>
  <div v-else-if="empty" class="cs cs--empty">{{ emptyText }}</div>
  <slot v-else />
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    loading?: boolean;
    error?: string | null;
    /** sem dados para exibir */
    empty?: boolean;
    emptyText?: string;
    rows?: number;
  }>(),
  { loading: false, error: null, empty: false, emptyText: 'Nenhuma informação cadastrada.', rows: 3 },
);
defineEmits<{ retry: [] }>();
</script>

<style scoped lang="scss">
.cs {
  font-size: 13px;
  color: var(--slate-500);

  &--loading {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &--error {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--red-600, #dc2626);
  }

  &--empty {
    padding: 8px 0;
  }

  &__retry {
    margin-left: auto;
    font-size: 12px;
  }
}
</style>
