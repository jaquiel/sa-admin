<template>
  <div class="shell">
    <aside class="sidebar" :class="{ 'sidebar--collapsed': ui.sidebarCollapsed }">
      <div class="sidebar__logo">
        <img v-if="ui.sidebarCollapsed" :src="saLogo" alt="SA" class="sidebar__logo-img" />
        <h1 v-else>Strategy Analytics</h1>
      </div>

      <q-scroll-area class="sidebar__menu">
        <nav class="sidebar__list">
          <SidebarItem
            v-for="item in visibleMenu"
            :key="item.key"
            :icon="item.icon"
            :label="item.label"
            :active="activeMenu === item.key"
            :collapsed="ui.sidebarCollapsed"
            @click="go(item.route)"
          />
        </nav>
      </q-scroll-area>

      <div class="sidebar__bottom">
        <SidebarItem
          :icon="Settings"
          label="Configurações"
          :active="activeMenu === 'settings'"
          :collapsed="ui.sidebarCollapsed"
          @click="go('settings')"
        />

        <div v-if="!ui.sidebarCollapsed" class="sidebar__user">
          <UserAvatar :src="auth.user?.avatar" :size="32" />
          <div class="sidebar__user-info">
            <p class="sidebar__user-name">{{ auth.user?.name ?? 'Admin User' }}</p>
            <p class="sidebar__user-mail">{{ auth.user?.email ?? 'admin@sa.com' }}</p>
          </div>
        </div>
        <div v-else class="sidebar__user sidebar__user--mini">
          <UserAvatar :src="auth.user?.avatar" :size="32" />
        </div>

        <SidebarItem
          :icon="Grid3x3"
          label="Trocar Sistema"
          tone="blue"
          :collapsed="ui.sidebarCollapsed"
          @click="switchSystem"
        />
        <SidebarItem :icon="LogOut" label="Sair" tone="red" :collapsed="ui.sidebarCollapsed" @click="logout" />
      </div>

      <button
        type="button"
        class="sidebar__toggle"
        :aria-label="ui.sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'"
        @click="ui.toggleSidebar()"
      >
        <ChevronRight v-if="ui.sidebarCollapsed" :size="12" />
        <ChevronLeft v-else :size="12" />
      </button>
    </aside>

    <main class="shell__main">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Activity,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Grid3x3,
  Landmark,
  LogOut,
  PieChart,
  Settings,
  Users,
} from 'lucide-vue-next';
import SidebarItem from 'components/layout/SidebarItem.vue';
import UserAvatar from 'components/ui/UserAvatar.vue';
import saLogo from 'src/assets/sa-logo.svg';
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';

const auth = useAuthStore();
const ui = useUiStore();
const route = useRoute();
const router = useRouter();

const menu = [
  { key: 'customers', label: 'Clientes', icon: Users, route: 'customers', permission: 'customers:read' },
  { key: 'contracts', label: 'Contratos', icon: Activity, route: 'contracts', permission: 'contracts:read' },
  { key: 'logics', label: 'Lógicas', icon: PieChart, route: 'logics', permission: 'logics:read' },
  { key: 'transactions', label: 'Transações', icon: ArrowRightLeft, route: 'transactions', permission: 'transactions:read' },
  { key: 'credit', label: 'Crédito', icon: Landmark, route: 'credit', permission: 'credit:read' },
  { key: 'communication', label: 'Comunicados', icon: FileText, route: 'communication', permission: 'communication:read' },
];

const visibleMenu = computed(() => menu.filter((m) => auth.can(m.permission)));
const activeMenu = computed(() => route.meta.menu as string | undefined);

function go(name: string) {
  void router.push({ name });
}

function switchSystem() {
  void router.push({ name: 'select-system' });
}

async function logout() {
  await auth.logout();
  await router.replace({ name: 'login' });
}
</script>

<style scoped lang="scss">
.shell {
  min-height: 100vh;
  background: rgba(248, 250, 252, 0.5);
  display: flex;
  color: var(--slate-900);

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 256px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid var(--slate-200);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  z-index: 40;

  &--collapsed {
    width: 64px;
  }

  &__logo {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--slate-100);
    padding: 0 16px;
    h1 {
      font-size: 20px;
      line-height: 28px;
      font-weight: 700;
      color: var(--slate-900);
      margin: 0;
      white-space: nowrap;
    }
  }

  &__logo-img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  &__menu {
    flex: 1;
  }

  &__list {
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__bottom {
    border-top: 1px solid var(--slate-100);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__user {
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--slate-50);
    border-radius: 8px;

    &--mini {
      background: transparent;
      justify-content: center;
      padding: 8px 0;
    }
  }

  &__user-info {
    flex: 1;
    min-width: 0;
    p {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__user-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-900);
  }

  &__user-mail {
    font-size: 10px;
    color: var(--slate-500);
  }

  &__toggle {
    position: absolute;
    right: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--slate-400);
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: color 0.15s, border-color 0.15s;
    &:hover {
      color: var(--slate-900);
      border-color: var(--slate-400);
    }
  }
}
</style>
