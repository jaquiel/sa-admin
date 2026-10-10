// Dados de exemplo do Figma Make (transactions/*.tsx).

export type TransactionType = 'Deposit' | 'Withdraw' | 'Transfer';
export type TransactionStatus = 'Completed' | 'Processing' | 'Cancelled' | 'Rejected';

export type OpRequestType = 'Internal' | 'Liquidation' | 'Mint' | 'Burn';
export type OpRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface OpRequest {
  id: string;
  type: OpRequestType;
  hash: string;
  origin?: string;
  destination?: string;
  value: number;
  requester: string;
  date: string;
  status: OpRequestStatus;
  details?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  referenceAccount: string;
  origin: string;
  destination: string;
  value: number;
  currency: string;
  date: string;
  status: TransactionStatus;
  executor: string;
  hasDocument: boolean;
  details?: { observation?: string; reference?: string; contractId?: string; clientName?: string; auditLog?: string };
}

export const financialSummary = {
  invested: { usd: 8200000, brl: 42860000, rate: 5.22, trend: '+2.4%' },
  free: { usd: 1500000, brl: 7830000, rate: 5.22 },
  total: { usd: 9700000, brl: 50690000, rate: 5.22 },
  contracts: { usd: 12500000, brl: 65250000, rate: 5.22 },
};

export const transactionsMock: Transaction[] = [
  {
    id: 'TRX-9821', type: 'Deposit', referenceAccount: 'Carteira Principal (A)', origin: 'Banco Externo (Itaú)', destination: 'Carteira Principal (A)',
    value: 150000, currency: 'BRL', date: '2024-02-25T10:30:00', status: 'Completed', executor: 'Ana Silva', hasDocument: true,
    details: { reference: 'DEP-EXT-001', observation: 'Aporte inicial para liquidez.', auditLog: 'Criado por Ana Silva em 25/02 às 10:25.' },
  },
  {
    id: 'TRX-9822', type: 'Transfer', referenceAccount: 'Carteira Principal (A)', origin: 'Carteira Principal (A)', destination: 'Carteira de Risco (B)',
    value: 50000, currency: 'BRL', date: '2024-02-25T11:15:00', status: 'Completed', executor: 'Carlos Adm', hasDocument: false,
    details: { observation: 'Rebalanceamento automático.', auditLog: 'Execução automática autorizada por Carlos Adm.' },
  },
  {
    id: 'TRX-9823', type: 'Withdraw', referenceAccount: 'Carteira de Risco (B)', origin: 'Carteira de Risco (B)', destination: 'Marcos Oliveira',
    value: 12500, currency: 'BRL', date: '2024-02-24T16:45:00', status: 'Processing', executor: 'Sistema', hasDocument: true,
    details: { contractId: 'CT-005', clientName: 'Marcos Oliveira', observation: 'Solicitação de resgate via portal.', auditLog: 'Aguardando aprovação final da tesouraria.' },
  },
];

export const internalWallets = [
  { id: 'wallet-a', name: 'Carteira Principal (A)', currency: 'BRL' },
  { id: 'wallet-b', name: 'Carteira de Risco (B)', currency: 'BRL' },
  { id: 'wallet-c', name: 'Carteira Externa (C)', currency: 'USD/EUR' },
  { id: 'wallet-corp', name: 'Carteira Institucional (Corp)', currency: 'USD' },
];

export const contractsForLiquidation = [
  {
    id: 'CT-2021-001', name: 'Alpha Hedge Fund', value: 125000,
    clients: [
      { name: 'Global Ventures Ltd.', wallet: 'Carteira Principal - USD', id: 'W-902', percent: 0.6 },
      { name: 'Roberto Silva', wallet: 'Carteira Pessoal', id: 'W-104', percent: 0.4 },
    ],
  },
  {
    id: 'CT-2023-012', name: 'Gamma Yield Secure', value: 250000,
    clients: [{ name: 'Invest Corp International', wallet: 'Fundo de Reserva EUR', id: 'W-555', percent: 1.0 }],
  },
];

export const opHistoryMock: OpRequest[] = [
  { id: 'OP-001', type: 'Liquidation', hash: '0x8f...3a1 (Prov)', origin: 'Alpha Hedge Fund', destination: 'Múltiplos Destinos (Split)', value: 450000, requester: 'Roberto Admin', date: '2024-02-27T08:15:00', status: 'Pending', details: 'Liquidação do contrato CT-2019-88' },
  { id: 'OP-002', type: 'Mint', hash: '0x9a...b22', origin: 'Sistema', destination: 'Carteira Institucional', value: 1000000, requester: 'Diretoria Financeira', date: '2024-02-26T14:30:00', status: 'Approved', details: 'Aporte de capital Q1.' },
  { id: 'OP-003', type: 'Internal', hash: '0x7c...d11', origin: 'Carteira de Risco (B)', destination: 'Carteira Principal (A)', value: 50000, requester: 'Sistema Automático', date: '2024-02-25T18:00:00', status: 'Rejected', details: 'Saldo insuficiente no momento da execução.' },
];

