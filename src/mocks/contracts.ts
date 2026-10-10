import { reactive } from 'vue';
import type { ContractClient } from 'src/types/contract';
export type { ClientStatus, ContractClient } from 'src/types/contract';

// Dados de exemplo do Figma Make (contracts/*.tsx · logic/ContractLogicScreen.tsx).
// Ainda não há endpoint de contratos: as telas usam estes mocks em memória.

export type ContractStatus = 'Active' | 'Ended' | 'Analysis' | 'Blocked';

export interface ContractSummary {
  id: string;
  name: string;
  clients: string[];
  initialCapital: number;
  baseCapital: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  contractLogic: string;
  dividendLogic: string;
  createdAt: string;
  currency: string;
}


/** Clientes já vinculados a algum contrato (ContractsScreen + ContractsListScreen). */
export const contractClientsDb: ContractClient[] = [
  { id: '1', name: 'Holding Familiar S.A.', type: 'PJ', document: '12.345.678/0001-90', email: 'contato@holding.com', status: 'Active', docLevel: 'Nível 3', docStatus: 'Complete', linkedDate: '15/01/2024' },
  { id: '2', name: 'Invest Corp LTDA', type: 'PJ', document: '98.765.432/0001-10', email: 'financeiro@investcorp.com', status: 'Active', docLevel: 'Nível 3', docStatus: 'Complete', linkedDate: '20/02/2024' },
  { id: '3', name: 'João Silva', type: 'PF', document: '***.456.789-**', email: 'joao.silva@email.com', status: 'Active', docLevel: 'Nível 2', docStatus: 'Complete', linkedDate: '10/03/2024' },
  { id: '4', name: 'Maria Oliveira', type: 'PF', document: '***.123.456-**', email: 'maria.o@email.com', status: 'Analysis', docLevel: 'Nível 1', docStatus: 'Incomplete', linkedDate: '05/04/2024' },
  { id: '5', name: 'Global Assets Inc.', type: 'PJ', document: '45.678.901/0001-23', email: 'admin@globalassets.com', status: 'Blocked', docLevel: 'Nível 1', docStatus: 'Incomplete', linkedDate: '12/04/2024' },
  { id: '6', name: 'Pedro Santos', type: 'PF', document: '***.789.012-**', email: 'pedro.s@email.com', status: 'Active', docLevel: 'Nível 2', docStatus: 'Complete', linkedDate: '15/05/2024' },
  { id: '7', name: 'Tech Solutions S.A.', type: 'PJ', document: '32.165.498/0001-55', email: 'tech@solutions.com', status: 'Active', docLevel: 'Nível 3', docStatus: 'Complete', linkedDate: '20/05/2024' },
  { id: '8', name: 'Ana Souza', type: 'PF', document: '***.234.567-**', email: 'ana.souza@email.com', status: 'Active', docLevel: 'Nível 2', docStatus: 'Complete', linkedDate: '01/06/2024' },
  { id: '9', name: 'Roberto Mendes', type: 'PF', document: '***.555.666-**', email: 'roberto@email.com', status: 'Active', docLevel: 'Nível 2', docStatus: 'Complete', linkedDate: '' },
  { id: '10', name: 'Empresa X Ltda', type: 'PJ', document: '11.222.333/0001-44', email: 'contato@empresax.com', status: 'Blocked', docLevel: 'Nível 1', docStatus: 'Incomplete', linkedDate: '01/05/2022' },
];

/** Clientes disponíveis para vínculo no modo de edição (LinkedClientsCard). */
export const availableClientsDb: ContractClient[] = [
  { id: '101', name: 'Carlos Eduardo Silva', type: 'PF', document: '111.222.333-44', email: 'carlos.silva@email.com', status: 'Active', docLevel: 'Nível 2', docStatus: 'Complete', linkedDate: '' },
  { id: '102', name: 'Fernanda Costa', type: 'PF', document: '222.333.444-55', email: 'fernanda.costa@email.com', status: 'Analysis', docLevel: 'Nível 1', docStatus: 'Incomplete', linkedDate: '' },
  { id: '103', name: 'Alpha Investimentos S.A.', type: 'PJ', document: '12.345.678/0001-99', email: 'contato@alpha.com', status: 'Active', docLevel: 'Nível 3', docStatus: 'Complete', linkedDate: '' },
  { id: '104', name: 'Beta Solutions LTDA', type: 'PJ', document: '98.765.432/0001-88', email: 'financeiro@beta.com', status: 'Blocked', docLevel: 'Nível 2', docStatus: 'Complete', linkedDate: '' },
  { id: '105', name: 'Roberto Almeida', type: 'PF', document: '333.444.555-66', email: 'roberto.almeida@email.com', status: 'Active', docLevel: 'Nível 3', docStatus: 'Complete', linkedDate: '' },
];

