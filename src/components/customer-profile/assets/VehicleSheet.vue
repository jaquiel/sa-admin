<template>
  <AssetSheet
    v-model="open"
    :icon="Car"
    title="Adicionar / Editar Veículo"
    description="Preencha os dados completos do veículo."
    save-label="Salvar Veículo"
    :loading="loading"
    @save="emitSave"
  >
    <SheetSection :icon="FileText" title="Identificação do Veículo">
      <div class="g12">
        <SaField label="Tipo do Veículo" class="c3"><SaSelect v-model="form.type" :options="typeOptions" /></SaField>
        <SaField label="Placa" class="c3">
          <SaInput v-model="form.plate" placeholder="ABC-1234" input-class="font-mono text-uppercase" />
        </SaField>
        <SaField label="Ano Fabricação" class="c3"><SaInput v-model="form.yearMade" type="number" placeholder="2023" /></SaField>
        <SaField label="Ano Modelo" class="c3"><SaInput v-model="form.yearModel" type="number" placeholder="2024" /></SaField>
        <SaField label="Marca" class="c4"><SaInput v-model="form.brand" placeholder="Ex: BMW, Honda, Toyota..." /></SaField>
        <SaField label="Modelo" class="c4"><SaInput v-model="form.model" placeholder="Ex: X1, Civic, Corolla..." /></SaField>
        <SaField label="Versão" class="c4"><SaInput v-model="form.version" placeholder="Ex: sDrive20i M Sport..." /></SaField>
      </div>
    </SheetSection>

    <SheetSection :icon="DollarSign" title="Situação Financeira">
      <div class="g3 g--end">
        <SaField label="Valor FIPE (R$)"><MoneyInput v-model="form.fipe" /></SaField>
        <div class="paid-box">
          <div class="paid-box__row">
            <label for="v-paid">Está quitado?</label>
            <q-toggle id="v-paid" v-model="form.paid" color="dark" dense />
          </div>
          <p>Se desativado, habilita saldo devedor.</p>
        </div>
        <SaField label="Restante para Quitação" :class="{ 'is-disabled': form.paid }">
          <MoneyInput v-model="form.remaining" :disable="form.paid" />
        </SaField>
      </div>
    </SheetSection>

    <SheetSection :icon="FileBadge" title="Documentação do Veículo" :card="false">
      <div class="g-docs">
        <DocTile state="sent" name="CRLV Digital 2024" hint="crlv_2024_assinado.pdf" />
        <DocTile state="empty" name="CRV (Recibo de Compra e Venda)" hint="Obrigatório • Nenhum arquivo" />
      </div>
    </SheetSection>

    <SheetSection
      :icon="ImageIcon"
      title="Fotos do Veículo (Vistoria)"
      hint="Adicione as fotos conforme solicitado para validação"
      :card="false"
    >
      <div class="photos photos--5">
        <PhotoTile
          src="https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=600&auto=format&fit=crop"
          label="Diagonal Dianteira"
          caption
          video
        />
        <PhotoTile
          src="https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=600&auto=format&fit=crop"
          label="Diagonal Traseira"
          caption
          video
        />
        <PhotoTile label="Lateral Motorista" video small />
        <PhotoTile label="Lateral Passageiro" video small />
        <PhotoTile label="Foto do Chassi" video small />
      </div>
    </SheetSection>
  </AssetSheet>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Car, DollarSign, FileBadge, FileText, Image as ImageIcon } from 'lucide-vue-next';
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
  { label: 'Carro (Passeio)', value: 'carro' },
  { label: 'Moto', value: 'moto' },
  { label: 'Utilitário / Caminhonete', value: 'utilitario' },
  { label: 'Caminhão', value: 'caminhao' },
];

const form = reactive({
  type: 'carro', plate: '', yearMade: '', yearModel: '', brand: '', model: '', version: '',
  fipe: '', paid: true, remaining: '',
});

function emitSave() {
  emit('save', { ...form });
}
</script>

<style scoped lang="scss">
@import './sheet-grid.scss';

.g-docs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
