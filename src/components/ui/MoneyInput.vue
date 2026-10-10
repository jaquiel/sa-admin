<template>
  <q-input
    v-model="model"
    outlined
    dense
    class="sa-control money"
    :class="tone ? `money--${tone}` : ''"
    placeholder="0,00"
    :disable="disable"
    inputmode="decimal"
    hide-bottom-space
  >
    <template #prepend><span class="money__prefix">R$</span></template>
  </q-input>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: '' });

defineProps<{
  disable?: boolean;
  /** destaque visual do valor (verde = valor atual, vermelho = saldo devedor, bold = valor principal) */
  tone?: 'green' | 'red' | 'bold';
}>();
</script>

<style scoped lang="scss">
.money {
  &__prefix {
    font-size: 14px;
    color: var(--slate-400);
  }

  :deep(.q-field__native) {
    font-weight: 500;
  }

  &--bold :deep(.q-field__native) {
    font-weight: 700;
    color: var(--slate-700);
  }

  &--green {
    :deep(.q-field__control) {
      background: var(--green-50);
      &:before {
        border-color: var(--green-100);
      }
    }
    :deep(.q-field__native) {
      font-weight: 700;
      color: var(--green-700);
    }
  }

  &--red {
    :deep(.q-field__control) {
      background: var(--red-50);
      &:before {
        border-color: #fee2e2;
      }
    }
    :deep(.q-field__native) {
      color: var(--red-600);
    }
  }
}
</style>
