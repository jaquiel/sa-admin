/**
 * Dados do protótipo no formato da API, usados quando USE_MOCKS=true.
 * Mantê-los no formato da API faz o modo mock exercitar os mesmos mapeamentos do backend real.
 */
import type {
  Bank,
  ContractListItem,
  CustomerAsset,
  CustomerAssetDocument,
  CustomerBankAccount,
  CustomerIdentification,
  CustomerOverview,
  GroupedDocuments,
  Portfolio,
  PortfolioComposition,
  TransactionSummary,
} from 'src/types/api';
import { customersMock } from './customers';

const docSummary = (customerId: string) => ({
  customerId, requirementCount: 15, documentCount: 13, approved: 12, pending: 2, rejected: 1, inReview: 0, missing: 0, waived: 0,
});

export function overview(id: string): CustomerOverview {
  const c = customersMock.find((x) => x.id === id) ?? customersMock[0]!;
  return {
    customerId: id,
    header: {
      id,
      workspaceId: 'ws-mock',
      kind: c.type === 'PJ' ? 'Company' : 'Person',
      status: c.status === 'blocked' ? 'Blocked' : c.status === 'inactive' ? 'Inactive' : 'Active',
      primaryName: c.name,
      primaryContact: 'roberto.carlos@email.com',
      birthDate: '1980-05-15',
      createdAtUtc: '2018-03-12T12:00:00Z',
      updatedAtUtc: null,
      archivedAtUtc: null,
      operationalSummary: {
        advisorId: null,
        advisorName: c.advisor,
        lastAccessAtUtc: '2024-12-15T12:42:00Z',
        riskClassification: c.classification,
        complianceStatus: c.compliance === 'ok' ? 'Compliant' : c.compliance === 'alert' ? 'Alert' : 'Pending',
        documentLevel: c.docLevel,
        documentSummary: docSummary(id),
      },
    },
    compliance: {
      customerId: id,
      primaryAlert: {
        id: 'f1',
        flagType: 'RelatedPep',
        severity: 'Medium',
        status: 'Active',
        title: 'PEP Relacionado',
        description:
          'Cliente possui parentesco de segundo grau com pessoa politicamente exposta (Vereador municipal). Monitoramento semestral ativo.',
        monitoringFrequency: 'Semiannual',
        detectedAtUtc: '2024-01-10T12:00:00Z',
      },
      summary: {
        activeCount: 1, criticalCount: 0, highCount: 0, hasPep: false, hasRelatedPep: true, hasSanctions: false,
        primaryAlert: null, recentAlerts: [],
      },
      recentHistory: [
        { id: 'e1', eventType: 'AddressChanged', title: 'Alteração de Endereço', description: null, actorName: 'Mariana Alencar', source: 'Web', occurredAtUtc: '2024-12-15T12:00:00Z' },
        { id: 'e2', eventType: 'FinancialProfileUpdated', title: 'Atualização de Renda (Upload IRPF)', description: null, actorName: 'Sistema', source: 'System', occurredAtUtc: '2024-12-10T12:00:00Z' },
      ],
    },
    documentSummary: docSummary(id),
    professionalProfile: { id: 'pp1', occupation: 'Diretor Executivo', employerName: 'Tech Solutions S.A.', validFrom: '2020-01-01', isCurrent: true },
    financialProfile: {
      id: 'fp1', individualMonthlyIncome: 45000, householdMonthlyIncome: 62000, declaredNetWorth: 12500000, currencyCode: 'BRL', effectiveFrom: '2024-01-01',
    },
    accountSecurity: {
      userId: 'u1', userName: 'roberto.csilva', email: 'roberto.carlos@email.com', status: 'Active', passwordStatus: 'Active',
      emailConfirmationStatus: 'Confirmed', lastLoginAtUtc: '2024-12-15T12:42:00Z', twoFactorEnabled: true, twoFactorStatus: 'Enabled',
    },
    preferences: {
      customerId: id, primaryCurrencyCode: 'BRL', secondaryCurrencyCode: 'USD', languageCode: 'pt-BR', timeZoneId: 'America/Sao_Paulo', theme: 'Light', countryId: null,
    },
    recentObservations: [],
  };
}

