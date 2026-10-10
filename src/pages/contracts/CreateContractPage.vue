<template>
  <PendingModule :icon="FilePlus" title="Novo Contrato" source="customer/CreateContractScreen.tsx" />
</template>

<script setup lang="ts">
import { FilePlus } from 'lucide-vue-next';
import PendingModule from 'components/ui/PendingModule.vue';
</script>
