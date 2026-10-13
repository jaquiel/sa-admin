<template>
  <WalletsList
    type="Free"
    title="Carteiras Livres"
    subtitle="Visão completa das carteiras com saldo livre disponível"
    balance-label="Saldo Atual"
    dialog-title="Detalhes da Carteira Livre"
    accent="emerald"
  />
</template>

<script setup lang="ts">
import WalletsList from 'components/transactions/WalletsList.vue';
</script>
