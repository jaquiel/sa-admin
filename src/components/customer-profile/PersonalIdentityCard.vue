<template>
  <ProfileCard title="Identificação e Contato" :icon="User">
    <CardState :loading="loading" :error="error" :empty="!d" @retry="profile.reload('identification')">
      <div v-if="d" class="pi">
        <div class="pi__grid pi__grid--4">
          <DataField label="Nome Completo" :value="orDash(d.fullName)" />
          <DataField label="Data de Nascimento" :value="birth" />
          <DataField label="Nacionalidade" :value="orDash(d.nationality)" />
          <div class="pi__spacer" />

          <template v-for="doc in d.documents" :key="doc.documentCode + doc.documentTypeId">
            <DataField :label="doc.documentCode" :value="orDash(doc.numberMasked)" />
            <DataField label="Órgão Emissor / UF" :value="issuer(doc)" />
            <DataField label="Data Emissão" :value="formatDate(doc.issuedOn)" />
            <DataField label="Validade" :value="formatDate(doc.expiresOn)" />
          </template>
        </div>

        <hr class="sa-separator" />

        <div class="pi__grid pi__grid--4">
          <DataField label="E-mail Principal" :value="contact(d.primaryEmail)" :icon="Mail" />
          <DataField label="Celular" :value="contact(d.mobilePhone)" :icon="Smartphone" />
          <DataField label="Telefone Secundário" :value="contact(d.secondaryPhone)" :icon="Phone" />
          <DataField label="Preferência">
            <span class="sa-badge sa-badge--slate pi__pref">{{ contactPreferenceLabel(d.contactPreference) }}</span>
          </DataField>
        </div>

        <hr class="sa-separator" />

        <div class="pi__grid pi__grid--addr">
          <div class="pi__span2">
            <DataField label="Endereço Residencial" :value="orDash(addr?.line1)" :icon="MapPin" />
          </div>
          <DataField label="Complemento" :value="orDash(addr?.line2)" />
          <DataField label="País" :value="orDash(addr?.countryIsoCode)" />
          <DataField label="Município / UF" :value="cityUf" />
          <DataField label="CEP" :value="orDash(addr?.postalCode)" />
        </div>
      </div>
    </CardState>
  </ProfileCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Mail, MapPin, Phone, Smartphone, User } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import DataField from './DataField.vue';
import CardState from './CardState.vue';
import { useCustomerProfileStore } from 'stores/customer-profile';
import type { ContactItem, TypedPersonalDocument } from 'src/types/api';
import { ageFrom, formatDate, orDash } from 'src/utils/format';
import { contactPreferenceLabel } from 'src/utils/labels';

const profile = useCustomerProfileStore();
const d = computed(() => profile.data.identification);
const loading = computed(() => profile.loading.identification);
const error = computed(() => profile.errors.identification);
const addr = computed(() => d.value?.residentialAddress ?? null);

const birth = computed(() => {
  const age = ageFrom(d.value?.birthDate);
  return age == null ? formatDate(d.value?.birthDate) : `${formatDate(d.value?.birthDate)} (${age} anos)`;
});
const cityUf = computed(() => [addr.value?.city, addr.value?.stateOrProvince].filter(Boolean).join(' / ') || '—');

const contact = (c: ContactItem | null) => orDash(c?.value ?? c?.valueMasked);
const issuer = (doc: TypedPersonalDocument) => [doc.issuer, doc.issuerState].filter(Boolean).join(' / ') || '—';
</script>

<style scoped lang="scss">
.pi {
  display: flex;
  flex-direction: column;
  gap: 32px;

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 24px;
    column-gap: 32px;

    &--4 {
      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    &--addr {
      gap: 24px;
      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  }

  &__spacer {
    display: none;
    @media (min-width: 1024px) {
      display: block;
    }
  }

  &__span2 {
    @media (min-width: 768px) {
      grid-column: span 2;
    }
  }

  &__pref {
    color: var(--slate-700);
    border-color: transparent;
  }
}
</style>
