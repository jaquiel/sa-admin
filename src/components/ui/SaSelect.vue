<template>
  <q-select
    v-model="model"
    outlined
    dense
    emit-value
    map-options
    class="sa-control"
    :class="{ 'sa-control--sm': size === 'sm', 'sa-control--empty': isEmpty }"
    :options="options"
    :display-value="displayValue"
    :style="width ? { width } : undefined"
    dropdown-icon="expand_more"
    popup-content-class="sa-select-menu"
    hide-bottom-space
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface SaOption {
  label: string;
  value: string | number | boolean;
}

const model = defineModel<string | number | boolean | null>({ default: null });

const props = withDefaults(
  defineProps<{
    options: SaOption[];
    placeholder?: string;
    size?: 'sm' | 'md';
    width?: string | undefined;
  }>(),
  { placeholder: 'Selecione', size: 'md' },
);

const isEmpty = computed(() => !props.options.some((o) => o.value === model.value));

const displayValue = computed(() => {
  const found = props.options.find((o) => o.value === model.value);
  return found ? found.label : props.placeholder;
});
</script>
