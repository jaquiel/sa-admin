import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from 'src/services/auth-storage';
import { unwrap, type ApiResponse } from 'src/services/api-envelope';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

/** Instância única da API. Base URL vem de API_BASE_URL (quasar.config → build.env). */
const api = axios.create({
  baseURL: process.env.API_BASE_URL ?? '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const MUTATING = new Set(['post', 'put', 'patch', 'delete']);

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // A API exige Idempotency-Key nas escritas; o retry pós-refresh reaproveita a mesma chave.
  if (MUTATING.has((config.method ?? 'get').toLowerCase()) && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = crypto.randomUUID();
  }
  return config;
});

// Refresh de token com fila: várias requisições 401 simultâneas disparam um único refresh.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Sem refresh token');
  const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>(
    `${process.env.API_BASE_URL ?? '/api'}/auth/refresh`,
    { refreshToken },
    { withCredentials: true, headers: { 'Idempotency-Key': crypto.randomUUID() } },
  );
  const { accessToken, refreshToken: next } = unwrap(data);
  updateAccessToken(accessToken, next);
  return accessToken;
}

export default defineBoot(({ app, router }) => {
  api.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
      const isAuthCall = original?.url?.includes('/auth/');

      if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
        original._retry = true;
        try {
          refreshPromise ??= refreshAccessToken().finally(() => (refreshPromise = null));
          const token = await refreshPromise;
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        } catch {
          clearSession();
          void router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
        }
      }
      return Promise.reject(error);
    },
  );

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
