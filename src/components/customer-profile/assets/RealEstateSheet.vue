<template>
  <AssetSheet
    v-model="open"
    :icon="Home"
    title="Adicionar / Editar Imóvel"
    description="Preencha os dados completos do patrimônio."
    save-label="Salvar Imóvel"
    :loading="loading"
    @save="emitSave"
  >
    <SheetSection :icon="FileText" title="Identificação do Imóvel">
      <div class="g12">
        <SaField label="Apelido do Imóvel" class="c6">
          <SaInput v-model="form.nickname" placeholder="Ex: Apartamento Centro, Casa de Praia..." />
        </SaField>
        <SaField label="ID Interno" class="c3">
          <SaInput v-model="form.internalId" placeholder="0001" input-class="font-mono" />
        </SaField>
        <SaField label="Tipo" class="c3">
          <SaSelect v-model="form.type" :options="typeOptions" />
        </SaField>
      </div>
    </SheetSection>

    <SheetSection :icon="DollarSign" title="Valor e Situação Financeira">
      <div class="g3 g--end">
        <SaField label="Valor Estimado (R$)"><MoneyInput v-model="form.value" /></SaField>
        <div class="paid-box">
          <div class="paid-box__row">
            <label for="re-paid">Está quitado?</label>
            <q-toggle id="re-paid" v-model="form.paid" color="dark" dense />
          </div>
          <p>Se desativado, habilita saldo devedor.</p>
        </div>
        <SaField label="Restante para Quitação" :class="{ 'is-disabled': form.paid }">
          <MoneyInput v-model="form.remaining" :disable="form.paid" />
        </SaField>
      </div>
    </SheetSection>

    <SheetSection :icon="MapPin" title="Localização">
      <div class="g4">
        <SaField label="CEP"><SaInput v-model="form.zip" placeholder="00000-000" /></SaField>
        <SaField label="Logradouro" class="c-span3"><SaInput v-model="form.street" placeholder="Av. Principal..." /></SaField>
        <SaField label="Número"><SaInput v-model="form.number" placeholder="123" /></SaField>
        <SaField label="Complemento"><SaInput v-model="form.complement" placeholder="Apto 101" /></SaField>
        <SaField label="Bairro"><SaInput v-model="form.district" placeholder="Centro" /></SaField>
        <SaField label="Cidade / UF"><SaInput v-model="form.city" placeholder="São Paulo / SP" /></SaField>
      </div>
    </SheetSection>

    <div class="g2">
      <SheetSection :icon="FileBadge" title="Registro Imobiliário" fill>
        <div class="stack">
          <SaField label="Inscrição Imobiliária (IPTU)"><SaInput v-model="form.iptu" placeholder="000.000.0000-0" /></SaField>
          <SaField label="Número da Matrícula"><SaInput v-model="form.registry" placeholder="123.456" /></SaField>
        </div>
      </SheetSection>

      <SheetSection :icon="Home" title="Características Físicas" fill>
        <div class="stack">
          <div class="g2 g--tight">
            <SaField label="Área Terreno (m²)"><SaInput v-model="form.landArea" placeholder="0" /></SaField>
            <SaField label="Área Construída (m²)"><SaInput v-model="form.builtArea" placeholder="0" /></SaField>
          </div>
          <div v-for="c in counters" :key="c.key" class="counter">
            <span class="counter__label">{{ c.label }}</span>
            <div class="counter__ctl">
              <q-btn flat round dense size="sm" :aria-label="`Diminuir ${c.label}`" @click="form[c.key] = Math.max(0, form[c.key] - 1)">
                <ChevronDown :size="12" />
              </q-btn>
              <span class="counter__value">{{ form[c.key] }}</span>
              <q-btn flat round dense size="sm" :aria-label="`Aumentar ${c.label}`" @click="form[c.key]++">
                <ChevronUp :size="12" />
              </q-btn>
            </div>
          </div>
        </div>
      </SheetSection>
    </div>

    <SheetSection :icon="FileBadge" title="Documentação do Imóvel" :card="false">
      <div class="g3">
        <DocTile state="sent" name="Matrícula do Imóvel" hint="matricula_123456_v2.pdf" />
        <DocTile state="sent" name="IPTU 2024" hint="iptu_capa_2024.jpg" />
        <DocTile state="empty" name="Convenção de Condomínio" hint="Opcional • Nenhum arquivo" />
      </div>
    </SheetSection>

    <SheetSection :icon="ImageIcon" title="Fotos do Imóvel" hint="3 fotos selecionadas" :card="false">
      <div class="photos">
        <PhotoTile
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop"
          label="Interior"
        />
        <PhotoTile
          src="https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=600&auto=format&fit=crop"
          label="Kitchen"
        />
        <PhotoTile
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop"
          label="Exterior"
        />
        <PhotoTile label="Adicionar fotos" />
      </div>
    </SheetSection>
  </AssetSheet>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ChevronDown, ChevronUp, DollarSign, FileBadge, FileText, Home, Image as ImageIcon, MapPin } from 'lucide-vue-next';
import AssetSheet from './AssetSheet.vue';
import SheetSection from './SheetSection.vue';
import DocTile from './DocTile.vue';
import PhotoTile from './PhotoTile.vue';
import SaField from 'components/ui/SaField.vue';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect, { type SaOption } from 'components/ui/SaSelect.vue';
import MoneyInput from 'components/ui/MoneyInput.vue';

const open = defineModel<boolean>({ default: false });
defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ save: [payload: Record<string, unknown>] }>();

const typeOptions: SaOption[] = [
  { label: 'Apartamento', value: 'apto' },
  { label: 'Casa', value: 'casa' },
  { label: 'Terreno', value: 'terreno' },
  { label: 'Comercial', value: 'comercial' },
];

const counters = [
  { key: 'bedrooms' as const, label: 'Quartos' },
  { key: 'bathrooms' as const, label: 'Banheiros' },
];

const form = reactive({
  nickname: '', internalId: '', type: 'apto',
  value: '', paid: true, remaining: '',
  zip: '', street: '', number: '', complement: '', district: '', city: '',
  iptu: '', registry: '', landArea: '', builtArea: '',
  bedrooms: 3, bathrooms: 2,
});

function emitSave() {
  emit('save', { ...form });
}
</script>

<style scoped lang="scss">
@import './sheet-grid.scss';

.counter {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-700);
  }

  &__ctl {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--slate-50);
    padding: 4px;
    border-radius: 6px;
    border: 1px solid var(--slate-200);
    color: var(--slate-400);
  }

  &__value {
    font-size: 14px;
    font-weight: 700;
    width: 16px;
    text-align: center;
    color: var(--slate-900);
  }
}
</style>
