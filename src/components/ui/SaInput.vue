<template>
  <q-input
    v-model="model"
    outlined
    dense
    class="sa-control"
    :class="{ 'sa-control--textarea': type === 'textarea' }"
    :type="type"
    :placeholder="placeholder"
    :readonly="readonly"
    :disable="disable"
    :autogrow="false"
    :rows="rows"
    :input-class="inputClass"
    hide-bottom-space
  >
    <template v-if="$slots.prepend" #prepend><slot name="prepend" /></template>
    <template v-if="$slots.append" #append><slot name="append" /></template>
  </q-input>
</template>

<script setup lang="ts">
import type { QInputProps } from 'quasar';

const model = defineModel<string | number | null>({ default: '' });

withDefaults(
  defineProps<{
    type?: QInputProps['type'];
    placeholder?: string;
    readonly?: boolean;
    disable?: boolean;
    rows?: number;
    inputClass?: string;
  }>(),
  { type: 'text', placeholder: '', rows: 3, inputClass: '' },
);
</script>
