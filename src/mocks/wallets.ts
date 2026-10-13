// Dados de exemplo no formato de GET /admin/wallets (usados só com USE_MOCKS=true).
import type { AdminWalletListItem, AdminWalletMovement } from 'src/types/api';

const mv = (
  n: number,
  type: string,
  direction: AdminWalletMovement['direction'],
  amount: number,
  balanceAfter: number,
  occurredAtUtc: string,
): AdminWalletMovement => ({
  transactionId: `mock-tx-${n}`,
  requestNumber: `REQ-2026-MOCK${String(n).padStart(4, '0')}`,
  type,
  direction,
  amount,
  balanceAfter,
  occurredAtUtc,
});

const CLIENT_IDS: Record<string, string> = {
  'Ana Lima': '2a1d9c4e-7b10-4c2a-9f3e-1d2c3b4a5e6f',
  'Global Assets Fund': '71e8b3f0-2c4d-4e5f-8a9b-0c1d2e3f4a5b',
  'Roberto Silva': 'c49f02a6-5d3e-4b1c-8e7f-6a5b4c3d2e1f',
};

const wallet = (
  id: string,
  type: AdminWalletListItem['type'],
  currencyIsoCode: string,
  client: string,
  reserved: number,
  movements: AdminWalletMovement[],
): AdminWalletListItem => {
  const balance = Number(movements[0]?.balanceAfter ?? 0);
  return {
    id,
    type,
    currencyId: `mock-${currencyIsoCode.toLowerCase()}`,
    currencyIsoCode,
    client: { id: CLIENT_IDS[client] ?? '00000000-0000-4000-8000-000000000000', name: client },
    balance,
    reserved,
    available: balance - reserved,
    lastMovementAtUtc: movements[0]?.occurredAtUtc ?? null,
    recentMovements: movements,
  };
};

/** Histórico completo por carteira (mais recente primeiro); a listagem expõe só as 3 primeiras. */
export const walletMovementsMock: Record<string, AdminWalletMovement[]> = {
  '3c9e1a07-0001-4000-8000-000000000001': [
    mv(1, 'WalletTransfer', 'Debit', 20, 730, '2026-10-13T12:30:00Z'),
    mv(2, 'Deposit', 'Credit', 500, 750, '2026-10-10T09:00:00Z'),
    mv(3, 'Withdrawal', 'Debit', 50, 250, '2026-10-02T15:20:00Z'),
    mv(4, 'Deposit', 'Credit', 300, 300, '2026-09-28T10:00:00Z'),
  ],
  '8d24f6b1-0002-4000-8000-000000000002': [mv(5, 'Deposit', 'Credit', 15000, 15000, '2026-10-11T14:45:00Z')],
  'e05b7c42-0003-4000-8000-000000000003': [],
  '5f71a9d8-0001-4000-8000-000000000001': [
    mv(6, 'ContractOperation', 'Debit', 10000, 40000, '2026-10-12T11:00:00Z'),
    mv(7, 'WalletTransfer', 'Credit', 50000, 50000, '2026-10-08T16:30:00Z'),
  ],
  'b6c3e2f5-0002-4000-8000-000000000002': [],
};

const m = walletMovementsMock;

export const adminWalletsMock: AdminWalletListItem[] = [
  wallet('3c9e1a07-0001-4000-8000-000000000001', 'Free', 'BRL', 'Ana Lima', 100, m['3c9e1a07-0001-4000-8000-000000000001']!.slice(0, 3)),
  wallet('8d24f6b1-0002-4000-8000-000000000002', 'Free', 'EUR', 'Global Assets Fund', 0, m['8d24f6b1-0002-4000-8000-000000000002']!),
  wallet('e05b7c42-0003-4000-8000-000000000003', 'Free', 'USD', 'Roberto Silva', 0, []),
  wallet('5f71a9d8-0001-4000-8000-000000000001', 'Applied', 'BRL', 'Ana Lima', 0, m['5f71a9d8-0001-4000-8000-000000000001']!),
  wallet('b6c3e2f5-0002-4000-8000-000000000002', 'Applied', 'USD', 'Global Assets Fund', 0, []),
];