export function identification(id: string): CustomerIdentification {
  const c = customersMock.find((x) => x.id === id) ?? customersMock[0]!;
  return {
    customerId: id,
    kind: 'Person',
    status: 'Active',
    fullName: c.name,
    birthDate: '1980-05-15',
    nationality: 'BR',
    documents: [
      { documentCode: 'CPF', documentId: 'd1', documentTypeId: 't1', numberMasked: '123.456.789-00', status: 'Approved', source: 'Admin', issuer: null, issuerState: null, issuedOn: null, expiresOn: null, category: 'Personal', countryIsoCode: 'BR' },
      { documentCode: 'RG', documentId: 'd2', documentTypeId: 't2', numberMasked: '12.345.678-9', status: 'Approved', source: 'Admin', issuer: 'SSP', issuerState: 'SP', issuedOn: '2015-02-10', expiresOn: null, category: 'Personal', countryIsoCode: 'BR' },
      { documentCode: 'CNH', documentId: 'd3', documentTypeId: 't3', numberMasked: '01234567890', status: 'Approved', source: 'Admin', issuer: 'DETRAN', issuerState: 'SP', issuedOn: '2020-05-15', expiresOn: '2025-05-15', category: 'Personal', countryIsoCode: 'BR' },
    ],
    primaryEmail: { kind: 'Email', value: 'roberto.carlos@email.com', valueMasked: null, isPrimary: true, isVerified: true, status: 'Active' },
    mobilePhone: { kind: 'Mobile', value: '(11) 99999-9999', valueMasked: null, isPrimary: true, isVerified: true, status: 'Active' },
    secondaryPhone: { kind: 'Phone', value: '(11) 3030-3030', valueMasked: null, isPrimary: false, isVerified: false, status: 'Active' },
    contactPreference: 'WhatsApp',
    residentialAddress: {
      kind: 'Residential', line1: 'Av. Brigadeiro Faria Lima, 3477', line2: 'Apt 142 - Bloco B', city: 'São Paulo', stateOrProvince: 'SP',
      postalCode: '04538-133', countryIsoCode: 'BR', isPrimary: true, status: 'Active',
    },
  };
}

export const banks: Bank[] = [
  { id: 'b-nu', name: 'Nubank', code: '260', countryId: 'br', isActive: true },
  { id: 'b-itau', name: 'Itaú', code: '341', countryId: 'br', isActive: true },
  { id: 'b-bradesco', name: 'Bradesco', code: '237', countryId: 'br', isActive: true },
  { id: 'b-bb', name: 'Banco do Brasil', code: '001', countryId: 'br', isActive: true },
  { id: 'b-santander', name: 'Santander', code: '033', countryId: 'br', isActive: true },
];

export const bankAccounts: CustomerBankAccount[] = [
  {
    id: '1', bankId: 'b-nu', branch: '0001', accountNumber: '123456', accountNumberMasked: '123456', accountDigit: '7',
    accountType: 'Checking', holderType: 'Individual', holderName: 'Roberto Carlos da Silva', holderDocument: '12345678900',
    holderDocumentMasked: '123.456.789-00', pixKey: '123.456.789-00', pixKeyMasked: '123.456.789-00', pixKeyType: 'Cpf', isPrimary: true, status: 'Active',
  },
  {
    id: '2', bankId: 'b-itau', branch: '3421', accountNumber: '09876', accountNumberMasked: '09876', accountDigit: '5',
    accountType: 'Savings', holderType: 'Individual', holderName: 'Roberto Carlos da Silva', holderDocument: '12345678900',
    holderDocumentMasked: '123.456.789-00', pixKey: 'roberto@email.com', pixKeyMasked: 'roberto@email.com', pixKeyType: 'Email', isPrimary: false, status: 'Active',
  },
];

const item = (name: string, status: string, submittedAtUtc: string | null) => ({
  requirementId: name, documentTypeId: name, documentTypeName: name, documentId: submittedAtUtc ? name : null, status, action: null, submittedAtUtc,
});
const counters = { total: 0, approved: 0, pending: 0, rejected: 0, inReview: 0, missing: 0, waived: 0 };