export const contractsMock = reactive<ContractSummary[]>([
  { id: '000123', name: 'Contrato de Expansão Global V2', clients: ['Holding Familiar S.A.', 'Invest Corp LTDA'], initialCapital: 1000000, baseCapital: 1500000, startDate: '2024-01-15', endDate: '2029-01-15', status: 'Active', contractLogic: 'Growth Alpha V2', dividendLogic: 'Quarterly Yield+', createdAt: '2023-12-20', currency: 'BRL' },
  { id: '000124', name: 'Fundo de Reserva Estratégica', clients: ['Tech Solutions S.A.'], initialCapital: 500000, baseCapital: 550000, startDate: '2024-03-01', endDate: '2026-03-01', status: 'Active', contractLogic: 'Conservative Beta', dividendLogic: 'Annual Fixed', createdAt: '2024-02-15', currency: 'BRL' },
  { id: '000120', name: 'Gestão Patrimonial Privada', clients: ['João Silva', 'Maria Oliveira'], initialCapital: 2500000, baseCapital: 2500000, startDate: '2023-11-10', endDate: '2028-11-10', status: 'Analysis', contractLogic: 'Balanced Delta', dividendLogic: 'Monthly Income', createdAt: '2023-11-01', currency: 'BRL' },
  { id: '000115', name: 'Liquidez Imediata Corporativa', clients: ['Global Assets Inc.'], initialCapital: 750000, baseCapital: 800000, startDate: '2023-06-01', endDate: '2024-06-01', status: 'Ended', contractLogic: 'Liquid Gamma', dividendLogic: 'On Demand', createdAt: '2023-05-20', currency: 'BRL' },
  { id: '000125', name: 'Parceria Estratégica 2025', clients: ['Pedro Santos', 'Ana Souza'], initialCapital: 1200000, baseCapital: 1200000, startDate: '2025-01-01', endDate: '2030-01-01', status: 'Active', contractLogic: 'Growth Alpha V2', dividendLogic: 'Quarterly Yield+', createdAt: '2024-12-10', currency: 'BRL' },
  { id: '000118', name: 'Fundo Bloqueado Judicial', clients: ['Empresa X Ltda'], initialCapital: 300000, baseCapital: 300000, startDate: '2022-05-15', endDate: '2027-05-15', status: 'Blocked', contractLogic: 'Frozen Alpha', dividendLogic: 'None', createdAt: '2022-05-01', currency: 'BRL' },
]);

export function findContract(id: string) {
  return contractsMock.find((c) => c.id === id);
}

export function clientByName(name: string): ContractClient {
  return (
    contractClientsDb.find((c) => c.name === name) ?? {
      id: '0', name, type: 'PF', document: '---', status: 'Active', docLevel: 'Nível 1', docStatus: 'Incomplete', linkedDate: '',
    }
  );
}