export const mintCurrencies = [
  { code: 'BRL', name: 'Real Brasileiro', rateToUsd: 1 / 5.22, symbol: 'R$' },
  { code: 'AUD', name: 'Dólar Australiano', rateToUsd: 0.6, symbol: 'A$' },
  { code: 'EUR', name: 'Euro', rateToUsd: 1.08, symbol: '€' },
  { code: 'GBP', name: 'Libra Esterlina', rateToUsd: 1.26, symbol: '£' },
];

export interface OpClientWallet { id: string; name: string; currency: string; balance: number; type: string }
export interface OpClientBank { id: string; name: string; agency: string; account: string; type: string; pix: string | null }
export interface OpClient { id: string; name: string; wallets: OpClientWallet[]; banks: OpClientBank[] }

export const opClientsDb: OpClient[] = [
  {
    id: 'CL-001', name: 'Strategy Holdings (Matriz)',
    wallets: [
      { id: 'CART-0041', name: 'Carteira Aplicada Global', currency: 'USD', balance: 850000, type: 'Investimento' },
      { id: 'CART-0042', name: 'Caixa Operacional BRL', currency: 'BRL', balance: 4500000, type: 'Corrente' },
    ],
    banks: [
      { id: 'BK-01', name: 'Banco Itaú', agency: '0341', account: '55123-9', type: 'Conta Corrente', pix: 'financeiro@strategy.com' },
      { id: 'BK-02', name: 'Banco Safra', agency: '0012', account: '12900-1', type: 'Conta Investimento', pix: null },
    ],
  },
  {
    id: 'CL-002', name: 'Global Assets Fund',
    wallets: [
      { id: 'CART-0020', name: 'Carteira Livre USD', currency: 'USD', balance: 120000, type: 'Liquidez' },
      { id: 'CART-0021', name: 'Reserva Tática EUR', currency: 'EUR', balance: 50000, type: 'Reserva' },
    ],
    banks: [{ id: 'BK-03', name: 'Santander Select', agency: '1102', account: '99012-4', type: 'Conta Mestra', pix: 'fund@globalassets.com' }],
  },
  {
    id: 'CL-003', name: 'Tesouraria Central',
    wallets: [{ id: 'CART-CORP', name: 'Master Account', currency: 'USD', balance: 12500000, type: 'Master' }],
    banks: [
      { id: 'BK-04', name: 'BTG Pactual', agency: '0001', account: '44211-0', type: 'Tesouraria', pix: 'treasury@central.com' },
      { id: 'BK-05', name: 'XP Investimentos', agency: '0001', account: '88211-2', type: 'Custódia', pix: null },
    ],
  },
];

// ---------- Carteira de Contratos ----------
export type CurrencyCode = 'USD' | 'BRL' | 'EUR' | 'JPY' | 'AUD' | 'GBP';

export interface ContractWalletItem {
  id: string;
  name: string;
  linkedAccount: string;
  clients: { name: string; clientWallet: string }[];
  signedCurrency: CurrencyCode;
  valueUSD: number;
  valueBRL: number;
  valueSigned: number;
  startDate: string;
  endDate: string;
  rates: { usdToBrl: number; usdToSigned: number };
  perfTotal: { points: number; percent: number };
  perfYTD: { points: number; percent: number };
}

