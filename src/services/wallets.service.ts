import { api } from 'boot/axios';
import type { AdminWalletListItem, AdminWalletMovement, WalletListSort, WalletType } from 'src/types/api';
import { adminWalletsMock, walletMovementsMock } from 'src/mocks/wallets';
import { ApiError, unwrap, type PagedResponse } from './api-envelope';

const useMocks = process.env.USE_MOCKS === 'true';
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

/** Limite do backend para `search` (acima disso: wallet.search_too_long). */
export const WALLET_SEARCH_MAX = 100;

export interface Page<T> {
  items: T[];
  totalItems: number;
  hasNextPage: boolean;
}

export interface WalletListParams {
  type?: WalletType | undefined;
  /** Nome do cliente ou id exato da carteira. */
  search?: string | undefined;
  clientId?: string | undefined;
  currencyId?: string | undefined;
  sort?: WalletListSort | undefined;
  page: number;
  pageSize: number;
}

export interface WalletStatementParams {
  /** yyyy-MM-dd (data UTC, inclusiva) */
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  page: number;
  pageSize: number;
}

const compact = (params: object) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

function toPage<T>(data: PagedResponse<T>): Page<T> {
  return {
    items: unwrap(data),
    totalItems: data.pagination?.totalItems ?? 0,
    hasNextPage: data.pagination?.hasNextPage ?? false,
  };
}

function paginate<T>(all: T[], page: number, pageSize: number): Page<T> {
  const start = (page - 1) * pageSize;
  return { items: structuredClone(all.slice(start, start + pageSize)), totalItems: all.length, hasNextPage: start + pageSize < all.length };
}

/** GET /admin/wallets (paginado; filtros e ordenação no backend) */
export async function listAdminWallets(params: WalletListParams): Promise<Page<AdminWalletListItem>> {
  if (useMocks) {
    await delay();
    const q = params.search?.toLowerCase() ?? '';
    const items = adminWalletsMock
      .filter((w) => (!params.type || w.type === params.type) && (!q || w.client.name.toLowerCase().includes(q) || w.id === params.search))
      .sort((a, b) => {
        switch (params.sort) {
          case 'HighestBalance': return Number(b.balance) - Number(a.balance);
          case 'LowestBalance': return Number(a.balance) - Number(b.balance);
          case 'RecentlyMoved': return (b.lastMovementAtUtc ?? '').localeCompare(a.lastMovementAtUtc ?? '');
          default: return a.client.name.localeCompare(b.client.name);
        }
      });
    return paginate(items, params.page, params.pageSize);
  }
  const { data } = await api.get<PagedResponse<AdminWalletListItem>>('/admin/wallets', { params: compact(params) });
  return toPage(data);
}

/** GET /admin/wallets/:id/statement (só movimentações executadas, mais recente primeiro) */
export async function getWalletStatement(walletId: string, params: WalletStatementParams): Promise<Page<AdminWalletMovement>> {
  if (useMocks) {
    await delay();
    const all = walletMovementsMock[walletId];
    if (!all) throw new ApiError([{ code: 'wallet.not_found', message: 'Carteira não encontrada.', field: null }]);
    if (params.dateFrom && params.dateTo && params.dateFrom > params.dateTo) {
      throw new ApiError([{ code: 'transaction.date_range_invalid', message: 'Período inválido.', field: 'dateFrom' }]);
    }
    const day = (iso: string) => iso.slice(0, 10);
    const items = all.filter(
      (m) => (!params.dateFrom || day(m.occurredAtUtc) >= params.dateFrom) && (!params.dateTo || day(m.occurredAtUtc) <= params.dateTo),
    );
    return paginate(items, params.page, params.pageSize);
  }
  const { data } = await api.get<PagedResponse<AdminWalletMovement>>(`/admin/wallets/${walletId}/statement`, { params: compact(params) });
  return toPage(data);
}
