<template>
  <ProfileCard title="Registro de Patrimônio" :icon="Home" subtitle="Ativos, bens e participações declarados pelo cliente.">
    <CardState
      v-if="!profile.data.assets"
      :loading="profile.loading.assets"
      :error="profile.errors.assets"
      :empty="true"
      @retry="profile.reload('assets')"
    />

    <template v-for="(group, gi) in groups" v-else :key="group.kind">
      <hr v-if="gi > 0" class="sa-separator ar__sep" />
      <div :class="{ ar__group: gi < groups.length - 1 }">
        <div class="ar__group-head">
          <h4><component :is="group.icon" v-if="gi > 0" :size="16" class="ar__ico" /> {{ group.title }}</h4>
          <q-btn flat dense no-caps class="sa-btn ar__add" @click="sheet = group.kind">
            <Plus :size="12" class="q-mr-xs" /> {{ group.addLabel }}
          </q-btn>
        </div>

        <div v-if="!group.items.length" class="ar__none">Nenhum item cadastrado.</div>

        <AssetAccordion
          v-for="a in group.items"
          :key="a.id"
          :icon="group.icon"
          v-bind="a.contemplated ? { variant: 'success' as const } : {}"
          :title="a.title"
          :subtitle="a.subtitle"
          :details="a.details"
          :docs-count="docsLabel(a.id)"
          @opened="loadDocs(a.id)"
          @remove="remove(a.id, a.title)"
        >
          <template v-if="a.contemplated && a.contemplation" #subtitle>
            <div class="ar__sub">
              <div>{{ a.subtitle }}</div>
              <div class="ar__contemplated"><Star :size="12" class="ar__star" /> Contemplação por {{ a.contemplation }}</div>
            </div>
          </template>
          <template #status>
            <div v-if="a.note" class="ar__st-col">
              <span class="sa-badge ar__st" :class="`ar__st--${a.badge.tone}`">{{ a.badge.label }}</span>
              <span class="ar__st-note">{{ a.note }}</span>
            </div>
            <span v-else class="sa-badge ar__st" :class="`ar__st--${a.badge.tone}`">
              <Star v-if="a.contemplated" :size="12" class="ar__star" />
              <Clock v-else-if="a.badge.clock" :size="12" />
              {{ a.badge.label }}
            </span>
          </template>

          <div v-if="a.facts.length" class="aa__full ar__facts">
            <DataField v-for="f in a.facts" :key="f.label" :label="f.label" :value="f.value" />
          </div>

          <div v-if="docs[a.id]?.loading" class="aa__full ar__empty">Carregando documentos…</div>
          <div v-else-if="docs[a.id]?.error" class="aa__full ar__empty">Não foi possível carregar os documentos.</div>
          <div v-else-if="docs[a.id] && !docs[a.id]!.items.length" class="aa__full ar__empty">Nenhum documento vinculado ainda.</div>
          <StandardDocRow
            v-for="d in docs[a.id]?.items ?? []"
            :key="d.documentId"
            :name="d.documentTypeName"
            :status="docTone(d.documentStatus)"
            :date="formatDate(d.linkedAtUtc)"
          />
        </AssetAccordion>
      </div>
    </template>

    <!-- Drawers de cadastro (cada um num chunk próprio) -->
    <RealEstateSheet v-if="mounted.real_estate" :model-value="sheet === 'real_estate'" :loading="saving" @update:model-value="onClose" @save="add('real_estate', $event)" />
    <VehicleSheet v-if="mounted.vehicle" :model-value="sheet === 'vehicle'" :loading="saving" @update:model-value="onClose" @save="add('vehicle', $event)" />
    <ConsortiumSheet v-if="mounted.consortium" :model-value="sheet === 'consortium'" :loading="saving" @update:model-value="onClose" @save="add('consortium', $event)" />
    <InvestmentSheet v-if="mounted.investment" :model-value="sheet === 'investment'" :loading="saving" @update:model-value="onClose" @save="add('investment', $event)" />
  </ProfileCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, watch, type Component } from 'vue';
import { useQuasar } from 'quasar';
import { Car, Clock, Home, Plus, Scroll, Star, TrendingUp } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import DataField from './DataField.vue';
import CardState from './CardState.vue';
import AssetAccordion from './assets/AssetAccordion.vue';
import StandardDocRow from './assets/StandardDocRow.vue';
import { ASSET_KIND, toAssetRequest, validateAsset, type SheetKind } from './assets/asset-request';
import { useCustomerProfileStore } from 'stores/customer-profile';
import * as service from 'src/services/customer-profile.service';
import type { CustomerAsset, CustomerAssetDocument } from 'src/types/api';
import { apiErrorMessage } from 'src/services/api-envelope';
import { formatDate, formatMoney } from 'src/utils/format';
import { contemplationLabel, docTone, quotaStatusLabel } from 'src/utils/labels';

