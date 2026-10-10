import { reactive, ref } from 'vue';
import { listCustomers } from 'src/services/customers.service';
import { listBankAccounts, listBanks } from 'src/services/customer-profile.service';
import { listCustomerWallets } from 'src/services/transactions.service';
import type { Bank, CustomerBankAccount, Wallet } from 'src/types/api';

/**
 * Clientes, carteiras e contas bancárias para os formulários de transação.
 * Estado compartilhado entre os componentes: a lista de clientes e os bancos carregam uma vez,
 * e carteiras/contas de cada cliente carregam quando ele é selecionado.
 */

export interface AccountsOfCustomer {
  wallets: Wallet[];
  bankAccounts: CustomerBankAccount[];
}

const WALLET_LABEL: Record<string, string> = { Free: 'Carteira Livre', Applied: 'Carteira Aplicada' };
const ACCOUNT_TYPE_LABEL: Record<string, string> = { Checking: 'Conta Corrente', Savings: 'Conta Poupança', Payment: 'Conta Pagamento' };

const customers = ref<{ id: string; name: string }[]>([]);
const customersLoading = ref(false);
const accounts = reactive<Record<string, AccountsOfCustomer>>({});
const bankNames = ref<Record<string, string>>({});

let customersPromise: Promise<void> | null = null;
let banksPromise: Promise<void> | null = null;
const accountsPromises = new Map<string, Promise<void>>();

function loadCustomers(): Promise<void> {
  customersPromise ??= (async () => {
    customersLoading.value = true;
    try {
      const list = await listCustomers();
      customers.value = list
        .map((c) => ({ id: c.id, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    } finally {
      customersLoading.value = false;
    }
  })().catch((e: unknown) => {
    customersPromise = null;
    throw e;
  });
  return customersPromise;
}

function loadBanks(): Promise<void> {
  banksPromise ??= listBanks()
    .then((banks: Bank[]) => {
      bankNames.value = Object.fromEntries(banks.map((b) => [b.id, b.name]));
    })
    .catch((e: unknown) => {
      banksPromise = null;
      throw e;
    });
  return banksPromise;
}

/** Carrega (uma vez) carteiras e contas bancárias ativas do cliente. `force` recarrega, ex.: após uma transação. */
function loadAccounts(customerId: string, force = false): Promise<void> {
  if (force) accountsPromises.delete(customerId);
  let p = accountsPromises.get(customerId);
  if (!p) {
    p = Promise.all([listCustomerWallets(customerId), listBankAccounts(customerId), loadBanks()])
      .then(([wallets, bankAccounts]) => {
        accounts[customerId] = { wallets, bankAccounts: bankAccounts.filter((a) => a.status === 'Active') };
      })
      .catch((e: unknown) => {
        accountsPromises.delete(customerId);
        throw e;
      });
    accountsPromises.set(customerId, p);
  }
  return p;
}

const walletLabel = (w: Wallet) => `${WALLET_LABEL[w.type] ?? `Carteira ${w.type}`} (${w.currencyIsoCode})`;
const bankName = (a: CustomerBankAccount) => bankNames.value[a.bankId] ?? 'Banco';
const accountLabel = (a: CustomerBankAccount) =>
  `${bankName(a)} · Ag ${a.branch} · ${a.accountNumberMasked ?? a.accountNumber ?? ''}${a.isPrimary ? ' (principal)' : ''}`;
const accountTypeLabel = (a: CustomerBankAccount) => ACCOUNT_TYPE_LABEL[a.accountType] ?? a.accountType;

export function useCustomerAccounts() {
  return {
    customers,
    customersLoading,
    accounts,
    loadCustomers,
    loadAccounts,
    walletLabel,
    bankName,
    accountLabel,
    accountTypeLabel,
  };
}
