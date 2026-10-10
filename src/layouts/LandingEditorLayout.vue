<template>
  <div class="le">
    <div class="le__bar">
      <div class="le__left">
        <img :src="saLogo" alt="SA" class="le__logo" />
        <span class="le__name">Strategy Analytics</span>
        <span class="sa-badge sa-badge--outline sa-badge--xs">Edição de Landing Page</span>
      </div>
      <div class="le__right">
        <q-btn outline no-caps size="sm" class="sa-btn sa-btn--outline" @click="router.push({ name: 'select-system' })">
          <Grid3x3 :size="16" class="q-mr-sm" /> Trocar Sistema
        </q-btn>
        <q-btn flat no-caps size="sm" class="sa-btn le__logout" @click="logout">
          <LogOut :size="16" class="q-mr-sm" /> Sair
        </q-btn>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Grid3x3, LogOut } from 'lucide-vue-next';
import saLogo from 'src/assets/sa-logo.svg';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const auth = useAuthStore();

async function logout() {
  await auth.logout();
  await router.replace({ name: 'login' });
}
</script>

<style scoped lang="scss">
.le {
  height: 100vh;
  display: flex;
  flex-direction: column;

  &__bar {
    height: 56px;
    background: #fff;
    border-bottom: 1px solid var(--slate-200);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    flex-shrink: 0;
  }

  &__left,
  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__left {
    gap: 16px;
  }

  &__logo {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  &__name {
    font-weight: 600;
    color: var(--slate-900);
  }

  &__logout {
    color: var(--red-600);
    &:hover {
      background: var(--red-50);
      color: var(--red-700);
    }
  }
}
</style>
