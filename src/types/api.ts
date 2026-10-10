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
  currencyIsoCode: string;
  balance: Num;
  reserved: Num;
  available: Num;
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
}

export interface TransactionSummary {
  id: string;
  requestNumber: string;
  type: string;
  status: string;
  currencyIsoCode: string;
  amount: Num;
  source: { kind: string; walletType: string | null; contractName: string | null } | null;
  destination: { kind: string; walletType: string | null; contractName: string | null } | null;
  requestedAtUtc: string;
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
