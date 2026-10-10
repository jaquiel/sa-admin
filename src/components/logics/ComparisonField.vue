<template>
  <div v-if="!editing" class="cf">
    <div class="cf__label-row">
      <label class="cf__label" :class="`cf__label--${color}`">{{ label }}</label>
      <InfoTip v-if="tooltip" :text="tooltip" :forced="forced" />
    </div>
    <div class="cf__value font-mono" :class="[`cf__value--${color}`, { 'cf__value--empty': current === null }]">
      {{ display(current) }}
    </div>
  </div>

  <div v-else class="cf">
    <div class="cf__label-row">
      <label class="cf__label" :class="`cf__label--${color}`">
        {{ label }}
        <InfoTip v-if="tooltip" :text="tooltip" :forced="forced" />
      </label>
      <span v-if="changed" class="cf__changed">MODIFICADO</span>
    </div>
    <div class="cf__compare">
      <div class="cf__slot">
        <span class="cf__tag">Atual</span>
        <div class="cf__current font-mono" :class="{ 'cf__value--empty': current === null }">{{ display(current) }}</div>
      </div>
      <div class="cf__slot">
        <span class="cf__tag cf__tag--new">Novo</span>
        <input
          class="cf__input"
          :class="{ 'cf__input--changed': changed }"
          :type="inputType"
          :step="step"
          :value="buffer ?? ''"
          placeholder="Sem limite"
          @input="emit('update', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoTip from './InfoTip.vue';

type Val = number | string | null;

const props = withDefaults(
  defineProps<{
    label: string;
    current: Val;
    buffer: Val;
    editing: boolean;
    suffix?: string;
    step?: string;
    color?: 'slate' | 'emerald' | 'rose' | 'indigo';
    tooltip?: string;
    inputType?: string;
    forced?: boolean;
  }>(),
  { suffix: '', step: '0.1', color: 'slate', tooltip: '', inputType: 'number', forced: false },
);
const emit = defineEmits<{ update: [value: string] }>();

const changed = computed(() => props.current !== props.buffer);

function display(v: Val) {
  if (v === null) return 'Sem limite';
  if (typeof v === 'number') return `${v > 0 ? '+' : ''}${v.toFixed(2)}${props.suffix}`;
  return `${v}${props.suffix}`;
}
</script>

<style scoped lang="scss">
.cf {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  &__label-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    &--slate { color: var(--slate-600); }
    &--emerald { color: var(--emerald-600); }
    &--rose { color: var(--rose-600); }
    &--indigo { color: var(--indigo-600); }
  }

  &__changed { font-size: 9px; font-weight: 700; color: var(--amber-600); background: var(--amber-50); padding: 0 4px; border-radius: 4px; }

  &__value {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    border: 1px solid;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 700;
    &--slate { color: var(--slate-700); border-color: var(--slate-100); }
    &--emerald { color: var(--emerald-700); border-color: var(--emerald-100); background: rgba(236, 253, 245, 0.5); }
    &--rose { color: var(--rose-700); border-color: var(--rose-100); background: rgba(255, 241, 242, 0.5); }
    &--indigo { color: var(--indigo-700); border-color: var(--indigo-100); background: rgba(238, 242, 255, 0.5); }
    &--empty { color: var(--slate-400) !important; font-weight: 400; font-style: italic; }
  }

  &__compare { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  &__slot { position: relative; }

  &__tag {
    position: absolute;
    top: -8px;
    left: 4px;
    z-index: 1;
    background: #fff;
    padding: 0 4px;
    font-size: 9px;
    font-weight: 500;
    color: var(--slate-400);
    &--new { color: var(--indigo-600); font-weight: 700; }
  }

  &__current {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: 4px;
    color: var(--slate-500);
    font-size: 12px;
    opacity: 0.8;
  }

  &__input {
    width: 100%;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--indigo-200);
    border-radius: 6px;
    background: #fff;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    color: var(--slate-700);
    outline: none;
    &:focus { box-shadow: 0 0 0 1px var(--indigo-500); }
    &--changed { background: rgba(238, 242, 255, 0.3); color: var(--indigo-700); }
    &::placeholder { font-weight: 400; color: var(--slate-400); }
  }
}
</style>
