<template>
  <div class="sa-page">
    <div class="sa-page__inner ld">
      <!-- 1. Cabeçalho -->
      <div class="ld__header">
        <q-btn flat no-caps class="sa-btn sa-btn--ghost ld__back" @click="router.push({ name: 'logics' })">
          <ArrowLeft :size="16" class="q-mr-sm" /> Voltar para Lista
        </q-btn>

        <div class="ld__header-main">
          <div class="ld__title-block">
            <h1 class="sa-page__title ld__title">
              {{ summary?.name ?? params.name }}
              <span class="sa-badge sa-badge--pill ld__status" :class="statusCfg[status].cls">{{ statusCfg[status].label }}</span>
            </h1>
            <div class="ld__meta">
              <span class="ld__meta-item">
                <Calendar :size="16" class="text-slate-400" />
                Criado em: <strong>{{ summary ? formatDate(summary.createdAt) : '01/12/2023' }}</strong>
              </span>
              <span v-if="summary" class="ld__meta-item ld__meta-sep font-mono ld__meta-id">ID: {{ summary.id }}</span>
              <span class="ld__meta-item ld__meta-sep ld__linked">
                <Link2 :size="16" class="ld__linked-icon" />
                <span class="ld__linked-label">{{ logicLinkedContracts.length }} Contratos vinculados</span>
                <q-tooltip class="sa-hovercard ld__hover" anchor="bottom left" self="top left" :offset="[0, 8]">
                  <div class="ld__hover-head">
                    <span><Briefcase :size="12" /> Contratos Vinculados</span>
                    <span class="sa-badge sa-badge--xs sa-badge--outline">{{ logicLinkedContracts.length }} Total</span>
                  </div>
                  <div class="ld__hover-list">
                    <div v-for="c in logicLinkedContracts" :key="c.id" class="ld__hover-item">
                      <div class="ld__hover-top">
                        <div>
                          <div class="ld__hover-name">
                            {{ c.name }}
                            <span class="sa-badge sa-badge--xs" :class="statusCfg[c.status].cls">{{ statusCfg[c.status].label }}</span>
                          </div>
                          <div class="ld__hover-id font-mono">{{ c.id }}</div>
                        </div>
                        <span class="sa-badge sa-badge--xs sa-badge--slate font-mono">{{ c.currency }}</span>
                      </div>
                      <div class="ld__hover-grid">
                        <div>
                          <div class="ld__hover-kv"><span>Vigência</span><strong>{{ c.startDate }} - {{ c.endDate }}</strong></div>
                          <div class="ld__hover-kv"><span>Vinculado desde</span><strong>{{ c.linkedSince }}</strong></div>
                        </div>
                        <div class="ld__hover-capitals">
                          <div class="ld__hover-kv"><span>Capital Inicial</span><strong class="font-mono ld__light">{{ compact(c.initialCapital) }}</strong></div>
                          <div class="ld__hover-kv"><span>Capital Base</span><strong class="font-mono">{{ compact(c.baseCapital) }}</strong></div>
                        </div>
                      </div>
                      <div class="ld__hover-clients">
                        <Users :size="12" class="text-slate-400" />
                        <span v-for="cl in c.clients" :key="cl">{{ cl }}</span>
                      </div>
                    </div>
                  </div>
                </q-tooltip>
              </span>
            </div>
          </div>

          <div class="ld__header-actions">
            <q-btn flat no-caps class="sa-btn ld__tips" :class="{ 'ld__tips--on': showAllTooltips }" @click="showAllTooltips = !showAllTooltips">
              <Eye :size="16" class="q-mr-sm" /> <span class="ld__tips-label">Exibir Tooltips</span>
            </q-btn>

            <span class="ld__clock"><Clock :size="14" class="text-slate-400" /> {{ now.toLocaleTimeString('pt-BR') }} GMT-3</span>

            <q-btn v-if="status === 'Active'" outline no-caps class="sa-btn ld__pause" @click="toggleStatus">
              <PauseCircle :size="16" class="q-mr-sm" /> Pausar Lógica
            </q-btn>
            <q-btn v-else-if="status === 'Paused'" outline no-caps class="sa-btn ld__start" @click="toggleStatus">
              <Play :size="16" class="q-mr-sm ld__play" /> Iniciar Lógica
            </q-btn>

            <div class="ld__inds">
              <div v-for="ind in logicHeaderIndicators" :key="ind.label" class="ld__ind">
                <div class="ld__ind-top"><span>{{ ind.label }}</span><TrendingUp :size="12" class="text-emerald-600" /></div>
                <div class="ld__ind-value font-mono">{{ ind.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Definições estruturais -->
      <section class="sa-card ld__defs" :class="{ 'ld__defs--editing': editing }">
        <header class="ld__card-head">
          <div class="ld__card-title">
            <span class="ld__card-icon"><CircuitBoard :size="14" /></span>
            <h2>Definições Estruturais</h2>
          </div>
          <div v-if="editing" class="ld__edit-actions">
            <q-btn flat no-caps class="sa-btn sa-btn--ghost sa-btn--sm" @click="cancelEdit"><X :size="12" class="q-mr-xs" /> Cancelar</q-btn>
            <q-btn unelevated no-caps class="sa-btn sa-btn--primary sa-btn--sm" @click="saveEdit"><Save :size="12" class="q-mr-xs" /> Salvar Alterações</q-btn>
          </div>
          <q-btn v-else outline no-caps class="sa-btn sa-btn--outline sa-btn--sm" @click="startEdit">
            <Edit2 :size="12" class="q-mr-xs" /> Editar Lógica
          </q-btn>
        </header>

        <div class="ld__cols">
          <!-- Col 1: oscilação -->
          <div class="ld__col">
            <h3 class="ld__col-title"><Maximize2 :size="14" /> Parâmetros de Oscilação Controlada</h3>
            <div class="ld__pair">
              <ComparisonField v-bind="fieldProps('maxUpperBound')" label="Teto de Oscilação Superior" color="emerald" :tooltip="TIPS.maxUpper" />
              <ComparisonField v-bind="fieldProps('minUpperBound')" label="Faixa Mínima de Oscilação Superior" color="emerald" :tooltip="TIPS.minUpper" />
            </div>
            <div class="ld__pair ld__pair--sep">
              <ComparisonField v-bind="fieldProps('maxLowerBound')" label="Teto de Oscilação Inferior" color="rose" :tooltip="TIPS.maxLower" />
              <ComparisonField v-bind="fieldProps('minLowerBound')" label="Faixa Mínima de Oscilação Inferior" color="rose" :tooltip="TIPS.minLower" />
            </div>
            <div class="ld__reset">
              <span class="sa-label-xs">Último Reset</span>
              <span class="ld__reset-time"><i /> <span class="font-mono">{{ lastReset.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</span></span>
              <span class="ld__reset-timer"><Clock :size="12" class="text-slate-400" /> <span class="font-mono">{{ elapsed }}</span></span>
            </div>
          </div>

          <!-- Col 2: fatores + estrutura temporal -->
          <div class="ld__col ld__col--stack">
            <div class="ld__sub ld__sub--tinted">
              <h3 class="ld__col-title"><TrendingUp :size="14" /> Fatores de Retorno Programado</h3>
              <div class="ld__pair">
                <ComparisonField v-bind="fieldProps('dailyFactor')" label="Retorno Diário Determinado" step="0.01" suffix="%" color="indigo" :tooltip="TIPS.daily" />
                <ComparisonField v-bind="fieldProps('dailyReturnTime')" label="Horário de Retorno Diário" input-type="text" :tooltip="TIPS.dailyTime" />
              </div>
              <div class="ld__pair ld__pair--sep">
                <div v-for="f in refFields" :key="f.key" class="ld__ref">
                  <div class="ld__ref-label">
                    <label>{{ f.label }} <InfoTip :text="f.tip" :forced="showAllTooltips" /></label>
                    <Lock v-if="editing" :size="12" class="ld__lock" />
                  </div>
                  <div v-if="editing" class="ld__ref-old">{{ params[f.key].toFixed(2) }}%</div>
                  <div class="ld__ref-value font-mono" :class="{ 'ld__ref-value--editing': editing }">
                    {{ (editing ? buffer[f.key] : params[f.key]).toFixed(2) }}%
                  </div>
                </div>
              </div>
            </div>

            <div class="ld__sub">
              <h3 class="ld__col-title"><Clock :size="14" /> Estrutura Temporal de Simulação</h3>
              <div class="ld__pair">
                <div class="ld__ref">
                  <div class="ld__ref-label">
                    <label class="ld__label-strong">Intervalo Operacional <InfoTip :text="TIPS.interval" :forced="showAllTooltips" /></label>
                    <span v-if="editing && params.oscillationInterval !== buffer.oscillationInterval" class="ld__changed">MODIFICADO</span>
                  </div>
                  <div v-if="editing" class="ld__compare">
                    <div class="ld__slot"><span class="ld__tag">Atual</span><div class="ld__box ld__box--old">{{ params.oscillationInterval }}</div></div>
                    <div class="ld__slot"><span class="ld__tag ld__tag--new">Novo</span><SaSelect v-model="intervalModel" size="sm" :options="intervalOptions" /></div>
                  </div>
                  <div v-else class="ld__box">{{ params.oscillationInterval }}</div>
                </div>
                <div class="ld__ref">
                  <div class="ld__ref-label"><label class="ld__label-strong">Última Atualização</label></div>
                  <div class="ld__box">{{ now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Col 3: comportamento -->
          <div class="ld__col ld__col--tinted">
            <h3 class="ld__col-title ld__col-title--dark"><Settings2 :size="14" /> Controle de Comportamento das Variações</h3>
            <div class="ld__ref">
              <div class="ld__ref-label">
                <label class="ld__label-strong">Modo de Variação <InfoTip :text="TIPS.mode" :forced="showAllTooltips" /></label>
                <span v-if="editing && params.variationMode !== buffer.variationMode" class="ld__changed">MODIFICADO</span>
              </div>
              <div v-if="editing" class="ld__modes">
                <InfoTip :text="TIPS.free" :forced="showAllTooltips" class="ld__mode-wrap">
                  <button type="button" class="ld__mode" :class="{ 'ld__mode--free': buffer.variationMode === 'free' }" @click="buffer.variationMode = 'free'">
                    <Waves :size="14" /> Variação Livre
                  </button>
                </InfoTip>
                <InfoTip :text="TIPS.structured" :forced="showAllTooltips" class="ld__mode-wrap">
                  <button type="button" class="ld__mode" :class="{ 'ld__mode--structured': buffer.variationMode === 'structured' }" @click="buffer.variationMode = 'structured'">
                    <GitBranch :size="14" /> Variação Estruturada
                  </button>
                </InfoTip>
              </div>
              <InfoTip v-else :text="params.variationMode === 'free' ? TIPS.free : TIPS.structured" :forced="showAllTooltips">
                <span class="ld__mode-view" :class="{ 'ld__mode-view--structured': params.variationMode === 'structured' }">
                  <Waves v-if="params.variationMode === 'free'" :size="14" />
                  <GitBranch v-else :size="14" />
                  {{ params.variationMode === 'free' ? 'Variação Livre' : 'Variação Estruturada' }}
                </span>
              </InfoTip>
            </div>

            <div v-if="activeMode === 'free'" class="ld__mode-fields">
              <ComparisonField v-bind="fieldProps('freeVolatility')" label="Intensidade de Aleatoriedade" :tooltip="TIPS.freeVol" />
              <ComparisonField v-bind="fieldProps('freeDispersion')" label="Distribuição de Probabilidade" :tooltip="TIPS.freeDisp" />
            </div>
            <div v-else class="ld__mode-fields">
              <ComparisonField v-bind="fieldProps('structTrend')" label="Mínimo Operacional de Movimento" color="indigo" :tooltip="TIPS.structTrend" />
              <ComparisonField v-bind="fieldProps('structConvergence')" label="Ritmo de Oscilação" color="indigo" :tooltip="TIPS.structConv" />
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Performance histórica -->
      <section class="sa-card ld__hist" :class="{ 'ld__hist--editing': editing }">
        <header class="ld__card-head">
          <div class="ld__hist-left">
            <div class="ld__card-title">
              <BarChart3 :size="16" :class="editing ? 'text-indigo-600' : 'text-slate-600'" />
              <h2>Performance Histórica</h2>
              <span v-if="editing" class="sa-badge sa-badge--indigo ld__sim">Modo de Simulação</span>
            </div>
            <div class="sa-seg sa-seg--neutral">
              <button type="button" :class="{ active: !showIntraday }" @click="showIntraday = false">Diário</button>
              <button type="button" :class="{ active: showIntraday }" @click="showIntraday = true">Detalhado</button>
            </div>
            <div v-if="editing" class="sa-seg">
              <button type="button" :class="{ active: simLayout === 'bottom' }" @click="simLayout = 'bottom'"><LayoutList :size="12" /> Abaixo</button>
              <button type="button" :class="{ active: simLayout === 'side' }" @click="simLayout = 'side'"><Columns :size="12" /> Ao Lado</button>
            </div>
            <div v-else class="sa-seg sa-seg--neutral ld__view-seg">
              <button type="button" :class="{ active: historyView === 'table' }" @click="historyView = 'table'"><TableIcon :size="14" /> Tabela</button>
              <button type="button" :class="{ active: historyView === 'chart' }" @click="historyView = 'chart'"><LineChartIcon :size="14" /> Ver em gráfico</button>
            </div>
          </div>
          <q-btn flat no-caps dense class="sa-btn ld__link" @click="fullOpen = true">
            Ver histórico completo <ExternalLink :size="12" class="q-ml-xs" />
          </q-btn>
        </header>

        <div v-if="!editing && historyView === 'chart'" class="ld__chart">
          <apexchart type="line" height="300" :options="chartOptions" :series="chartSeries" />
        </div>

        <div v-else-if="editing" class="ld__sim-wrap" :class="`ld__sim-wrap--${simLayout}`">
          <div class="ld__sim-panel">
            <div class="ld__sim-title">Cenário Atual (Salvo)</div>
            <table class="ld__sim-table">
              <thead><tr><th>Data / Hora</th><th>Var. %</th><th>Osc. Máx (+)</th><th>Osc. Máx (-)</th></tr></thead>
              <tbody>
                <tr v-for="r in visibleHistory.slice(0, 20)" :key="r.date">
                  <td class="ld__sim-date font-mono">{{ r.date }}</td>
                  <td :class="tone(r.variation)">{{ r.variation.toFixed(2) }}%</td>
                  <td class="font-mono text-emerald-700">+{{ r.maxPosOsc.toFixed(2) }}</td>
                  <td class="font-mono text-rose-700">{{ r.maxNegOsc.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ld__sim-panel ld__sim-panel--proj">
            <div class="ld__sim-title ld__sim-title--proj"><Activity :size="12" /> Projeção (Em Edição)</div>
            <table class="ld__sim-table ld__sim-table--proj">
              <thead><tr><th>Data / Hora</th><th>Var. %</th><th>Osc. Máx (+)</th><th>Osc. Máx (-)</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in visibleProjected.slice(0, 20)" :key="r.date">
                  <td class="ld__sim-date font-mono">{{ r.date }}</td>
                  <td>
                    <span
                      class="ld__proj-var font-mono"
                      :class="[tone(r.variation), { 'ld__proj-var--diff': Math.abs(r.variation - (visibleHistory[i]?.variation ?? r.variation)) > 0.001 }]"
                    >{{ r.variation > 0 ? '+' : '' }}{{ r.variation.toFixed(2) }}%</span>
                  </td>
                  <td class="font-mono text-emerald-700">+{{ r.maxPosOsc.toFixed(2) }}</td>
                  <td class="font-mono text-rose-700">{{ r.maxNegOsc.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="ld__scroll">
          <table class="ld__table">
            <thead>
              <tr>
                <th class="ld__sticky">Indicador</th>
                <th v-for="r in visibleHistory.slice(0, 20)" :key="r.date">{{ r.date }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="ld__sticky">Variação Diária [%]</td>
                <td v-for="r in visibleHistory.slice(0, 20)" :key="r.date" :class="tone(r.variation)">{{ r.variation.toFixed(2) }}%</td>
              </tr>
              <tr>
                <td class="ld__sticky">Osc. Máx. Negativa</td>
                <td v-for="r in visibleHistory.slice(0, 20)" :key="r.date" :class="tone(r.maxNegOsc)">{{ r.maxNegOsc.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="ld__sticky">Osc. Máx. Positiva</td>
                <td v-for="r in visibleHistory.slice(0, 20)" :key="r.date" :class="tone(r.maxPosOsc)">{{ r.maxPosOsc.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="ld__sticky">Média de Oscilação</td>
                <td v-for="r in visibleHistory.slice(0, 20)" :key="r.date" class="text-slate-500">{{ r.avgOsc.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <LogicFullHistoryDialog v-model="fullOpen" :history="currentHistory" :logic-name="summary?.name ?? params.name" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Briefcase,
  Calendar,
  CircuitBoard,
  Clock,
  Columns,
  Edit2,
  ExternalLink,
  Eye,
  GitBranch,
  LayoutList,
  LineChart as LineChartIcon,
  Link2,
  Lock,
  Maximize2,
  PauseCircle,
  Play,
  Save,
  Settings2,
  Table as TableIcon,
  TrendingUp,
  Users,
  Waves,
  X,
} from 'lucide-vue-next';
import SaSelect from 'components/ui/SaSelect.vue';
import ComparisonField from 'components/logics/ComparisonField.vue';
import InfoTip from 'components/logics/InfoTip.vue';
import LogicFullHistoryDialog from 'components/logics/LogicFullHistoryDialog.vue';
import {
  calculateLogicHistory,
  findLogic,
  initialLogicParams,
  logicHeaderIndicators,
  logicLinkedContracts,
  type LinkedContractStatus,
  type LogicParameters,
  type LogicStatus,
} from 'src/mocks/logics';
import { formatDate } from 'src/utils/format';

const props = defineProps<{ id: string }>();
const router = useRouter();

const summary = computed(() => findLogic(props.id));
const start: LogicParameters = { ...initialLogicParams, name: summary.value?.name ?? initialLogicParams.name };

const params = reactive<LogicParameters>({ ...start });
const buffer = reactive<LogicParameters>({ ...start });

const editing = ref(false);
const showAllTooltips = ref(false);
const simLayout = ref<'side' | 'bottom'>('side');
const historyView = ref<'table' | 'chart'>('table');
const fullOpen = ref(false);
const showIntraday = ref(false);

type AnyStatus = LogicStatus | LinkedContractStatus;
const status = ref<AnyStatus>(summary.value?.status ?? 'Active');

const statusCfg: Record<AnyStatus, { label: string; cls: string }> = {
  Active: { label: 'Ativo', cls: 'sa-badge--emerald-soft' },
  Paused: { label: 'Pausado', cls: 'sa-badge--yellow' },
  Analysis: { label: 'Em Análise', cls: 'sa-badge--amber-soft' },
  Closed: { label: 'Encerrado', cls: 'sa-badge--slate-soft' },
  Blocked: { label: 'Bloqueado', cls: 'sa-badge--rose-soft' },
  Inactive: { label: 'Inativo', cls: 'sa-badge--slate-soft' },
};

const TIPS = {
  maxUpper: 'Define o limite máximo positivo permitido para a variação acumulada ao longo do período. Garante que a trajetória não ultrapasse esse patamar de valorização intraperíodo.',
  minUpper: 'Define o limite mínimo positivo esperado para a variação acumulada superior. Impede movimentos excessivamente tímidos acima de zero, mantendo o comportamento dentro do intervalo superior previsto.',
  maxLower: 'Define o limite máximo negativo permitido para a variação acumulada ao longo do período. Garante que a trajetória não ultrapasse esse patamar de desvalorização intraperíodo.',
  minLower: 'Define o limite mínimo negativo esperado para a variação acumulada inferior. Evita que a curva opere próxima de zero no campo negativo, preservando a dinâmica prevista.',
  daily: 'Percentual final obrigatório do período. Independentemente das oscilações intradiárias, o fechamento sempre convergirá exatamente para este valor.',
  dailyTime: 'Horário exato de aplicação do retorno diário programado, incluindo o fuso horário de referência.',
  monthly: 'Projeção estimada do retorno mensal com base no fator diário configurado. Serve como referência estratégica, sem impacto direto nos cálculos operacionais.',
  annual: 'Projeção estimada do retorno anual considerando a continuidade do fator diário. Utilizada para visão macro de performance, sem interferir na simulação intraperíodo.',
  interval: 'Define a granularidade da simulação (ex.: 1 minuto, 5 minutos, 30 minutos, 1 hora). Determina a quantidade de pontos gerados ao longo do período, sem alterar o resultado final.',
  mode: 'Define o comportamento operacional das oscilações ao longo do período, determinando se a dinâmica será totalmente livre ou estruturada.',
  free: 'Permite oscilações totalmente aleatórias dentro dos limites máximo positivo e negativo. Não exige variação mínima por intervalo, podendo gerar desde movimentos sutis até variações mais intensas. Produz uma curva mais natural, estatisticamente livre e imprevisível.',
  structured: 'Além dos limites positivo e negativo, este modo estabelece também um limite mínimo de variação por intervalo. Evita períodos de baixa movimentação e garante comportamento mais ativo, contínuo e organizado. Ideal para apresentação institucional e análise técnica.',
  freeVol: 'Define o nível de liberdade das oscilações randômicas dentro do intervalo permitido. Valores maiores geram movimentos mais amplos e imprevisíveis; valores menores criam uma curva mais suave, porém ainda totalmente aleatória.',
  freeDisp: 'Controla o perfil estatístico das variações no modo livre. Permite definir entre comportamento mais uniforme ou maior concentração em determinadas faixas, sem impor limite mínimo obrigatório de movimento.',
  structTrend: 'Define a menor variação aceitável por intervalo. Evita oscilações micro irrelevantes e garante movimento perceptível e consistente em cada etapa.',
  structConv: 'Controla a cadência das oscilações ao longo do período. Permite ajustar entre uma dinâmica mais constante ou mais variável, mantendo sempre a lógica estruturada do modo.',
};

const refFields: { key: 'monthlyFactor' | 'annualFactor'; label: string; tip: string }[] = [
  { key: 'monthlyFactor', label: 'Referência de Retorno Mensal', tip: TIPS.monthly },
  { key: 'annualFactor', label: 'Referência de Retorno Anual', tip: TIPS.annual },
];

const intervalOptions = [
  { label: '15 minutos', value: '15min' },
  { label: '30 minutos', value: '30min' },
  { label: '1 hora', value: '1h' },
  { label: '4 horas', value: '4h' },
  { label: 'Diário', value: '1d' },
];

const intervalModel = computed({
  get: () => buffer.oscillationInterval,
  set: (v: string | number | boolean | null) => (buffer.oscillationInterval = String(v)),
});

const activeMode = computed(() => (editing.value ? buffer.variationMode : params.variationMode));

type FieldKey = Exclude<keyof LogicParameters, 'name' | 'oscillationInterval' | 'variationMode' | 'monthlyFactor' | 'annualFactor'>;
const BOUNDS: FieldKey[] = ['maxUpperBound', 'minUpperBound', 'maxLowerBound', 'minLowerBound'];

/** Props comuns do ComparisonField (valores atual/novo + handler). */
function fieldProps(key: FieldKey) {
  return {
    current: params[key],
    buffer: buffer[key],
    editing: editing.value,
    forced: showAllTooltips.value,
    onUpdate: (v: string) => updateField(key, v),
  };
}

function updateField(key: FieldKey, value: string) {
  if (key === 'dailyReturnTime') {
    buffer.dailyReturnTime = value;
    return;
  }
  if (value === '') {
    if (BOUNDS.includes(key)) (buffer as Record<string, unknown>)[key] = null;
    return;
  }
  const num = parseFloat(value);
  const val = Number.isNaN(num) ? 0 : num;
  if (key === 'dailyFactor') {
    const rate = val / 100;
    buffer.dailyFactor = val;
    buffer.monthlyFactor = (Math.pow(1 + rate, 21) - 1) * 100;
    buffer.annualFactor = (Math.pow(1 + rate, 252) - 1) * 100;
  } else {
    (buffer as Record<string, unknown>)[key] = val;
  }
}

function startEdit() {
  Object.assign(buffer, params);
  editing.value = true;
  historyView.value = 'table';
}

function cancelEdit() {
  editing.value = false;
  simLayout.value = 'side';
}

function saveEdit() {
  Object.assign(params, buffer);
  editing.value = false;
  simLayout.value = 'side';
}

function toggleStatus() {
  status.value = status.value === 'Active' ? 'Paused' : 'Active';
  if (summary.value && (status.value === 'Active' || status.value === 'Paused')) summary.value.status = status.value;
}

// Relógio do sistema + cronômetro desde o último reset (09:45)
const now = ref(new Date());
const lastReset = (() => {
  const d = new Date();
  d.setHours(9, 45, 0, 0);
  if (d > new Date()) d.setDate(d.getDate() - 1);
  return d;
})();
const timer = setInterval(() => (now.value = new Date()), 1000);
onBeforeUnmount(() => clearInterval(timer));

const elapsed = computed(() => {
  const diff = Math.max(0, now.value.getTime() - lastReset.getTime());
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(diff / 3600000))}:${pad(Math.floor((diff % 3600000) / 60000))}:${pad(Math.floor((diff % 60000) / 1000))}`;
});

// Histórico simulado (atual e projeção em edição)
const currentHistory = computed(() => calculateLogicHistory(params));
const projectedHistory = computed(() => calculateLogicHistory(buffer));
const visibleHistory = computed(() => (showIntraday.value ? currentHistory.value : currentHistory.value.filter((h) => h.type === 'daily')));
const visibleProjected = computed(() => (showIntraday.value ? projectedHistory.value : projectedHistory.value.filter((h) => h.type === 'daily')));

const chartPoints = computed(() => {
  let acc = 0;
  return [...visibleHistory.value]
    .slice(0, 30)
    .reverse()
    .map((r) => {
      acc += r.variation;
      return { label: r.date.slice(0, 5), full: r.date, value: Number(acc.toFixed(2)) };
    });
});

const chartSeries = computed(() => [{ name: 'Variação Acumulada', data: chartPoints.value.map((p) => p.value) }]);

const chartOptions = computed(() => ({
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif', animations: { enabled: false } },
  colors: ['#4f46e5'],
  stroke: { curve: 'smooth', width: 3 },
  markers: { size: 4, colors: ['#4f46e5'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 6 } },
  grid: { borderColor: '#e2e8f0', strokeDashArray: 3, xaxis: { lines: { show: false } } },
  dataLabels: { enabled: false },
  legend: { show: false },
  xaxis: {
    categories: chartPoints.value.map((p) => p.label),
    labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '12px' }, formatter: (v: number) => `${v.toFixed(1)}%` } },
  annotations: { yaxis: [{ y: 0, borderColor: '#cbd5e1', strokeDashArray: 3 }] },
  tooltip: {
    x: { formatter: (_: unknown, o: { dataPointIndex: number }) => chartPoints.value[o.dataPointIndex]?.full ?? '' },
    y: { formatter: (v: number) => `${v.toFixed(2)}%` },
  },
}));

const tone = (v: number) => (v >= 0 ? 'text-emerald-700' : 'text-rose-700');
const compact = (v: number) => v.toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short' });
</script>

<style scoped lang="scss">
.ld {
  gap: 24px !important;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--slate-200);
  }

  &__back { width: fit-content; margin-left: -8px; padding: 0 8px; }

  &__header-main {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    @media (min-width: 1280px) { flex-direction: row; align-items: flex-end; }
  }

  &__title-block { display: flex; flex-direction: column; gap: 12px; }
  &__title { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  &__status { margin-left: 8px; font-size: 12px; font-weight: 600; }

  &__meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; font-size: 14px; color: var(--slate-500); }
  &__meta-item { display: flex; align-items: center; gap: 6px; strong { font-weight: 500; color: var(--slate-700); } }
  &__meta-sep { border-left: 1px solid var(--slate-200); padding-left: 16px; }
  &__meta-id { font-size: 12px; color: var(--slate-400); }

  &__linked {
    cursor: pointer;
    &:hover .ld__linked-label, &:hover .ld__linked-icon { color: var(--indigo-600); }
  }
  &__linked-icon { color: var(--slate-400); transition: color 0.15s; }
  &__linked-label {
    font-weight: 500;
    color: var(--slate-700);
    text-decoration: underline dotted var(--slate-300);
    text-underline-offset: 4px;
    transition: color 0.15s;
  }

  &__header-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

  &__tips {
    font-size: 12px;
    color: var(--slate-500);
    &:hover { background: var(--slate-100); color: var(--slate-800); }
    &--on { background: var(--indigo-50); color: var(--indigo-700); }
  }
  &__tips-label { @media (max-width: 639px) { display: none; } }

  &__clock {
    display: none;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-600);
    @media (min-width: 1280px) { display: flex; }
  }

  &__pause {
    color: var(--yellow-700);
    background: var(--yellow-50);
    &:before { border-color: var(--yellow-200) !important; }
    &:hover { background: var(--yellow-100); }
  }

  &__start {
    color: var(--emerald-700);
    background: var(--emerald-50);
    &:before { border-color: var(--emerald-200) !important; }
    &:hover { background: var(--emerald-100); }
  }
  &__play { fill: currentColor; }

  &__inds { display: flex; gap: 8px; }

  &__ind {
    min-width: 100px;
    padding: 8px 12px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  }
  &__ind-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; span { font-size: 10px; font-weight: 700; color: var(--slate-400); text-transform: uppercase; } }
  &__ind-value { font-size: 14px; font-weight: 700; color: var(--emerald-700); }

  // ---------- Hover de contratos ----------
  &__hover-head {
    margin: -16px -16px 0;
    padding: 12px 16px;
    background: var(--slate-50);
    border-bottom: 1px solid var(--slate-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    > span:first-child { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate-500); }
  }

  &__hover-list { width: 518px; padding-top: 8px; display: flex; flex-direction: column; gap: 4px; }
  &__hover-item { padding: 12px; border-radius: 6px; border: 1px solid transparent; &:hover { background: var(--slate-50); border-color: var(--slate-100); } }
  &__hover-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  &__hover-name { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--slate-800); }
  &__hover-id { margin-top: 4px; font-size: 12px; color: var(--slate-400); }

  &__hover-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 10px;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(241, 245, 249, 0.6);
    border-radius: 4px;
    font-size: 12px;
    > div { display: flex; flex-direction: column; gap: 6px; }
  }

  &__hover-capitals { border-left: 1px solid var(--slate-200); padding-left: 16px; }
  &__hover-kv { display: flex; align-items: center; justify-content: space-between; gap: 8px; span { color: var(--slate-400); } strong { color: var(--slate-900); font-weight: 700; } }
  &__light { font-weight: 400 !important; color: var(--slate-700) !important; }

  &__hover-clients {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 12px;
    span { background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--slate-100); font-weight: 500; color: var(--slate-600); }
  }

  // ---------- Cards ----------
  &__defs, &__hist {
    transition: box-shadow 0.2s, border-color 0.2s;
    overflow: visible;
  }
  &__defs--editing { border-color: var(--indigo-200); box-shadow: 0 0 0 4px rgba(238, 242, 255, 0.5); }
  &__hist--editing { box-shadow: 0 0 0 4px rgba(238, 242, 255, 0.3); }

  &__card-head {
    padding: 12px 24px;
    border-bottom: 1px solid var(--slate-100);
    background: rgba(248, 250, 252, 0.8);
    border-radius: var(--radius) var(--radius) 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    h2 { margin: 0; font-size: 14px; font-weight: 700; color: var(--slate-800); text-transform: uppercase; letter-spacing: 0.025em; }
  }

  &__card-icon { width: 24px; height: 24px; border-radius: 6px; background: var(--indigo-100); color: var(--indigo-600); display: flex; align-items: center; justify-content: center; }
  &__edit-actions { display: flex; gap: 8px; }

  &__cols {
    display: grid;
    grid-template-columns: 1fr;
    @media (min-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
    > * + * {
      border-top: 1px solid var(--slate-100);
      @media (min-width: 1024px) { border-top: 0; border-left: 1px solid var(--slate-100); }
    }
  }

  &__col {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
    &--stack { padding: 0; gap: 0; }
    &--tinted { background: rgba(248, 250, 252, 0.4); }
  }

  &__sub {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    &--tinted { background: rgba(248, 250, 252, 0.3); border-bottom: 1px solid var(--slate-100); }
  }

  &__col-title {
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    &--dark { color: var(--slate-500); }
  }

  &__pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    &--sep { padding-top: 8px; border-top: 1px solid var(--slate-100); }
  }

  &__reset {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    margin-top: 4px;
    background: rgba(248, 250, 252, 0.5);
    border: 1px solid rgba(241, 245, 249, 0.5);
    border-radius: 4px;
  }

  &__reset-time {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 500;
    color: var(--slate-600);
    i { width: 6px; height: 6px; border-radius: 50%; background: var(--slate-400); }
  }

  &__reset-timer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 12px;
    border-left: 1px solid var(--slate-200);
    font-size: 10px;
    font-weight: 700;
    color: var(--slate-700);
  }

  &__ref { display: flex; flex-direction: column; gap: 8px; min-width: 0; }

  &__ref-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    label { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--slate-500); }
  }

  &__label-strong { color: var(--slate-600) !important; }
  &__lock { color: var(--slate-300); }
  &__ref-old { padding: 0 4px; font-size: 10px; color: var(--slate-400); text-decoration: line-through; }

  &__ref-value {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 4px;
    font-size: 14px;
    color: var(--slate-700);
    &--editing { background: rgba(238, 242, 255, 0.2); color: var(--indigo-700); border-color: var(--indigo-100); font-weight: 700; }
  }

  &__changed { font-size: 9px; font-weight: 700; color: var(--amber-600); background: var(--amber-50); padding: 0 4px; border-radius: 4px; }

  &__compare { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  &__slot { position: relative; }
  &__tag { position: absolute; top: -8px; left: 4px; z-index: 2; background: #fff; padding: 0 4px; font-size: 9px; font-weight: 500; color: var(--slate-400); &--new { color: var(--indigo-600); font-weight: 700; } }

  &__box {
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-700);
    &--old { font-size: 12px; color: var(--slate-500); opacity: 0.8; }
  }

  &__modes { display: flex; padding: 4px; background: #fff; border: 1px solid var(--slate-200); border-radius: 8px; }
  &__mode-wrap { flex: 1; }

  &__mode {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-500);
    cursor: pointer;
    transition: all 0.15s;
    &:hover { color: var(--slate-700); background: var(--slate-50); }
    &--free, &--free:hover { background: var(--slate-800); color: #fff; }
    &--structured, &--structured:hover { background: var(--indigo-600); color: #fff; }
  }

  &__mode-view {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 12px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-700);
    svg { color: var(--slate-500); }
    &--structured { color: var(--indigo-700); svg { color: var(--indigo-500); } }
  }

  &__mode-fields { padding-top: 8px; display: grid; grid-template-columns: 1fr; gap: 20px; }

  // ---------- Performance histórica ----------
  &__hist-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  &__sim { margin-left: 8px; }
  &__view-seg { margin-left: 8px; }
  &__link { font-size: 12px; color: var(--indigo-600); &:hover { background: var(--indigo-50); } }

  &__chart { padding: 24px; }

  &__scroll { overflow-x: auto; }

  &__table {
    width: 100%;
    min-width: 800px;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 12px;
    white-space: nowrap;
    th { background: var(--slate-50); height: 40px; padding: 0 8px; min-width: 150px; text-align: center; font-weight: 500; color: var(--slate-600); border-bottom: 1px solid var(--slate-200); }
    td { padding: 8px; text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; border-bottom: 1px solid var(--slate-200); }
    tbody tr:last-child td { border-bottom: 0; }
  }

  &__sticky {
    position: sticky;
    left: 0;
    z-index: 1;
    width: 200px;
    min-width: 200px !important;
    background: #fff;
    border-right: 1px solid var(--slate-100);
    text-align: left !important;
    font-family: inherit !important;
    font-weight: 500;
    color: var(--slate-700);
  }
  th.ld__sticky { background: var(--slate-50); font-weight: 700; }

  &__sim-wrap {
    overflow-x: auto;
    &--side { display: grid; grid-template-columns: 1fr 1fr; > * + * { border-left: 1px solid var(--slate-200); } }
    &--bottom { display: flex; flex-direction: column; > * + * { border-top: 1px solid var(--slate-200); } }
  }

  &__sim-panel { background: rgba(248, 250, 252, 0.3); min-width: 400px; &--proj { background: rgba(238, 242, 255, 0.1); } }

  &__sim-title {
    padding: 8px 16px;
    background: var(--slate-100);
    border-bottom: 1px solid var(--slate-200);
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    &--proj { display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--indigo-50); border-color: var(--indigo-100); color: var(--indigo-700); }
  }

  &__sim-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    th { height: 36px; padding: 0 8px; text-align: right; font-weight: 700; color: var(--slate-500); background: var(--slate-50); border-bottom: 1px solid var(--slate-200); &:first-child { text-align: left; width: 160px; } }
    td { padding: 8px; text-align: right; border-bottom: 1px solid var(--slate-100); &:first-child { text-align: left; } }
    tbody tr:last-child td { border-bottom: 0; }

    &--proj {
      th { color: var(--indigo-400); background: rgba(238, 242, 255, 0.3); border-color: var(--indigo-100); }
      td { border-color: var(--indigo-50); }
      .ld__sim-date { color: var(--indigo-400); }
    }
  }

  &__sim-date { font-size: 10px; color: var(--slate-500); white-space: nowrap; }
  &__proj-var { font-weight: 700; &--diff { background: var(--amber-100); color: var(--amber-800) !important; padding: 0 4px; border-radius: 4px; } }
}
</style>