export function groupedDocuments(id: string): GroupedDocuments {
  return {
    customerId: id,
    counters: { ...counters, total: 16, approved: 13, pending: 2, rejected: 1 },
    sections: [
      {
        categoryId: 'c1', code: 'PERSONAL', name: 'Documentação Pessoal', counters,
        items: [
          item('RG / CNH', 'Approved', '2024-03-12T12:00:00Z'),
          item('CPF', 'Approved', '2024-03-12T12:00:00Z'),
          item('Comprovante de Residência', 'Pending', null),
          item('Certidão de Casamento', 'Approved', '2024-03-12T12:00:00Z'),
          item('Comprovante de Renda', 'Approved', '2024-05-15T12:00:00Z'),
        ],
      },
      {
        categoryId: 'c2', code: 'TAX', name: 'Contábil / Fiscal', counters,
        items: [
          item('Declaração IRPF 2024', 'Approved', '2024-05-15T12:00:00Z'),
          item('Recibo IRPF 2024', 'Approved', '2024-05-15T12:00:00Z'),
          item('Extratos Bancários', 'Approved', '2024-06-10T12:00:00Z'),
          item('Comprovantes Patrimoniais', 'Pending', null),
        ],
      },
      {
        categoryId: 'c4', code: 'CONTRACTS', name: 'Contratos', counters,
        items: [
          item('Contrato assinado', 'Approved', '2024-01-15T12:00:00Z'),
          item('Termo de adesão', 'Approved', '2024-01-15T12:00:00Z'),
          item('Aditivo 01', 'Rejected', '2024-03-20T12:00:00Z'),
        ],
      },
    ],
  };
}

export function portfolio(id: string): Portfolio {
  return {
    customerId: id,
    calculatedAtUtc: '2024-12-16T12:00:00Z',
    isAutomaticallyCalculated: true,
    lastUpdatedAtUtc: '2024-12-16T12:00:00Z',
    currencies: [
      {
        currencyId: 'brl', currencyIsoCode: 'BRL', baseEquity: 2450000, invested: 1850000, investable: 150000, total: 4450000,
        investedBreakdown: { contractCount: 2, contractAllocation: 1850000, contractContributions: 1500000 },
        wallets: [
          { id: 'CART-0001', type: 'BaseEquity', currencyIsoCode: 'BRL', balance: 2450000, reserved: 0, available: 2450000 },
          { id: 'CART-0002', type: 'Invested', currencyIsoCode: 'BRL', balance: 1850000, reserved: 1850000, available: 0 },
          { id: 'CART-0003', type: 'Investable', currencyIsoCode: 'BRL', balance: 150000, reserved: 0, available: 150000 },
        ],
      },
    ],
  };
}

export function composition(id: string): PortfolioComposition {
  return {
    customerId: id,
    currencies: [
      {
        currencyIsoCode: 'BRL',
        total: 3650000,
        items: [
          { classCode: 'RE', className: 'Imobiliário', origin: 'Registro Patrimonial', value: 1800000, sharePercentage: 49, lastUpdatedAtUtc: '2024-12-16T12:00:00Z' },
          { classCode: 'FI', className: 'Renda Fixa', origin: 'Integração BTG', value: 1250000, sharePercentage: 34, lastUpdatedAtUtc: '2024-12-16T13:15:00Z' },
          { classCode: 'MM', className: 'Multimercado', origin: 'Integração XP', value: 600000, sharePercentage: 17, lastUpdatedAtUtc: '2024-12-16T13:15:00Z' },
        ],
      },
    ],
  };
}

export const contracts: ContractListItem[] = [
  {
    id: '000123', publicCode: '000123', name: 'Contrato XPTO 2024–2030', registrationStatus: 'Finalized',
    businessStatus: { id: 's1', code: 'ACTIVE', name: 'Ativo' }, initialContractualCapital: 500000, currentCapital: 580000,
    currencyCode: 'BRL', startDate: '2024-01-01', endDate: '2030-01-01',
  },
  {
    id: '000124', publicCode: '000124', name: 'Fundo Multimercado Lock-Up 180', registrationStatus: 'Finalized',
    businessStatus: { id: 's1', code: 'ACTIVE', name: 'Ativo' }, initialContractualCapital: 1000000, currentCapital: 1270000,
    currencyCode: 'BRL', startDate: '2023-06-15', endDate: '2026-12-15',
  },
];

const tx = (
  id: string, type: string, amount: number, when: string, src: string | null, dst: string | null,
): TransactionSummary => ({
  id, requestNumber: id, type, status: 'Completed', currencyIsoCode: 'BRL', amount, requestedAtUtc: when,
  source: src ? { kind: 'Wallet', walletType: src, contractName: null } : null,
  destination: dst ? { kind: 'Wallet', walletType: dst, contractName: null } : null,
});

export const transactions: TransactionSummary[] = [
  tx('tx_a1b2c3d4', 'Yield', 15000, '2024-12-16T12:00:00Z', null, 'Invested'),
  tx('tx_e5f6g7h8', 'Deposit', 50000, '2024-12-15T17:30:00Z', null, 'Investable'),
  tx('tx_m3n4o5p6', 'WalletTransfer', 100000, '2024-12-01T14:20:00Z', 'Investable', 'Invested'),
  tx('tx_q7r8s9t0', 'Withdrawal', 25000, '2024-11-20T19:45:00Z', 'Investable', null),
];

