<template>
  <PendingModule
    :icon="GitBranch"
    title="Lógica do Contrato"
    source="customer/ContractLogicScreen.tsx · ContractLogicSelectionScreen.tsx"
  />
</template>

<script setup lang="ts">
import { GitBranch } from 'lucide-vue-next';
import PendingModule from 'components/ui/PendingModule.vue';

defineProps<{ id: string }>();
</script>
