<template>
  <div class="bp" :class="`bp--${tone}`">
    <label class="bp__label"><Building2 :size="12" /> Selecionar Banco Cadastrado (Obrigatório)</label>
    <div class="bp__list">
      <button
        v-for="b in banks"
        :key="b.id"
        type="button"
        class="bp__bank"
        :class="{ 'bp__bank--active': model === b.id }"
        @click="model = b.id"
      >
        <span v-if="model === b.id" class="bp__check"><Check :size="12" /></span>
        <span class="bp__name"><span class="bp__icon"><Building2 :size="16" /></span> {{ b.name }}</span>
        <span class="bp__meta"><strong>Ag:</strong> {{ b.agency }} • <strong>CC:</strong> {{ b.account }}</span>
        <span class="bp__type">{{ b.type }}</span>
        <span v-if="b.pix" class="bp__pix font-mono">PIX: {{ b.pix }}</span>
      </button>
    </div>
    <div v-if="!banks.length" class="bp__empty">Nenhum banco cadastrado para este cliente.</div>
  </div>
</template>

<script setup lang="ts">
import { Building2, Check } from 'lucide-vue-next';
import type { OpClientBank } from 'src/mocks/transactions';

defineProps<{ banks: OpClientBank[]; tone: 'emerald' | 'rose' }>();
const model = defineModel<string>({ default: '' });
</script>

<style scoped lang="scss">
.bp {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
  &--emerald .bp__label { color: var(--emerald-700); }
  &--rose .bp__label { color: var(--rose-800); }

  &__list { display: flex; flex-direction: column; gap: 12px; }

  &__bank {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 12px;
    text-align: left;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    font: inherit;
    cursor: pointer;
    transition: all 0.15s;
    &:hover { box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05); }
  }

  &--emerald .bp__bank:hover { border-color: var(--emerald-300); }
  &--rose .bp__bank:hover { border-color: var(--rose-300); }
  &--emerald .bp__bank--active { border-color: var(--emerald-500); background: rgba(236, 253, 245, 0.5); box-shadow: 0 0 0 1px var(--emerald-500); }
  &--rose .bp__bank--active { border-color: var(--rose-500); background: rgba(255, 241, 242, 0.5); box-shadow: 0 0 0 1px var(--rose-500); }

  &__check { position: absolute; top: 0; right: 0; padding: 2px; color: #fff; border-bottom-left-radius: 4px; display: flex; }
  &--emerald .bp__check { background: var(--emerald-500); }
  &--rose .bp__check { background: var(--rose-500); }

  &__name { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; font-weight: 700; color: var(--slate-800); }
  &__icon { padding: 6px; border-radius: 50%; background: var(--slate-100); color: var(--slate-600); display: flex; }
  &__meta { font-size: 10px; color: var(--slate-500); strong { font-weight: 600; } }
  &__type { font-size: 10px; font-weight: 600; color: var(--slate-400); text-transform: uppercase; }
  &__pix { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
  &--emerald .bp__pix { color: rgba(5, 150, 105, 0.8); }
  &--rose .bp__pix { color: rgba(225, 29, 72, 0.8); }

  &__empty { padding: 16px; text-align: center; font-size: 12px; color: var(--slate-400); background: var(--slate-50); border: 1px dashed var(--slate-200); border-radius: 4px; }
}
</style>