const RealEstateSheet = defineAsyncComponent(() => import('./assets/RealEstateSheet.vue'));
const VehicleSheet = defineAsyncComponent(() => import('./assets/VehicleSheet.vue'));
const ConsortiumSheet = defineAsyncComponent(() => import('./assets/ConsortiumSheet.vue'));
const InvestmentSheet = defineAsyncComponent(() => import('./assets/InvestmentSheet.vue'));

const $q = useQuasar();
const profile = useCustomerProfileStore();

const sheet = ref<SheetKind | null>(null);
const saving = ref(false);

/** só monta (e baixa) o drawer na primeira vez que é aberto */
const mounted = reactive<Record<SheetKind, boolean>>({
  real_estate: false,
  vehicle: false,
  consortium: false,
  investment: false,
});
watch(sheet, (k) => {
  if (k) mounted[k] = true;
});

interface Row {
  id: string;
  title: string;
  subtitle: string;
  details: string;
  badge: { label: string; tone: 'green' | 'green-strong' | 'amber' | 'slate'; clock?: boolean };
  note?: string;
  contemplated?: boolean;
  contemplation?: string | undefined;
  facts: Array<{ label: string; value: string }>;
}

const money = (v: number | string | null | undefined) => formatMoney(v);
const join = (...parts: Array<string | number | null | undefined>) => parts.filter((p) => p != null && p !== '').join(' • ');

/** Quitado / Financiado (resta X) a partir do saldo devedor. */
function payoffBadge(a: CustomerAsset): Pick<Row, 'badge' | 'note'> {
  const remaining = Number(a.remainingBalance ?? 0);
  return remaining > 0
    ? { badge: { label: 'Financiado', tone: 'amber' }, note: `Resta ${formatMoney(remaining, 'BRL', true)}` }
    : { badge: { label: 'Quitado', tone: 'green' } };
}

function toRow(a: CustomerAsset): Row {
  const title = a.nickname ?? 'Sem identificação';
  if (a.realEstate) {
    const r = a.realEstate;
    const street = [r.addressLine, r.number].filter(Boolean).join(', ');
    const city = [r.city, r.state].filter(Boolean).join('/');
    return { id: a.id, title, subtitle: [street, city].filter(Boolean).join(' - '), details: money(a.declaredValue), facts: [], ...payoffBadge(a) };
  }
  if (a.vehicle) {
    const v = a.vehicle;
    return {
      id: a.id, title, subtitle: join(v.licensePlate && `Placa: ${v.licensePlate}`, v.modelYear && `Ano ${v.modelYear}`),
      details: money(a.declaredValue), facts: [], ...payoffBadge(a),
    };
  }
  if (a.consortium) {
    const c = a.consortium;
    const contemplated = /^contemplated$/i.test(c.quotaStatus ?? '');
    return {
      id: a.id,
      title,
      subtitle: join(c.administrator && `Adm: ${c.administrator}`, c.groupNumber && `Grupo ${c.groupNumber} / Cota ${c.quotaNumber ?? '—'}`),
      details: `Carta: ${money(a.declaredValue)}`,
      contemplated,
      contemplation: c.contemplationMethod ? contemplationLabel(c.contemplationMethod) : undefined,
      badge: { label: quotaStatusLabel(c.quotaStatus), tone: contemplated ? 'green-strong' : 'slate', clock: !contemplated },
      facts: [
        { label: 'Valor da Carta', value: money(a.declaredValue) },
        { label: 'Parcelas', value: `${c.paidInstallments ?? '—'} / ${c.totalInstallments ?? '—'}` },
        { label: 'Valor Pago', value: money(c.amountPaid) },
        { label: 'Saldo Devedor', value: money(a.remainingBalance) },
      ],
    };
  }
  if (a.investment) {
    const i = a.investment;
    return {
      id: a.id,
      title,
      subtitle: join(i.institution, i.productName !== title ? i.productName : null),
      details: money(a.declaredValue ?? i.initialAmount),
      badge: i.hasFixedTerm
        ? { label: `Vence ${formatDate(i.maturityDate)}`, tone: 'slate' }
        : { label: 'Sem Vencimento', tone: 'slate' },
      facts: [],
    };
  }
  return { id: a.id, title, subtitle: a.assetType, details: money(a.declaredValue), badge: { label: a.status, tone: 'slate' }, facts: [] };
}

const GROUPS: Array<{ kind: SheetKind; title: string; addLabel: string; icon: Component }> = [
  { kind: 'real_estate', title: 'Imóveis', addLabel: 'Adicionar Imóvel', icon: Home },
  { kind: 'vehicle', title: 'Veículos', addLabel: 'Adicionar Veículo', icon: Car },
  { kind: 'consortium', title: 'Consórcios', addLabel: 'Adicionar Consórcio', icon: Scroll },
  { kind: 'investment', title: 'Investimentos (Ativos Externos)', addLabel: 'Adicionar Investimento', icon: TrendingUp },
];

