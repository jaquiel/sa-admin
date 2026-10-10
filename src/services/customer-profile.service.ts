import { api } from 'boot/axios';
import type {
  AssetKind,
  Bank,
  BankAccountRequest,
  ContractListItem,
  CustomerAsset,
  CustomerAssetDocument,
  CustomerBankAccount,
  CustomerIdentification,
  CustomerOverview,
  CustomerPreferences,
  GroupedDocuments,
  Portfolio,
  PortfolioComposition,
  TimelineEvent,
  TransactionSummary,
} from 'src/types/api';
import * as mock from 'src/mocks/customer-profile';
import { unwrap, type ApiResponse, type PagedResponse } from './api-envelope';
import { getAllPages } from './paging';

const useMocks = process.env.USE_MOCKS === 'true';
const delay = <T>(value: T, ms = 250) => new Promise<T>((r) => setTimeout(() => r(structuredClone(value)), ms));

const base = (id: string) => `/admin/customers/${id}`;

async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  return unwrap(data);
}

// ---- leitura ----

/** GET /admin/customers/:id/summary — cabeçalho, compliance, docs, perfis, segurança e preferências. */
export function getOverview(id: string): Promise<CustomerOverview> {
  return useMocks ? delay(mock.overview(id)) : get(`${base(id)}/summary`);
}

/** GET /admin/customers/:id/identification */
export function getIdentification(id: string): Promise<CustomerIdentification> {
  return useMocks ? delay(mock.identification(id)) : get(`${base(id)}/identification`);
}

/** GET /admin/customers/:id/bank-accounts (todas as páginas) */
export function listBankAccounts(id: string): Promise<CustomerBankAccount[]> {
  return useMocks ? delay(mock.bankAccounts) : getAllPages(`${base(id)}/bank-accounts`);
}

/** GET /admin/banks?isActive=true */
export function listBanks(): Promise<Bank[]> {
  return useMocks ? delay(mock.banks) : getAllPages('/admin/banks', { isActive: true });
}

/** GET /admin/customers/:id/documents/grouped */
export function getGroupedDocuments(id: string): Promise<GroupedDocuments> {
  return useMocks ? delay(mock.groupedDocuments(id)) : get(`${base(id)}/documents/grouped`);
}

/** GET /admin/customers/:id/portfolio */
export function getPortfolio(id: string): Promise<Portfolio> {
  return useMocks ? delay(mock.portfolio(id)) : get(`${base(id)}/portfolio`);
}

/** GET /admin/customers/:id/portfolio/composition */
export function getPortfolioComposition(id: string): Promise<PortfolioComposition> {
  return useMocks ? delay(mock.composition(id)) : get(`${base(id)}/portfolio/composition`);
}

/** GET /admin/contracts?clientId= */
export function listContracts(id: string): Promise<ContractListItem[]> {
  return useMocks ? delay(mock.contracts) : getAllPages('/admin/contracts', { clientId: id }, 50);
}

/** GET /admin/transactions?clientId= (primeira página, mais recentes) */
export async function listTransactions(id: string, pageSize = 50): Promise<TransactionSummary[]> {
  if (useMocks) return delay(mock.transactions);
  const { data } = await api.get<PagedResponse<TransactionSummary>>('/admin/transactions', {
    params: { clientId: id, page: 1, pageSize },
  });
  return unwrap(data);
}

/** GET /admin/customers/:id/statement/export?format=csv */
export async function exportStatement(id: string): Promise<Blob> {
  if (useMocks) return new Blob([mock.statementCsv], { type: 'text/csv' });
  const { data } = await api.get<Blob>(`${base(id)}/statement/export`, {
    params: { format: 'csv' },
    responseType: 'blob',
  });
  return data;
}

/** GET /admin/customers/:id/assets (todas as páginas) */
export function listAssets(id: string): Promise<CustomerAsset[]> {
  return useMocks ? delay(mock.assets) : getAllPages(`${base(id)}/assets`);
}

/** GET /admin/customers/:id/assets/:assetId/documents */
export function listAssetDocuments(id: string, assetId: string): Promise<CustomerAssetDocument[]> {
  return useMocks ? delay(mock.assetDocuments) : get(`${base(id)}/assets/${assetId}/documents`);
}

/** GET /admin/customers/:id/timeline */
export async function listTimeline(id: string, pageSize = 50): Promise<TimelineEvent[]> {
  if (useMocks) return delay(mock.overview(id).recentObservations);
  const { data } = await api.get<PagedResponse<TimelineEvent>>(`${base(id)}/timeline`, { params: { page: 1, pageSize } });
  return unwrap(data);
}

// ---- escrita ----

