<template>
  <div class="cp">
    <!-- Header fixo -->
    <header class="cp__header">
      <div class="cp__left">
        <div class="cp__identity">
          <UserAvatar :src="customer?.avatar" :size="56" :initials="initials" bordered class="cp__avatar" />
          <div>
            <div class="cp__name-row">
              <h1 class="cp__name">{{ header?.primaryName ?? customer?.name ?? '—' }}</h1>
              <span class="sa-badge sa-badge--slate cp__type">
                {{ isCompany ? 'Pessoa Jurídica' : 'Pessoa Física' }}
              </span>
            </div>
            <div class="cp__meta">
              <span class="font-mono cp__id" :title="id">ID: {{ shortId }}</span>
              <span>Desde: {{ header ? formatDate(header.createdAtUtc) : (customer?.createdAt ?? '—') }}</span>
              <span>
                Assessor: <a class="cp__advisor">{{ header?.operationalSummary?.advisorName ?? customer?.advisor ?? '—' }}</a>
              </span>
            </div>
          </div>
        </div>

        <div class="cp__divider" />

        <button type="button" class="cp__switch" @click="router.push({ name: 'customers' })">
          <Search :size="16" class="cp__switch-ico" />
          <span class="cp__switch-text">Trocar cliente (Nome, CPF...)</span>
        </button>
      </div>

      <div class="cp__right">
        <div class="cp__indicators">
          <div class="cp__indicator">
            <div class="cp__ind-label">Risco</div>
            <span class="sa-badge sa-badge--green cp__ind-badge">{{ header?.operationalSummary?.riskClassification ?? customer?.classification ?? '—' }}</span>
          </div>
          <div class="cp__indicator">
            <div class="cp__ind-label">Compliance</div>
            <span class="sa-badge cp__ind-badge" :class="complianceBadge.cls">{{ complianceBadge.label }}</span>
          </div>
          <div class="cp__indicator">
            <div class="cp__ind-label">Status</div>
            <span class="sa-badge cp__ind-badge" :class="isActive ? 'sa-badge--green-strong' : 'sa-badge--red'">{{ customerStatusLabel(header?.status) }}</span>
          </div>
        </div>

        <div class="cp__actions">
          <q-btn outline no-caps dense class="sa-btn sa-btn--outline cp__action">
            <ArrowLeftRight :size="16" class="q-mr-sm" /> Comparar
          </q-btn>
          <q-btn outline no-caps dense class="sa-btn sa-btn--outline cp__action">
            <Edit :size="16" class="q-mr-sm" /> Editar
          </q-btn>
          <q-btn flat round dense class="cp__more" aria-label="Ações da conta">
            <MoreVertical :size="20" />
            <q-menu anchor="bottom right" self="top right">
              <q-list dense style="min-width: 200px" class="cp__menu">
                <q-item-label header class="cp__menu-label">Ações da Conta</q-item-label>
                <q-item v-close-popup clickable>
                  <q-item-section avatar><Activity :size="16" /></q-item-section>
                  <q-item-section>Ver Histórico</q-item-section>
                </q-item>
                <q-item v-close-popup clickable :disable="!header" @click="toggleBlock">
                  <q-item-section avatar><ShieldAlert :size="16" /></q-item-section>
                  <q-item-section>{{ isBlocked ? 'Desbloquear Acesso' : 'Bloquear Acesso' }}</q-item-section>
                </q-item>
                <q-separator />
                <q-item v-close-popup clickable class="text-red-600">
                  <q-item-section avatar><LogOut :size="16" /></q-item-section>
                  <q-item-section>Encerrar Conta</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </header>

    <!-- Conteúdo -->
    <div class="cp__scroll">
      <div class="cp__content">
        <div class="cp__grid">
          <div class="cp__main">
            <PersonalIdentityCard />
            <FinancialProfileCard />
            <SecurityCard />
            <SystemPreferencesCard />
            <ConsolidatedWalletCard />
            <BankAccountsCard />
            <AssetRegistryCard />
          </div>
          <aside class="cp__aside">
            <DocumentationCard />
            <ComplianceCard />
          </aside>
        </div>
        <div style="height: 80px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import {
  Activity,
  ArrowLeftRight,
  Edit,
  LogOut,
  MoreVertical,
  Search,
  ShieldAlert,
} from 'lucide-vue-next';
import UserAvatar from 'components/ui/UserAvatar.vue';
import PersonalIdentityCard from 'components/customer-profile/PersonalIdentityCard.vue';
import FinancialProfileCard from 'components/customer-profile/FinancialProfileCard.vue';
import SecurityCard from 'components/customer-profile/SecurityCard.vue';
import SystemPreferencesCard from 'components/customer-profile/SystemPreferencesCard.vue';
import ConsolidatedWalletCard from 'components/customer-profile/ConsolidatedWalletCard.vue';
import BankAccountsCard from 'components/customer-profile/BankAccountsCard.vue';
import AssetRegistryCard from 'components/customer-profile/AssetRegistryCard.vue';
import DocumentationCard from 'components/customer-profile/DocumentationCard.vue';
import ComplianceCard from 'components/customer-profile/ComplianceCard.vue';
import { useCustomersStore } from 'stores/customers';
import { useCustomerProfileStore } from 'stores/customer-profile';
import { changeStatus } from 'src/services/customer-profile.service';
import { formatDate } from 'src/utils/format';
import { customerStatusLabel } from 'src/utils/labels';

