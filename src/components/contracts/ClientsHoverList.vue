<template>
  <div class="chl">
    <div class="chl__head">
      <Users :size="16" class="chl__head-icon" />
      <span>Clientes Vinculados ({{ clients.length }})</span>
    </div>
    <div class="chl__list">
      <div v-for="(c, idx) in details" :key="idx" class="chl__item">
        <div class="chl__avatar">
          <Building2 v-if="c.type === 'PJ'" :size="14" />
          <User v-else :size="14" />
        </div>
        <div class="chl__info">
          <span class="chl__name">{{ c.name }}</span>
          <div class="chl__meta">
            <span class="chl__type font-mono">{{ c.type }}</span>
            <span class="chl__doc font-mono">{{ c.document }}</span>
          </div>
          <span v-if="c.status !== 'Active'" class="chl__status" :class="c.status === 'Blocked' ? 'text-rose-600' : 'text-amber-600'">
            {{ STATUS_LABEL[c.status] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Building2, User, Users } from 'lucide-vue-next';
import type { ClientStatus, ContractClient } from 'src/types/contract';

const props = defineProps<{ clients: ContractClient[] }>();
const details = computed(() => props.clients);
const STATUS_LABEL: Record<ClientStatus, string> = { Active: 'Ativo', Analysis: 'Em Análise', Blocked: 'Bloqueado', Inactive: 'Inativo' };
</script>

<style scoped lang="scss">
.chl {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 280px;

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--slate-100);
    font-size: 12px;
    font-weight: 600;
    color: var(--slate-700);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  &__head-icon { color: var(--indigo-600); }

  &__list { display: flex; flex-direction: column; gap: 8px; }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px;
    border-radius: 6px;
  }

  &__avatar {
    margin-top: 2px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--slate-100);
    border: 1px solid var(--slate-200);
    color: var(--slate-500);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info { display: flex; flex-direction: column; gap: 2px; }
  &__name { font-size: 14px; font-weight: 500; color: var(--slate-900); line-height: 1; }
  &__meta { display: flex; align-items: center; gap: 8px; }
  &__type { font-size: 10px; color: var(--slate-500); background: var(--slate-100); padding: 0 4px; border-radius: 4px; }
  &__doc { font-size: 10px; color: var(--slate-400); }
  &__status { font-size: 10px; font-weight: 500; margin-top: 2px; }
}
</style>