export const statementCsv = 'Data;Transação;Tipo;Valor\n16/12/2024 09:00;tx_a1b2c3d4;Rendimento;15000,00\n';

export const assets: CustomerAsset[] = [
  {
    id: 'a1', assetType: 'RealEstate', nickname: 'Apartamento Residencial', declaredValue: 1800000, currencyId: 'brl', status: 'PaidOff',
    remainingBalance: null, createdAtUtc: '2024-01-10T12:00:00Z', archivedAtUtc: null,
    realEstate: { propertyType: 'Apartment', addressLine: 'Av. Faria Lima', number: '3477', city: 'São Paulo', state: 'SP' },
    vehicle: null, consortium: null, investment: null,
  },
  {
    id: 'a2', assetType: 'RealEstate', nickname: 'Terreno em Condomínio', declaredValue: 450000, currencyId: 'brl', status: 'Financed',
    remainingBalance: 120000, createdAtUtc: '2024-01-10T12:00:00Z', archivedAtUtc: null,
    realEstate: { propertyType: 'Land', addressLine: 'Rod. Castelo Branco, Km 50', number: null, city: 'Araçariguama', state: 'SP' },
    vehicle: null, consortium: null, investment: null,
  },
  {
    id: 'a3', assetType: 'Vehicle', nickname: 'BMW X1 sDrive20i', declaredValue: 280000, currencyId: 'brl', status: 'PaidOff',
    remainingBalance: null, createdAtUtc: '2024-01-10T12:00:00Z', archivedAtUtc: null, realEstate: null,
    vehicle: { licensePlate: 'ABC-1234', brand: 'BMW', model: 'X1', modelYear: 2023, version: 'sDrive20i' },
    consortium: null, investment: null,
  },
  {
    id: 'a4', assetType: 'Consortium', nickname: 'Consórcio Imobiliário - Carta 200k', declaredValue: 200000, currencyId: 'brl', status: 'Financed',
    remainingBalance: 185000, createdAtUtc: '2022-01-10T12:00:00Z', archivedAtUtc: null, realEstate: null, vehicle: null,
    consortium: {
      consortiumType: 'RealEstate', administrator: 'Caixa Seguridade', groupNumber: '1050', quotaNumber: '230', amountPaid: 45000,
      totalInstallments: 180, paidInstallments: 30, quotaStatus: 'Contemplated', contemplationMethod: 'Draw',
    },
    investment: null,
  },
  {
    id: 'a5', assetType: 'Consortium', nickname: 'Consórcio Veicular - Carta 50k', declaredValue: 50000, currencyId: 'brl', status: 'Financed',
    remainingBalance: 35000, createdAtUtc: '2023-06-05T12:00:00Z', archivedAtUtc: null, realEstate: null, vehicle: null,
    consortium: {
      consortiumType: 'Vehicle', administrator: 'Porto Seguro', groupNumber: '400', quotaNumber: '12', amountPaid: 15000,
      totalInstallments: 60, paidInstallments: 18, quotaStatus: 'NotContemplated', contemplationMethod: null,
    },
    investment: null,
  },
  {
    id: 'a6', assetType: 'Investment', nickname: 'Fundo Multimercado Alpha', declaredValue: 150000, currencyId: 'brl', status: 'PaidOff',
    remainingBalance: null, createdAtUtc: '2023-05-12T12:00:00Z', archivedAtUtc: null, realEstate: null, vehicle: null, consortium: null,
    investment: {
      investmentType: 'Fund', institution: 'XP Investimentos', productName: 'Fundo Multimercado Alpha', initialAmount: 150000,
      startDate: '2023-05-12', hasFixedTerm: false, maturityDate: null,
    },
  },
];

export const assetDocuments: CustomerAssetDocument[] = [
  { documentId: 'ad1', documentTypeId: 't1', documentTypeCode: 'IPTU', documentTypeName: 'IPTU 2024 - Capa', documentStatus: 'Approved', fileName: 'iptu.pdf', linkedAtUtc: '2024-01-10T12:00:00Z' },
  { documentId: 'ad2', documentTypeId: 't2', documentTypeCode: 'REG', documentTypeName: 'Matrícula do Imóvel', documentStatus: 'Pending', fileName: 'matricula.pdf', linkedAtUtc: '2024-02-15T12:00:00Z' },
];
