import { api } from 'boot/axios';
import type { ContractCatalogItem, ContractDetail, ContractListItem } from 'src/types/api';
import type { ClientStatus, ContractClient } from 'src/types/contract';
import type { CustomerSummary } from 'src/types/customer';
import { contractWalletsMock } from 'src/mocks/transactions';
import { listCustomers } from './customers.service';
import { unwrap, type ApiResponse } from './api-envelope';
import { getAllPages } from './paging';

const useMocks = process.env.USE_MOCKS === 'true';
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const base = (id: string) => `/admin/contracts/${id}`;

/** GET /admin/contracts (todas as páginas; o backend lista só os Created por padrão, então os rascunhos vêm à parte) */
export async function listAllContracts(): Promise<ContractListItem[]> {
  if (useMocks) {
    await delay();
    return contractWalletsMock.map((c) => ({
      id: c.id,
      publicCode: c.id,
      name: c.name,
      registrationStatus: 'Created',
      businessStatus: null,
      initialContractualCapital: c.valueSigned / (1 + c.perfTotal.percent / 100),
      currentCapital: c.valueSigned,
      currencyCode: c.signedCurrency,
      startDate: c.startDate,
      endDate: c.endDate,
      clients: c.clients.map((cl, i) => ({ clientId: `${c.id}-${i}`, displayName: cl.name, personType: 'PF' })),
      clientCount: c.clients.length,
      primaryEngine: null,
    }));
  }
  const [created, drafts] = await Promise.all([
    getAllPages<ContractListItem>('/admin/contracts', { registrationStatus: 'Created' }, 100),
    getAllPages<ContractListItem>('/admin/contracts', { registrationStatus: 'Draft' }, 100),
  ]);
  return [...created, ...drafts];
}

/** GET /admin/contracts/:id */
export async function getContract(id: string): Promise<ContractDetail> {
  const { data } = await api.get<ApiResponse<ContractDetail>>(base(id));
  return unwrap(data);
}

/** PATCH /admin/contracts/:id — só contratos Created. Nome e observações são substituídos; o prazo muda por endDate. */
export async function updateContract(
  id: string,
  body: { name: string; financialNotes: string | null; endDate?: string | null },
): Promise<ContractDetail> {
  const { data } = await api.patch<ApiResponse<ContractDetail>>(base(id), body);
  return unwrap(data);
}

/** POST /admin/contracts/:id/status */
export async function changeContractStatus(id: string, statusId: string): Promise<ContractDetail> {
  const { data } = await api.post<ApiResponse<ContractDetail>>(`${base(id)}/status`, { statusId });
  return unwrap(data);
}

/** POST /admin/contracts/:id/participants */
export async function addContractParticipant(id: string, clientId: string, allocatedAmount: number | null = null): Promise<ContractDetail> {
  const { data } = await api.post<ApiResponse<ContractDetail>>(`${base(id)}/participants`, { clientId, allocatedAmount });
  return unwrap(data);
}

/** DELETE /admin/contracts/:id/participants/:clientId */
export async function removeContractParticipant(id: string, clientId: string): Promise<void> {
  await api.delete(`${base(id)}/participants/${clientId}`);
}

/** POST /admin/contracts/:id/finalize — o rascunho precisa estar completo (ver validações no backend). */
export async function finalizeContract(id: string): Promise<ContractDetail> {
  const { data } = await api.post<ApiResponse<ContractDetail>>(`${base(id)}/finalize`);
  return unwrap(data);
}

/** GET /admin/contracts/catalog/statuses (status de negócio ativos) */
export async function listContractStatuses(): Promise<ContractCatalogItem[]> {
  const { data } = await api.get<ApiResponse<ContractCatalogItem[]>>('/admin/contracts/catalog/statuses');
  return unwrap(data);
}

// ---- clientes do contrato ----

const CLIENT_STATUS: Record<CustomerSummary['status'], ClientStatus> = { active: 'Active', blocked: 'Blocked', inactive: 'Inactive' };

