import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'stores/auth';

export default defineRouter(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => {
    const auth = useAuthStore(store);

    if (to.meta.public) {
      if (to.name === 'login' && auth.isAuthenticated) return { name: 'select-system' };
      return true;
    }

    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }

    const permission = to.meta.permission as string | undefined;
    if (permission && !auth.can(permission)) return { name: 'forbidden' };

    return true;
  });

  Router.afterEach((to) => {
    const title = to.meta.title as string | undefined;
    document.title = title ? `${title} · Strategy Analytics` : 'Strategy Analytics';
  });

  return Router;
});
