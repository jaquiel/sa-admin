/** Cliente como as telas de contrato o exibem (participante do contrato ou candidato a vínculo). */

export type ClientStatus = 'Active' | 'Analysis' | 'Blocked' | 'Inactive';

export interface ContractClient {
  id: string;
  name: string;
  type: 'PF' | 'PJ';
  document: string;
  email?: string;
  status: ClientStatus;
  docLevel: string;
  docStatus: 'Complete' | 'Incomplete';
  linkedDate: string;
  /** valor alocado ao cliente no contrato (participantes) */
  allocatedAmount?: number | null;
}
