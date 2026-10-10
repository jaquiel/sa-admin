import { api } from 'boot/axios';
import { unwrap, type PagedResponse } from './api-envelope';

/** Percorre todas as páginas de um endpoint paginado (limite de segurança: 50 páginas). */
export async function getAllPages<T>(url: string, params: Record<string, unknown> = {}, pageSize = 100): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data } = await api.get<PagedResponse<T>>(url, { params: { ...params, page, pageSize } });
    all.push(...unwrap(data));
    if (!data.pagination?.hasNextPage) break;
  }
  return all;
}
