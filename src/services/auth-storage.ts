import { Cookies } from 'quasar';

/**
 * Persistência da sessão.
 * - Tokens e usuário em cookies `SA_token` / `SA_user` / `SA_refresh` (secure + sameSite=None).
 * - Permissões em localStorage (`SA_permissions`).
 *
 * Observação: `sameSite=None` exige `secure`, então em http://localhost o navegador
 * só aceita esses cookies em contexto seguro (Chrome trata localhost como seguro).
 */

export const COOKIE_TOKEN = 'SA_token';
export const COOKIE_USER = 'SA_user';
export const COOKIE_REFRESH = 'SA_refresh';
export const LS_PERMISSIONS = 'SA_permissions';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

const cookieOptions = (days = 7) =>
  ({
    expires: days,
    path: '/',
    secure: true,
    sameSite: 'None',
  }) as const;

export function saveSession(params: {
  token: string;
  refreshToken: string;
  user: SessionUser;
  permissions: string[];
}) {
  Cookies.set(COOKIE_TOKEN, params.token, cookieOptions(1));
  Cookies.set(COOKIE_REFRESH, params.refreshToken, cookieOptions(30));
  Cookies.set(COOKIE_USER, JSON.stringify(params.user), cookieOptions(30));
  // JSON puro (sem o prefixo de tipo do LocalStorage do Quasar) para ser legível por outros apps/SDKs.
  localStorage.setItem(LS_PERMISSIONS, JSON.stringify(params.permissions));
}

export function updateAccessToken(token: string, refreshToken?: string) {
  Cookies.set(COOKIE_TOKEN, token, cookieOptions(1));
  if (refreshToken) Cookies.set(COOKIE_REFRESH, refreshToken, cookieOptions(30));
}

export function getAccessToken(): string | null {
  return Cookies.get(COOKIE_TOKEN) ?? null;
}

export function getRefreshToken(): string | null {
  return Cookies.get(COOKIE_REFRESH) ?? null;
}

export function getStoredUser(): SessionUser | null {
  const raw = Cookies.get(COOKIE_USER) as unknown;
  if (!raw) return null;
  // Quasar Cookies faz JSON.parse automático quando possível.
  if (typeof raw === 'object') return raw as SessionUser;
  try {
    return JSON.parse(String(raw)) as SessionUser;
  } catch {
    return null;
  }
}

export function getStoredPermissions(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LS_PERMISSIONS) ?? '[]');
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function clearSession() {
  const opts = { path: '/', secure: true, sameSite: 'None' } as const;
  Cookies.remove(COOKIE_TOKEN, opts);
  Cookies.remove(COOKIE_REFRESH, opts);
  Cookies.remove(COOKIE_USER, opts);
  localStorage.removeItem(LS_PERMISSIONS);
}
