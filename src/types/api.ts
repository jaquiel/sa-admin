/**
 * Contratos da Strategy Analytics API (/api/v1) usados pelo admin.
 * Fonte: /openapi/v1.json e strategy-analytics.postman_collection.json.
 * Números podem chegar como string (o OpenAPI declara integer|string); converta com Number().
 */

type Num = number | string;

export interface AvailableSystem {
  id: string;
  name: string;
  description: string;
  route: string;
  status: string;
  requiredPermissions: string[];
  requiredRoles: string[];
}

export interface AvailableSystemsResponse {
  workspaceId: string;
  systems: AvailableSystem[];
}

// ---- cliente ----

export interface DocumentSummary {
  customerId: string;
  requirementCount: Num;
  documentCount: Num;
  approved: Num;
  pending: Num;
  rejected: Num;
  inReview: Num;
  missing: Num;
  waived: Num;
}

export interface OperationalSummary {
  advisorId: string | null;
  advisorName: string | null;
  lastAccessAtUtc: string | null;
  riskClassification: string;
  complianceStatus: string;
  documentLevel: Num;
  documentSummary: DocumentSummary;
}

export interface CustomerHeader {
  id: string;
  workspaceId: string;
  kind: string;
  status: string;
  primaryName: string | null;
  primaryContact: string | null;
  birthDate: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  archivedAtUtc: string | null;
  operationalSummary: OperationalSummary | null;
}

export interface ContactItem {
  kind: string;
  value: string | null;
  valueMasked: string | null;
  isPrimary: boolean;
  isVerified: boolean;
  status: string;
}

export interface IdentificationAddress {
  kind: string;
  line1: string;
  line2: string | null;
  city: string;
  stateOrProvince: string | null;
  postalCode: string | null;
  countryIsoCode: string | null;
  isPrimary: boolean;
  status: string;
}

export interface TypedPersonalDocument {
  documentCode: string;
  documentId: string | null;
  documentTypeId: string;
  numberMasked: string | null;
  status: string;
  source: string | null;
  issuer: string | null;
  issuerState: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
  category: string | null;
  countryIsoCode: string | null;
}

export interface CustomerIdentification {
  customerId: string;
  kind: string;
  status: string;
  fullName: string | null;
  birthDate: string | null;
  nationality: string | null;
  documents: TypedPersonalDocument[];
  primaryEmail: ContactItem | null;
  mobilePhone: ContactItem | null;
  secondaryPhone: ContactItem | null;
  contactPreference: string | null;
  residentialAddress: IdentificationAddress | null;
}

export interface ComplianceFlag {
  id: string;
  flagType: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  monitoringFrequency: string | null;
  detectedAtUtc: string;
}

export interface ComplianceAlerts {
  activeCount: Num;
  criticalCount: Num;
  highCount: Num;
  hasPep: boolean;
  hasRelatedPep: boolean;
  hasSanctions: boolean;
  primaryAlert: ComplianceFlag | null;
  recentAlerts: ComplianceFlag[];
}

export interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  actorName: string | null;
  source: string | null;
  occurredAtUtc: string;
}

export interface ComplianceCard {
  customerId: string;
  primaryAlert: ComplianceFlag | null;
  summary: ComplianceAlerts;
  recentHistory: TimelineEvent[];
}

export interface ProfessionalProfile {
  id: string;
  occupation: string | null;
  employerName: string | null;
  validFrom: string | null;
  isCurrent: boolean;
}

export interface FinancialProfile {
  id: string;
  individualMonthlyIncome: Num | null;
  householdMonthlyIncome: Num | null;
  declaredNetWorth: Num | null;
  currencyCode: string;
  effectiveFrom: string;
}

export interface AccountSecurity {
  userId: string;
  userName: string | null;
  email: string | null;
  status: string;
  passwordStatus: string | null;
  emailConfirmationStatus: string | null;
  lastLoginAtUtc: string | null;
  twoFactorEnabled: boolean;
  twoFactorStatus: string | null;
}

export interface CustomerPreferences {
  customerId: string;
  primaryCurrencyCode: string | null;
  secondaryCurrencyCode: string | null;
  languageCode: string | null;
  timeZoneId: string | null;
  theme: string | null;
  countryId: string | null;
}

