import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type {
  Bank,
  ContractListItem,
  CustomerAsset,
  CustomerBankAccount,
  CustomerIdentification,
  CustomerOverview,
  GroupedDocuments,
  Portfolio,
  PortfolioComposition,
  TransactionSummary,
} from 'src/types/api';
import * as service from 'src/services/customer-profile.service';

interface Sections {
  overview: CustomerOverview;
  identification: CustomerIdentification;
  bankAccounts: CustomerBankAccount[];
  banks: Bank[];
  documents: GroupedDocuments;
  portfolio: Portfolio;
  composition: PortfolioComposition;
  contracts: ContractListItem[];
  transactions: TransactionSummary[];
  assets: CustomerAsset[];
}

type Key = keyof Sections;

const loaders: { [K in Key]: (id: string) => Promise<Sections[K]> } = {
  overview: service.getOverview,
  identification: service.getIdentification,
  bankAccounts: service.listBankAccounts,
  banks: () => service.listBanks(),
  documents: service.getGroupedDocuments,
  portfolio: service.getPortfolio,
  composition: service.getPortfolioComposition,
  contracts: service.listContracts,
  transactions: (id) => service.listTransactions(id),
  assets: service.listAssets,
};

/**
 * Perfil do cliente: cada card lê sua seção daqui.
 * As seções carregam em paralelo e falham isoladamente (um 404/403 num card não derruba os outros).
 */
export const useCustomerProfileStore = defineStore('customer-profile', () => {
  const customerId = ref<string | null>(null);
  const data = reactive<{ [K in Key]: Sections[K] | null }>({
    overview: null, identification: null, bankAccounts: null, banks: null, documents: null,
    portfolio: null, composition: null, contracts: null, transactions: null, assets: null,
  });
  const loading = reactive<Record<Key, boolean>>(Object.fromEntries(Object.keys(loaders).map((k) => [k, false])) as Record<Key, boolean>);
  const errors = reactive<Record<Key, string | null>>(Object.fromEntries(Object.keys(loaders).map((k) => [k, null])) as Record<Key, string | null>);

  async function reload<K extends Key>(key: K) {
    const id = customerId.value;
    if (!id) return;
    loading[key] = true;
    errors[key] = null;
    try {
      const value = await loaders[key](id);
      // descarta respostas de um cliente anterior (troca rápida de perfil)
      if (customerId.value === id) (data as Record<Key, unknown>)[key] = value;
    } catch (e) {
      if (customerId.value === id) errors[key] = e instanceof Error ? e.message : 'Falha ao carregar';
    } finally {
      if (customerId.value === id) loading[key] = false;
    }
  }

  async function load(id: string) {
    if (customerId.value !== id) {
      for (const k of Object.keys(data) as Key[]) (data as Record<Key, unknown>)[k] = null;
    }
    customerId.value = id;
    await Promise.all((Object.keys(loaders) as Key[]).map((k) => reload(k)));
  }

  return { customerId, data, loading, errors, load, reload };
});
