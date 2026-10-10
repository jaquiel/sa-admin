export type CustomerType = 'PF' | 'PJ';
export type CustomerStatus = 'active' | 'blocked' | 'inactive';
export type Classification = 'A' | 'B' | 'C';
export type ComplianceStatus = 'ok' | 'pending' | 'alert' | 'blocked';

export interface CustomerSummary {
  id: string;
  name: string;
  type: CustomerType;
  document: string;
  maskedDoc: string;
  status: CustomerStatus;
  classification: Classification;
  compliance: ComplianceStatus;
  docLevel: number;
  /** dd/MM/yyyy HH:mm */
  lastAccess: string;
  totalInvested: number;
  contracts: number;
  avatar: string | null;
  /** dd/MM/yyyy */
  createdAt: string;
  advisor: string;
}

export interface CustomerFilters {
  search: string;
  status: 'all' | CustomerStatus;
  classification: 'all' | 'a' | 'b' | 'c';
  compliance: 'all' | 'ok' | 'pending' | 'alert';
  docType: 'all' | 'pf' | 'pj';
  sortBy: 'az' | 'patrimony' | 'recent' | 'risk' | 'status';
}

export interface CreateCustomerPayload {
  type: CustomerType;
  [key: string]: unknown;
}
