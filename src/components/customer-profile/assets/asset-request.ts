/**
 * Formulários dos drawers de patrimônio → CreateCustomerAssetRequest (POST /admin/customers/:id/assets).
 *
 * Regras espelhadas do backend (StrategyAnalytics.Assets.Application/AssetAdministration.cs):
 * - status ∈ PaidOff | Financed | UnderReview | Inactive;
 * - Financed exige remainingBalance > 0; nos demais status remainingBalance tem de ser null;
 * - Investment nunca é Financed;
 * - só o bloco de detalhe do assetType pode vir preenchido; campos desconhecidos são rejeitados
 *   (JsonUnmappedMemberHandling.Disallow) — não envie nada além do que está aqui.
 * Os subtipos (propertyType, vehicleType, consortiumType, quotaStatus, investmentType…) são texto livre.
 */
import type { AssetKind } from 'src/types/api';

export type SheetKind = 'real_estate' | 'vehicle' | 'consortium' | 'investment';

export const ASSET_KIND: Record<SheetKind, AssetKind> = {
  real_estate: 'RealEstate',
  vehicle: 'Vehicle',
  consortium: 'Consortium',
  investment: 'Investment',
};

type Form = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/** "1.234.567,89" (pt-BR) ou "1234567.89" → número */
export function parseMoney(v: unknown): number | null {
  if (typeof v === 'number') return v;
  const s = str(v);
  if (!s) return null;
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  const n = Number(normalized.replace(/[^\d.-]/g, ''));
  return Number.isNaN(n) ? null : n;
}

const int = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : null;
};

const map = (table: Record<string, string>, v: unknown) => (typeof v === 'string' ? (table[v] ?? v) : null);

/** Quitado → PaidOff sem saldo; com saldo devedor → Financed. */
function payoff(financed: boolean, balance: number | null) {
  return financed
    ? { status: 'Financed', remainingBalance: balance }
    : { status: 'PaidOff', remainingBalance: null };
}

/** Todos os campos do request; o bloco do tipo escolhido sobrescreve o null correspondente. */
export function toAssetRequest(kind: SheetKind, f: Form, currencyId: string) {
  return {
    realEstate: null,
    vehicle: null,
    consortium: null,
    investment: null,
    ...buildAsset(kind, f, currencyId),
  };
}

function buildAsset(kind: SheetKind, f: Form, currencyId: string) {
  switch (kind) {
    case 'real_estate': {
      const [city, state] = String(f.city ?? '').split('/').map((x) => x.trim());
      return {
        assetType: ASSET_KIND.real_estate,
        nickname: str(f.nickname),
        declaredValue: parseMoney(f.value),
        currencyId,
        ...payoff(f.paid === false, parseMoney(f.remaining)),
        realEstate: {
          propertyType: map({ apto: 'Apartment', casa: 'House', terreno: 'Land', comercial: 'Commercial' }, f.type),
          postalCode: str(f.zip),
          addressLine: str(f.street),
          number: str(f.number),
          complement: str(f.complement),
          neighborhood: str(f.district),
          city: city || null,
          state: state ? state.toUpperCase() : null,
          propertyTaxRegistration: str(f.iptu),
          registrationNumber: str(f.registry),
          landAreaSquareMeters: parseMoney(f.landArea),
          builtAreaSquareMeters: parseMoney(f.builtArea),
          bedrooms: int(f.bedrooms),
          bathrooms: int(f.bathrooms),
        },
      };
    }
    case 'vehicle':
      return {
        assetType: ASSET_KIND.vehicle,
        nickname: [str(f.brand), str(f.model), str(f.version)].filter(Boolean).join(' ') || null,
        declaredValue: parseMoney(f.fipe),
        currencyId,
        ...payoff(f.paid === false, parseMoney(f.remaining)),
        vehicle: {
          licensePlate: str(f.plate),
          brand: str(f.brand),
          model: str(f.model),
          manufactureYear: int(f.yearMade),
          color: null,
          vehicleType: map({ carro: 'Car', moto: 'Motorcycle', utilitario: 'Utility', caminhao: 'Truck' }, f.type),
          modelYear: int(f.yearModel),
          version: str(f.version),
        },
      };
    case 'consortium': {
      const administrator = str(f.admin);
      const group = str(f.group);
      const quota = str(f.quota);
      const balance = parseMoney(f.balance);
      return {
        assetType: ASSET_KIND.consortium,
        // o drawer não tem apelido; mesmo padrão que o backend usa nas declarações do cliente
        nickname: administrator && group && quota ? `Consórcio ${administrator} — Grupo ${group} / Cota ${quota}`.slice(0, 120) : null,
        declaredValue: parseMoney(f.letter),
        currencyId,
        ...payoff((balance ?? 0) > 0, balance),
        consortium: {
          consortiumType: map({ imobiliario: 'RealEstate', veicular: 'Vehicle', servicos: 'Services', maquinas: 'Machinery' }, f.type),
          administrator,
          broker: str(f.broker),
          groupNumber: group,
          quotaNumber: quota,
          amountPaid: parseMoney(f.paid) ?? 0,
          totalInstallments: int(f.totalInstallments),
          paidInstallments: int(f.paidInstallments) ?? 0,
          quotaStatus: map(
            { nao_contemplado: 'NotContemplated', contemplado: 'Contemplated', cancelado: 'Cancelled', encerrado: 'Closed' },
            f.status,
          ),
          contemplationMethod:
            f.status === 'contemplado'
              ? map({ sorteio: 'Draw', lance: 'Bid', lance_fixo: 'FixedBid', lance_embutido: 'EmbeddedBid' }, f.contemplation)
              : null,
        },
      };
    }
    case 'investment': {
      const fixed = f.hasTerm === true;
      return {
        assetType: ASSET_KIND.investment,
        nickname: str(f.product),
        declaredValue: parseMoney(f.current) ?? parseMoney(f.initial),
        currencyId,
        ...payoff(false, null), // investimento nunca é financiado
        investment: {
          investmentType: map(
            { fixa: 'FixedIncome', fundo: 'Fund', variavel: 'Equity', multimercado: 'Multimarket', offshore: 'Offshore', previdencia: 'Pension' },
            f.type,
          ),
          institution: str(f.institution),
          productName: str(f.product),
          initialAmount: parseMoney(f.initial),
          startDate: str(f.startDate),
          hasFixedTerm: fixed,
          // sem prazo determinado a API exige os dois nulos
          maturityDate: fixed ? str(f.maturity) : null,
          termMonths: fixed ? int(f.months) : null,
        },
      };
    }
  }
}

