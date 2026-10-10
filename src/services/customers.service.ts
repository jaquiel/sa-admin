import { api } from 'boot/axios';
import type {
  Classification,
  ComplianceStatus,
  CreateCustomerPayload,
  CustomerStatus,
  CustomerSummary,
  CustomerType,
} from 'src/types/customer';
import { customersMock } from 'src/mocks/customers';
import { unwrap, type ApiResponse, type PagedResponse } from './api-envelope';

const useMocks = process.env.USE_MOCKS === 'true';
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

/** GET /admin/customers/cards (todas as páginas — filtros e ordenação são feitos no store) */
export async function listCustomers(): Promise<CustomerSummary[]> {
  if (useMocks) {
    await delay();
    return structuredClone(customersMock);
  }
  const all: CustomerCardResponse[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data } = await api.get<PagedResponse<CustomerCardResponse>>('/admin/customers/cards', {
      params: { page, pageSize: 100 },
    });
    all.push(...unwrap(data));
    if (!data.pagination?.hasNextPage) break;
  }
  return all.map(fromCard);
}

/** GET /admin/customers/:id/header */
export async function getCustomer(id: string): Promise<CustomerSummary | null> {
  if (useMocks) {
    await delay();
    return structuredClone(customersMock.find((c) => c.id === id) ?? null);
  }
  const { data } = await api.get<ApiResponse<CustomerHeaderResponse>>(`/admin/customers/${id}/header`);
  return fromHeader(unwrap(data));
}

/** POST /admin/customers */
export async function createCustomer(payload: CreateCustomerPayload): Promise<{ id: string }> {
  if (useMocks) {
    await delay(500);
    return { id: String(Date.now()) };
  }
  const { data } = await api.post<ApiResponse<{ id: string }>>('/admin/customers', toCreateRequest(payload));
  const id = unwrap(data).id;
  await saveProfiles(id, payload);
  return { id };
}

/**
 * Dados profissionais e financeiros do wizard vão para endpoints próprios depois da criação.
 * Falhas aqui não desfazem o cadastro (o cliente já existe); só são registradas no console.
 */
async function saveProfiles(id: string, p: CreateCustomerPayload) {
  const f = p as Record<string, unknown>;
  const text = (k: string) => (typeof f[k] === 'string' ? (f[k] as string).trim() : '');
  // inputs type="number" chegam como number ou "1234.56"; texto pt-BR ("1.234,56") também é aceito
  const num = (k: string) => {
    const v = f[k];
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const t = text(k);
    if (!t) return null;
    const n = Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t);
    return Number.isFinite(n) ? n : null;
  };
  const today = new Date().toISOString().slice(0, 10);
  const pj = p.type === 'PJ';
  const calls: Promise<unknown>[] = [];

  if (!pj && text('profession')) {
    calls.push(
      api.put(`/admin/customers/${id}/professional-profile`, {
        occupation: text('profession'), employerName: null, validFrom: today, validTo: null, isCurrent: true,
      }),
    );
  }
  const income = pj ? num('monthlyRevenue') : num('monthlyIncome');
  const netWorth = pj ? num('companyCash') : num('declaredAssets');
  if (income != null || netWorth != null) {
    calls.push(
      api.post(`/admin/customers/${id}/financial-profiles`, {
        individualMonthlyIncome: income, householdMonthlyIncome: null, declaredNetWorth: netWorth,
        currencyCode: text('baseCurrency') || 'BRL', effectiveFrom: today, effectiveTo: null,
      }),
    );
  }
  const results = await Promise.allSettled(calls);
  results.filter((r) => r.status === 'rejected').forEach((r) => console.warn('[createCustomer] perfil não salvo', r));
}

// ---- contratos da API ----

interface DocumentSummary {
  approved: number;
  pending: number;
  rejected: number;
  missing: number;
}

interface CustomerCardResponse {
  customerId: string;
  displayName: string | null;
  customerKind: string;
  status: string;
  maskedDocument: string | null;
  avatarUrl: string | null;
  advisorName: string | null;
  lastAccessAtUtc: string | null;
  customerSince: string;
  documentClassification: string | null;
  documentLevel: number | string | null;
  complianceStatus: string | null;
  createdAtUtc: string;
}

interface CustomerHeaderResponse {
  id: string;
  kind: string;
  status: string;
  primaryName: string | null;
  createdAtUtc: string;
  operationalSummary: {
    advisorName: string | null;
    lastAccessAtUtc: string | null;
    riskClassification: string;
    complianceStatus: string;
    documentLevel: number | string;
    documentSummary: DocumentSummary;
  } | null;
}

// ---- mapeamento API → tela ----
// A API não documenta os enums de kind/status/compliance; os mapas abaixo aceitam variações comuns.

