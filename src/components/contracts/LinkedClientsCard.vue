<template>
  <section class="sa-card lc" :class="{ 'lc--editing': editing }">
    <header class="lc__head" :class="{ 'lc__head--open': expanded }" @click="expanded = !expanded">
      <h2 class="lc__title">
        <Users :size="14" class="text-slate-500" />
        Clientes Vinculados
        <span v-if="editing" class="lc__editing">Editando</span>
      </h2>

      <div class="lc__head-right">
        <div v-if="!expanded" class="lc__compact">
          <span
            v-for="c in compactClients"
            :key="c.id"
            class="lc__chip"
            :class="{ 'lc__chip--blocked': c.status === 'Blocked' }"
          >
            <Building2 v-if="c.type === 'PJ'" :size="10" />
            <User v-else :size="10" />
            <span class="lc__chip-name">{{ c.name }}</span>
          </span>
          <span v-if="remaining > 0" class="lc__chip lc__chip--more">+{{ remaining }}</span>
        </div>
        <span class="lc__toggle">
          <ChevronUp v-if="expanded" :size="14" />
          <ChevronDown v-else :size="14" />
        </span>
      </div>
    </header>

    <transition name="fade-slide">
      <div v-if="expanded" class="lc__list">
        <div v-for="c in clients" :key="c.id" class="lc__row" :class="{ 'lc__row--editing': editing }">
          <div class="lc__identity">
            <span class="lc__avatar" :class="c.type === 'PJ' ? 'lc__avatar--pj' : 'lc__avatar--pf'">
              <Building2 v-if="c.type === 'PJ'" :size="16" />
              <User v-else :size="16" />
            </span>
            <div>
              <p class="lc__name">{{ c.name }}</p>
              <div class="lc__doc-row">
                <span class="lc__doc font-mono">{{ c.document }}</span>
                <span class="lc__type">{{ c.type }}</span>
              </div>
            </div>
          </div>

          <div class="lc__middle">
            <div class="lc__col">
              <span class="sa-label-xs lc__col-label">Status</span>
              <span class="sa-badge" :class="statusCfg[c.status].cls">
                <component :is="statusCfg[c.status].icon" :size="14" :class="statusCfg[c.status].iconCls" />
                {{ statusCfg[c.status].label }}
              </span>
            </div>
            <div class="lc__col">
              <span class="sa-label-xs lc__col-label">Documentação</span>
              <div class="lc__doc-level">
                <span class="lc__level">{{ c.docLevel }}</span>
                <span v-if="c.docStatus === 'Incomplete'" class="lc__incomplete" title="Incompleto" />
              </div>
            </div>
          </div>

          <div class="lc__right">
            <q-btn v-if="editing" flat round dense class="lc__remove" aria-label="Remover cliente" @click.stop="emit('remove', c.id)">
              <Trash2 :size="16" />
            </q-btn>
            <template v-else>
              <span class="sa-label-xs lc__col-label">Vínculo</span>
              <span class="lc__linked"><Calendar :size="14" class="text-slate-400" /> {{ c.linkedDate || '—' }}</span>
              <span v-if="allocation(c)" class="lc__alloc">Alocado: {{ allocation(c) }}</span>
            </template>
          </div>
        </div>

        <div v-if="editing" class="lc__add-row">
          <q-btn outline no-caps class="sa-btn lc__add" @click.stop="dialogOpen = true">
            <Plus :size="14" class="q-mr-sm" /> Adicionar Cliente Vinculado
          </q-btn>
        </div>
      </div>
    </transition>

    <!-- Seletor de clientes -->
    <q-dialog v-model="dialogOpen" @hide="query = ''">
      <div class="sa-dialog">
        <div class="lc-dlg__head">
          <h3><Users :size="20" class="text-indigo-600" /> Adicionar Cliente Vinculado</h3>
        </div>
        <div class="lc-dlg__body">
          <SaInput v-model="query" placeholder="Buscar cliente por ID, nome, e-mail ou documento" autofocus>
            <template #prepend><Search :size="16" /></template>
          </SaInput>
          <div class="lc-dlg__results">
            <div v-if="loadingCandidates" class="sa-empty lc-dlg__empty"><q-spinner size="24px" /><p>Carregando clientes...</p></div>
            <div v-else-if="!available.length" class="sa-empty lc-dlg__empty">
              <span class="lc-dlg__empty-icon"><Search :size="24" /></span>
              <p>Nenhum cliente encontrado</p>
            </div>
            <button v-for="c in available" :key="c.id" type="button" class="lc-dlg__item" @click="select(c)">
              <div class="lc__identity">
                <span class="lc__avatar" :class="c.type === 'PJ' ? 'lc__avatar--pj' : 'lc__avatar--pf'">
                  <Building2 v-if="c.type === 'PJ'" :size="16" />
                  <User v-else :size="16" />
                </span>
                <div>
                  <p class="lc__name">{{ c.name }}</p>
                  <div class="lc-dlg__meta">
                    <span class="font-mono">{{ c.document }}</span>
                    <template v-if="c.email">
                      <span class="lc-dlg__dot" />
                      <span class="lc-dlg__email">{{ c.email }}</span>
                    </template>
                  </div>
                </div>
              </div>
              <div class="lc-dlg__side">
                <span class="sa-badge sa-badge--xs sa-badge--outline">ID: {{ c.id }}</span>
                <span class="lc-dlg__select">Selecionar</span>
              </div>
            </button>
          </div>
        </div>
        <div class="lc-dlg__foot">
          <q-btn flat no-caps class="sa-btn sa-btn--ghost" label="Cancelar" @click="dialogOpen = false" />
        </div>
      </div>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue';
