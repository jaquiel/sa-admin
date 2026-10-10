import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import type { CustomerFilters, CustomerSummary } from 'src/types/customer';
import * as service from 'src/services/customers.service';

const toTime = (ddmmyyyy: string) => {
  const [d, m, y] = ddmmyyyy.split(' ')[0]!.split('/');
  return new Date(`${y}-${m}-${d}`).getTime();
};

export const useCustomersStore = defineStore('customers', () => {
  const items = ref<CustomerSummary[]>([]);
  const loading = ref(false);
  const loaded = ref(false);
  const current = ref<CustomerSummary | null>(null);

  const filters = reactive<CustomerFilters>({
    search: '',
    status: 'all',
    classification: 'all',
    compliance: 'all',
    docType: 'all',
    sortBy: 'az',
  });

  /**
   * Mesmo comportamento do protótipo: busca por nome, documento mascarado, assessor ou ID.
   * Os selects de filtro do protótipo não filtravam a lista; aqui eles filtram de fato.
   */
  const filtered = computed(() => {
    const q = filters.search.trim().toLowerCase();
    return items.value.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.maskedDoc.includes(filters.search) ||
        c.advisor.toLowerCase().includes(q) ||
        c.id.includes(filters.search);
      const matchesStatus = filters.status === 'all' || c.status === filters.status;
      const matchesClass =
        filters.classification === 'all' || c.classification.toLowerCase() === filters.classification;
      const matchesCompliance = filters.compliance === 'all' || c.compliance === filters.compliance;
      const matchesDoc = filters.docType === 'all' || c.type.toLowerCase() === filters.docType;
      return matchesSearch && matchesStatus && matchesClass && matchesCompliance && matchesDoc;
    });
  });

  const sorted = computed(() => {
    const list = [...filtered.value];
    switch (filters.sortBy) {
      case 'az':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      case 'patrimony':
        return list.sort((a, b) => b.totalInvested - a.totalInvested);
      case 'recent':
        return list.sort((a, b) => toTime(b.lastAccess) - toTime(a.lastAccess));
      case 'risk':
        return list.sort((a, b) => a.classification.localeCompare(b.classification));
      case 'status':
        return list.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return list;
    }
  });

  async function fetchAll(force = false) {
    if (loaded.value && !force) return;
    loading.value = true;
    try {
      items.value = await service.listCustomers();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: string) {
    current.value = items.value.find((c) => c.id === id) ?? (await service.getCustomer(id));
    return current.value;
  }

  return { items, loading, filters, filtered, sorted, current, fetchAll, fetchOne };
});
