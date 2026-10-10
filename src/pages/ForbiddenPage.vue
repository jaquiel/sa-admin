<template>
  <PendingModule
    :icon="ShieldAlert"
    title="Acesso negado"
    message="Seu usuário não tem permissão para acessar esta área."
  />
</template>

<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next';
import PendingModule from 'components/ui/PendingModule.vue';
</script>