import {
  AlertCircle,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Trash2,
  User,
  Users,
} from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import { loadCustomerIndex, toContractClient } from 'src/services/contracts.service';
import type { ClientStatus, ContractClient } from 'src/types/contract';
import { formatCurrencyIn } from 'src/utils/format';

const props = defineProps<{ clients: ContractClient[]; editing: boolean; currency?: string | undefined }>();
const emit = defineEmits<{ add: [client: ContractClient]; remove: [id: string] }>();

const expanded = ref(false);
const dialogOpen = ref(false);
const query = ref<string | number | null>('');

const MAX_COMPACT = 4;
const compactClients = computed(() => props.clients.slice(0, MAX_COMPACT));
const remaining = computed(() => props.clients.length - MAX_COMPACT);

const statusCfg: Record<ClientStatus, { label: string; cls: string; icon: Component; iconCls: string }> = {
  Active: { label: 'Ativo', cls: 'sa-badge--emerald', icon: CheckCircle2, iconCls: 'lc__ico--emerald' },
  Blocked: { label: 'Bloqueado', cls: 'sa-badge--rose', icon: Ban, iconCls: 'lc__ico--rose' },
  Analysis: { label: 'Em Análise', cls: 'sa-badge--amber', icon: AlertCircle, iconCls: 'lc__ico--amber' },
  Inactive: { label: 'Inativo', cls: 'sa-badge--slate', icon: Ban, iconCls: 'lc__ico--slate' },
};

