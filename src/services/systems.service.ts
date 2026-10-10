import { api } from 'boot/axios';
import type { AvailableSystem, AvailableSystemsResponse } from 'src/types/api';
import { unwrap, type ApiResponse } from './api-envelope';

const useMocks = process.env.USE_MOCKS === 'true';

/** GET /me/systems — sistemas liberados para o usuário logado. */
export async function listAvailableSystems(): Promise<AvailableSystem[]> {
  if (useMocks) {
    return [
      { id: 'data-entry', name: '', description: '', route: '/clientes', status: 'Active', requiredPermissions: [], requiredRoles: [] },
      { id: 'landing-page', name: '', description: '', route: '/landing-page', status: 'Active', requiredPermissions: [], requiredRoles: [] },
    ];
  }
  const { data } = await api.get<ApiResponse<AvailableSystemsResponse>>('/me/systems');
  return unwrap(data).systems;
}