function fromCard(c: CustomerCardResponse): CustomerSummary {
  return {
    id: c.customerId,
    name: c.displayName ?? '—',
    type: toType(c.customerKind),
    document: c.maskedDocument ?? '',
    maskedDoc: c.maskedDocument ?? '',
    status: toStatus(c.status),
    classification: toClassification(c.documentClassification),
    compliance: toCompliance(c.complianceStatus),
    docLevel: Number(c.documentLevel ?? 0),
    lastAccess: formatDateTime(c.lastAccessAtUtc),
    totalInvested: 0,
    contracts: 0,
    avatar: c.avatarUrl,
    createdAt: formatDate(c.customerSince || c.createdAtUtc),
    advisor: c.advisorName ?? '—',
  };
}

function fromHeader(h: CustomerHeaderResponse): CustomerSummary {
  const op = h.operationalSummary;
  return {
    id: h.id,
    name: h.primaryName ?? '—',
    type: toType(h.kind),
    document: '',
    maskedDoc: '',
    status: toStatus(h.status),
    classification: toClassification(op?.riskClassification),
    compliance: toCompliance(op?.complianceStatus),
    docLevel: Number(op?.documentLevel ?? 0),
    lastAccess: formatDateTime(op?.lastAccessAtUtc),
    totalInvested: 0,
    contracts: 0,
    avatar: null,
    createdAt: formatDate(h.createdAtUtc),
    advisor: op?.advisorName ?? '—',
  };
}

function toType(kind: string): CustomerType {
  return /pj|company|legal|business|corporate|juridica/i.test(kind ?? '') ? 'PJ' : 'PF';
}

function toStatus(status: string): CustomerStatus {
  const s = (status ?? '').toLowerCase();
  if (/block|suspend/.test(s)) return 'blocked';
  if (/inactive|archiv|closed|disabled/.test(s)) return 'inactive';
  return 'active';
}

function toClassification(value: string | null | undefined): Classification {
  const v = (value ?? '').trim().toUpperCase();
  if (v === 'A' || v === 'B' || v === 'C') return v;
  if (/LOW|BAIX/.test(v)) return 'A';
  if (/HIGH|ALT/.test(v)) return 'C';
  return 'B';
}

function toCompliance(value: string | null | undefined): ComplianceStatus {
  const v = (value ?? '').toLowerCase();
  if (/block/.test(v)) return 'blocked';
  if (/alert|reject|flag|risk/.test(v)) return 'alert';
  if (/ok|approv|compliant|clear|valid/.test(v)) return 'ok';
  return 'pending';
}

const pad = (n: number) => String(n).padStart(2, '0');

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---- mapeamento tela → API ----

function toCreateRequest(p: CreateCustomerPayload) {
  const f = p as Record<string, unknown>;
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string).trim() : '');
  const pj = p.type === 'PJ';
  const today = new Date().toISOString().slice(0, 10);

  const name = pj ? str('companyName') : str('fullName');
  const email = pj ? str('corporateEmail') : str('email');
  const phone = pj ? str('corporatePhone') : str('phone');
  const address = pj ? str('corporateAddress') : str('address');

  const contacts = [
    email && { kind: 'Email', value: email, isPrimary: true },
    phone && { kind: 'Phone', value: phone, isPrimary: !email },
  ].filter(Boolean);

  const parsed = parseAddress(address);

  return {
    // "Person" vem da collection Postman; o valor de PJ não está documentado ("Company" segue o padrão).
    kind: pj ? 'Company' : 'Person',
    birthDate: !pj && str('birthDate') ? str('birthDate') : null,
    names: name
      ? [{ kind: 'Legal', displayName: name, validFrom: today, isPrimary: true }]
      : [],
    contacts,
    addresses: parsed ? [{ kind: pj ? 'Business' : 'Residential', ...parsed, isPrimary: true }] : [],
  };
}

/**
 * O wizard tem um único campo de endereço ("Rua, número, complemento, bairro, cidade, estado, CEP").
 * A API exige cidade, então só enviamos o endereço quando dá para separar ao menos cidade/UF.
 */
function parseAddress(raw: string) {
  if (!raw) return null;
  const postalCode = /\b\d{5}-?\d{3}\b/.exec(raw)?.[0] ?? null;
  const parts = raw
    .replace(postalCode ?? '', '')
    .split(/[,\n]|\s-\s/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  let state: string | null = null;
  let city = parts.pop()!;
  const cityUf = /^(.+?)\s*\/\s*([A-Za-z]{2})$/.exec(city);
  if (cityUf) {
    city = cityUf[1]!;
    state = cityUf[2]!.toUpperCase();
  } else if (/^[A-Za-z]{2}$/.test(city) && parts.length >= 2) {
    state = city.toUpperCase();
    city = parts.pop()!;
  }
  return { line1: parts.join(', '), line2: null, city, stateOrProvince: state, postalCode };
}
