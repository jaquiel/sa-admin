<template>
  <div class="systems">
    <div class="systems__wrap">
      <header class="systems__header">
        <img :src="saLogo" alt="Strategy Analytics" class="systems__logo" />
        <h1>Selecionar Sistema</h1>
        <p>Escolha qual ambiente deseja acessar.</p>
      </header>

      <div v-if="loading" class="systems__grid">
        <q-skeleton v-for="n in 2" :key="n" class="systems__skeleton" />
      </div>
      <p v-else-if="!visible.length" class="systems__empty">Seu usuário não tem acesso a nenhum sistema.</p>
      <div v-else class="systems__grid">
        <button
          v-for="sys in visible"
          :key="sys.key"
          type="button"
          class="sys-card"
          :class="`sys-card--${sys.tone}`"
          @click="select(sys.key)"
        >
          <div class="sys-card__bg" />
          <div class="sys-card__content">
            <div class="sys-card__icon">
              <component :is="sys.icon" :size="32" />
            </div>
            <div>
              <h2>
                {{ sys.title }}
                <ChevronRight :size="24" class="sys-card__chevron" />
              </h2>
              <p>{{ sys.description }}</p>
            </div>
            <div class="sys-card__tags">
              <span v-for="tag in sys.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
          <div class="sys-card__glow" />
        </button>
      </div>

      <p class="systems__footer">© 2024 Strategy Analytics. Todos os direitos reservados.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronRight, Database, FileText } from 'lucide-vue-next';
import saLogo from 'src/assets/sa-logo.svg';
import { trackEvent } from 'boot/gtag';
import { listAvailableSystems } from 'src/services/systems.service';
import type { AvailableSystem } from 'src/types/api';

const router = useRouter();

const systems = [
  {
    key: 'data-entry' as const,
    tone: 'cyan',
    icon: Database,
    title: 'Inserção de Dados',
    description:
      'Acesse o ambiente administrativo para gestão de clientes, contratos, lógicas, transações e informações operacionais.',
    tags: ['Clientes', 'Contratos', 'Lógicas', 'Transações'],
  },
  {
    key: 'landing-page-editor' as const,
    tone: 'purple',
    icon: FileText,
    title: 'Edição de Landing Page',
    description:
      'Acesse o painel de edição da landing page, com visualização da edição em tempo real e prévia do site em tempo real.',
    tags: ['Editor Visual', 'Preview Live', 'Seções', 'Mídia'],
  },
];

type SystemKey = (typeof systems)[number]['key'];

/** Sistema da API → card local. Casa por id/rota/nome (ex.: "landing-page", "/landing", "Landing Page"). */
function keyOf(sys: AvailableSystem): SystemKey {
  return /landing/i.test(`${sys.id} ${sys.route} ${sys.name}`) ? 'landing-page-editor' : 'data-entry';
}

const available = ref<AvailableSystem[] | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    available.value = await listAvailableSystems();
  } catch {
    available.value = null; // sem resposta da API: mostra os dois e deixa o guard de rota decidir
  } finally {
    loading.value = false;
  }
});

const visible = computed(() => {
  if (!available.value) return systems;
  const active = available.value.filter((s) => !/inactive|disabled|unavailable/i.test(s.status));
  const keys = new Set(active.map(keyOf));
  return systems
    .filter((s) => keys.has(s.key))
    .map((s) => {
      const api = active.find((a) => keyOf(a) === s.key);
      return api ? { ...s, title: api.name || s.title, description: api.description || s.description } : s;
    });
});

function select(key: SystemKey) {
  trackEvent('select_system', { system: key });
  void router.push(key === 'data-entry' ? { name: 'customers' } : { name: 'landing-editor' });
}
</script>

<style scoped lang="scss">
.systems {
  min-height: 100vh;
  background: var(--slate-900);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  &__wrap {
    width: 100%;
    max-width: 1024px;
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  &__header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    h1 {
      font-size: 36px;
      line-height: 40px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    p {
      color: var(--slate-400);
      font-size: 18px;
      margin: 0;
    }
  }

  &__logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    margin-bottom: 8px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__footer {
    text-align: center;
    font-size: 14px;
    color: var(--slate-500);
    margin: 0;
  }
}

.sys-card {
  --tone: var(--cyan-500);
  --tone-text: var(--cyan-400);
  --tone-from: rgba(6, 182, 212, 0.05);
  --tone-to: rgba(59, 130, 246, 0.05);

  &--purple {
    --tone: var(--purple-500);
    --tone-text: var(--purple-400);
    --tone-from: rgba(168, 85, 247, 0.05);
    --tone-to: rgba(236, 72, 153, 0.05);
  }

  position: relative;
  text-align: left;
  font: inherit;
  color: inherit;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.02);
    box-shadow: 0 25px 50px -12px color-mix(in srgb, var(--tone) 10%, transparent);
  }

  &__bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom right, var(--tone-from), var(--tone-to));
    opacity: 0;
    transition: opacity 0.3s;
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--tone) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 20%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tone-text);
    transition: background 0.15s;
  }

  h2 {
    font-size: 24px;
    line-height: 32px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    color: var(--slate-400);
    line-height: 1.625;
    margin: 0;
    font-size: 16px;
  }

  &__chevron {
    color: var(--slate-400);
    transition: all 0.15s;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    span {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--slate-400);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  &__glow {
    position: absolute;
    bottom: -96px;
    right: -96px;
    width: 192px;
    height: 192px;
    background: color-mix(in srgb, var(--tone) 20%, transparent);
    border-radius: 50%;
    filter: blur(64px);
    opacity: 0;
    transition: opacity 0.5s;
  }

  &:hover &__bg,
  &:hover &__glow {
    opacity: 1;
  }
  &:hover &__icon {
    background: color-mix(in srgb, var(--tone) 20%, transparent);
  }
  &:hover &__chevron {
    color: var(--tone-text);
    transform: translateX(4px);
  }
}

.systems__skeleton {
  height: 260px;
  border-radius: 16px;
}
.systems__empty {
  text-align: center;
  color: var(--slate-500);
}
</style>
