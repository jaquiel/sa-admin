<template>
  <PendingModule
    :icon="Activity"
    title="Contratos"
    source="customer/ContractsListScreen.tsx · ContractMockData.ts"
  />
</template>

<script setup lang="ts">
import { Activity } from 'lucide-vue-next';
import PendingModule from 'components/ui/PendingModule.vue';
</script>
