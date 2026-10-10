<template>
  <div class="login">
    <div class="login__wrap">
      <div class="login__brand">
        <h1>Strategy Analytics</h1>
        <p>Sistema de Gestão Financeira</p>
      </div>

      <div class="login__panel">
        <q-form class="login__form" @submit="onSubmit">
          <div class="login__group">
            <label for="email" class="login__label">E-mail</label>
            <q-input
              v-model="email"
              for="email"
              type="email"
              dark
              outlined
              placeholder="seu@email.com"
              class="login__input"
              autocomplete="username"
              :rules="[(v) => !!v || 'Informe o e-mail']"
              lazy-rules
              hide-bottom-space
            >
              <template #prepend><Mail :size="20" /></template>
            </q-input>
          </div>

          <div class="login__group">
            <label for="password" class="login__label">Senha</label>
            <q-input
              v-model="password"
              for="password"
              :type="showPassword ? 'text' : 'password'"
              dark
              outlined
              placeholder="••••••••"
              class="login__input"
              autocomplete="current-password"
              :rules="[(v) => !!v || 'Informe a senha']"
              lazy-rules
              hide-bottom-space
            >
              <template #prepend><Lock :size="20" /></template>
              <template #append>
                <button
                  type="button"
                  class="login__eye"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="20" />
                  <Eye v-else :size="20" />
                </button>
              </template>
            </q-input>
          </div>

          <q-btn
            type="submit"
            unelevated
            no-caps
            class="login__submit"
            label="Entrar"
            :loading="loading"
          />

          <div class="text-center">
            <button type="button" class="login__forgot">Esqueceu sua senha?</button>
          </div>
        </q-form>
      </div>

      <p class="login__footer">© 2024 Strategy Analytics. Todos os direitos reservados.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { Eye, EyeOff, Lock, Mail } from 'lucide-vue-next';
import { useAuthStore } from 'stores/auth';
import { trackEvent } from 'boot/gtag';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

async function onSubmit() {
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    trackEvent('login', { method: 'password' });
    const redirect = route.query.redirect as string | undefined;
    await router.replace(redirect ?? { name: 'select-system' });
  } catch {
    $q.notify({ type: 'negative', message: 'E-mail ou senha inválidos.' });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.login {
  min-height: 100vh;
  background: var(--slate-900);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  &__wrap {
    width: 100%;
    max-width: 448px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  &__brand {
    text-align: center;
    h1 {
      font-size: 30px;
      line-height: 36px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
    }
    p {
      color: var(--slate-400);
      font-size: 14px;
      margin: 0;
    }
  }

  &__panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .login__label {
      color: #fff;
      font-size: 14px;
      font-weight: 500;
    }
  }

  &__input {
    :deep(.q-field__control) {
      height: 48px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      &:before {
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
    :deep(.q-field__prepend),
    :deep(.q-field__append) {
      color: var(--slate-400);
      height: 48px;
    }
    :deep(.q-field__native) {
      color: #fff;
      &::placeholder {
        color: var(--slate-500);
        opacity: 1;
      }
    }
  }

  &__eye {
    background: none;
    border: 0;
    padding: 0;
    color: var(--slate-400);
    cursor: pointer;
    display: flex;
    transition: color 0.15s;
    &:hover {
      color: #fff;
    }
  }

  &__submit {
    width: 100%;
    height: 48px;
    background: var(--cyan-500);
    color: #fff;
    font-weight: 500;
    border-radius: 8px;
    font-size: 16px;
    &:hover {
      background: var(--cyan-600);
    }
  }

  &__forgot {
    background: none;
    border: 0;
    font-size: 14px;
    color: var(--slate-400);
    cursor: pointer;
    transition: color 0.15s;
    &:hover {
      color: #fff;
    }
  }

  &__footer {
    text-align: center;
    font-size: 12px;
    color: var(--slate-500);
    margin: 0;
  }
}
</style>