const groups = computed(() => {
  const active = (profile.data.assets ?? []).filter((a) => !a.archivedAtUtc && !/archiv/i.test(a.status));
  return GROUPS.map((g) => ({
    ...g,
    items: active.filter((a) => a.assetType.toLowerCase() === ASSET_KIND[g.kind].toLowerCase()).map(toRow),
  }));
});

// ---- documentos por ativo (carregados ao expandir) ----

const docs = reactive<Record<string, { loading: boolean; error: boolean; items: CustomerAssetDocument[] }>>({});

async function loadDocs(assetId: string) {
  const id = profile.customerId;
  if (!id || docs[assetId]?.items.length || docs[assetId]?.loading) return;
  docs[assetId] = { loading: true, error: false, items: [] };
  try {
    docs[assetId] = { loading: false, error: false, items: await service.listAssetDocuments(id, assetId) };
  } catch {
    docs[assetId] = { loading: false, error: true, items: [] };
  }
}

const docsLabel = (assetId: string) => {
  const d = docs[assetId];
  return d && !d.loading && !d.error ? `${d.items.length} docs` : 'Docs';
};

// ---- cadastro / remoção ----

function onClose(v: boolean) {
  if (!v) sheet.value = null;
}

async function add(kind: SheetKind, form: Record<string, unknown>) {
  const id = profile.customerId;
  if (!id) return;
  saving.value = true;
  try {
    // Os formulários são em R$; a API exige o UUID da moeda.
    const currencyId = await service.resolveCurrencyId('BRL', profile.data.portfolio);
    if (!currencyId) {
      $q.notify({ type: 'negative', message: 'Moeda BRL não encontrada no backend (portfólio ou catálogo de mercados).' });
      return;
    }
    const body = toAssetRequest(kind, form, currencyId);
    const problems = validateAsset(kind, body);
    if (problems.length) {
      $q.notify({ type: 'warning', message: problems.join(' '), timeout: 6000 });
      return;
    }
    await service.createAsset(id, body);
    await profile.reload('assets');
    sheet.value = null;
    $q.notify({ type: 'positive', message: 'Item de patrimônio cadastrado.' });
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e, 'Não foi possível cadastrar o item.'), timeout: 6000 });
  } finally {
    saving.value = false;
  }
}

function remove(assetId: string, title: string) {
  $q.dialog({
    title: 'Remover item',
    message: `Arquivar "${title}" do patrimônio do cliente?`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Arquivar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    const id = profile.customerId;
    if (!id) return;
    try {
      await service.archiveAsset(id, assetId);
      await profile.reload('assets');
    } catch {
      $q.notify({ type: 'negative', message: 'Não foi possível remover o item.' });
    }
  });
}
</script>

<style scoped lang="scss">
.ar {
  &__group {
    margin-bottom: 32px;
  }

  &__group-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--slate-800);
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
  }

  &__ico {
    color: var(--blue-600);
  }

  &__add {
    height: 28px;
    min-height: 28px;
    font-size: 12px;
    color: var(--blue-600);
    padding: 0 8px;
    &:hover {
      background: var(--blue-50);
    }
  }

  &__sep {
    margin: 32px 0;
  }

  &__st {
    &--green {
      color: var(--green-600);
      border-color: var(--green-200);
      background: var(--green-50);
    }
    &--green-strong {
      background: var(--green-100);
      color: var(--green-700);
      border-color: var(--green-200);
    }
    &--amber {
      color: var(--amber-600);
      border-color: var(--amber-200);
      background: var(--amber-50);
      margin-bottom: 2px;
    }
    &--slate {
      color: var(--slate-500);
      border-color: var(--slate-200);
      background: var(--slate-50);
    }
  }

  &__st-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  &__st-note {
    font-size: 10px;
    color: var(--slate-400);
  }

  &__sub {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__contemplated {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--green-700);
    font-weight: 500;
    font-size: 11px;
    background: rgba(220, 252, 231, 0.5);
    width: fit-content;
    padding: 2px 8px;
    border-radius: 4px;
  }

  &__star {
    fill: currentColor;
  }

  &__facts {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    background: var(--slate-50);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 8px;
    border: 1px solid var(--slate-100);
    @media (min-width: 768px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__green {
    color: var(--green-600);
    font-weight: 700;
  }

  &__empty {
    text-align: center;
    padding: 16px 0;
    font-size: 14px;
    color: var(--slate-500);
    font-style: italic;
  }
}

.ar__none {
  font-size: 13px;
  color: var(--slate-500);
  padding: 4px 0 8px;
}
</style>
