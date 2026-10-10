<template>
  <div class="sa-page">
    <div class="sa-page__inner">
      <!-- Cabeçalho -->
      <div class="clp__header">
        <div>
          <h1 class="sa-page__title">Parâmetros de Lógica</h1>
          <p class="sa-page__subtitle">Gestão e análise da lógica contratual vinculada.</p>
        </div>

        <div class="clp__actions">
          <label class="clp__switch">
            <q-toggle v-model="showProjection" color="indigo-7" dense />
            <span>Projeção</span>
          </label>

          <q-btn outline no-caps class="sa-btn sa-btn--outline" @click="showParams = !showParams">
            <EyeOff v-if="showParams" :size="16" class="q-mr-sm" />
            <Eye v-else :size="16" class="q-mr-sm" />
            {{ showParams ? 'Ocultar Parâmetros' : 'Ver Parâmetros' }}
          </q-btn>

          <template v-if="editing">
            <q-btn flat no-caps class="sa-btn sa-btn--ghost" @click="editing = false">
              <X :size="16" class="q-mr-sm" /> Cancelar
            </q-btn>
            <q-btn unelevated no-caps class="sa-btn sa-btn--primary" @click="save">
              <Save :size="16" class="q-mr-sm" /> Salvar
            </q-btn>
          </template>
          <q-btn v-else outline no-caps class="sa-btn sa-btn--outline" @click="startEdit">
            <Edit2 :size="16" class="q-mr-sm" /> Editar
          </q-btn>

          <q-btn unelevated no-caps class="sa-btn clp__back" @click="router.push({ name: 'contract-detail', params: { id } })">
            <ArrowLeft :size="16" class="q-mr-sm" /> Ver Contrato
          </q-btn>
        </div>
      </div>

      <!-- Parâmetros -->
      <transition name="fade-slide">
        <section v-if="showParams" class="sa-card">
          <header class="clp__card-head">
            <span class="clp__icon"><Activity :size="16" /></span>
            <h2>Definições da Lógica</h2>
          </header>
          <div class="clp__params">
            <div class="clp__param clp__param--name">
              <label>Nome da Lógica</label>
              <SaInput v-if="editing" v-model="buffer.name" input-class="clp__bold" />
              <div v-else class="clp__value clp__value--name">{{ params.name }}</div>
            </div>
            <div class="clp__param">
              <label>Delta</label>
              <SaInput v-if="editing" v-model.number="buffer.delta" type="number" />
              <div v-else class="clp__value font-mono">{{ params.delta.toFixed(2) }}</div>
            </div>
            <div class="clp__spacer clp__spacer--2" />

            <div v-for="f in factorFields" :key="f.key" class="clp__param">
              <label>{{ f.label }}</label>
              <SaInput v-if="editing" v-model.number="buffer[f.key]" type="number" />
              <div v-else class="clp__value font-mono">{{ params[f.key].toFixed(2) }}%</div>
            </div>
            <div class="clp__spacer" />

            <div v-for="f in boundFields" :key="f.key" class="clp__param">
              <label>{{ f.label }}</label>
              <SaInput v-if="editing" v-model.number="buffer[f.key]" type="number" />
              <div v-else class="clp__value font-mono" :class="f.cls">{{ f.sign }}{{ params[f.key].toFixed(2) }}</div>
            </div>
          </div>
        </section>
      </transition>

      <!-- Indicadores -->
      <div class="clp__indicators">
        <section v-for="ind in contractLogicIndicators" :key="ind.label" class="sa-card clp__ind">
          <div class="clp__ind-top">
            <span>{{ ind.label }}</span>
            <TrendingUp v-if="ind.trend === 'up'" :size="16" class="text-emerald-600" />
            <TrendingDown v-else-if="ind.trend === 'down'" :size="16" class="text-rose-600" />
            <Activity v-else :size="16" class="text-slate-400" />
          </div>
          <div>
            <div class="clp__ind-value" :class="`clp__ind-value--${ind.trend}`">{{ ind.value }}</div>
            <p class="clp__ind-cmp">{{ ind.comparison }}</p>
          </div>
        </section>
      </div>

      <!-- Performance histórica -->
      <section class="sa-card">
        <header class="clp__card-head clp__card-head--between">
          <div class="clp__card-title">
            <BarChart3 :size="20" class="text-indigo-600" />
            <h2>Performance Histórica</h2>
          </div>
          <q-btn flat no-caps dense class="sa-btn clp__link">
            Ver histórico completo <ExternalLink :size="12" class="q-ml-xs" />
          </q-btn>
        </header>
        <div class="clp__scroll">
          <table class="clp__table">
            <thead>
              <tr>
                <th class="clp__sticky">Indicador</th>
                <th v-for="r in contractLogicHistory" :key="r.date">{{ r.date }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="clp__sticky">Preço do Papel [R$]</td>
                <td v-for="r in contractLogicHistory" :key="r.date" class="font-mono clp__muted-600">R$ {{ r.price.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="clp__sticky">Variação Diária [%]</td>
                <td v-for="r in contractLogicHistory" :key="r.date" class="font-mono" :class="tone(r.variation)">{{ r.variation.toFixed(2) }}%</td>
              </tr>
              <tr>
                <td class="clp__sticky">Preço de Abertura</td>
                <td v-for="r in contractLogicHistory" :key="r.date" class="font-mono clp__muted">{{ r.open.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="clp__sticky">Preço de Fechamento</td>
                <td v-for="r in contractLogicHistory" :key="r.date" class="font-mono clp__muted">{{ r.close.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="clp__sticky">Osc. Máx. Negativa</td>
                <td v-for="r in contractLogicHistory" :key="r.date" class="font-mono" :class="tone(r.maxNegOsc)">{{ r.maxNegOsc.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="clp__sticky">Osc. Máx. Positiva</td>
                <td v-for="r in contractLogicHistory" :key="r.date" class="font-mono" :class="tone(r.maxPosOsc)">{{ r.maxPosOsc.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="clp__sticky">Média de Oscilação</td>
                <td v-for="r in contractLogicHistory" :key="r.date" class="font-mono clp__muted">{{ r.avgOsc.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import {
  contractLogicHistory,
  contractLogicIndicators,
  contractLogicParams,
  findContract,
  type ContractLogicParams,
} from 'src/mocks/contracts';

const props = defineProps<{ id: string }>();
const router = useRouter();

type NumKey = Exclude<keyof ContractLogicParams, 'name'>;

const initial = { ...contractLogicParams, name: findContract(props.id)?.contractLogic ?? contractLogicParams.name };
const params = reactive<ContractLogicParams>({ ...initial });
const buffer = reactive<ContractLogicParams>({ ...initial });

const editing = ref(false);
const showParams = ref(true);
const showProjection = ref(false);

const factorFields: { key: NumKey; label: string }[] = [
  { key: 'dailyFactor', label: 'Fator Diário (%)' },
  { key: 'monthlyFactor', label: 'Fator Mensal (%)' },
  { key: 'annualFactor', label: 'Fator Anual (%)' },
];

const boundFields: { key: NumKey; label: string; cls: string; sign: string }[] = [
  { key: 'maxUpperBound', label: 'Osc. Sup. Máxima', cls: 'text-emerald-700', sign: '+' },
  { key: 'minUpperBound', label: 'Osc. Sup. Mínima', cls: 'clp__emerald-soft', sign: '+' },
  { key: 'maxLowerBound', label: 'Osc. Inf. Máxima', cls: 'text-rose-700', sign: '' },
  { key: 'minLowerBound', label: 'Osc. Inf. Mínima', cls: 'clp__rose-soft', sign: '' },
];

const tone = (v: number) => (v >= 0 ? 'text-emerald-700' : 'text-rose-700');

function startEdit() {
  Object.assign(buffer, params);
  editing.value = true;
}

function save() {
  for (const k of Object.keys(buffer) as (keyof ContractLogicParams)[]) {
    if (k !== 'name') buffer[k] = Number(buffer[k]) || 0;
  }
  Object.assign(params, buffer);
  editing.value = false;
}
</script>

<style scoped lang="scss">
.clp {
  &__header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    @media (min-width: 768px) { flex-direction: row; align-items: center; }
  }

  &__actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

  &__switch {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    margin-right: 8px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-700);
    cursor: pointer;
  }

  &__back { background: var(--slate-900); color: #fff; &:hover { background: var(--slate-800); } }

  &__card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--slate-100);
    background: rgba(248, 250, 252, 0.5);
    h2 { margin: 0; font-size: 16px; font-weight: 600; color: var(--slate-800); }
    &--between { justify-content: space-between; }
  }

  &__card-title { display: flex; align-items: center; gap: 8px; }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--indigo-50);
    color: var(--indigo-600);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__params {
    padding: 24px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
  }

  &__param {
    display: flex;
    flex-direction: column;
    gap: 8px;
    label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--slate-500); }
    &--name { @media (min-width: 768px) { grid-column: span 2; } @media (min-width: 1024px) { grid-column: span 1; } }
  }

  &__spacer {
    display: none;
    @media (min-width: 1024px) { display: block; }
    &--2 { @media (min-width: 1024px) { grid-column: span 2; } }
  }

  &__value {
    padding: 10px;
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: 6px;
    font-size: 14px;
    color: var(--slate-700);
    &--name { font-weight: 700; color: var(--slate-900); }
  }

  :deep(.clp__bold) { font-weight: 700; }
  &__emerald-soft { color: rgba(5, 150, 105, 0.8); }
  &__rose-soft { color: rgba(225, 29, 72, 0.8); }

  &__indicators {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: 1024px) { grid-template-columns: repeat(5, 1fr); }
  }

  &__ind {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    transition: box-shadow 0.15s;
    &:hover { box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1); }
  }

  &__ind-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    span { font-size: 12px; font-weight: 600; color: var(--slate-500); text-transform: uppercase; letter-spacing: -0.025em; }
  }

  &__ind-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--slate-900);
    &--up { color: var(--emerald-600); }
    &--down { color: var(--rose-600); }
  }

  &__ind-cmp { margin: 4px 0 0; font-size: 12px; color: var(--slate-400); }

  &__link { font-size: 12px; color: var(--indigo-600); &:hover { background: var(--indigo-50); } }

  &__scroll { overflow-x: auto; }

  &__table {
    width: 100%;
    min-width: 800px;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;
    white-space: nowrap;

    th {
      background: var(--slate-50);
      height: 40px;
      padding: 0 8px;
      min-width: 120px;
      text-align: center;
      font-weight: 500;
      color: var(--slate-600);
      border-bottom: 1px solid var(--slate-200);
    }

    td {
      padding: 8px;
      text-align: center;
      border-bottom: 1px solid var(--slate-200);
    }
    tbody tr:last-child td { border-bottom: 0; }
  }

  &__sticky {
    position: sticky;
    left: 0;
    z-index: 1;
    width: 200px;
    min-width: 200px !important;
    text-align: left !important;
    background: #fff;
    border-right: 1px solid var(--slate-100);
    font-weight: 500;
    color: var(--slate-700);
  }
  th.clp__sticky { background: var(--slate-50); font-weight: 700; }

  &__muted { color: var(--slate-500); }
  &__muted-600 { color: var(--slate-600); }
}
</style>
