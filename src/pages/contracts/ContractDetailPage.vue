<template>
  <PendingModule
    :icon="FileText"
    :title="`Contrato ${id}`"
    source="customer/ContractsScreen.tsx · DebtModals.tsx"
  />
</template>

<script setup lang="ts">
import { FileText } from 'lucide-vue-next';
import PendingModule from 'components/ui/PendingModule.vue';

defineProps<{ id: string }>();
</script>