// Candidatos a vínculo: o cadastro de clientes, carregado quando o diálogo abre.
const candidates = ref<ContractClient[]>([]);
const loadingCandidates = ref(false);
watch(dialogOpen, async (isOpen) => {
  if (!isOpen || candidates.value.length) return;
  loadingCandidates.value = true;
  try {
    candidates.value = [...(await loadCustomerIndex()).values()].map((c) => toContractClient(c)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  } finally {
    loadingCandidates.value = false;
  }
});

const allocation = (c: ContractClient) =>
  c.allocatedAmount == null ? null : formatCurrencyIn(c.allocatedAmount, props.currency || 'BRL');

const available = computed(() => {
  const q = String(query.value ?? '').toLowerCase();
  const linked = new Set(props.clients.map((c) => c.id));
  return candidates.value.filter(
    (c) =>
      !linked.has(c.id) &&
      (c.name.toLowerCase().includes(q) || c.document.includes(q) || (c.email ?? '').toLowerCase().includes(q) || c.id.includes(q)),
  );
});

function select(c: ContractClient) {
  emit('add', { ...c, linkedDate: new Date().toLocaleDateString('pt-BR') });
  dialogOpen.value = false;
}
</script>

<style scoped lang="scss">
.lc {
  transition: border-color 0.3s, box-shadow 0.3s;

  &--editing {
    border-color: var(--indigo-200);
    box-shadow: 0 0 0 1px var(--indigo-50);
  }

  &__head {
    padding: 10px 12px;
    background: rgba(248, 250, 252, 0.5);
    border-bottom: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
    transition: background 0.15s;
    &:hover { background: rgba(241, 245, 249, 0.5); }
    &--open { border-bottom-color: var(--slate-100); }
  }

  &__title {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-700);
    text-transform: uppercase;
    letter-spacing: 0.025em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__editing {
    font-size: 10px;
    background: var(--indigo-100);
    color: var(--indigo-700);
    padding: 2px 6px;
    border-radius: 999px;
    text-transform: none;
    letter-spacing: 0;
  }

  &__head-right { display: flex; align-items: center; gap: 12px; min-width: 0; }

  &__compact { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 8px;
    font-size: 10px;
    font-weight: 500;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 6px;
    color: var(--slate-600);
    svg { opacity: 0.7; }

    &--blocked { color: var(--rose-600); border-color: var(--rose-200); background: rgba(255, 241, 242, 0.5); }
    &--more { background: var(--slate-50); color: var(--slate-500); border: 1px dashed var(--slate-300); }
  }

  &__chip-name { max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  &__toggle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--slate-400);
    flex-shrink: 0;
  }

  &__list { max-height: 350px; overflow-y: auto; }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 24px;
    border-bottom: 1px solid var(--slate-100);
    transition: background 0.15s;
    &:hover { background: var(--slate-50); .lc__name { color: var(--indigo-900); } }
    &--editing { background: rgba(248, 250, 252, 0.3); }
  }

  &__identity { display: flex; align-items: center; gap: 12px; min-width: 30%; }

  &__avatar {
    padding: 8px;
    border-radius: 50%;
    border: 1px solid;
    display: flex;
    flex-shrink: 0;
    &--pj { background: var(--indigo-50); border-color: var(--indigo-100); color: var(--indigo-600); }
    &--pf { background: var(--sky-50); border-color: var(--sky-100); color: var(--sky-600); }
  }

  &__name { margin: 0; font-size: 14px; font-weight: 600; color: var(--slate-900); transition: color 0.15s; }
  &__doc-row { display: flex; align-items: center; gap: 8px; }
  &__doc { font-size: 12px; color: var(--slate-500); }

  &__type {
    font-size: 10px;
    font-weight: 700;
    color: var(--slate-300);
    padding: 0 4px;
    border: 1px solid var(--slate-200);
    border-radius: 4px;
  }

  &__middle {
    display: none;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 24px;
    @media (min-width: 768px) { display: flex; }
  }

  &__col { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
  &__col-label { color: var(--slate-400); }

  &__doc-level { display: flex; align-items: center; gap: 8px; }

  &__level {
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-700);
    background: var(--slate-100);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--slate-200);
  }

  &__incomplete {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--amber-500);
    box-shadow: 0 0 0 2px #fff;
  }

  &__right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 15%; }
  &__linked { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--slate-600); }
  &__alloc { margin-top: 2px; font-size: 11px; font-weight: 600; color: var(--indigo-600); }

  &__remove { color: var(--rose-400); &:hover { color: var(--rose-600); background: var(--rose-50); } }

  &__add-row {
    padding: 12px;
    background: rgba(248, 250, 252, 0.5);
    display: flex;
    justify-content: center;
  }

  &__add {
    color: var(--slate-500);
    &:before { border: 1px dashed var(--slate-300) !important; }
    &:hover { color: var(--indigo-600); background: var(--indigo-50); }
  }

  :deep(.lc__ico--emerald) { color: var(--emerald-500); }
  :deep(.lc__ico--rose) { color: var(--rose-500); }
  :deep(.lc__ico--slate) { color: var(--slate-500); }
  :deep(.lc__ico--amber) { color: var(--amber-500); }
}

.lc-dlg {
  &__head {
    padding: 16px 16px 8px;
    border-bottom: 1px solid var(--slate-100);
    h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 700;
      color: var(--slate-900);
    }
  }

  &__body { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

  &__results {
    height: 300px;
    overflow-y: auto;
    border: 1px solid var(--slate-100);
    border-radius: 6px;
    background: rgba(248, 250, 252, 0.3);
  }

  &__empty { height: 100%; }
  &__empty-icon { padding: 12px; background: var(--slate-100); border-radius: 50%; display: flex; opacity: 0.6; }

  &__item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--slate-100);
    border-left: 4px solid transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
    &:hover {
      background: rgba(238, 242, 255, 0.5);
      border-left-color: var(--indigo-500);
      .lc-dlg__select { opacity: 1; }
    }
  }

  &__meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--slate-500); }
  &__dot { width: 4px; height: 4px; border-radius: 50%; background: var(--slate-300); }
  &__email { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  &__side { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  &__select { font-size: 10px; font-weight: 700; color: var(--indigo-600); opacity: 0; transition: opacity 0.15s; }

  &__foot {
    padding: 12px;
    background: var(--slate-50);
    border-top: 1px solid var(--slate-100);
    display: flex;
    justify-content: flex-end;
  }
}
</style>
