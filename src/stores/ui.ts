import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { LocalStorage } from 'quasar';

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref<boolean>(LocalStorage.getItem<boolean>('SA_sidebar_collapsed') ?? false);

  watch(sidebarCollapsed, (v) => LocalStorage.set('SA_sidebar_collapsed', v));

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  return { sidebarCollapsed, toggleSidebar };
});