export const contractWalletsMock: ContractWalletItem[] = [
  { id: 'CT-2021-001', name: 'Alpha Hedge Fund', linkedAccount: 'Carteira A', clients: [{ name: 'Global Ventures Ltd.', clientWallet: 'Carteira Principal - USD' }, { name: 'Roberto Silva', clientWallet: 'Carteira Pessoal' }], signedCurrency: 'USD', valueUSD: 125000, valueBRL: 653750, valueSigned: 125000, startDate: '2021-03-15', endDate: '2026-03-15', rates: { usdToBrl: 5.23, usdToSigned: 1.0 }, perfTotal: { points: 15420, percent: 42.5 }, perfYTD: { points: 1250, percent: 5.2 } },
  { id: 'CT-2022-045', name: 'Beta Growth Spec', linkedAccount: 'Carteira de Contratos', clients: [{ name: 'Construtora Horizonte', clientWallet: 'Tesouraria Corporativa' }], signedCurrency: 'BRL', valueUSD: 50000, valueBRL: 261500, valueSigned: 261500, startDate: '2022-06-01', endDate: '2025-06-01', rates: { usdToBrl: 5.23, usdToSigned: 5.23 }, perfTotal: { points: 8900, percent: 28.4 }, perfYTD: { points: 3400, percent: 8.9 } },
  { id: 'CT-2023-012', name: 'Gamma Yield Secure', linkedAccount: 'Carteira B', clients: [{ name: 'Invest Corp International', clientWallet: 'Fundo de Reserva EUR' }], signedCurrency: 'EUR', valueUSD: 250000, valueBRL: 1307500, valueSigned: 230000, startDate: '2023-01-10', endDate: '2028-01-10', rates: { usdToBrl: 5.23, usdToSigned: 0.92 }, perfTotal: { points: -1200, percent: -2.1 }, perfYTD: { points: 450, percent: 1.2 } },
  { id: 'CT-2020-099', name: 'Legacy Prime', linkedAccount: 'Carteira A', clients: [{ name: 'Família Sato Trust', clientWallet: 'Carteira Patrimonial (Japão)' }, { name: 'Kenji Sato', clientWallet: 'Carteira de Dividendos' }], signedCurrency: 'JPY', valueUSD: 500000, valueBRL: 2615000, valueSigned: 76600000, startDate: '2020-11-20', endDate: '2025-11-20', rates: { usdToBrl: 5.23, usdToSigned: 153.2 }, perfTotal: { points: 45000, percent: 85.0 }, perfYTD: { points: 2100, percent: 4.5 } },
  { id: 'CT-2024-003', name: 'Novo Horizonte Aggressive', linkedAccount: 'Carteira de Contratos', clients: [{ name: 'Startup Tech Solutions', clientWallet: 'Capital de Giro AUD' }], signedCurrency: 'AUD', valueUSD: 10000, valueBRL: 52300, valueSigned: 15305, startDate: '2024-02-01', endDate: '2024-12-31', rates: { usdToBrl: 5.23, usdToSigned: 1.53 }, perfTotal: { points: 150, percent: 1.5 }, perfYTD: { points: 150, percent: 1.5 } },
  { id: 'CT-2018-055', name: 'Vintage Strategy', linkedAccount: 'Carteira A', clients: [{ name: 'Legacy Holdings', clientWallet: 'Fundo Expirado 2018' }], signedCurrency: 'USD', valueUSD: 100000, valueBRL: 523000, valueSigned: 100000, startDate: '2018-05-15', endDate: '2023-05-15', rates: { usdToBrl: 5.23, usdToSigned: 1.0 }, perfTotal: { points: 65000, percent: 120.5 }, perfYTD: { points: 0, percent: 0 } },
];

// ---------- Carteiras Aplicadas / Livres ----------
export type WalletTxType = 'Deposit' | 'Withdraw' | 'Transfer' | 'Profit' | 'Fee';

export interface WalletTransaction {
  id: string;
  hash: string;
  date: string;
  type: WalletTxType;
  origin?: string;
  destination?: string;
  value: number;
  dailyBalance: number;
  currency: string;
  status: 'Completed' | 'Processing' | 'Failed';
}

export interface AppliedWallet {
  id: string;
  clientId: string;
  clientName: string;
  balance: number;
  currency: string;
  status: 'Active' | 'Inactive';
  lastUpdate: string;
  performance: string;
  recentTransactions: WalletTransaction[];
}

