import { api } from 'boot/axios';
import { getRefreshToken, type SessionUser } from './auth-storage';
import { unwrap, type ApiResponse } from './api-envelope';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: SessionUser;
  permissions: string[];
}

const useMocks = process.env.USE_MOCKS === 'true';

/** Contrato esperado da API: POST /auth/login { email, password } → LoginResponse */
export async function login(email: string, password: string): Promise<LoginResponse> {
  if (useMocks) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      token: 'mock-token',
      refreshToken: 'mock-refresh',
      user: { id: '1', name: 'Admin User', email: email || 'admin@sa.com', avatar: null },
      permissions: [
        'customers:read', 'customers:write', 'contracts:read', 'contracts:write',
        'logics:read', 'logics:write', 'transactions:read', 'credit:read', 'communication:read', 'settings:read',
        'landing:edit',
      ],
    };
  }
  const auth = unwrap(
    (await api.post<ApiResponse<AuthTokenResponse>>('/auth/login', { email, password })).data,
  );
  // O login não traz permissões; /auth/me traz roles + permissions (token ainda não está no cookie).
  const me = unwrap(
    (
      await api.get<ApiResponse<CurrentUserResponse>>('/auth/me', {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
    ).data,
  );
  return {
    token: auth.accessToken,
    refreshToken: auth.refreshToken,
    user: { id: auth.user.id, name: auth.user.name, email: auth.user.email, avatar: null },
    permissions: toAppPermissions([auth.user.role, ...me.roles], me.permissions),
  };
}

interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string };
}

interface CurrentUserResponse {
  roles: string[];
  permissions: string[];
}

/** Permissões usadas em meta.permission das rotas. */
const APP_PERMISSIONS = [
  'customers:read', 'customers:write', 'contracts:read', 'contracts:write',
  'logics:read', 'logics:write', 'transactions:read', 'credit:read', 'communication:read', 'settings:read',
  'landing:edit',
];

/**
 * A API pode nomear permissões de outro jeito (ex.: "Customers.Read"); normaliza para "customers:read".
 * Perfis administrativos recebem todas — a autorização de fato continua no backend.
 */
function toAppPermissions(roles: string[], permissions: string[]): string[] {
  if (roles.some((r) => /admin/i.test(r ?? ''))) return [...APP_PERMISSIONS];
  const normalized = permissions.map((p) => p.toLowerCase().replace(/[.\s]/g, ':'));
  return [...new Set([...permissions, ...normalized])];
}

export async function logout(): Promise<void> {
  if (useMocks) return;
  try {
    await api.post('/auth/logout', { refreshToken: getRefreshToken() });
  } catch {
    /* sessão é limpa localmente de qualquer forma */
  }
}
