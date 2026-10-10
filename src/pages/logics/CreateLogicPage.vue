<template>
  <div class="cl">
    <!-- Cabeçalho -->
    <div class="cl__header">
      <div class="cl__header-inner">
        <div class="cl__header-title">
          <q-btn flat round dense class="cl__back" aria-label="Voltar" @click="cancel"><ArrowLeft :size="20" /></q-btn>
          <div>
            <h1>Criar Nova Lógica de Contrato</h1>
            <p>Configure a base operacional, identidade e parâmetros estruturais desta lógica.</p>
          </div>
        </div>
        <div class="cl__actions">
          <q-btn outline no-caps class="sa-btn sa-btn--outline" label="Cancelar" @click="cancel" />
          <q-btn outline no-caps class="sa-btn sa-btn--outline cl__draft" @click="saveDraft">
            <Save :size="16" class="q-mr-sm" /> Salvar Rascunho
          </q-btn>
          <q-btn unelevated no-caps class="sa-btn sa-btn--primary" @click="create">
            <CheckCircle2 :size="16" class="q-mr-sm" /> Confirmar e Criar
          </q-btn>
        </div>
      </div>
    </div>

    <div class="cl__grid">
      <div class="cl__form">
        <div v-if="showValidation && !isValid" class="cl__alert">
          <AlertCircle :size="20" />
          <div>
            <h4>Atenção</h4>
            <p>Preencha os campos obrigatórios (Nome e Retorno Diário) para criar a lógica.</p>
          </div>
        </div>

        <!-- 1. Identidade -->
        <section class="sa-card cl__card">
          <header class="cl__card-head">
            <h2>Identidade da Lógica</h2>
            <p>Defina como esta lógica será identificada visualmente no sistema.</p>
          </header>
          <div class="cl__card-body">
            <div class="cl__row cl__row--2">
              <div class="cl__field">
                <label>Nome da Lógica <span class="cl__req">*</span></label>
                <SaInput v-model="name" placeholder="Ex: Growth Alpha V3" :class="{ 'cl__invalid': showValidation && !name }" />
              </div>
              <div class="cl__field">
                <label>ID da Lógica</label>
                <SaInput :model-value="generatedId" disable input-class="font-mono" />
              </div>
            </div>

            <div class="cl__field">
              <label>Ícone Representativo</label>
              <div class="cl__icons">
                <button
                  v-for="item in ICONS"
                  :key="item.id"
                  type="button"
                  class="cl__icon-btn"
                  :class="{ 'cl__icon-btn--active': iconId === item.id }"
                  :title="item.label"
                  @click="iconId = item.id"
                >
                  <component :is="item.icon" :size="20" />
                </button>
              </div>
            </div>

            <div class="cl__field">
              <label>Identidade Visual (Cor)</label>
              <div class="cl__colors">
                <button
                  v-for="c in COLORS"
                  :key="c.id"
                  type="button"
                  class="cl__color"
                  :class="{ 'cl__color--active': colorId === c.id }"
                  :style="{ background: c.value }"
                  :title="c.label"
                  @click="colorId = c.id"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Configuração operacional -->
        <section class="sa-card cl__card">
          <header class="cl__card-head">
            <h2>Configuração Operacional</h2>
            <p>Parâmetros fundamentais para o funcionamento da lógica.</p>
          </header>
          <div class="cl__card-body">
            <div class="cl__row cl__row--3">
              <div class="cl__field">
                <label>Moeda Firmada</label>
                <SaSelect v-model="currency" :options="currencyOptions" />
              </div>
              <div class="cl__field">
                <label>Retorno Diário (%) <span class="cl__req">*</span></label>
                <SaInput v-model="dailyReturn" type="number" placeholder="0.00" :class="{ 'cl__invalid': showValidation && !dailyReturn }">
                  <template #append><span class="cl__suffix">%</span></template>
                </SaInput>
              </div>
              <div class="cl__field">
                <label>Intervalo Operacional</label>
                <SaSelect v-model="interval" :options="intervalOptions" />
              </div>
            </div>
            <div class="cl__info">
              <Clock :size="16" class="text-slate-400" />
              <p>
                Esta lógica operará em <strong>{{ currency }}</strong> buscando um retorno diário de
                <strong>{{ dailyReturn || '0' }}%</strong> em intervalos de <strong>{{ interval }}</strong>.
              </p>
            </div>
          </div>
        </section>

        <!-- 3. Estrutura inicial -->
        <section class="sa-card cl__card">
          <header class="cl__card-head">
            <h2>Estrutura Inicial</h2>
            <p>Definições de estado e limites iniciais.</p>
          </header>
          <div class="cl__card-body">
            <div class="cl__row cl__row--2">
              <div class="cl__field">
                <label>Parâmetros de Oscilação</label>
                <SaInput model-value="Padrão do Sistema (Automático)" disable />
              </div>
              <div class="cl__field">
                <label>Limites Estruturais</label>
                <SaInput model-value="Base Conservadora (Inicial)" disable />
              </div>
            </div>
            <div class="cl__field">
              <label>Status Inicial</label>
              <div class="cl__row cl__row--3">
                <button
                  v-for="s in STATUS_OPTIONS"
                  :key="s.value"
                  type="button"
                  class="cl__status"
                  :class="[`cl__status--${s.tone}`, { 'cl__status--active': status === s.value }]"
                  @click="status = s.value"
                >
                  <component :is="s.icon" :size="20" class="cl__status-icon" />
                  <span>{{ s.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Contratos vinculados -->
        <section class="sa-card cl__card">
          <header class="cl__card-head cl__card-head--row">
            <div>
              <h2>Contratos Vinculados</h2>
              <p>Associe contratos existentes a esta nova lógica (opcional).</p>
            </div>
            <q-btn v-if="!linking" outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" @click="linking = true">
              <Plus :size="16" class="q-mr-sm" /> Vincular Contratos
            </q-btn>
          </header>
          <div class="cl__card-body">
            <div v-if="linking" class="cl__linking">
              <SaInput v-model="contractSearch" placeholder="Buscar contrato por nome ou ID...">
                <template #prepend><Search :size="16" /></template>
              </SaInput>
              <div class="cl__contract-list">
                <div v-for="c in filteredContracts" :key="c.id" class="cl__contract" @click="toggleContract(c.id)">
                  <q-checkbox :model-value="selectedContracts.includes(c.id)" dense color="indigo-7" @update:model-value="toggleContract(c.id)" @click.stop />
                  <div>
                    <p class="cl__contract-name">{{ c.name }}</p>
                    <p class="cl__contract-meta">{{ c.id }} • {{ c.type }}</p>
                  </div>
                </div>
                <div v-if="!filteredContracts.length" class="cl__contract-empty">Nenhum contrato encontrado.</div>
              </div>
              <div class="cl__linking-foot">
                <q-btn flat no-caps class="sa-btn sa-btn--ghost sa-btn--sm" label="Concluir Seleção" @click="linking = false" />
              </div>
            </div>
            <div v-else-if="selectedContracts.length" class="cl__chips">
              <span v-for="id in selectedContracts" :key="id" class="sa-badge sa-badge--slate cl__chip">
                {{ contractName(id) }}
                <button type="button" aria-label="Remover" @click="toggleContract(id)">&times;</button>
              </span>
            </div>
            <div v-else class="cl__none">Nenhum contrato vinculado inicialmente.</div>
          </div>
        </section>
      </div>

      <!-- Preview -->
      <aside class="cl__preview">
        <div class="cl__preview-sticky">
          <h3 class="cl__preview-title">Preview da Lógica</h3>
          <section class="sa-card cl__pcard">
            <div class="cl__pcard-bar" :style="{ background: color.value }" />
            <div class="cl__pcard-head">
              <div class="cl__pcard-top">
                <span class="cl__pcard-icon"><component :is="icon.icon" :size="24" /></span>
                <span class="sa-badge sa-badge--xs sa-badge--upper" :class="statusBadge.cls">{{ statusBadge.label }}</span>
              </div>
              <h4>{{ name || 'Nova Lógica' }}</h4>
              <span class="cl__pcard-id font-mono">{{ generatedId }}</span>
            </div>
            <hr class="sa-separator" />
            <div class="cl__pcard-grid">
              <div><span>Moeda</span><p>{{ currency }}</p></div>
              <div><span>Retorno Dia</span><p :class="dailyReturn ? 'text-emerald-600' : 'cl__pcard-empty'">{{ dailyReturn ? `${dailyReturn}%` : '--' }}</p></div>
              <div><span>Intervalo</span><p>{{ interval }}</p></div>
              <div><span>Contratos</span><p>{{ selectedContracts.length }}</p></div>
            </div>
            <div class="cl__pcard-foot"><CircuitBoard :size="14" /> Configuração Preliminar</div>
          </section>
          <p class="cl__preview-note">
            Ao confirmar, a lógica será criada com os parâmetros base definidos. Ajustes finos poderão ser feitos posteriormente.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircuitBoard,
  Clock,
  Cpu,
  Globe,
  Lock,
  Plus,
  Save,
  Search,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import { availableContractsForLogic, logicsMock, type LogicStatus } from 'src/mocks/logics';

const router = useRouter();
const $q = useQuasar();

const ICONS = [
  { id: 'zap', icon: Zap, label: 'Agressiva' },
  { id: 'shield', icon: Shield, label: 'Proteção' },
  { id: 'trending-up', icon: TrendingUp, label: 'Crescimento' },
  { id: 'activity', icon: Activity, label: 'Volatilidade' },
  { id: 'cpu', icon: Cpu, label: 'Algorítmica' },
  { id: 'globe', icon: Globe, label: 'Global' },
  { id: 'lock', icon: Lock, label: 'Segurança' },
  { id: 'target', icon: Target, label: 'Alvo' },
];

const COLORS = [
  { id: 'emerald', value: '#10b981', label: 'Emerald' },
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'indigo', value: '#6366f1', label: 'Indigo' },
  { id: 'violet', value: '#8b5cf6', label: 'Violet' },
  { id: 'rose', value: '#f43f5e', label: 'Rose' },
  { id: 'amber', value: '#f59e0b', label: 'Amber' },
  { id: 'slate', value: '#64748b', label: 'Slate' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa', icon: Zap, tone: 'emerald' },
  { value: 'analysis', label: 'Em Análise', icon: Activity, tone: 'amber' },
  { value: 'paused', label: 'Pausada', icon: Lock, tone: 'slate' },
];

const currencyOptions = [
  { label: 'BRL (Real)', value: 'BRL' },
  { label: 'USD (Dólar)', value: 'USD' },
  { label: 'EUR (Euro)', value: 'EUR' },
  { label: 'BTC (Bitcoin)', value: 'BTC' },
];

const intervalOptions = [
  { label: '30 segundos', value: '30s' },
  { label: '1 minuto', value: '1min' },
  { label: '5 minutos', value: '5min' },
  { label: '15 minutos', value: '15min' },
  { label: '30 minutos', value: '30min' },
  { label: '1 hora', value: '1h' },
];

const INTERVAL_SECONDS: Record<string, number> = { '30s': 30, '1min': 60, '5min': 300, '15min': 900, '30min': 1800, '1h': 3600 };

const name = ref<string | number | null>('');
const iconId = ref('zap');
const colorId = ref('indigo');
const currency = ref<string | number | boolean | null>('BRL');
const dailyReturn = ref<string | number | null>('');
const interval = ref<string | number | boolean | null>('5min');
const status = ref('analysis');
const selectedContracts = ref<string[]>([]);
const linking = ref(false);
const contractSearch = ref<string | number | null>('');
const showValidation = ref(false);

const generatedId = `LOG-${Math.floor(10000 + Math.random() * 90000)}`;

const icon = computed(() => ICONS.find((i) => i.id === iconId.value) ?? ICONS[0]!);
const color = computed(() => COLORS.find((c) => c.id === colorId.value) ?? COLORS[2]!);
const isValid = computed(() => !!name.value && !!dailyReturn.value);

const statusBadge = computed(() => {
  if (status.value === 'active') return { label: 'Ativa', cls: 'sa-badge--emerald' };
  if (status.value === 'paused') return { label: 'Pausada', cls: 'sa-badge--slate' };
  return { label: 'Em Análise', cls: 'sa-badge--amber' };
});

const filteredContracts = computed(() => {
  const q = String(contractSearch.value ?? '').toLowerCase();
  return availableContractsForLogic.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
});

const contractName = (id: string) => availableContractsForLogic.find((c) => c.id === id)?.name ?? id;

function toggleContract(id: string) {
  selectedContracts.value = selectedContracts.value.includes(id)
    ? selectedContracts.value.filter((c) => c !== id)
    : [...selectedContracts.value, id];
}

function cancel() {
  void router.push({ name: 'logics' });
}

function saveDraft() {
  $q.notify({ type: 'info', message: 'Rascunho salvo localmente.' });
}

function create() {
  if (!isValid.value) {
    showValidation.value = true;
    return;
  }
  const statusMap: Record<string, LogicStatus> = { active: 'Active', analysis: 'Analysis', paused: 'Paused' };
  const today = new Date().toISOString().slice(0, 10);
  logicsMock.unshift({
    id: generatedId,
    name: String(name.value),
    description: 'Lógica criada pelo painel administrativo.',
    status: statusMap[status.value] ?? 'Analysis',
    type: icon.value.label,
    currency: String(currency.value),
    createdAt: today,
    updatedAt: today,
    dailyReturn: parseFloat(String(dailyReturn.value)) || 0,
    operationalInterval: String(interval.value),
    operationalIntervalSeconds: INTERVAL_SECONDS[String(interval.value)] ?? 300,
    performanceYTD: 0,
    performanceAllTime: 0,
    contracts: selectedContracts.value.map((id) => ({ id, name: contractName(id) })),
    lastOscillationReset: '00:00',
  });
  $q.notify({ type: 'positive', message: `Lógica ${generatedId} criada.` });
  void router.push({ name: 'logics' });
}
</script>

<style scoped lang="scss">
.cl {
  flex: 1;
  min-height: 100vh;
  background: var(--slate-50);
  padding-bottom: 80px;

  &__header {
    background: #fff;
    border-bottom: 1px solid var(--slate-200);
    padding: 24px;
    position: sticky;
    top: 0;
    z-index: 20;
  }

  &__header-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__header-title {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; color: var(--slate-900); }
    p { margin: 4px 0 0; font-size: 14px; color: var(--slate-500); }
  }

  &__back { margin-top: 4px; color: var(--slate-400); &:hover { color: var(--slate-600); } }
  &__actions { display: flex; align-items: center; gap: 12px; }
  &__draft { @media (max-width: 639px) { display: none; } }

  &__grid {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    @media (min-width: 1024px) { grid-template-columns: 2fr 1fr; }
  }

  &__form { display: flex; flex-direction: column; gap: 32px; min-width: 0; }

  &__alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: var(--red-50);
    border: 1px solid var(--red-200);
    border-radius: 6px;
    color: var(--red-700);
    h4 { margin: 0; font-size: 14px; font-weight: 600; }
    p { margin: 0; font-size: 14px; opacity: 0.9; }
    svg { flex-shrink: 0; margin-top: 2px; }
  }

  &__card-head {
    padding: 24px 24px 0;
    h2 { margin: 0; font-size: 18px; font-weight: 600; color: var(--slate-800); }
    p { margin: 6px 0 0; font-size: 14px; color: var(--slate-500); }
    &--row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  }

  &__card-body { padding: 24px; display: flex; flex-direction: column; gap: 24px; }

  &__row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    &--2 { @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); } }
    &--3 { @media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    > label { font-size: 14px; font-weight: 500; color: var(--slate-600); }
  }

  &__req { color: var(--red-500); }
  &__invalid :deep(.q-field__control:before) { border-color: var(--red-200) !important; }
  &__suffix { font-size: 14px; color: var(--slate-400); }

  &__icons, &__colors { display: flex; flex-wrap: wrap; gap: 12px; }

  &__icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    border: 1px solid var(--slate-200);
    background: #fff;
    color: var(--slate-500);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    &:hover { border-color: var(--slate-300); background: var(--slate-50); }
    &--active, &--active:hover {
      background: var(--slate-900);
      border-color: var(--slate-900);
      color: #fff;
      transform: scale(1.05);
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2);
    }
  }

  &__color {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 0;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    &:hover { transform: scale(1.05); }
    &--active, &--active:hover { transform: scale(1.1); box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--slate-400); }
  }

  &__info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: var(--slate-50);
    border: 1px solid var(--slate-100);
    border-radius: 6px;
    svg { flex-shrink: 0; margin-top: 2px; }
    p { margin: 0; font-size: 14px; color: var(--slate-600); }
    strong { color: var(--slate-900); }
  }

  &__status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border: 2px solid var(--slate-100);
    border-radius: 6px;
    background: #fff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    &:hover { background: var(--slate-50); }

    &--emerald { color: var(--emerald-900); .cl__status-icon { color: var(--emerald-600); } }
    &--amber { color: var(--amber-900); .cl__status-icon { color: var(--amber-600); } }
    &--slate { color: var(--slate-900); .cl__status-icon { color: var(--slate-600); } }

    &--emerald.cl__status--active { border-color: var(--emerald-500); background: var(--emerald-50); }
    &--amber.cl__status--active { border-color: var(--amber-500); background: var(--amber-50); }
    &--slate.cl__status--active { border-color: var(--slate-500); background: var(--slate-50); }
  }

  &__linking { display: flex; flex-direction: column; gap: 16px; }

  &__contract-list {
    border: 1px solid var(--slate-200);
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
    padding: 4px;
  }

  &__contract {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    &:hover { background: var(--slate-50); }
  }

  &__contract-name { margin: 0; font-size: 14px; font-weight: 500; color: var(--slate-900); }
  &__contract-meta { margin: 0; font-size: 12px; color: var(--slate-500); }
  &__contract-empty { padding: 16px; text-align: center; font-size: 14px; color: var(--slate-500); }
  &__linking-foot { display: flex; justify-content: flex-end; }

  &__chips { display: flex; flex-wrap: wrap; gap: 8px; }

  &__chip {
    padding: 4px 4px 4px 8px;
    color: var(--slate-700);
    button {
      margin-left: 4px;
      border: 0;
      background: transparent;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      color: inherit;
      &:hover { color: var(--red-600); }
    }
  }

  &__none {
    padding: 16px;
    text-align: center;
    font-size: 14px;
    font-style: italic;
    color: var(--slate-400);
    background: rgba(248, 250, 252, 0.5);
    border: 1px dashed var(--slate-200);
    border-radius: 4px;
  }

  // ---------- Preview ----------
  &__preview { display: none; @media (min-width: 1024px) { display: block; } }
  &__preview-sticky { position: sticky; top: 128px; display: flex; flex-direction: column; gap: 16px; }

  &__preview-title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__pcard { box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1); }
  &__pcard-bar { height: 8px; width: 100%; }

  &__pcard-head {
    padding: 24px 24px 16px;
    h4 { margin: 0; font-size: 20px; font-weight: 600; color: var(--slate-900); }
  }

  &__pcard-top { display: flex; justify-content: space-between; align-items: flex-start; }

  &__pcard-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: var(--slate-50);
    border: 1px solid var(--slate-100);
    color: var(--slate-700);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  &__pcard-id { display: block; margin-top: 4px; font-size: 12px; color: var(--slate-500); }

  &__pcard-grid {
    padding: 16px 24px 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    span { font-size: 12px; color: var(--slate-400); text-transform: uppercase; }
    p { margin: 4px 0 0; font-weight: 600; color: var(--slate-700); }
  }

  &__pcard-empty { color: var(--slate-300) !important; }

  &__pcard-foot {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--slate-50);
    border-top: 1px solid var(--slate-100);
    font-size: 12px;
    color: var(--slate-500);
  }

  &__preview-note { margin: 0 auto; max-width: 280px; text-align: center; font-size: 12px; color: var(--slate-400); }
}
</style>
