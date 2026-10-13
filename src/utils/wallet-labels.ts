import type { AdminWalletListItem, AdminWalletMovement, WalletType } from 'src/types/api';
import { apiErrorCode, apiErrorStatus } from 'src/services/api-envelope';
import { formatCurrencyIn } from 'src/utils/format';
import { transactionTypeMeta } from 'src/utils/transaction-labels';

/** Mapeamento card ↔ GET /admin/wallets. A API não tem nome nem código de carteira: o rótulo é tipo + moeda. */

export const WALLET_TYPE_LABEL: Record<WalletType, string> = { Free: 'Livre', Applied: 'Aplicada' };

/** "Livre · USD", "Aplicada · BRL" */
export const walletLabel = (w: Pick<AdminWalletListItem, 'type' | 'currencyIsoCode'>) =>
  `${WALLET_TYPE_LABEL[w.type] ?? w.type} · ${w.currencyIsoCode}`;

/** Trecho curto de um GUID para identificar a carteira/cliente na tela (o id completo vai no title). */
export const shortId = (id: string) => id.slice(0, 8);

/** Sinal, cor e ícone de uma movimentação: o sinal vem de `direction`, o ícone de `type`. */
export function movementMeta(m: AdminWalletMovement, currency: string) {
  const credit = m.direction === 'Credit';
  const type = transactionTypeMeta(m.type);
  return {
    credit,
    signed: `${credit ? '+' : '−'}${formatCurrencyIn(Number(m.amount), currency)}`,
    cls: credit ? 'text-emerald-600' : 'text-rose-600',
    icon: type.icon,
    label: type.label,
  };
}

const WALLET_ERRORS: Record<string, string> = {
  'wallet.invalid_type': 'Tipo de carteira inválido.',
  'wallet.invalid_sort': 'Ordenação inválida.',
  'wallet.search_too_long': 'A busca aceita no máximo 100 caracteres.',
  'pagination.invalid': 'Página inválida.',
  'wallet.not_found': 'Carteira não encontrada.',
  'transaction.date_range_invalid': 'A data inicial não pode ser posterior à data final.',
};

/**
 * Mensagem de erro das telas de carteiras, decidida por `errors[0].code`.
 * 401 já é tratado pelo interceptor do axios (refresh ou volta ao login); 403 pode vir sem corpo.
 */
export function walletErrorMessage(e: unknown, fallback: string): string {
  const code = apiErrorCode(e);
  if (code && WALLET_ERRORS[code]) return WALLET_ERRORS[code];
  const status = apiErrorStatus(e);
  if (status === 401) return 'Sessão expirada. Entre novamente.';
  if (status === 403) return 'Você não tem permissão para ver as carteiras.';
  return fallback;
}
