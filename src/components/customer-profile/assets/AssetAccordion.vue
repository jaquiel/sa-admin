<template>
  <div class="aa" :class="[{ 'aa--open': open }, variant ? `aa--${variant}` : '']">
    <div
      class="aa__head"
      role="button"
      tabindex="0"
      :aria-expanded="open"
      @click="open = !open"
      @keydown.enter.prevent="open = !open"
      @keydown.space.prevent="open = !open"
    >
      <div class="aa__left">
        <span class="aa__chev">
          <ChevronUp v-if="open" :size="16" />
          <ChevronDown v-else :size="16" />
        </span>
        <span class="aa__icon"><component :is="icon" :size="20" /></span>
        <div class="aa__titles">
          <div class="aa__title">{{ title }}</div>
          <div class="aa__subtitle"><slot name="subtitle">{{ subtitle }}</slot></div>
        </div>
      </div>

      <div class="aa__details">{{ details }}</div>

      <div class="aa__right" @click.stop>
        <slot name="status" />
        <div class="aa__meta">
          <span class="sa-badge sa-badge--slate aa__docs"><FolderOpen :size="14" /> {{ docsCount }}</span>
          <q-btn flat round dense size="sm" class="aa__more" aria-label="Mais ações">
            <MoreHorizontal :size="16" />
            <q-menu anchor="bottom right" self="top right" class="aa__menu">
              <q-list dense style="min-width: 140px">
                                <q-item v-close-popup clickable class="text-red-600" @click="$emit('remove')">
                  <q-item-section>Remover</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>

    <q-slide-transition>
      <div v-show="open" class="aa__body">
        <div class="aa__body-head">
          <h5><FileBadge :size="16" /> Documentação Vinculada</h5>
          <q-btn outline no-caps dense class="sa-btn aa__extra">
            <Plus :size="12" class="q-mr-xs" /> Documento Extra
          </q-btn>
        </div>
        <div class="aa__grid">
          <slot />
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Component } from 'vue';
import { ChevronDown, ChevronUp, FileBadge, FolderOpen, MoreHorizontal, Plus } from 'lucide-vue-next';

defineProps<{
  icon: Component;
  title: string;
  subtitle?: string;
  details: string;
  docsCount: string;
  /** 'success' = consórcio contemplado (borda/ícone verdes) */
  variant?: 'success';
}>();
const emit = defineEmits<{ edit: []; remove: []; opened: [] }>();

const open = ref(false);
// permite carregar a documentação só quando o item é expandido
watch(open, (v) => v && emit('opened'));
</script>

<style scoped lang="scss">
.aa {
  border: 1px solid var(--slate-200);
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--slate-300);
  }

  &--success {
    border-color: var(--green-200);
    background: rgba(240, 253, 244, 0.2);
  }

  &__head {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    outline: none;
    transition: background 0.15s;
    &:hover {
      background: rgba(248, 250, 252, 0.3);
    }
    &:focus-visible {
      box-shadow: inset 0 0 0 2px var(--blue-200);
    }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  &__chev {
    color: var(--slate-400);
    display: flex;
    width: 24px;
    justify-content: center;
    flex-shrink: 0;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--slate-50);
    border: 1px solid var(--slate-100);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--blue-600);
    flex-shrink: 0;
  }

  &--success &__icon {
    background: var(--green-100);
    color: var(--green-700);
    border-color: var(--green-200);
  }

  &__title {
    font-weight: 700;
    font-size: 14px;
    color: var(--slate-900);
  }

  &__subtitle {
    font-size: 12px;
    color: var(--slate-500);
    margin-top: 2px;
  }

  &__details {
    display: none;
    flex: 1;
    padding: 0 16px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-700);
    @media (min-width: 768px) {
      display: block;
    }
  }

  &__right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    min-width: 200px;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__docs {
    height: 28px;
    font-size: 10px;
    gap: 6px;
    border-color: var(--slate-200);
    color: var(--slate-600);
  }

  &__more {
    color: var(--slate-400);
    &:hover {
      color: var(--slate-600);
    }
  }

  &__body {
    background: rgba(248, 250, 252, 0.5);
    border-top: 1px solid var(--slate-100);
    padding: 20px 20px 20px 64px;
  }

  &__body-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    h5 {
      font-size: 12px;
      font-weight: 700;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
  }

  &__extra {
    height: 28px;
    min-height: 28px;
    font-size: 12px;
    padding: 0 10px;
    background: #fff;
    color: var(--blue-600);
    &:before {
      border: 1px dashed var(--blue-200) !important;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    @media (min-width: 1280px) {
      grid-template-columns: 1fr 1fr;
    }
    :deep(.aa__full) {
      grid-column: 1 / -1;
    }
  }
}
</style>
