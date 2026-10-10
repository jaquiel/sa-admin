<template>
  <q-btn flat round dense class="lam__trigger" aria-label="Ações" @click.stop>
    <MoreHorizontal :size="16" />
    <q-menu anchor="bottom right" self="top right" class="lam__menu">
      <q-list dense>
        <q-item v-close-popup clickable @click="emit('open')">
          <q-item-section><span class="lam__item"><CircuitBoard :size="14" /> Abrir Lógica</span></q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="emit('open')">
          <q-item-section><span class="lam__item"><Edit :size="14" /> Editar</span></q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="emit('duplicate')">
          <q-item-section><span class="lam__item"><Copy :size="14" /> Duplicar</span></q-item-section>
        </q-item>
        <q-separator />
        <q-item v-if="logic.status === 'Active'" v-close-popup clickable @click="emit('toggle')">
          <q-item-section><span class="lam__item lam__item--orange"><Pause :size="14" /> Pausar</span></q-item-section>
        </q-item>
        <q-item v-else v-close-popup clickable @click="emit('toggle')">
          <q-item-section><span class="lam__item lam__item--emerald"><Play :size="14" /> Ativar</span></q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { CircuitBoard, Copy, Edit, MoreHorizontal, Pause, Play } from 'lucide-vue-next';
import type { LogicSummary } from 'src/mocks/logics';

defineProps<{ logic: LogicSummary }>();
const emit = defineEmits<{ open: []; duplicate: []; toggle: [] }>();
</script>

<style scoped lang="scss">
.lam__trigger { color: var(--slate-400); &:hover { color: var(--slate-600); } }
.lam__menu { min-width: 160px; }
.lam__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  &--orange { color: var(--orange-600); }
  &--emerald { color: var(--emerald-600); }
}
</style>
