<template>
  <AssetSheet
    v-model="open"
    :icon="TrendingUp"
    title="Adicionar / Editar Investimento"
    description="Registre ativos financeiros externos para consolidação patrimonial."
    save-label="Salvar Investimento"
    :loading="loading"
    @save="emitSave"
  >
    <SheetSection :icon="FileText" title="Identificação da Aplicação">
      <div class="g12">
        <SaField label="Tipo de Investimento" class="c4"><SaSelect v-model="form.type" :options="typeOptions" /></SaField>
        <SaField label="Corretora / Instituição" class="c8">
          <SaInput v-model="form.institution" placeholder="Ex: XP Investimentos, BTG Pactual, Banco Safra..." />
        </SaField>
        <SaField label="Nome do Produto / Aplicação" class="c12">
          <SaInput v-model="form.product" placeholder="Ex: Fundo Verde AM Scena FIC FIM, CDB Banco Master..." />
        </SaField>
      </div>
    </SheetSection>

    <div class="g2">
      <SheetSection :icon="DollarSign" title="Informações Financeiras" fill>
        <div class="stack">
          <SaField label="Valor Inicial Aplicado (R$)"><MoneyInput v-model="form.initial" /></SaField>
          <SaField label="Valor Bruto Atual (R$)"><MoneyInput v-model="form.current" tone="green" /></SaField>
          <SaField label="Data de Início / Aporte"><SaInput v-model="form.startDate" type="date" /></SaField>
        </div>
      </SheetSection>

      <SheetSection :icon="Calendar" title="Prazos e Vencimento" muted fill>
        <div class="stack stack--lg">
          <div class="term">
            <div>
              <label for="inv-term" class="term__label">Prazo Determinado</label>
              <p class="term__hint">O ativo possui data de vencimento?</p>
            </div>
            <q-toggle id="inv-term" v-model="form.hasTerm" color="dark" dense />
          </div>

          <div class="stack" :class="{ 'is-disabled': !form.hasTerm }">
            <SaField label="Data de Vencimento"><SaInput v-model="form.maturity" type="date" :disable="!form.hasTerm" /></SaField>
            <SaField label="Prazo em Meses (Opcional)">
              <SaInput v-model="form.months" type="number" placeholder="Ex: 24" :disable="!form.hasTerm" />
            </SaField>
          </div>

          <div v-if="!form.hasTerm" class="term__free">
            <span class="sa-badge sa-badge--slate">Ativo com liquidez / Prazo livre</span>
          </div>
        </div>
      </SheetSection>
    </div>

    <SheetSection :icon="FileBadge" title="Documentação do Investimento" :card="false">
      <div class="g3">
        <DocTile state="sent" badge="Validado" name="Extrato de Posição" hint="posicao_consolidada_nov24.pdf" />
        <DocTile state="pending" badge="Pendente" name="Nota de Corretagem" hint="Comprovante de execução" />
        <DocTile state="empty" name="Comprovante de Aplicação" hint="TED ou comprovante bancário" />
      </div>
    </SheetSection>
  </AssetSheet>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Calendar, DollarSign, FileBadge, FileText, TrendingUp } from 'lucide-vue-next';
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
  { label: 'Renda Fixa (CDB, LCI, LCA)', value: 'fixa' },
  { label: 'Fundo de Investimento', value: 'fundo' },
  { label: 'Renda Variável / Ações', value: 'variavel' },
  { label: 'Multimercado', value: 'multimercado' },
  { label: 'Externo / Offshore', value: 'offshore' },
  { label: 'Previdência Privada', value: 'previdencia' },
];

const form = reactive({
  type: 'fundo', institution: '', product: '',
  initial: '', current: '', startDate: '',
  hasTerm: false, maturity: '', months: '',
});

function emitSave() {
  emit('save', { ...form });
}
</script>

<style scoped lang="scss">
@import './sheet-grid.scss';

.stack--lg {
  gap: 24px;
}

.term {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fff;
  border: 1px solid var(--slate-200);
  border-radius: 8px;

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--slate-900);
  }

  &__hint {
    font-size: 10px;
    color: var(--slate-500);
    margin: 2px 0 0;
  }

  &__free {
    text-align: center;
    padding: 8px;
    .sa-badge {
      font-weight: 400;
    }
  }
}
</style>
