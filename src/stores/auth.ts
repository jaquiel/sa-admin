import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as authService from 'src/services/auth.service';
import {
  clearSession,
  getAccessToken,
  getStoredPermissions,
  getStoredUser,
  saveSession,
  type SessionUser,
} from 'src/services/auth-storage';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(getStoredUser());
  const permissions = ref<string[]>(getStoredPermissions());
  const token = ref<string | null>(getAccessToken());

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  function can(permission: string) {
    return permissions.value.includes(permission);
  }

  async function login(email: string, password: string) {
    const res = await authService.login(email, password);
    saveSession(res);
    token.value = res.token;
    user.value = res.user;
    permissions.value = res.permissions;
  }

  async function logout() {
    await authService.logout();
    clearSession();
    token.value = null;
    user.value = null;
    permissions.value = [];
  }

  /** Re-sincroniza com os cookies (ex.: após refresh feito pelo interceptor). */
  function hydrate() {
    token.value = getAccessToken();
    user.value = getStoredUser();
    permissions.value = getStoredPermissions();
  }

  return { user, permissions, token, isAuthenticated, can, login, logout, hydrate };
});