/** POST /admin/customers/:id/bank-accounts */
export async function createBankAccount(id: string, body: BankAccountRequest): Promise<CustomerBankAccount> {
  if (useMocks) return delay({ ...mock.bankAccounts[0]!, ...body, id: String(Date.now()), accountNumberMasked: body.accountNumber });
  const { data } = await api.post<ApiResponse<CustomerBankAccount>>(`${base(id)}/bank-accounts`, body);
  return unwrap(data);
}

/** PATCH /admin/customers/:id/bank-accounts/:accountId */
export async function updateBankAccount(id: string, accountId: string, body: BankAccountRequest): Promise<CustomerBankAccount> {
  if (useMocks) return delay({ ...mock.bankAccounts[0]!, ...body, id: accountId, accountNumberMasked: body.accountNumber });
  const { data } = await api.patch<ApiResponse<CustomerBankAccount>>(`${base(id)}/bank-accounts/${accountId}`, body);
  return unwrap(data);
}

/** POST /admin/customers/:id/bank-accounts/:accountId/archive */
export async function archiveBankAccount(id: string, accountId: string): Promise<void> {
  if (useMocks) return delay(undefined);
  unwrap((await api.post<ApiResponse<unknown>>(`${base(id)}/bank-accounts/${accountId}/archive`)).data);
}

/** PATCH /admin/customers/:id/preferences */
export async function updatePreferences(
  id: string,
  body: Omit<CustomerPreferences, 'customerId'>,
): Promise<CustomerPreferences> {
  if (useMocks) return delay({ customerId: id, ...body });
  const { data } = await api.patch<ApiResponse<CustomerPreferences>>(`${base(id)}/preferences`, body);
  return unwrap(data);
}

/** PATCH /admin/customers/:id/status */
export async function changeStatus(id: string, status: string): Promise<void> {
  if (useMocks) return delay(undefined);
  unwrap((await api.patch<ApiResponse<unknown>>(`${base(id)}/status`, { status })).data);
}

/**
 * UUID da moeda pelo código ISO. Não há endpoint de moedas: procura no portfólio do cliente
 * e, se ele ainda não tiver carteira, no catálogo de mercados (defaultCurrency).
 */
export async function resolveCurrencyId(iso: string, portfolio: Portfolio | null): Promise<string | null> {
  const fromPortfolio = portfolio?.currencies.find((c) => c.currencyIsoCode === iso)?.currencyId;
  if (fromPortfolio) return fromPortfolio;
  if (useMocks) return 'brl';
  try {
    const markets = await get<Array<{ defaultCurrency: { id: string; isoCode: string } | null }>>(
      '/admin/contracts/catalog/markets',
    );
    const fromMarkets = markets.find((m) => m.defaultCurrency?.isoCode === iso)?.defaultCurrency?.id;
    if (fromMarkets) return fromMarkets;
  } catch {
    // catálogo indisponível para o perfil do usuário: cai no id semeado
  }
  return SEEDED_CURRENCY_IDS[iso] ?? null;
}

/** Ids fixos da migration SeedCurrencies do backend (core.currencies). */
const SEEDED_CURRENCY_IDS: Record<string, string> = {
  BRL: 'f39ba6d7-e6ca-4367-9f7e-81850804447d',
  EUR: '3dda9cd8-9584-4087-9e1e-5eef981cefc7',
  USD: '9bd50b81-47f2-42c3-b854-937624b40d4d',
};

/** POST /admin/customers/:id/assets */
export async function createAsset(id: string, body: Record<string, unknown> & { assetType: AssetKind }): Promise<CustomerAsset> {
  if (useMocks) {
    const created = {
      id: String(Date.now()), nickname: null, declaredValue: null, currencyId: null, status: 'Active',
      remainingBalance: null, createdAtUtc: new Date().toISOString(), archivedAtUtc: null,
      realEstate: null, vehicle: null, consortium: null, investment: null, ...body,
    } as CustomerAsset;
    mock.assets.push(created); // o mock guarda o que foi salvo, como o backend faria
    return delay(created);
  }
  const { data } = await api.post<ApiResponse<CustomerAsset>>(`${base(id)}/assets`, body);
  return unwrap(data);
}

/** POST /admin/customers/:id/assets/:assetId/archive */
export async function archiveAsset(id: string, assetId: string): Promise<void> {
  if (useMocks) {
    const a = mock.assets.find((x) => x.id === assetId);
    if (a) a.archivedAtUtc = new Date().toISOString();
    return delay(undefined);
  }
  unwrap((await api.post<ApiResponse<unknown>>(`${base(id)}/assets/${assetId}/archive`)).data);
}
