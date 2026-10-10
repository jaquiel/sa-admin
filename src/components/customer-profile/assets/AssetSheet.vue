<template>
  <q-dialog v-model="open" position="right" full-height class="sa-sheet-dialog">
    <div class="ash">
      <header class="ash__head">
        <div class="ash__title-wrap">
          <span class="ash__icon"><component :is="icon" :size="20" /></span>
          <div>
            <h3 class="ash__title">{{ title }}</h3>
            <p class="ash__desc">{{ description }}</p>
          </div>
        </div>
        <div class="ash__actions">
          <q-btn flat no-caps class="sa-btn ash__discard" @click="open = false">
            <X :size="16" class="q-mr-sm" /> Descartar
          </q-btn>
          <q-btn unelevated no-caps class="sa-btn ash__save" :loading="loading" @click="$emit('save')">
            <CheckCircle2 :size="16" class="q-mr-sm" /> {{ saveLabel }}
          </q-btn>
        </div>
      </header>
      <div class="ash__body">
        <div class="ash__content">
          <slot />
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { CheckCircle2, X } from 'lucide-vue-next';

const open = defineModel<boolean>({ default: false });

defineProps<{
  icon: Component;
  title: string;
  description: string;
  saveLabel: string;
  loading?: boolean;
}>();
defineEmits<{ save: [] }>();
</script>

<style scoped lang="scss">
.ash {
  width: 900px;
  max-width: 100vw !important;
  height: 100vh;
  max-height: 100vh !important;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  border-radius: 0 !important;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid var(--slate-200);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
    color: var(--blue-600);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--slate-800);
    margin: 0;
    line-height: 1.4;
  }

  &__desc {
    font-size: 12px;
    color: #717182;
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__discard {
    color: var(--slate-500);
    &:hover {
      color: var(--red-600);
      background: var(--red-50);
    }
  }

  &__save {
    background: var(--blue-600);
    color: #fff;
    min-width: 120px;
    &:hover {
      background: var(--blue-700);
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
  }

  &__content {
    padding: 24px 24px 96px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
}
</style>
