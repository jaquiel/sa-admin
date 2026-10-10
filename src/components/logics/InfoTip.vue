<template>
  <span class="it" :class="{ 'it--plain': !icon }">
    <slot><Info :size="14" class="it__icon" /></slot>
    <q-tooltip v-model="shown" class="sa-tooltip-dark" anchor="top middle" self="bottom middle" :offset="[0, 8]">
      {{ text }}
    </q-tooltip>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Info } from 'lucide-vue-next';

/** Tooltip escuro do Figma; `forced` mantém todos abertos ("Exibir Tooltips"). */
const props = withDefaults(defineProps<{ text: string; forced?: boolean; icon?: boolean }>(), { forced: false, icon: true });

const hover = ref(false);
const shown = computed({
  get: () => props.forced || hover.value,
  set: (v: boolean) => (hover.value = v),
});
</script>

<style scoped lang="scss">
.it {
  display: inline-flex;
  align-items: center;
  cursor: help;
  &__icon { color: var(--slate-400); transition: color 0.15s; }
  &:hover .it__icon { color: var(--slate-600); }
}
</style>
