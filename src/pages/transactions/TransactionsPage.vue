<template>
  <PendingModule
    :icon="ArrowRightLeft"
    title="Transações"
    source="transactions/TransactionsScreen.tsx (+ Applied/Contracts/Free/Total WalletsView, PendingRequestsSection)"
  />
</template>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next';
import PendingModule from 'components/ui/PendingModule.vue';
</script>
