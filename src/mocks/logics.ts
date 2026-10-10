import { reactive } from 'vue';

// Dados de exemplo do Figma Make (logics/LogicsListScreen.tsx · LogicDetailsScreen.tsx · CreateLogicScreen.tsx).

export type LogicStatus = 'Active' | 'Paused' | 'Analysis' | 'Inactive';

export interface LogicSummary {
  id: string;
  name: string;
  description: string;
  status: LogicStatus;
  type: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  dailyReturn: number;
  operationalInterval: string;
  operationalIntervalSeconds: number;
  performanceYTD: number;
  performanceAllTime: number;
  contracts: { id: string; name: string }[];
  lastOscillationReset: string;
}

export const logicsMock = reactive<LogicSummary[]>([
  {
    id: 'LOG-24001', name: 'Growth Alpha V2', description: 'Lógica agressiva focada em maximização de retorno com alta volatilidade.',
    status: 'Active', type: 'Agressiva', currency: 'BRL', createdAt: '2023-12-01', updatedAt: '2024-02-15',
    dailyReturn: 1.25, operationalInterval: '1 min', operationalIntervalSeconds: 60, performanceYTD: 12.5, performanceAllTime: 45.2,
    contracts: [{ id: 'CT-001', name: 'Dólar Futuro - V2' }, { id: 'CT-003', name: 'Índice Bovespa - Alpha' }, { id: 'CT-008', name: 'Mini Dólar - Scalp' }],
    lastOscillationReset: '09:45',
  },
  {
    id: 'LOG-24002', name: 'Conservative Beta', description: 'Preservação de capital com baixa exposição e retorno consistente.',
    status: 'Active', type: 'Conservadora', currency: 'BRL', createdAt: '2024-01-10', updatedAt: '2024-02-10',
    dailyReturn: 0.45, operationalInterval: '5 min', operationalIntervalSeconds: 300, performanceYTD: 3.2, performanceAllTime: 8.4,
    contracts: [{ id: 'CT-002', name: 'Tesouro Direto - Longo' }, { id: 'CT-005', name: 'S&P 500 - Hedge' }],
    lastOscillationReset: '00:00',
  },
  {
    id: 'LOG-24003', name: 'Balanced Delta', description: 'Equilíbrio entre risco e retorno para médio prazo.',
    status: 'Analysis', type: 'Moderada', currency: 'USD', createdAt: '2024-02-01', updatedAt: '2024-02-18',
    dailyReturn: 0.8, operationalInterval: '15 min', operationalIntervalSeconds: 900, performanceYTD: -1.2, performanceAllTime: 5.6,
    contracts: [{ id: 'CT-012', name: 'Nasdaq - Tech' }],
    lastOscillationReset: '12:30',
  },
  {
    id: 'LOG-24004', name: 'Liquid Gamma', description: 'Foco em liquidez imediata e operações de curto prazo.',
    status: 'Inactive', type: 'Liquidez', currency: 'BRL', createdAt: '2023-06-15', updatedAt: '2023-12-20',
    dailyReturn: 0.15, operationalInterval: '30 s', operationalIntervalSeconds: 30, performanceYTD: -4.5, performanceAllTime: -1.5,
    contracts: [],
    lastOscillationReset: '08:00',
  },
  {
    id: 'LOG-24005', name: 'Frozen Alpha', description: 'Lógica bloqueada para reavaliação de parâmetros.',
    status: 'Paused', type: 'Bloqueada', currency: 'EUR', createdAt: '2022-05-01', updatedAt: '2024-01-05',
    dailyReturn: 0, operationalInterval: '10 min', operationalIntervalSeconds: 600, performanceYTD: 0, performanceAllTime: 22.1,
    contracts: [{ id: 'CT-099', name: 'Euro Stoxx 50' }, { id: 'CT-101', name: 'DAX 40' }, { id: 'CT-105', name: 'CAC 40' }, { id: 'CT-110', name: 'FTSE 100' }],
    lastOscillationReset: '00:00',
  },
  {
    id: 'LOG-24006', name: 'High Yield Omega', description: 'Estratégia experimental de alto rendimento.',
    status: 'Analysis', type: 'Agressiva', currency: 'USD', createdAt: '2024-02-10', updatedAt: '2024-02-19',
    dailyReturn: 2.5, operationalInterval: '1 min', operationalIntervalSeconds: 60, performanceYTD: 15.8, performanceAllTime: 15.8,
    contracts: [{ id: 'CT-200', name: 'Crypto - BTC' }, { id: 'CT-201', name: 'Crypto - ETH' }],
    lastOscillationReset: '02:00',
  },
]);

export function findLogic(id: string) {
  return logicsMock.find((l) => l.id === id);
}

/** Contratos disponíveis para vínculo ao criar uma lógica. */
export const availableContractsForLogic = [
  { id: 'CT-001', name: 'Dólar Futuro - V2', type: 'Future' },
  { id: 'CT-002', name: 'Tesouro Direto - Longo', type: 'Fixed Income' },
  { id: 'CT-003', name: 'Índice Bovespa - Alpha', type: 'Index' },
  { id: 'CT-004', name: 'S&P 500 - Hedge', type: 'Index' },
  { id: 'CT-005', name: 'Euro FX - Spot', type: 'Forex' },
];

// ---------- Detalhe da lógica ----------
export interface LogicParameters {
  name: string;
  delta: number;
  oscillationInterval: string;
  dailyFactor: number;
  dailyReturnTime: string;
  monthlyFactor: number;
  annualFactor: number;
  maxUpperBound: number | null;
  minUpperBound: number | null;
  maxLowerBound: number | null;
  minLowerBound: number | null;
  variationMode: 'free' | 'structured';
  freeVolatility: number;
  freeDispersion: number;
  structTrend: number;
  structConvergence: number;
}

