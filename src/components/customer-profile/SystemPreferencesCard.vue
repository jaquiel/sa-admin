<template>
  <ProfileCard title="Preferências do Sistema" :icon="Settings">
    <template v-if="dirty" #actions>
      <q-btn unelevated no-caps dense class="sa-btn sp__save" :loading="saving" label="Salvar" @click="save" />
    </template>
    <CardState :loading="loading" :error="error" :empty="!loaded" @retry="profile.reload('overview')">
    <div class="sp__grid">
      <div class="sp__field">
        <label class="sp__label">Moeda Primária</label>
        <SaSelect v-model="prefs.primaryCurrency" :options="currencies" />
      </div>
      <div class="sp__field">
        <label class="sp__label">Moeda Secundária</label>
        <SaSelect v-model="prefs.secondaryCurrency" :options="[{ label: 'Nenhuma', value: 'NONE' }, ...currencies]" />
      </div>
      <div class="sp__field">
        <label class="sp__label">Idioma do Sistema</label>
        <SaSelect v-model="prefs.language" :options="languages" />
      </div>
      <div class="sp__field">
        <label class="sp__label">Fuso Horário</label>
        <SaSelect v-model="prefs.timezone" :options="timezones" />
      </div>
    </div>

    <div class="sp__field">
      <label class="sp__label">Tema do Sistema</label>
      <div class="sp__themes" role="radiogroup" aria-label="Tema do sistema">
        <button
          v-for="t in themes"
          :key="t.value"
          type="button"
          role="radio"
          :aria-checked="prefs.theme === t.value"
          class="sp__theme"
          :class="{ [`sp__theme--${t.value}`]: prefs.theme === t.value }"
          @click="prefs.theme = t.value"
        >
          <component :is="t.icon" :size="16" />
          <span>{{ t.label }}</span>
        </button>
      </div>
    </div>
    </CardState>
  </ProfileCard>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { Monitor, Moon, Settings, Sun } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import CardState from './CardState.vue';
import SaSelect, { type SaOption } from 'components/ui/SaSelect.vue';
import { useCustomerProfileStore } from 'stores/customer-profile';
import { updatePreferences } from 'src/services/customer-profile.service';
import type { CustomerPreferences } from 'src/types/api';

const $q = useQuasar();
const profile = useCustomerProfileStore();
const loading = computed(() => profile.loading.overview);
const error = computed(() => profile.errors.overview);
const source = computed(() => profile.data.overview?.preferences ?? null);
const loaded = computed(() => !!source.value);

const currencies: SaOption[] = [
  { label: 'Real Brasileiro (BRL)', value: 'BRL' },
  { label: 'Dólar Americano (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
];
const languages: SaOption[] = [
  { label: 'Português (Brasil)', value: 'pt-BR' },
  { label: 'Inglês (United States)', value: 'en-US' },
  { label: 'Espanhol', value: 'es-ES' },
];
const timezones: SaOption[] = [
  { label: 'Brasília (GMT-3)', value: 'America/Sao_Paulo' },
  { label: 'New York (GMT-5)', value: 'America/New_York' },
  { label: 'London (GMT+0/+1)', value: 'Europe/London' },
  { label: 'Lisboa (GMT+0/+1)', value: 'Europe/Lisbon' },
];
// A API usa "Light" (collection Postman); "Dark" e "System" seguem o mesmo padrão.
const themes = [
  { value: 'light' as const, label: 'Claro', icon: Sun, api: 'Light' },
  { value: 'dark' as const, label: 'Escuro', icon: Moon, api: 'Dark' },
  { value: 'auto' as const, label: 'Automático', icon: Monitor, api: 'System' },
];
type Theme = (typeof themes)[number]['value'];

const toTheme = (t: string | null | undefined): Theme => (/dark/i.test(t ?? '') ? 'dark' : /light/i.test(t ?? '') ? 'light' : t ? 'auto' : 'light');

/** valores desconhecidos da API entram como opção para não sumirem do select */
function withValue(options: SaOption[], value: string | null | undefined) {
  if (value && !options.some((o) => o.value === value)) options.push({ label: value, value });
}

const prefs = reactive({ primaryCurrency: 'BRL', secondaryCurrency: 'NONE', language: 'pt-BR', timezone: 'America/Sao_Paulo', theme: 'light' as Theme });
const snapshot = ref('');
const saving = ref(false);

function fill(p: CustomerPreferences) {
  withValue(currencies, p.primaryCurrencyCode);
  withValue(currencies, p.secondaryCurrencyCode);
  withValue(languages, p.languageCode);
  withValue(timezones, p.timeZoneId);
  Object.assign(prefs, {
    primaryCurrency: p.primaryCurrencyCode ?? 'BRL',
    secondaryCurrency: p.secondaryCurrencyCode ?? 'NONE',
    language: p.languageCode ?? 'pt-BR',
    timezone: p.timeZoneId ?? 'America/Sao_Paulo',
    theme: toTheme(p.theme),
  });
  snapshot.value = JSON.stringify(prefs);
}

watch(source, (p) => p && fill(p), { immediate: true });
const dirty = computed(() => loaded.value && JSON.stringify(prefs) !== snapshot.value);

async function save() {
  const id = profile.customerId;
  if (!id) return;
  saving.value = true;
  try {
    const saved = await updatePreferences(id, {
      primaryCurrencyCode: prefs.primaryCurrency,
      secondaryCurrencyCode: prefs.secondaryCurrency === 'NONE' ? null : prefs.secondaryCurrency,
      languageCode: prefs.language,
      timeZoneId: prefs.timezone,
      theme: themes.find((t) => t.value === prefs.theme)!.api,
      countryId: source.value?.countryId ?? null,
    });
    if (profile.data.overview) profile.data.overview.preferences = saved;
    fill(saved);
    $q.notify({ type: 'positive', message: 'Preferências salvas.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Não foi possível salvar as preferências.' });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.sp {
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 32px;
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (min-width: 1024px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    .sp__label {
      font-size: 12px;
      font-weight: 500;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }

  &__themes {
    display: flex;
    gap: 16px;
    margin-top: 6px;
  }

  &__theme {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--slate-200);
    background: #fff;
    color: var(--slate-600);
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.15s;

    &:hover {
      border-color: var(--slate-300);
    }

    &--light,
    &--auto {
      background: var(--blue-50);
      border-color: var(--blue-200);
      color: var(--blue-700);
      box-shadow: 0 0 0 1px var(--blue-200);
    }

    &--dark {
      background: var(--slate-800);
      border-color: var(--slate-700);
      color: #fff;
      &:hover {
        border-color: var(--slate-700);
      }
    }
  }
}

.sp__save {
  background: var(--slate-900);
  color: #fff;
  font-size: 12px;
  padding: 0 12px;
}
</style>