export const appliedWalletsMock: AppliedWallet[] = [
  {
    id: 'CART-INV-001', clientId: 'CL-001', clientName: 'Strategy Holdings (Matriz)', balance: 850000, currency: 'USD', status: 'Active', lastUpdate: '2024-02-27T10:00:00', performance: '+12.4%',
    recentTransactions: [
      { id: 'TRX-101', hash: '0x8a...991', date: '2024-02-27T10:00:00', type: 'Profit', value: 12500, dailyBalance: 850000, currency: 'USD', status: 'Completed', origin: 'Yield Farming A', destination: 'Carteira Aplicada' },
      { id: 'TRX-102', hash: '0x7b...882', date: '2024-02-25T14:30:00', type: 'Deposit', value: 50000, dailyBalance: 837500, currency: 'USD', status: 'Completed', origin: 'Banco Externo', destination: 'Carteira Aplicada' },
      { id: 'TRX-103', hash: '0x6c...773', date: '2024-02-20T09:15:00', type: 'Fee', value: 250, dailyBalance: 787500, currency: 'USD', status: 'Completed', origin: 'Carteira Aplicada', destination: 'Taxa Adm' },
    ],
  },
  {
    id: 'CART-INV-002', clientId: 'CL-002', clientName: 'Global Assets Fund', balance: 2100000, currency: 'USD', status: 'Active', lastUpdate: '2024-02-26T16:45:00', performance: '+8.2%',
    recentTransactions: [
      { id: 'TRX-201', hash: '0x5d...664', date: '2024-02-26T16:45:00', type: 'Withdraw', value: 100000, dailyBalance: 2100000, currency: 'USD', status: 'Processing', origin: 'Carteira Aplicada', destination: 'Carteira Livre' },
      { id: 'TRX-202', hash: '0x4e...555', date: '2024-02-15T11:20:00', type: 'Profit', value: 45000, dailyBalance: 2200000, currency: 'USD', status: 'Completed', origin: 'Staking Pool B', destination: 'Carteira Aplicada' },
    ],
  },
  {
    id: 'CART-INV-003', clientId: 'CL-005', clientName: 'Roberto Silva', balance: 320000, currency: 'BRL', status: 'Active', lastUpdate: '2024-02-24T09:00:00', performance: '+5.1%',
    recentTransactions: [
      { id: 'TRX-301', hash: '0x3f...446', date: '2024-02-24T09:00:00', type: 'Deposit', value: 50000, dailyBalance: 320000, currency: 'BRL', status: 'Completed', origin: 'PIX', destination: 'Carteira Aplicada' },
    ],
  },
  { id: 'CART-INV-004', clientId: 'CL-008', clientName: 'Alpha Ventures', balance: 1500000, currency: 'EUR', status: 'Inactive', lastUpdate: '2023-12-10T14:00:00', performance: '0.0%', recentTransactions: [] },
];

export interface FreeWallet {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  balance: number;
  currency: string;
  lastUpdate: string;
  recentTransactions: WalletTransaction[];
}

export const freeWalletsMock: FreeWallet[] = [
  {
    id: 'CART-FREE-001', name: 'Carteira Livre USD', clientId: 'CL-001', clientName: 'Strategy Holdings (Matriz)', balance: 150000, currency: 'USD', lastUpdate: '2024-02-27T11:00:00',
    recentTransactions: [
      { id: 'TRX-501', hash: '0x1a...221', date: '2024-02-27T11:00:00', type: 'Deposit', value: 25000, dailyBalance: 150000, currency: 'USD', status: 'Completed', origin: 'Banco Externo', destination: 'Carteira Livre' },
      { id: 'TRX-502', hash: '0x2b...332', date: '2024-02-26T09:30:00', type: 'Transfer', value: 10000, dailyBalance: 125000, currency: 'USD', status: 'Completed', origin: 'Carteira Livre', destination: 'Carteira Aplicada' },
      { id: 'TRX-503', hash: '0x3c...443', date: '2024-02-25T14:15:00', type: 'Withdraw', value: 5000, dailyBalance: 135000, currency: 'USD', status: 'Completed', origin: 'Carteira Livre', destination: 'Fornecedor X' },
    ],
  },
  {
    id: 'CART-FREE-002', name: 'Liquidez Global EUR', clientId: 'CL-002', clientName: 'Global Assets Fund', balance: 45000, currency: 'EUR', lastUpdate: '2024-02-26T15:45:00',
    recentTransactions: [
      { id: 'TRX-601', hash: '0x4d...554', date: '2024-02-26T15:45:00', type: 'Deposit', value: 15000, dailyBalance: 45000, currency: 'EUR', status: 'Completed', origin: 'Câmbio', destination: 'Carteira Livre' },
    ],
  },
  {
    id: 'CART-FREE-003', name: 'Caixa Rápido BRL', clientId: 'CL-005', clientName: 'Roberto Silva', balance: 12500, currency: 'BRL', lastUpdate: '2024-02-24T10:00:00',
    recentTransactions: [
      { id: 'TRX-701', hash: '0x5e...665', date: '2024-02-24T10:00:00', type: 'Transfer', value: 2000, dailyBalance: 12500, currency: 'BRL', status: 'Completed', origin: 'Carteira Aplicada', destination: 'Carteira Livre' },
      { id: 'TRX-702', hash: '0x6f...776', date: '2024-02-23T08:00:00', type: 'Deposit', value: 5000, dailyBalance: 10500, currency: 'BRL', status: 'Completed', origin: 'PIX', destination: 'Carteira Livre' },
    ],
  },
  { id: 'CART-FREE-004', name: 'Reserva USD', clientId: 'CL-008', clientName: 'Alpha Ventures', balance: 78000, currency: 'USD', lastUpdate: '2024-02-22T16:20:00', recentTransactions: [] },
];
