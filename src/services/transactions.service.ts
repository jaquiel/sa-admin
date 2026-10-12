import { api } from 'boot/axios';
import type { TransactionSummary, TransactionsSummary, Wallet } from 'src/types/api';
import { transactions as transactionsMock } from 'src/mocks/customer-profile';
import { unwrap, type ApiResponse, type PagedResponse } from './api-envelope';

const useMocks = process.env.USE_MOCKS === 'true';
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export interface TransactionListParams {
  page: number;
  pageSize: number;
  search?: string | undefined;
  type?: string | undefined;
  status?: string | undefined;
  /** yyyy-MM-dd (data UTC) */
  requestedFrom?: string | undefined;
  requestedTo?: string | undefined;
}

export interface TransactionPage {
  items: TransactionSummary[];
  totalItems: number;
  hasNextPage: boolean;
}

/** GET /admin/transactions (paginado; filtros aplicados no backend) */
export async function listAllTransactions(params: TransactionListParams): Promise<TransactionPage> {
  if (useMocks) {
    await delay();
    const items = transactionsMock.filter(
      (t) => (!params.type || t.type === params.type) && (!params.status || t.status === params.status),
    );
    return { items: structuredClone(items), totalItems: items.length, hasNextPage: false };
  }
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
  const { data } = await api.get<PagedResponse<TransactionSummary>>('/admin/transactions', { params: query });
  return {
    items: unwrap(data),
    totalItems: data.pagination?.totalItems ?? 0,
    hasNextPage: data.pagination?.hasNextPage ?? false,
  };
}

/** GET /admin/transactions/summary (saldos consolidados de todas as carteiras, por moeda) */
export async function getTransactionsSummary(): Promise<TransactionsSummary> {
  if (useMocks) {
    await delay();
    const zero = { balance: 0, reserved: 0, available: 0 };
    const free = { balance: 7830000, reserved: 0, available: 7830000 };
    const applied = { balance: 42860000, reserved: 0, available: 42860000 };
    return {
      calculatedAtUtc: new Date().toISOString(),
      currencies: [
        {
          currencyId: 'brl',
          currencyIsoCode: 'BRL',
          free,
          applied,
          total: { balance: 50690000, reserved: 0, available: 50690000 },
          contracts: { contractCount: 4, contractAllocation: 65250000, contractContributions: 0, total: 65250000 },
        },
        {
          currencyId: 'usd',
          currencyIsoCode: 'USD',
          free: zero,
          applied: zero,
          total: zero,
          contracts: { contractCount: 0, contractAllocation: 0, contractContributions: 0, total: 0 },
        },
      ],
    };
  }
  const { data } = await api.get<ApiResponse<TransactionsSummary>>('/admin/transactions/summary');
  return unwrap(data);
}

/** GET /admin/customers/:id/wallets */
export async function listCustomerWallets(customerId: string): Promise<Wallet[]> {
  if (useMocks) {
    await delay();
    return [
      { id: `${customerId}-free`, type: 'Free', currencyId: 'brl', currencyIsoCode: 'BRL', balance: 50000, reserved: 0, available: 50000 },
      { id: `${customerId}-applied`, type: 'Applied', currencyId: 'brl', currencyIsoCode: 'BRL', balance: 0, reserved: 0, available: 0 },
    ];
  }
  const { data } = await api.get<ApiResponse<Wallet[]>>(`/admin/customers/${customerId}/wallets`);
  return unwrap(data);
}

// ---- criação (a transação nasce em PendingValidation; a aprovação é feita pela fila de solicitações) ----

export interface CreateDepositPayload {
  clientId: string;
  currencyId: string;
  sourceBankAccountId: string;
  amount: number;
  observation?: string | null;
}

export interface CreateWithdrawalPayload {
  clientId: string;
  currencyId: string;
  destinationBankAccountId: string;
  amount: number;
  observation?: string | null;
}

