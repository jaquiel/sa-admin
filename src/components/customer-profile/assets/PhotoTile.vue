<template>
  <button v-if="!src" type="button" class="pt pt--empty" :class="{ 'pt--video': video }">
    <span class="pt__plus"><Plus :size="small ? 16 : 20" /></span>
    <span class="pt__add" :class="{ 'pt__add--xs': small }">{{ label }}</span>
  </button>

  <div v-else class="pt" :class="{ 'pt--video': video }">
    <img :src="src" :alt="label" loading="lazy" />
    <div v-if="caption" class="pt__caption">{{ label }}</div>
    <div class="pt__overlay">
      <q-btn round dense flat class="pt__btn" aria-label="Visualizar"><Eye :size="16" /></q-btn>
      <q-btn round dense flat class="pt__btn pt__btn--del" aria-label="Remover"><Trash2 :size="16" /></q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, Plus, Trash2 } from 'lucide-vue-next';

defineProps<{
  src?: string;
  label: string;
  /** mostra o rótulo sobre a foto (vistoria de veículo) */
  caption?: boolean;
  /** proporção 16:9 no mobile, quadrada no desktop */
  video?: boolean;
  small?: boolean;
}>();
</script>

<style scoped lang="scss">
.pt {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--slate-200);
  background: var(--slate-100);
  cursor: pointer;

  &--video {
    aspect-ratio: 16 / 9;
    @media (min-width: 768px) {
      aspect-ratio: 1 / 1;
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }

  &:hover img {
    transform: scale(1.1);
  }

  &__caption {
    position: absolute;
    inset: auto 0 0 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 8px;
    font-size: 10px;
    color: #fff;
    font-weight: 500;
    text-align: center;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    opacity: 0;
    transition: opacity 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &:hover &__overlay {
    opacity: 1;
  }

  &__btn {
    width: 32px;
    height: 32px;
    min-height: 32px;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    backdrop-filter: blur(4px);
    &:hover {
      background: #fff;
      color: var(--slate-900);
    }
    &--del:hover {
      background: var(--red-500);
      color: #fff;
    }
  }

  &--empty {
    border: 2px dashed var(--slate-300);
    background: var(--slate-50);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font: inherit;
    transition: all 0.15s;
    &:hover {
      background: var(--slate-100);
      border-color: var(--blue-400);
    }
  }

  &__plus {
    padding: 8px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 50%;
    color: var(--slate-400);
    display: flex;
    transition: transform 0.15s, color 0.15s;
  }

  &--empty:hover &__plus {
    transform: scale(1.1);
    color: var(--blue-500);
  }

  &__add {
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-600);
    &--xs {
      font-size: 10px;
    }
  }

  &--empty:hover &__add {
    color: var(--blue-600);
  }
}
</style>
