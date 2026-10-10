<template>
  <PendingModule
    :icon="LayoutTemplate"
    title="Edição de Landing Page"
    source="landing/LandingPageEditor.tsx · LandingPageViewer.tsx"
  />
</template>

<script setup lang="ts">
import { LayoutTemplate } from 'lucide-vue-next';
import PendingModule from 'components/ui/PendingModule.vue';
</script>