/** Rotas aceitas: Free → Applied, Applied → Free e Applied → Contract. */
export interface CreateWalletTransferPayload {
  clientId: string;
  currencyId: string;
  sourceWallet: 'Free' | 'Applied';
  destinationType: 'Wallet' | 'Contract';
  destinationContractId?: string | null;
  amount: number;
  observation?: string | null;
}

export interface CreateContractOperationPayload {
  clientId: string;
  destinationContractId: string;
  amount: number;
  observation?: string | null;
}

export interface CreatedTransaction {
  id: string;
  requestNumber: string;
  status: string;
}

async function create(url: string, body: object): Promise<CreatedTransaction> {
  if (useMocks) {
    await delay();
    return { id: crypto.randomUUID(), requestNumber: 'REQ-MOCK', status: 'PendingValidation' };
  }
  const { data } = await api.post<ApiResponse<CreatedTransaction>>(url, body);
  return unwrap(data);
}

/** POST /admin/transactions/deposits */
export const createDeposit = (p: CreateDepositPayload) => create('/admin/transactions/deposits', p);
/** POST /admin/transactions/withdrawals */
export const createWithdrawal = (p: CreateWithdrawalPayload) => create('/admin/transactions/withdrawals', p);
/** POST /admin/transactions/wallet-transfers */
export const createWalletTransfer = (p: CreateWalletTransferPayload) => create('/admin/transactions/wallet-transfers', p);
/** POST /admin/transactions/contract-operations */
export const createContractOperation = (p: CreateContractOperationPayload) => create('/admin/transactions/contract-operations', p);

// ---- fila de solicitações ----

export type TransactionAction = 'Validate' | 'Approve' | 'Reject' | 'RequestCorrection' | 'Execute' | 'RetryExecution' | 'Cancel';

/** Status que ainda esperam alguma ação (os demais — Completed, Rejected, Canceled — são finais). */
export const OPEN_STATUSES = ['PendingValidation', 'AwaitingReceipt', 'CorrectionRequested', 'Validated', 'Approved', 'Failed'] as const;

/**
 * Ações aceitas em cada status (espelho de FinancialTransaction.CanTransition no backend, que continua validando).
 * A listagem não traz `availableActions`; buscar o detalhe de cada linha custaria uma chamada por transação.
 */
export const ACTIONS_BY_STATUS: Record<string, TransactionAction[]> = {
  PendingValidation: ['Validate', 'RequestCorrection', 'Reject', 'Cancel'],
  AwaitingReceipt: ['RequestCorrection', 'Cancel'],
  CorrectionRequested: ['Validate', 'Cancel'],
  Validated: ['Approve', 'RequestCorrection', 'Reject', 'Cancel'],
  Approved: ['Execute', 'Cancel'],
  Failed: ['RetryExecution', 'Cancel'],
};

/** Ações que exigem motivo. */
export const REASON_REQUIRED: ReadonlySet<TransactionAction> = new Set(['Reject', 'RequestCorrection', 'Cancel']);

/** Transações em aberto (uma chamada por status, até 100 cada), mais antigas primeiro. */
export async function listOpenTransactions(): Promise<TransactionSummary[]> {
  if (useMocks) {
    await delay();
    return [];
  }
  const pages = await Promise.all(
    OPEN_STATUSES.map((status) => listAllTransactions({ page: 1, pageSize: 100, status })),
  );
  return pages
    .flatMap((p) => p.items)
    .sort((a, b) => a.requestedAtUtc.localeCompare(b.requestedAtUtc));
}

/** POST /admin/transactions/:id/actions */
export async function applyTransactionAction(id: string, action: TransactionAction, reason?: string | null): Promise<CreatedTransaction> {
  if (useMocks) {
    await delay();
    return { id, requestNumber: 'REQ-MOCK', status: 'Completed' };
  }
  const { data } = await api.post<ApiResponse<CreatedTransaction>>(`/admin/transactions/${id}/actions`, { action, reason: reason ?? null });
  return unwrap(data);
}
