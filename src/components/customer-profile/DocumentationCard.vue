<template>
  <ProfileCard title="Documentação" :icon="FileCheck">
    <template v-if="docs" #subheader>
      <div class="doc__counts">
        <span class="text-green-600">{{ counts.approved }} Aprovados</span>
        <span class="doc__pipe">|</span>
        <span class="text-amber-600">{{ counts.pending }} Pendentes</span>
        <span class="doc__pipe">|</span>
        <span class="text-red-600">{{ counts.rejected }} Rejeitado{{ counts.rejected === 1 ? '' : 's' }}</span>
      </div>
    </template>

    <CardState
      :loading="loading"
      :error="error"
      :empty="!categories.length"
      empty-text="Nenhum documento exigido ou enviado."
      @retry="profile.reload('documents')"
    >
      <div class="doc__body">
        <div v-for="(cat, i) in categories" :key="cat.key" class="doc__cat">
          <div class="doc__cat-head">
            <h5>{{ i + 1 }}. {{ cat.title }}</h5>
            <q-btn flat round dense size="sm" class="doc__cat-toggle" :aria-expanded="isOpen(cat.key, i)" @click="toggle(cat.key, i)">
              <ChevronUp v-if="isOpen(cat.key, i)" :size="16" />
              <ChevronDown v-else :size="16" />
            </q-btn>
          </div>

          <q-slide-transition>
            <div v-show="isOpen(cat.key, i)">
              <DocItem v-for="d in cat.items" :key="d.key" :name="d.name" :status="d.status" :date="d.date" />
            </div>
          </q-slide-transition>
        </div>
      </div>
    </CardState>
  </ProfileCard>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { ChevronDown, ChevronUp, FileCheck } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import DocItem from './DocItem.vue';
import CardState from './CardState.vue';
import { useCustomerProfileStore } from 'stores/customer-profile';
import { formatDate } from 'src/utils/format';
import { docTone } from 'src/utils/labels';

const profile = useCustomerProfileStore();
const docs = computed(() => profile.data.documents);
const loading = computed(() => profile.loading.documents);
const error = computed(() => profile.errors.documents);

const STATUS = { approved: 'Aprovado', pending: 'Pendente', missing: 'Pendente', rejected: 'Rejeitado' } as const;

const categories = computed(() =>
  (docs.value?.sections ?? []).map((sec) => ({
    key: sec.categoryId ?? sec.code,
    title: sec.name,
    items: sec.items.map((it, idx) => ({
      key: it.documentId ?? it.requirementId ?? `${it.documentTypeId}-${idx}`,
      name: it.documentTypeName,
      status: STATUS[docTone(it.status)],
      date: it.submittedAtUtc ? formatDate(it.submittedAtUtc) : '',
    })),
  })),
);

// Totais vêm da API; "Pendentes" inclui pendentes, em análise e faltantes.
const counts = computed(() => {
  const c = docs.value?.counters;
  const n = (v: number | string | undefined) => Number(v ?? 0);
  return {
    approved: n(c?.approved),
    pending: n(c?.pending) + n(c?.inReview) + n(c?.missing),
    rejected: n(c?.rejected),
  };
});

// As duas primeiras categorias começam abertas, como no protótipo.
const openCats = reactive<Record<string, boolean>>({});
const isOpen = (key: string, i: number) => openCats[key] ?? i < 2;
const toggle = (key: string, i: number) => (openCats[key] = !isOpen(key, i));
</script>

<style scoped lang="scss">
.doc {
  &__counts {
    display: flex;
    gap: 12px;
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
  }

  &__pipe {
    color: var(--slate-300);
    font-weight: 400;
  }

  &__body {
    margin: -8px;
    padding: 0;
  }

  &__cat {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  &__cat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    h5 {
      font-size: 12px;
      font-weight: 700;
      color: var(--slate-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }
  }

  &__cat-toggle {
    color: var(--slate-400);
    &:hover {
      color: var(--slate-600);
    }
  }

  &__groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__group {
    border-left: 2px solid var(--blue-300);
    padding-left: 12px;
    &--purple {
      border-left-color: #d8b4fe;
    }
  }

  &__group-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-700);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__group-ico {
    color: var(--blue-600);
  }
  &__group--purple &__group-ico {
    color: #9333ea;
  }
}
</style>