export const CURRENCIES = [
  { id: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { id: 'USD', name: 'Dólar Americano', symbol: 'US$' },
  { id: 'EUR', name: 'Euro', symbol: '€' },
];

export const CONTRACT_LOGICS = ['Growth Alpha V2', 'Conservative Beta', 'Balanced Delta', 'Liquid Gamma', 'Frozen Alpha', 'High Yield Omega'];
export const DIVIDEND_LOGICS = ['Quarterly Yield+', 'Annual Fixed', 'Monthly Income', 'On Demand', 'Reinvest All', 'None'];

// ---------- Histórico de aportes (ContributionHistory) ----------
export type ContributionType = 'Aporte Inicial' | 'Aporte Adicional' | 'Reforço de Capital';

export interface Contribution {
  id: string;
  date: string;
  type: ContributionType;
  value: number;
  origin: string;
  responsible: string;
}

export const contributionsMock: Contribution[] = [
  { id: '1', date: '15/01/2024', type: 'Aporte Inicial', value: 1000000, origin: 'Transferência TED - Banco Safra', responsible: 'Sistema (Contrato)' },
  { id: '2', date: '10/06/2024', type: 'Aporte Adicional', value: 300000, origin: 'PIX - Chave CNPJ', responsible: 'Carlos Eduardo (Gerente)' },
  { id: '3', date: '22/01/2025', type: 'Reforço de Capital', value: 200000, origin: 'Transferência Interna - CC', responsible: 'Ana Souza (Financeiro)' },
];

// ---------- Saldo e desempenho (ContractSummary) ----------
/** 25 meses de histórico + 37 de projeção (o último ponto histórico conecta as duas linhas). */
export const performanceChart = (() => {
  const history: (number | null)[] = [];
  const projection: (number | null)[] = [];
  let value = 1000000;
  for (let i = 0; i <= 24; i++) {
    value *= 1 + Math.random() * 0.02;
    history.push(Math.round(value));
    projection.push(i === 24 ? Math.round(value) : null);
  }
  for (let i = 25; i <= 61; i++) {
    value *= 1.012;
    history.push(null);
    projection.push(Math.round(value));
  }
  return { history, projection, todayIndex: 24 };
})();

// ---------- Performance histórica (ContractTable) ----------
export type MetricType = 'currency' | 'diff' | 'percent_badge' | 'diff_badge';

export interface Metric {
  id: string;
  label: string;
  type: MetricType;
  description?: string;
}

export const contractMetrics: Metric[] = [
  { id: 'baseValue', label: 'Capital Base', type: 'currency', description: 'Capital Inicial + Aportes' },
  { id: 'currentValue', label: 'Capital Consolidado Atual', type: 'currency' },
  { id: 'totalVariation', label: 'Retorno Acumulado do Contrato', type: 'diff' },
  { id: 'dailyVariation', label: 'Retorno Diário do Contrato', type: 'diff' },
  { id: 'openPrice', label: 'Preço de Referência de Abertura', type: 'currency' },
  { id: 'closePrice', label: 'Preço de Referência de Fechamento', type: 'currency' },
  { id: 'logicalYield', label: 'Resultado da Lógica Contratual', type: 'percent_badge' },
  { id: 'distributedYield', label: 'Resultado da Lógica de Dividendos', type: 'diff_badge' },
];

export interface MetricCell {
  val: number;
  pct?: number;
  label?: string;
}

const variation = (base: number) => Math.round(base * (1 + (Math.random() * 0.05 - 0.01)));
const diff = (): MetricCell => ({ val: Math.round(Math.random() * 50000 - 10000), pct: Number((Math.random() * 5 - 1).toFixed(1)) });

function buildMetricRows(length: number): Record<string, MetricCell[]> {
  const fill = (fn: () => MetricCell) => Array.from({ length }, fn);
  return {
    baseValue: fill(() => ({ val: 1500000 })),
    currentValue: fill(() => ({ val: variation(1500000) })),
    totalVariation: fill(diff),
    dailyVariation: fill(diff),
    openPrice: fill(() => ({ val: variation(1500000) })),
    closePrice: fill(() => ({ val: variation(1500000) })),
    logicalYield: fill(() => ({ val: 0.25, label: 'Growth Alpha' })),
    distributedYield: fill(() => ({ val: 0, pct: 0, label: 'Quarterly+' })),
  };
}

export const summaryDates = ['10/02/25', '11/02/25', '12/02/25', '13/02/25', '14/02/25', '15/02/25', '16/02/25', '17/02/25', '18/02/25', '19/02/25', '20/02/25', '21/02/25', '22/02/25'];
export const summaryMetricData = buildMetricRows(summaryDates.length);

/** 181 dias até 22/02/2025, para o histórico completo em tela cheia. */
export const fullHistoryDates = Array.from({ length: 181 }, (_, idx) => {
  const d = new Date(2025, 1, 22);
  d.setDate(d.getDate() - (180 - idx));
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
});
export const fullHistoryMetricData = buildMetricRows(fullHistoryDates.length);

// ---------- Lógica do contrato (ContractLogicScreen) ----------
export interface ContractLogicParams {
  name: string;
  delta: number;
  dailyFactor: number;
  monthlyFactor: number;
  annualFactor: number;
  maxUpperBound: number;
  minUpperBound: number;
  maxLowerBound: number;
  minLowerBound: number;
}

export const contractLogicParams: ContractLogicParams = {
  name: 'Growth Alpha V2',
  delta: 1.05,
  dailyFactor: 0.15,
  monthlyFactor: 4.5,
  annualFactor: 54.0,
  maxUpperBound: 2.5,
  minUpperBound: 0.5,
  maxLowerBound: -1.5,
  minLowerBound: -0.2,
};

export interface TrendIndicator {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  comparison: string;
}

export const contractLogicIndicators: TrendIndicator[] = [
  { label: 'Valorização (7d)', value: '+1.25%', trend: 'up', comparison: 'vs semana anterior' },
  { label: 'Valorização (30d)', value: '+4.80%', trend: 'up', comparison: 'vs mês anterior' },
  { label: 'Valorização (90d)', value: '+12.50%', trend: 'up', comparison: 'vs trimestre anterior' },
  { label: 'Valorização (1 ano)', value: '+42.10%', trend: 'up', comparison: 'vs ano anterior' },
  { label: 'Intervalo de Oscilação', value: '30min', trend: 'neutral', comparison: 'Estável' },
];

export const contractLogicHistory = Array.from({ length: 15 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return {
    date: date.toLocaleDateString('pt-BR'),
    price: 100 + Math.random() * 10 - 5,
    variation: Math.random() * 2 - 1,
    open: 100 + Math.random() * 5,
    close: 100 + Math.random() * 5,
    maxNegOsc: -Math.random(),
    maxPosOsc: Math.random(),
    avgOsc: Math.random() * 0.5,
  };
});