export interface CustomerOverview {
  customerId: string;
  header: CustomerHeader;
  compliance: ComplianceCard;
  documentSummary: DocumentSummary;
  professionalProfile: ProfessionalProfile | null;
  financialProfile: FinancialProfile | null;
  accountSecurity: AccountSecurity | null;
  preferences: CustomerPreferences;
  recentObservations: TimelineEvent[];
}

// ---- contas bancárias ----

export interface Bank {
  id: string;
  name: string;
  code: string;
  countryId: string;
  isActive: boolean;
}

export interface CustomerBankAccount {
  id: string;
  bankId: string;
  branch: string;
  accountNumber: string | null;
  accountNumberMasked: string | null;
  accountDigit: string | null;
  accountType: string;
  holderType: string;
  holderName: string | null;
  holderDocument: string | null;
  holderDocumentMasked: string | null;
  pixKey: string | null;
  pixKeyMasked: string | null;
  pixKeyType: string | null;
  isPrimary: boolean;
  status: string;
}

export interface BankAccountRequest {
  bankId: string;
  branch: string;
  accountNumber: string;
  accountDigit: string | null;
  accountType: string;
  holderType: string;
  holderName: string | null;
  holderDocument: string | null;
  pixKey: string | null;
  pixKeyType: string | null;
  isPrimary: boolean;
  status: string;
}

// ---- documentos ----

export interface GroupedCounters {
  total: Num;
  approved: Num;
  pending: Num;
  rejected: Num;
  inReview: Num;
  missing: Num;
  waived: Num;
}

export interface GroupedDocumentItem {
  requirementId: string | null;
  documentTypeId: string;
  documentTypeName: string;
  documentId: string | null;
  status: string;
  action: string | null;
  submittedAtUtc: string | null;
}

export interface GroupedDocuments {
  customerId: string;
  counters: GroupedCounters;
  sections: Array<{ categoryId: string; code: string; name: string; counters: GroupedCounters; items: GroupedDocumentItem[] }>;
}

// ---- carteira ----

export interface Wallet {
  id: string;
  type: string;
  currencyId?: string;
  currencyIsoCode: string;
  balance: Num;
  reserved: Num;
  available: Num;
}

// ---- carteiras (GET /admin/wallets e /admin/wallets/{id}/statement) ----

export type WalletType = 'Free' | 'Applied';
export type MovementDirection = 'Credit' | 'Debit';
export type WalletListSort = 'ClientName' | 'HighestBalance' | 'LowestBalance' | 'RecentlyMoved';

/** Movimentação executada numa carteira (item de `recentMovements` e do extrato). */
export interface AdminWalletMovement {
  transactionId: string;
  requestNumber: string;
  /** Deposit | Withdrawal | WalletTransfer | ContractOperation */
  type: string;
  direction: MovementDirection;
  amount: Num;
  /** Saldo da carteira logo depois desta movimentação. */
  balanceAfter: Num;
  occurredAtUtc: string;
}

export interface AdminWalletListItem {
  id: string;
  type: WalletType;
  currencyId: string;
  currencyIsoCode: string;
  client: { id: string; name: string };
  balance: Num;
  reserved: Num;
  available: Num;
  lastMovementAtUtc: string | null;
  /** Até 3, da mais recente para a mais antiga. */
  recentMovements: AdminWalletMovement[];
}

export interface WalletBalances {
  balance: Num;
  reserved: Num;
  available: Num;
}

/** Item de GET /admin/transactions/summary: saldos somados de todos os clientes, por moeda. */
export interface TransactionsSummaryCurrency {
  currencyId: string;
  currencyIsoCode: string;
  free: WalletBalances;
  applied: WalletBalances;
  total: WalletBalances;
  contracts: { contractCount: number; contractAllocation: Num; contractContributions: Num; total: Num };
}

export interface TransactionsSummary {
  calculatedAtUtc: string;
  currencies: TransactionsSummaryCurrency[];
}

export interface PortfolioCurrency {
  currencyId: string;
  currencyIsoCode: string;
  baseEquity: Num;
  invested: Num;
  investable: Num;
  total: Num;
  investedBreakdown: { contractCount: Num; contractAllocation: Num; contractContributions: Num };
  wallets: Wallet[];
}