const props = defineProps<{ id: string }>();

const router = useRouter();
const $q = useQuasar();
const store = useCustomersStore();
const profile = useCustomerProfileStore();
/** Resumo da lista (aparece na hora); o cabeçalho completo chega com /summary. */
const customer = computed(() => store.items.find((c) => c.id === props.id) ?? null);
const header = computed(() => profile.data.overview?.header ?? null);

const isCompany = computed(() => (header.value ? /company|legal|business/i.test(header.value.kind) : customer.value?.type === 'PJ'));
const isBlocked = computed(() => /block|suspend/i.test(header.value?.status ?? ''));
const isActive = computed(() => /^active$/i.test(header.value?.status ?? ''));
const shortId = computed(() => props.id.slice(0, 8).toUpperCase());
const initials = computed(() =>
  (header.value?.primaryName ?? customer.value?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join(''),
);

const complianceBadge = computed(() => {
  const s = (header.value?.operationalSummary?.complianceStatus ?? '').toLowerCase();
  if (!s) return { label: '—', cls: 'sa-badge--slate' };
  if (/ok|approv|compliant|clear/.test(s)) return { label: 'OK', cls: 'sa-badge--blue' };
  if (/alert|reject|flag|block/.test(s)) return { label: 'Alerta', cls: 'sa-badge--red' };
  return { label: 'Pendente', cls: 'sa-badge--amber' };
});

function toggleBlock() {
  const next = isBlocked.value ? 'Active' : 'Blocked';
  $q.dialog({
    title: isBlocked.value ? 'Desbloquear acesso' : 'Bloquear acesso',
    message: `Alterar o status do cliente para "${customerStatusLabel(next)}"?`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Confirmar', color: isBlocked.value ? 'primary' : 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await changeStatus(props.id, next);
      await profile.reload('overview');
      $q.notify({ type: 'positive', message: 'Status atualizado.' });
    } catch {
      $q.notify({ type: 'negative', message: 'Não foi possível alterar o status.' });
    }
  });
}

watch(
  () => props.id,
  (id) => void profile.load(id),
  { immediate: true },
);
</script>

<style scoped lang="scss">
.cp {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    height: 88px;
    background: #fff;
    border-bottom: 1px solid var(--slate-200);
    position: sticky;
    top: 0;
    z-index: 30;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    gap: 16px;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 1;
    min-width: 0;
  }

  &__identity {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  &__avatar {
    border-color: var(--slate-100);
  }

  &__name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__name {
    font-size: 20px;
    font-weight: 700;
    color: var(--slate-900);
    line-height: 1;
    margin: 0;
    white-space: nowrap;
  }

  &__type {
    font-size: 10px;
    height: 20px;
    padding: 0 6px;
    font-weight: 400;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: var(--slate-500);
    white-space: nowrap;
  }

  &__id {
    color: var(--slate-400);
  }

  &__advisor {
    color: var(--blue-600);
    font-weight: 500;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }

  &__divider {
    display: none;
    height: 32px;
    width: 1px;
    background: var(--slate-200);
    margin: 0 8px;
    @media (min-width: 1600px) {
      display: block;
    }
  }

  &__switch {
    display: none;
    width: 256px;
    min-width: 140px;
    flex-shrink: 1;
    height: 36px;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    color: #717182;
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;
    // o protótipo exibe a partir de xl (1280px), mas ali o cabeçalho transborda; só cabe a partir de 1600px
    @media (min-width: 1600px) {
      display: flex;
    }
    &:hover {
      background: #fff;
    }
  }

  &__switch-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__switch-ico {
    flex-shrink: 0;
    color: var(--slate-400);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__indicators {
    display: none;
    align-items: center;
    gap: 16px;
    margin-right: 16px;
    @media (min-width: 1024px) {
      display: flex;
    }
  }

  &__indicator {
    text-align: center;
  }

  &__ind-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--slate-400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }

  &__ind-badge {
    padding: 2px 10px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    border-left: 1px solid var(--slate-200);
    padding-left: 24px;
  }

  &__action {
    display: none;
    height: 32px;
    min-height: 32px;
    padding: 0 12px;
    font-size: 14px;
    @media (min-width: 768px) {
      display: inline-flex;
    }
  }

  &__more {
    color: var(--slate-500);
  }

  &__menu-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-900);
  }

  &__scroll {
    flex: 1;
  }

  &__content {
    padding: 24px;
    max-width: 1920px;
    margin: 0 auto;
    @media (min-width: 768px) {
      padding: 32px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: start;
    @media (min-width: 1280px) {
      grid-template-columns: repeat(12, 1fr);
    }
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    @media (min-width: 1280px) {
      grid-column: span 8;
    }
    @media (min-width: 1536px) {
      grid-column: span 9;
    }
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    @media (min-width: 1280px) {
      grid-column: span 4;
      position: sticky;
      top: 112px;
    }
    @media (min-width: 1536px) {
      grid-column: span 3;
    }
  }
}
</style>
