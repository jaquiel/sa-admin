/**
 * Rótulos pt-BR para enums da API. Valor desconhecido → o próprio valor (nunca some da tela).
 * Os enums vêm de exemplos da collection Postman; os não documentados estão marcados com "?".
 */
const label = (map: Record<string, string>) => (v: string | null | undefined) => (v ? (map[v] ?? map[v.toLowerCase()] ?? v) : '—');

export const customerStatusLabel = label({
  Active: 'Ativo', Inactive: 'Inativo', Blocked: 'Bloqueado', Suspended: 'Suspenso', Archived: 'Arquivado',
  Pending: 'Em análise', UnderReview: 'Em análise', Prospect: 'Prospect',
});

export const accountTypeLabel = label({
  Checking: 'Corrente', Savings: 'Poupança', Payment: 'Pagamento', Investment: 'Investimento',
});

export const holderTypeLabel = label({ Individual: 'Pessoa Física', Company: 'Pessoa Jurídica', Joint: 'Conjunta' });

export const documentStatusLabel = label({
  Approved: 'Aprovado', Pending: 'Pendente', Rejected: 'Rejeitado', UnderReview: 'Em análise', InReview: 'Em análise',
  Missing: 'Pendente', Waived: 'Dispensado', Expired: 'Vencido', Uploaded: 'Em análise', Submitted: 'Em análise',
});

export const contactPreferenceLabel = label({ Email: 'E-mail', Phone: 'Telefone', Sms: 'SMS', WhatsApp: 'WhatsApp' });

export const transactionTypeLabel = label({
  Deposit: 'Aporte', Withdrawal: 'Resgate', WalletTransfer: 'Transferência', ContractOperation: 'Operação de contrato',
  Yield: 'Rendimento', Block: 'Bloqueio',
});

export const transactionStatusLabel = label({
  Completed: 'Concluída', Pending: 'Pendente', Processing: 'Em processamento', Requested: 'Solicitada',
  Approved: 'Aprovada', Rejected: 'Rejeitada', Cancelled: 'Cancelada', Failed: 'Falhou',
});

export const walletTypeLabel = label({
  BaseEquity: 'Saldo Base', Invested: 'Saldo Investido', Investable: 'Saldo Investível',
});

export const quotaStatusLabel = label({ Contemplated: 'Contemplado', NotContemplated: 'Não Contemplado' });
export const contemplationLabel = label({ Draw: 'Sorteio', Bid: 'Lance', FixedBid: 'Lance fixo' });

/** Status de documento normalizado para os componentes de tela (DocItem / StandardDocRow). */
export function docTone(status: string | null | undefined): 'approved' | 'pending' | 'rejected' | 'missing' {
  const s = (status ?? '').toLowerCase();
  if (/approv|valid|accept/.test(s)) return 'approved';
  if (/reject|expired|denied/.test(s)) return 'rejected';
  if (/missing|notsubmitted|required/.test(s)) return 'missing';
  return 'pending';
}