/** Cliente do cadastro no formato das telas de contrato. */
export function toContractClient(c: CustomerSummary, linkedDate = ''): ContractClient {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    document: c.maskedDoc || '—',
    status: CLIENT_STATUS[c.status] ?? 'Active',
    docLevel: c.docLevel ? `Nível ${c.docLevel}` : 'Sem nível',
    docStatus: c.compliance === 'ok' ? 'Complete' : 'Incomplete',
    linkedDate,
  };
}

let customersPromise: Promise<Map<string, CustomerSummary>> | null = null;

/** Índice dos clientes do cadastro (carregado uma vez) para completar os dados dos participantes. */
export function loadCustomerIndex(): Promise<Map<string, CustomerSummary>> {
  customersPromise ??= listCustomers()
    .then((list) => new Map(list.map((c) => [c.id, c])))
    .catch((e: unknown) => {
      customersPromise = null;
      throw e;
    });
  return customersPromise;
}

/** Participante (ou cliente da listagem) completado com o cadastro; sem cadastro, usa o que o contrato traz. */
export function participantToClient(
  p: { clientId: string; displayName: string; personType: string; linkedAtUtc?: string; allocatedAmount?: unknown },
  customers: Map<string, CustomerSummary>,
): ContractClient {
  const linked = p.linkedAtUtc ? new Date(p.linkedAtUtc).toLocaleDateString('pt-BR') : '';
  const customer = customers.get(p.clientId);
  const client = customer
    ? toContractClient(customer, linked)
    : {
        id: p.clientId,
        name: p.displayName,
        type: p.personType === 'PJ' ? ('PJ' as const) : ('PF' as const),
        document: '—',
        status: 'Active' as const,
        docLevel: '—',
        docStatus: 'Incomplete' as const,
        linkedDate: linked,
      };
  return { ...client, name: p.displayName || client.name, allocatedAmount: p.allocatedAmount == null ? null : Number(p.allocatedAmount) };
}

// ---- criação ----

/**
 * Moedas ativas no backend. Não há endpoint de moedas: os ids são os do seed fixo
 * (migration SeedCurrencies do backend), onde só estas três estão ativas.
 */
export const CONTRACT_CURRENCIES = [
  { id: 'f39ba6d7-e6ca-4367-9f7e-81850804447d', code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { id: '9bd50b81-47f2-42c3-b854-937624b40d4d', code: 'USD', name: 'Dólar Americano', symbol: 'US$' },
  { id: '3dda9cd8-9584-4087-9e1e-5eef981cefc7', code: 'EUR', name: 'Euro', symbol: '€' },
] as const;

export interface SaveContractDraftPayload {
  name: string | null;
  term: { value: number; unit: 'Day' | 'Month' | 'Year' } | null;
  startDate: string | null;
  currencyId: string | null;
  initialContractualCapital: number | null;
  initialCapitalOriginId: string | null;
  financialNotes: string | null;
  primaryEngineId: string | null;
  initialContractStatusId: string | null;
  clientAllocations: { clientId: string; allocatedAmount: number | null }[];
}

/** POST /admin/contracts/drafts */
export async function createContractDraft(body: SaveContractDraftPayload): Promise<ContractDetail> {
  const { data } = await api.post<ApiResponse<ContractDetail>>('/admin/contracts/drafts', body);
  return unwrap(data);
}

/** GET /admin/contracts/catalog/engines (só os selecionáveis interessam na criação) */
export async function listContractEngines(): Promise<ContractCatalogItem[]> {
  const { data } = await api.get<ApiResponse<ContractCatalogItem[]>>('/admin/contracts/catalog/engines');
  return unwrap(data).filter((e) => e.isSelectable !== false);
}

/** GET /admin/contracts/catalog/capital-origins */
export async function listCapitalOrigins(): Promise<ContractCatalogItem[]> {
  const { data } = await api.get<ApiResponse<ContractCatalogItem[]>>('/admin/contracts/catalog/capital-origins');
  return unwrap(data);
}
