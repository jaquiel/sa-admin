<template>
  <ProfileCard title="Segurança da Conta" :icon="Lock">
    <CardState
      :loading="loading"
      :error="error"
      :empty="!sec"
      empty-text="Cliente sem acesso à Área do Cliente."
      @retry="profile.reload('overview')"
    >
      <div v-if="sec" class="sec__grid">
        <DataField label="Usuário" :value="orDash(sec.userName ?? sec.email)" />
        <DataField label="Senha" value="••••••••" masked />
        <DataField label="Status Senha">
          <span :class="passwordOk ? 'sec__ok' : 'sec__warn'">
            <CheckCircle2 v-if="passwordOk" :size="12" /> {{ passwordLabel }}
          </span>
        </DataField>
        <DataField label="Último Login" :value="formatDateTime(sec.lastLoginAtUtc, ' às ')" />
        <DataField label="2FA">
          <span class="sa-badge" :class="sec.twoFactorEnabled ? 'sec__2fa' : 'sa-badge--slate'">
            {{ sec.twoFactorEnabled ? 'Ativo' : 'Inativo' }}
          </span>
        </DataField>
      </div>
    </CardState>
  </ProfileCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, Lock } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import DataField from './DataField.vue';
import CardState from './CardState.vue';
import { useCustomerProfileStore } from 'stores/customer-profile';
import { formatDateTime, orDash } from 'src/utils/format';

// O histórico de sessões do protótipo não tem endpoint de admin (só /users/me/sessions, do próprio usuário).
const profile = useCustomerProfileStore();
const sec = computed(() => profile.data.overview?.accountSecurity ?? null);
const loading = computed(() => profile.loading.overview);
const error = computed(() => profile.errors.overview);

const passwordOk = computed(() => /active|set|ok|valid/i.test(sec.value?.passwordStatus ?? ''));
const passwordLabel = computed(() => {
  const s = sec.value?.passwordStatus;
  if (!s) return '—';
  if (passwordOk.value) return 'Ativa';
  if (/expired/i.test(s)) return 'Expirada';
  if (/reset|pending/i.test(s)) return 'Redefinição pendente';
  if (/notset|none/i.test(s)) return 'Não definida';
  return s;
});
</script>

<style scoped lang="scss">
.sec {
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 768px) {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  &__ok {
    color: var(--green-600);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__2fa {
    background: var(--green-100);
    color: var(--green-700);
    border-color: var(--green-200);
  }

  &__warn {
    color: var(--amber-600);
  }
}
</style>
