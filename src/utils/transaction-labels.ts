import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, FileSignature } from 'lucide-vue-next';
import type { TransactionEndpoint } from 'src/types/api';
import type { TransactionAction } from 'src/services/transactions.service';

/** Rótulos e estilos das transações da API, compartilhados entre a listagem e a fila de solicitações. */

export const TRANSACTION_STATUS: Record<string, { label: string; cls: string }> = {
  PendingValidation: { label: 'Aguardando Validação', cls: 'sa-badge--blue-soft' },
  AwaitingReceipt: { label: 'Aguardando Comprovante', cls: 'sa-badge--blue-soft' },
  CorrectionRequested: { label: 'Correção Solicitada', cls: 'sa-badge--rose-soft' },
  Validated: { label: 'Validada', cls: 'sa-badge--blue-soft' },
  Approved: { label: 'Aprovada', cls: 'sa-badge--blue-soft' },
  Rejected: { label: 'Rejeitada', cls: 'sa-badge--rose-soft' },
  Completed: { label: 'Concluída', cls: 'sa-badge--emerald-soft' },
  Failed: { label: 'Falhou', cls: 'sa-badge--rose-soft' },
  Canceled: { label: 'Cancelada', cls: 'sa-badge--slate-soft' },
};

export const TRANSACTION_TYPE: Record<string, { label: string; icon: typeof ArrowDownLeft; cls: string }> = {
  Deposit: { label: 'Depósito', icon: ArrowDownLeft, cls: 'deposit' },
  Withdrawal: { label: 'Saque', icon: ArrowUpRight, cls: 'withdraw' },
  WalletTransfer: { label: 'Transferência', icon: ArrowRightLeft, cls: 'transfer' },
  ContractOperation: { label: 'Op. de Contrato', icon: FileSignature, cls: 'contract' },
};

export const TRANSACTION_ACTION: Record<TransactionAction, string> = {
  Validate: 'Validar',
  Approve: 'Aprovar',
  Execute: 'Executar',
  RetryExecution: 'Retentar execução',
  RequestCorrection: 'Solicitar correção',
  Reject: 'Rejeitar',
  Cancel: 'Cancelar',
};

export const transactionTypeMeta = (type: string) => TRANSACTION_TYPE[type] ?? { label: type, icon: ArrowRightLeft, cls: 'transfer' };
export const transactionStatusMeta = (status: string) => TRANSACTION_STATUS[status] ?? { label: status, cls: 'sa-badge--slate-soft' };

const WALLET: Record<string, string> = { Free: 'Carteira Livre', Applied: 'Carteira Aplicada' };

export function endpointLabel(e: TransactionEndpoint | null): string {
  if (!e) return '—';
  if (e.kind === 'Wallet') return WALLET[e.walletType ?? ''] ?? `Carteira ${e.walletType ?? ''}`.trim();
  if (e.kind === 'BankAccount') return [e.bankName, e.accountNumberMasked].filter(Boolean).join(' · ') || 'Conta bancária';
  if (e.kind === 'Contract') return [e.contractPublicCode, e.contractName].filter(Boolean).join(' · ') || 'Contrato';
  return e.kind;
}