export interface Portfolio {
  customerId: string;
  calculatedAtUtc: string;
  isAutomaticallyCalculated: boolean;
  lastUpdatedAtUtc: string | null;
  currencies: PortfolioCurrency[];
}

export interface PortfolioComposition {
  customerId: string;
  currencies: Array<{
    currencyIsoCode: string;
    total: Num;
    items: Array<{ classCode: string; className: string; origin: string; value: Num; sharePercentage: Num; lastUpdatedAtUtc: string | null }>;
  }>;
}

export interface ContractListItem {
  id: string;
  publicCode: string;
  name: string;
  registrationStatus: string;
  businessStatus: { id: string; code: string; name: string } | null;
  initialContractualCapital: Num;
  currentCapital: Num;
  currencyCode: string;
  startDate: string | null;
  endDate: string | null;
  createdAtUtc?: string;
  clients?: { clientId: string; displayName: string; personType: string }[];
  clientCount?: number;
  primaryEngine?: { engineId: string; name: string } | null;
}

/** GET /admin/contracts/:id. `currentBalance` ainda é sempre null no backend. */
export interface ContractDetail {
  id: string;
  publicCode: string;
  name: string | null;
  registrationStatus: string;
  term: { value: number; unit: string } | null;
  startDate: string | null;
  expectedEndDate: string | null;
  currency: { id: string; isoCode: string; name: string } | null;
  initialContractualCapital: Num | null;
  initialConsolidatedCapital: Num | null;
  currentBalance: Num | null;
  initialCapitalOrigin: { id: string; code: string; name: string } | null;
  financialNotes: string | null;
  businessStatus: { id: string; code: string; name: string } | null;
  primaryEngine: { engineId: string; code: string; name: string; connectionStatus: string } | null;
  participants: {
    participantId: string;
    clientId: string;
    displayName: string;
    personType: string;
    allocatedAmount: Num | null;
    allocationPercentage: Num | null;
    linkedAtUtc: string;
  }[];
  createdAtUtc: string;
  updatedAtUtc: string | null;
  finalizedAtUtc: string | null;
  version: number;
}

export interface ContractCatalogItem {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  isSelectable?: boolean;
  displayOrder?: number;
}

/** Kind: Wallet (walletType) | BankAccount (bankName, accountNumberMasked) | Contract (contractPublicCode, contractName). */
export interface TransactionEndpoint {
  kind: string;
  id?: string;
  walletType: string | null;
  bankName?: string | null;
  accountNumberMasked?: string | null;
  contractPublicCode?: string | null;
  contractName: string | null;
}

export interface TransactionSummary {
  id: string;
  requestNumber: string;
  type: string;
  status: string;
  clientId?: string;
  clientName?: string;
  currencyIsoCode: string;
  amount: Num;
  source: TransactionEndpoint | null;
  destination: TransactionEndpoint | null;
  requestedAtUtc: string;
  attentionRequired?: boolean;
}

// ---- patrimônio ----

export type AssetKind = 'RealEstate' | 'Vehicle' | 'Consortium' | 'Investment';

export interface CustomerAsset {
  id: string;
  assetType: string;
  nickname: string | null;
  declaredValue: Num | null;
  currencyId: string | null;
  status: string;
  remainingBalance: Num | null;
  createdAtUtc: string;
  archivedAtUtc: string | null;
  realEstate: {
    propertyType: string | null;
    addressLine: string | null;
    number: string | null;
    city: string | null;
    state: string | null;
  } | null;
  vehicle: { licensePlate: string | null; brand: string | null; model: string | null; modelYear: Num | null; version: string | null } | null;
  consortium: {
    consortiumType: string | null;
    administrator: string | null;
    groupNumber: string | null;
    quotaNumber: string | null;
    amountPaid: Num | null;
    totalInstallments: Num | null;
    paidInstallments: Num | null;
    quotaStatus: string | null;
    contemplationMethod: string | null;
  } | null;
  investment: {
    investmentType: string | null;
    institution: string | null;
    productName: string | null;
    initialAmount: Num | null;
    startDate: string | null;
    hasFixedTerm: boolean;
    maturityDate: string | null;
  } | null;
}

export interface CustomerAssetDocument {
  documentId: string;
  documentTypeId: string;
  documentTypeCode: string;
  documentTypeName: string;
  documentStatus: string;
  fileName: string | null;
  linkedAtUtc: string;
}
