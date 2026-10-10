<template>
  <ProfileCard title="Profissional e Financeiro" :icon="Briefcase">
    <CardState :loading="loading" :error="error" :empty="!pro && !fin" @retry="profile.reload('overview')">
      <div class="fp">
        <div class="fp__span2"><DataField label="Profissão" :value="orDash(pro?.occupation)" /></div>
        <div class="fp__span3"><DataField label="Empresa" :value="orDash(pro?.employerName)" /></div>
        <DataField label="Renda Mensal Individual" :value="formatMoney(fin?.individualMonthlyIncome, currency)" />
        <DataField label="Renda Familiar" :value="formatMoney(fin?.householdMonthlyIncome, currency)" />
        <DataField label="Patrimônio Declarado">
          <span class="fp__muted">{{ formatMoney(fin?.declaredNetWorth, currency) }}</span>
        </DataField>
      </div>
    </CardState>
  </ProfileCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Briefcase } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import DataField from './DataField.vue';
import CardState from './CardState.vue';
import { useCustomerProfileStore } from 'stores/customer-profile';
import { formatMoney, orDash } from 'src/utils/format';

const profile = useCustomerProfileStore();
const pro = computed(() => profile.data.overview?.professionalProfile ?? null);
const fin = computed(() => profile.data.overview?.financialProfile ?? null);
const currency = computed(() => fin.value?.currencyCode ?? 'BRL');
const loading = computed(() => profile.loading.overview);
const error = computed(() => profile.errors.overview);
</script>

<style scoped lang="scss">
.fp {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr);
  }

  &__span2 {
    @media (min-width: 1024px) {
      grid-column: span 2;
    }
  }
  &__span3 {
    @media (min-width: 1024px) {
      grid-column: span 3;
    }
  }
  &__muted {
    color: var(--slate-500);
    font-weight: 400;
  }
}
</style>
