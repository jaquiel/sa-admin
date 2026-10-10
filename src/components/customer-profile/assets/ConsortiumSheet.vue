<template>
  <AssetSheet
    v-model="open"
    :icon="Scroll"
    title="Adicionar / Editar Consórcio"
    description="Gerencie cotas de consórcios imobiliários, veiculares e serviços."
    save-label="Salvar Consórcio"
    :loading="loading"
    @save="emitSave"
  >
    <SheetSection :icon="FileText" title="Identificação do Consórcio">
      <div class="g12">
        <SaField label="Tipo de Consórcio" class="c4"><SaSelect v-model="form.type" :options="typeOptions" /></SaField>
        <SaField label="Administradora" class="c8">
          <SaInput v-model="form.admin" placeholder="Ex: Porto Seguro, Caixa, Bradesco..." />
        </SaField>
        <SaField label="Corretora / Origem" class="c6"><SaInput v-model="form.broker" placeholder="Ex: Corretora XPTO" /></SaField>
        <SaField label="Grupo" class="c3"><SaInput v-model="form.group" placeholder="0000" /></SaField>
        <SaField label="Cota" class="c3"><SaInput v-model="form.quota" placeholder="000" /></SaField>
      </div>
    </SheetSection>

    <div class="g2">
      <SheetSection :icon="DollarSign" title="Valores Financeiros" fill>
        <div class="stack">
          <SaField label="Valor da Carta de Crédito (R$)"><MoneyInput v-model="form.letter" tone="bold" /></SaField>
          <SaField label="Valor Pago (Total)"><MoneyInput v-model="form.paid" /></SaField>
          <SaField label="Saldo Devedor"><MoneyInput v-model="form.balance" tone="red" /></SaField>
        </div>
      </SheetSection>

      <SheetSection :icon="Calendar" title="Parcelamento" fill>
        <div class="stack">
          <SaField label="Total de Parcelas">
            <SaInput v-model.number="form.totalInstallments" type="number" placeholder="Ex: 180" />
          </SaField>
          <div class="g2 g--tight">
            <SaField label="Pagas">
              <SaInput v-model.number="form.paidInstallments" type="number" placeholder="0" input-class="paid-in" />
            </SaField>
            <SaField label="Restantes">
              <SaInput :model-value="remaining" type="number" placeholder="0" readonly input-class="remaining-in" />
            </SaField>
          </div>
          <div class="progress">
            <div class="progress__track"><div class="progress__bar" :style="{ width: `${percent}%` }" /></div>
            <p>{{ percent }}% quitado</p>
          </div>
        </div>
      </SheetSection>
    </div>

    <SheetSection :icon="Star" title="Situação da Cota" muted>
      <div class="g-quota">
        <SaField label="Status Atual"><SaSelect v-model="form.status" :options="statusOptions" class="white-select" /></SaField>
        <transition name="fade-slide">
          <SaField v-if="form.status === 'contemplado'" label="Forma de Contemplação" class="contemplation">
            <SaSelect v-model="form.contemplation" :options="contemplationOptions" class="blue-select" />
            <p class="contemplation__hint">Informe como ocorreu a contemplação para histórico.</p>
          </SaField>
        </transition>
      </div>
    </SheetSection>

    <SheetSection :icon="FileBadge" title="Documentação do Consórcio" :card="false">
      <div class="g3">
        <DocTile state="sent" badge="Validado" name="Contrato de Adesão" hint="contrato_porto_seguro.pdf" />
        <DocTile state="pending" badge="Pendente" name="Termo de Contemplação" hint="Necessário para liberar crédito" :icon="Star" />
        <DocTile state="empty" name="Extrato / Demonstrativo" hint="Adicionar documento" />
      </div>
    </SheetSection>
  </AssetSheet>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { Calendar, DollarSign, FileBadge, FileText, Scroll, Star } from 'lucide-vue-next';
import AssetSheet from './AssetSheet.vue';
import SheetSection from './SheetSection.vue';
import DocTile from './DocTile.vue';
import SaField from 'components/ui/SaField.vue';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect, { type SaOption } from 'components/ui/SaSelect.vue';
import MoneyInput from 'components/ui/MoneyInput.vue';

const open = defineModel<boolean>({ default: false });
defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ save: [payload: Record<string, unknown>] }>();

const typeOptions: SaOption[] = [
  { label: 'Imobiliário', value: 'imobiliario' },
  { label: 'Veicular', value: 'veicular' },
  { label: 'Serviços', value: 'servicos' },
  { label: 'Máquinas e Equipamentos', value: 'maquinas' },
];
const statusOptions: SaOption[] = [
  { label: 'Não Contemplado (Ativo)', value: 'nao_contemplado' },
  { label: 'Contemplado', value: 'contemplado' },
  { label: 'Cancelado / Excluído', value: 'cancelado' },
  { label: 'Encerrado', value: 'encerrado' },
];
const contemplationOptions: SaOption[] = [
  { label: 'Sorteio', value: 'sorteio' },
  { label: 'Lance Livre', value: 'lance' },
  { label: 'Lance Fixo', value: 'lance_fixo' },
  { label: 'Lance Embutido', value: 'lance_embutido' },
];

const form = reactive({
  type: 'imobiliario', admin: '', broker: '', group: '', quota: '',
  letter: '', paid: '', balance: '',
  totalInstallments: null as number | null,
  paidInstallments: null as number | null,
  status: 'contemplado', contemplation: 'lance',
});

const remaining = computed(() =>
  form.totalInstallments ? Math.max(0, form.totalInstallments - (form.paidInstallments ?? 0)) : null,
);

// Sem dados ainda, mantém os 25% de exemplo do protótipo.
const percent = computed(() => {
  if (!form.totalInstallments) return 25;
  return Math.min(100, Math.round(((form.paidInstallments ?? 0) / form.totalInstallments) * 100));
});

function emitSave() {
  emit('save', { ...form });
}
</script>

<style scoped lang="scss">
@import './sheet-grid.scss';

.g-quota {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.white-select :deep(.q-field__control) {
  background: #fff;
}

.blue-select :deep(.q-field__control) {
  background: var(--blue-50);
  &:before {
    border-color: var(--blue-200);
  }
}
.blue-select :deep(.q-field__native) {
  color: var(--blue-700) !important;
}

.contemplation {
  :deep(.sa-form-field__label) {
    color: var(--blue-700);
  }
  &__hint {
    font-size: 10px;
    color: rgba(37, 99, 235, 0.7);
    margin: 0;
  }
}

:deep(.paid-in) {
  color: var(--green-600);
  font-weight: 500;
}
:deep(.remaining-in) {
  color: var(--slate-500);
}

.progress {
  padding-top: 8px;

  &__track {
    width: 100%;
    height: 10px;
    background: var(--slate-100);
    border-radius: 999px;
    overflow: hidden;
  }

  &__bar {
    height: 10px;
    background: var(--blue-600);
    border-radius: 999px;
    transition: width 0.3s;
  }

  p {
    font-size: 10px;
    color: var(--slate-400);
    margin: 4px 0 0;
    text-align: right;
  }
}
</style>