// ---- validação (mesmas regras do backend, com mensagens em português) ----

type Req = ReturnType<typeof toAssetRequest>;

const REQUIRED: Record<SheetKind, Array<[path: string, label: string]>> = {
  real_estate: [
    ['nickname', 'Apelido'], ['realEstate.propertyType', 'Tipo de imóvel'], ['realEstate.postalCode', 'CEP'],
    ['realEstate.addressLine', 'Logradouro'], ['realEstate.number', 'Número'], ['realEstate.neighborhood', 'Bairro'],
    ['realEstate.city', 'Cidade'], ['realEstate.state', 'UF (preencha "Cidade / UF")'],
  ],
  vehicle: [
    ['vehicle.licensePlate', 'Placa'], ['vehicle.brand', 'Marca'], ['vehicle.model', 'Modelo'],
    ['vehicle.manufactureYear', 'Ano de fabricação'],
  ],
  consortium: [
    ['consortium.consortiumType', 'Tipo'], ['consortium.administrator', 'Administradora'], ['consortium.groupNumber', 'Grupo'],
    ['consortium.quotaNumber', 'Cota'], ['consortium.totalInstallments', 'Total de parcelas'], ['consortium.quotaStatus', 'Status da cota'],
  ],
  investment: [
    ['investment.investmentType', 'Tipo'], ['investment.institution', 'Instituição'], ['investment.productName', 'Nome do produto'],
    ['investment.initialAmount', 'Valor inicial'], ['investment.startDate', 'Data de início'],
  ],
};

/** Lista de problemas que o backend recusaria; vazia = pode enviar. */
export function validateAsset(kind: SheetKind, req: Req): string[] {
  const at = (path: string) => path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | null)?.[k], req);
  const missing = REQUIRED[kind].filter(([p]) => at(p) == null || at(p) === '').map(([, label]) => label);
  const problems = missing.length ? [`Preencha: ${missing.join(', ')}.`] : [];

  if (!req.declaredValue || req.declaredValue <= 0) problems.push('O valor do bem deve ser maior que zero.');
  if (req.status === 'Financed' && (!req.remainingBalance || req.remainingBalance <= 0)) {
    problems.push('Informe o saldo restante (maior que zero) para bens financiados.');
  }

  const re = req.realEstate;
  if (re?.state && re.state.length !== 2) problems.push('UF deve ter 2 letras (ex.: "São Paulo / SP").');

  const v = req.vehicle;
  if (v?.manufactureYear != null) {
    const max = new Date().getFullYear() + 1;
    if (v.manufactureYear < 1900 || v.manufactureYear > max) problems.push(`Ano de fabricação deve estar entre 1900 e ${max}.`);
    if (v.modelYear != null && (v.modelYear < v.manufactureYear || v.modelYear > v.manufactureYear + 1)) {
      problems.push('Ano do modelo deve ser igual ao de fabricação ou o seguinte.');
    }
  }

  const c = req.consortium;
  if (c?.totalInstallments != null) {
    if (c.totalInstallments < 1) problems.push('Total de parcelas deve ser pelo menos 1.');
    else if (c.paidInstallments < 0 || c.paidInstallments > c.totalInstallments) {
      problems.push('Parcelas pagas devem estar entre 0 e o total de parcelas.');
    }
  }

  const i = req.investment;
  if (i?.startDate && i.startDate > new Date().toISOString().slice(0, 10)) problems.push('Data de início não pode estar no futuro.');
  if (i?.hasFixedTerm) {
    if (!i.maturityDate) problems.push('Informe a data de vencimento.');
    else if (i.startDate && i.maturityDate <= i.startDate) problems.push('Vencimento deve ser depois da data de início.');
    if (i.termMonths != null && (i.termMonths < 1 || i.termMonths > 1200)) problems.push('Prazo deve estar entre 1 e 1200 meses.');
  }

  return problems;
}
