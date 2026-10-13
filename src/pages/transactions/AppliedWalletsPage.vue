<template>
  <WalletsList
    type="Applied"
    title="Carteiras Aplicadas"
    subtitle="Visão detalhada das carteiras aplicadas no sistema"
    balance-label="Valor Consolidado"
    dialog-title="Detalhes da Carteira Aplicada"
    accent="indigo"
  />
</template>

<script setup lang="ts">
import WalletsList from 'components/transactions/WalletsList.vue';
</script>
