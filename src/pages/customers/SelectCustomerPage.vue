<template>
  <div class="sc">
    <!-- Header -->
    <div class="sc__header">
      <div class="sc__container sc__header-inner">
        <div class="sc__title-row">
          <div>
            <h1 class="sc__title">Selecionar Cliente</h1>
            <p class="sc__subtitle">
              Escolha um cliente para acessar suas informações financeiras, patrimoniais e operacionais
            </p>
          </div>
          <q-btn unelevated no-caps class="sa-btn sc__new" @click="createOpen = true">
            <Plus :size="16" class="q-mr-sm" /> Cadastrar Novo Cliente
          </q-btn>
        </div>

        <div class="sc__search">
          <q-input
            v-model="store.filters.search"
            outlined
            class="sa-input sc__search-input"
            placeholder="Buscar cliente por nome, documento, e-mail, ID ou assessor"
            debounce="150"
            hide-bottom-space
          >
            <template #prepend><Search :size="16" /></template>
          </q-input>
        </div>

        <div class="sc__filters-row">
          <div class="sc__filters">
            <SaSelect v-model="store.filters.status" size="sm" width="140px" placeholder="Status" :options="statusOptions" />
            <SaSelect
              v-model="store.filters.classification"
              size="sm"
              width="140px"
              placeholder="Classificação"
              :options="classOptions"
            />
            <SaSelect
              v-model="store.filters.compliance"
              size="sm"
              width="140px"
              placeholder="Compliance"
              :options="complianceOptions"
            />
            <SaSelect v-model="store.filters.docType" size="sm" width="140px" placeholder="Documento" :options="docOptions" />
            <SaSelect v-model="store.filters.sortBy" size="sm" width="160px" placeholder="Ordenar por" :options="sortOptions" />
          </div>

          <div class="sc__toggle" role="group" aria-label="Modo de visualização">
            <button
              type="button"
              :class="{ active: viewMode === 'cards' }"
              title="Visualização em Cards"
              @click="viewMode = 'cards'"
            >
              <LayoutGrid :size="16" />
            </button>
            <button
              type="button"
              :class="{ active: viewMode === 'list' }"
              title="Visualização em Lista"
              @click="viewMode = 'list'"
            >
              <LayoutList :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List -->
    <main class="sc__container sc__main">
      <p class="sc__counter">
        Exibindo <strong>{{ store.sorted.length }}</strong>
        {{ store.sorted.length === 1 ? 'cliente' : 'clientes' }}
      </p>

      <div v-if="store.loading" class="sc__grid">
        <q-skeleton v-for="i in 4" :key="i" height="290px" class="sc__skeleton" />
      </div>

      <!-- Cards -->
      <div v-else-if="viewMode === 'cards'" class="sc__grid">
        <article
          v-for="c in store.sorted"
          :key="c.id"
          class="cc"
          tabindex="0"
          role="button"
          @click="open(c.id)"
          @keydown.enter="open(c.id)"
        >
          <div class="cc__head">
            <UserAvatar
              :src="c.avatar"
              :size="64"
              :fallback-icon="c.type === 'PF' ? User : Building2"
              bordered
              class="cc__avatar"
            />
            <div class="cc__identity">
              <div class="cc__badges">
                <span class="sa-badge sa-badge--outline sa-badge--xs">
                  {{ c.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica' }}
                </span>
                <CustomerBadge kind="status" :value="c.status" />
              </div>
              <h3 class="cc__name">{{ c.name }}</h3>
              <span class="cc__doc font-mono">{{ c.maskedDoc }}</span>
            </div>
            <ChevronRight :size="20" class="cc__chevron" />
          </div>

          <div class="cc__info">
            <div class="cc__info-box">
              <div class="cc__label">Assessor</div>
              <div class="cc__info-value">{{ c.advisor }}</div>
            </div>
            <div class="cc__info-box">
              <div class="cc__label">Último Acesso</div>
              <div class="cc__info-value cc__info-value--sm">{{ c.lastAccess }}</div>
            </div>
          </div>

          <div class="cc__status">
            <div>
              <div class="cc__label cc__label--mb">Classificação</div>
              <CustomerBadge kind="classification" :value="c.classification" />
            </div>
            <div>
              <div class="cc__label cc__label--mb">Compliance</div>
              <CustomerBadge kind="compliance" :value="c.compliance" />
            </div>
            <div>
              <div class="cc__label cc__label--mb">Nível Doc.</div>
              <DocLevelIndicator :level="c.docLevel" />
            </div>
          </div>

          <div class="cc__footer">
            <Clock :size="14" />
            <span>Cliente desde {{ c.createdAt }}</span>
          </div>
        </article>
      </div>

      <!-- Lista -->
      <div v-else class="sa-card">
        <div class="sc__table-wrap">
          <table class="sa-table sc__table">
            <thead>
              <tr>
                <th style="width: 20%" class="sc__th-first">Cliente / ID</th>
                <th style="width: 10%">Classificação</th>
                <th style="width: 12%">Assessor</th>
                <th style="width: 14%">Status / Compliance</th>
                <th style="width: 10%">Nível Doc.</th>
                <th style="width: 16%">Datas</th>
                <th style="width: 4%"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in store.sorted" :key="c.id" class="sc__row" @click="open(c.id)">
                <td class="sc__td-first">
                  <div class="sc__cell-identity">
                    <UserAvatar :src="c.avatar" :size="40" :fallback-icon="c.type === 'PF' ? User : Building2" />
                    <div>
                      <div class="sc__row-name">{{ c.name }}</div>
                      <div class="sc__row-id font-mono">ID: {{ c.id }}</div>
                    </div>
                  </div>
                </td>
                <td><CustomerBadge kind="classification" :value="c.classification" /></td>
                <td><span class="sc__row-advisor">{{ c.advisor }}</span></td>
                <td>
                  <div class="sc__stack">
                    <CustomerBadge kind="status" :value="c.status" />
                    <CustomerBadge kind="compliance" :value="c.compliance" />
                  </div>
                </td>
                <td><DocLevelIndicator :level="c.docLevel" /></td>
                <td>
                  <div class="sc__date-label">Último Acesso</div>
                  <div class="sc__date">{{ c.lastAccess }}</div>
                  <div class="sc__date-label sc__date-label--mt">Cliente Desde</div>
                  <div class="sc__date">{{ c.createdAt }}</div>
                </td>
                <td class="text-right"><ChevronRight :size="16" class="sc__row-chevron" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginação -->
      <div class="sc__pagination">
        <p>Página 1 de 1</p>
        <div class="sc__pages">
          <q-btn outline no-caps dense class="sa-btn sa-btn--outline sc__page-btn" disable label="Anterior" />
          <q-btn outline no-caps dense class="sa-btn sc__page-btn sc__page-btn--active" label="1" />
          <q-btn outline no-caps dense class="sa-btn sa-btn--outline sc__page-btn" disable label="Próximo" />
        </div>
      </div>
    </main>

    <CreateCustomerDialog v-model="createOpen" @created="store.fetchAll(true)" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Building2,
  ChevronRight,
  Clock,
  LayoutGrid,
  LayoutList,
  Plus,
  Search,
  User,
} from 'lucide-vue-next';
import SaSelect, { type SaOption } from 'components/ui/SaSelect.vue';
import UserAvatar from 'components/ui/UserAvatar.vue';
import CustomerBadge from 'components/customers/CustomerBadge.vue';
import DocLevelIndicator from 'components/customers/DocLevelIndicator.vue';
import { useCustomersStore } from 'stores/customers';

// O wizard de cadastro é pesado e só abre sob demanda → chunk separado.
const CreateCustomerDialog = defineAsyncComponent(
  () => import('components/customers/CreateCustomerDialog.vue'),
);

const store = useCustomersStore();
const router = useRouter();
const viewMode = ref<'cards' | 'list'>('cards');
const createOpen = ref(false);

const statusOptions: SaOption[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Ativo', value: 'active' },
  { label: 'Bloqueado', value: 'blocked' },
  { label: 'Inativo', value: 'inactive' },
];
const classOptions: SaOption[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Classe A', value: 'a' },
  { label: 'Classe B', value: 'b' },
  { label: 'Classe C', value: 'c' },
];
const complianceOptions: SaOption[] = [
  { label: 'Todos', value: 'all' },
  { label: 'OK', value: 'ok' },
  { label: 'Pendente', value: 'pending' },
  { label: 'Alerta', value: 'alert' },
];
const docOptions: SaOption[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pessoa Física', value: 'pf' },
  { label: 'Pessoa Jurídica', value: 'pj' },
];
const sortOptions: SaOption[] = [
  { label: 'A-Z', value: 'az' },
  { label: 'Maior patrimônio', value: 'patrimony' },
  { label: 'Último acesso', value: 'recent' },
  { label: 'Risco', value: 'risk' },
  { label: 'Status', value: 'status' },
];

function open(id: string) {
  void router.push({ name: 'customer-profile', params: { id } });
}

onMounted(() => void store.fetchAll());
</script>

<style scoped lang="scss">
.sc {
  min-height: 100vh;
  background: rgba(248, 250, 252, 0.5);
  padding-bottom: 80px;

  &__container {
    max-width: 1600px;
    margin: 0 auto;
    padding-left: 24px;
    padding-right: 24px;
  }

  &__header {
    background: #fff;
    border-bottom: 1px solid var(--slate-200);
    position: sticky;
    top: 0;
    z-index: 20;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  &__header-inner {
    padding-top: 24px;
    padding-bottom: 24px;
  }

  &__title-row {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  &__title {
    font-size: 24px;
    line-height: 32px;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--slate-900);
    margin: 0;
  }

  &__subtitle {
    font-size: 14px;
    color: var(--slate-500);
    margin: 4px 0 0;
  }

  &__new {
    background: var(--blue-600);
    color: #fff;
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    &:hover {
      background: var(--blue-700);
    }
  }

  &__search {
    margin-bottom: 16px;
  }

  &__search-input {
    max-width: 672px;
    :deep(.q-field__control) {
      height: 44px;
    }
    :deep(.q-field__marginal) {
      height: 44px;
      color: var(--slate-400);
    }
  }

  &__filters-row {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    @media (min-width: 1024px) {
      flex-direction: row;
      align-items: center;
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--slate-100);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid var(--slate-200);
    width: fit-content;

    button {
      display: flex;
      padding: 6px;
      border-radius: 6px;
      border: 0;
      background: transparent;
      color: var(--slate-400);
      cursor: pointer;
      transition: all 0.15s;
      &:hover {
        color: var(--slate-600);
      }
      &.active {
        background: #fff;
        color: var(--blue-600);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }
  }

  &__main {
    padding-top: 32px;
    padding-bottom: 32px;
  }

  &__counter {
    font-size: 14px;
    color: var(--slate-600);
    margin: 0 0 24px;
    strong {
      font-weight: 600;
      color: var(--slate-900);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__skeleton {
    border-radius: var(--radius);
  }

  &__table-wrap {
    overflow-x: auto;
  }

  &__table {
    thead tr {
      background: var(--slate-50);
    }
  }

  &__th-first,
  &__td-first {
    padding-left: 24px !important;
  }

  &__row {
    cursor: pointer;
    border-bottom-color: var(--slate-100) !important;
    td {
      padding-top: 16px;
      padding-bottom: 16px;
    }
    &:hover {
      background: rgba(239, 246, 255, 0.3) !important;
    }
    &:hover .sc__row-name {
      color: var(--blue-700);
    }
    &:hover .sc__row-chevron {
      color: var(--blue-500);
    }
    &:hover :deep(.q-avatar) {
      border-color: var(--blue-300);
    }
  }

  &__cell-identity {
    display: flex;
    align-items: center;
    gap: 12px;
    :deep(.q-avatar) {
      border: 1px solid var(--slate-200);
      transition: border-color 0.15s;
    }
  }

  &__row-name {
    font-weight: 700;
    font-size: 14px;
    color: var(--slate-800);
    transition: color 0.15s;
  }

  &__row-id {
    font-size: 10px;
    color: var(--slate-400);
    margin-top: 4px;
  }

  &__row-advisor {
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-700);
  }

  &__stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__date-label {
    font-size: 10px;
    color: var(--slate-400);
    text-transform: uppercase;
    margin-bottom: 2px;
    &--mt {
      margin-top: 4px;
    }
  }

  &__date {
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-700);
  }

  &__row-chevron {
    color: var(--slate-300);
    margin-right: 8px;
  }

  &__pagination {
    margin-top: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    p {
      font-size: 14px;
      color: var(--slate-600);
      margin: 0;
    }
  }

  &__pages {
    display: flex;
    gap: 8px;
  }

  &__page-btn {
    height: 32px;
    padding: 0 12px;
    font-size: 14px;
    &--active {
      background: var(--blue-50) !important;
      color: var(--blue-600) !important;
      &:before {
        border-color: var(--blue-200) !important;
      }
    }
  }
}

/* ---------- Card do cliente ---------- */
.cc {
  border: 1px solid var(--slate-200);
  border-radius: var(--radius);
  background: linear-gradient(to bottom right, var(--slate-50), #fff);
  padding: 24px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  outline: none;

  &:hover,
  &:focus-visible {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }
  &:focus-visible {
    border-color: var(--blue-300);
  }

  &__head {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__avatar {
    transition: border-color 0.15s;
  }
  &:hover &__avatar {
    border-color: var(--blue-300);
  }

  &__identity {
    flex: 1;
    min-width: 0;
  }

  &__badges {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__name {
    font-size: 18px;
    line-height: 28px;
    font-weight: 700;
    color: var(--slate-900);
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s;
  }
  &:hover &__name {
    color: var(--blue-700);
  }

  &__doc {
    font-size: 12px;
    color: var(--slate-500);
  }

  &__chevron {
    color: var(--slate-300);
    flex-shrink: 0;
    transition: color 0.15s;
  }
  &:hover &__chevron {
    color: var(--blue-600);
  }

  &__info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  &__info-box {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid var(--slate-200);
  }

  &__label {
    font-size: 10px;
    color: var(--slate-500);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
    &--mb {
      margin-bottom: 6px;
    }
  }

  &__info-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-900);
    &--sm {
      font-size: 12px;
      color: var(--slate-700);
    }
  }

  &__status {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--slate-200);
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 16px;
    font-size: 12px;
    color: var(--slate-500);
  }
}
</style>