export const initialLogicParams: LogicParameters = {
  name: 'Growth Alpha V2',
  delta: 1.05,
  oscillationInterval: '30min',
  dailyFactor: 0.15,
  dailyReturnTime: '00:00 GMT-3',
  monthlyFactor: 3.2,
  annualFactor: 45.9,
  maxUpperBound: 2.5,
  minUpperBound: 0.5,
  maxLowerBound: -1.5,
  minLowerBound: -0.2,
  variationMode: 'structured',
  freeVolatility: 1.2,
  freeDispersion: 0.8,
  structTrend: 0.5,
  structConvergence: 0.95,
};

export const logicHeaderIndicators = [
  { label: '7d', value: '+1.25%', trend: 'up' as const },
  { label: '30d', value: '+4.80%', trend: 'up' as const },
  { label: '90d', value: '+12.50%', trend: 'up' as const },
  { label: '1 ano', value: '+42.10%', trend: 'up' as const },
];

export type LinkedContractStatus = 'Active' | 'Analysis' | 'Closed' | 'Blocked' | 'Paused';

export const logicLinkedContracts = [
  { id: 'CTR-2024-001', name: 'Alpha Hedge Fund I', clients: ['Horizon Capital', 'Nexus Invest'], status: 'Active' as LinkedContractStatus, startDate: '01/01/2024', endDate: '31/12/2025', linkedSince: '15/12/2023', currency: 'BRL', initialCapital: 5000000, baseCapital: 5000000 },
  { id: 'CTR-2024-042', name: 'Private Equity Growth', clients: ['Aurora Invest'], status: 'Analysis' as LinkedContractStatus, startDate: '15/02/2024', endDate: '15/02/2026', linkedSince: '10/01/2024', currency: 'USD', initialCapital: 1200000, baseCapital: 1000000 },
  { id: 'CTR-2023-115', name: 'Legacy Patrimonial', clients: ['Grupo Legacy', 'Family Office A'], status: 'Active' as LinkedContractStatus, startDate: '10/11/2023', endDate: 'Indeterminado', linkedSince: '01/11/2023', currency: 'BRL', initialCapital: 15000000, baseCapital: 14500000 },
];

export interface HistoryRow {
  date: string;
  dateObj: Date;
  type: 'daily' | 'intraday';
  variation: number;
  maxNegOsc: number;
  maxPosOsc: number;
  avgOsc: number;
  params: {
    interval: string;
    upperMax: number | null;
    upperMin: number | null;
    lowerMax: number | null;
    lowerMin: number | null;
    dailyFactor: number;
  };
}

interface Scenario {
  date: string;
  dateObj: Date;
  baseVolatility: number;
  direction: 1 | -1;
  type: 'daily' | 'intraday';
}

/** 60 dias de cenário diário + intradiário (a cada 4h) nos 3 dias mais recentes. */
const marketScenarios: Scenario[] = (() => {
  const list: Scenario[] = [];
  const today = new Date();
  const dateFmt: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    list.push({ date: d.toLocaleDateString('pt-BR', dateFmt), dateObj: d, baseVolatility: 0.5 + Math.random(), direction: Math.random() > 0.4 ? 1 : -1, type: 'daily' });
    if (i < 3) {
      for (let h = 4; h <= 20; h += 4) {
        const intra = new Date(d);
        intra.setHours(h, 0, 0, 0);
        const time = intra.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        list.push({ date: `${intra.toLocaleDateString('pt-BR', dateFmt)} ${time}`, dateObj: intra, baseVolatility: 0.3 + Math.random() * 0.5, direction: Math.random() > 0.5 ? 1 : -1, type: 'intraday' });
      }
    }
  }
  return list.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
})();

/** Simula o histórico a partir dos parâmetros (usado também na projeção em edição). */
export function calculateLogicHistory(p: LogicParameters): HistoryRow[] {
  return marketScenarios.map((s, idx) => {
    const drift = p.dailyFactor / 10;
    const mode = p.variationMode === 'free' ? p.freeVolatility || 1.2 : 0.8 + (p.structTrend || 0.5) * 0.1;
    let v = s.baseVolatility * mode * s.direction + drift;
    if (p.maxUpperBound !== null && v > p.maxUpperBound) v = p.maxUpperBound;
    if (p.maxLowerBound !== null && v < p.maxLowerBound) v = p.maxLowerBound;
    const amp = s.baseVolatility * 1.2 * mode;
    const maxPosOsc = p.maxUpperBound !== null ? Math.min(amp, p.maxUpperBound) : amp;
    const maxNegOsc = p.maxLowerBound !== null ? Math.max(-amp, p.maxLowerBound) : -amp;
    const variance = idx % 5 === 0 ? 0.1 : 0;
    return {
      date: s.date,
      dateObj: new Date(s.dateObj),
      type: s.type,
      variation: v,
      maxPosOsc,
      maxNegOsc,
      avgOsc: (Math.abs(maxPosOsc) + Math.abs(maxNegOsc)) / 2,
      params: {
        interval: p.oscillationInterval,
        upperMax: p.maxUpperBound ? p.maxUpperBound - variance : null,
        upperMin: p.minUpperBound,
        lowerMax: p.maxLowerBound,
        lowerMin: p.minLowerBound ? p.minLowerBound + variance : null,
        dailyFactor: p.dailyFactor,
      },
    };
  });
}
