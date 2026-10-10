<template>
  <section class="sa-card cc">
    <header class="cc__head">
      <h2 class="sa-card__title cc__title"><ShieldCheck :size="16" /> Compliance e Observações</h2>
    </header>
    <div class="cc__body">
      <CardState :loading="loading" :error="error" :empty="!card" @retry="profile.reload('overview')">
        <div v-if="alert" class="cc__alert">
          <AlertTriangle :size="16" class="cc__alert-ico" />
          <div>
            <h5>{{ alert.title }}</h5>
            <p v-if="alert.description">{{ alert.description }}</p>
          </div>
        </div>
        <p v-else class="cc__none">Nenhum alerta de compliance ativo.</p>

        <div class="cc__history">
          <div class="cc__history-title">Histórico Recente</div>
          <ol v-if="events.length" class="cc__timeline">
            <li v-for="e in events" :key="e.id">
              <span class="cc__dot" />
              <p class="cc__event">{{ e.title }}</p>
              <p class="cc__meta">Por {{ e.actorName ?? e.source ?? 'Sistema' }} • {{ formatDate(e.occurredAtUtc) }}</p>
            </li>
          </ol>
          <p v-else class="cc__none">Sem eventos recentes.</p>
        </div>

        <q-btn outline no-caps class="sa-btn sa-btn--outline cc__all" label="Ver todo o histórico" @click="openHistory" />
      </CardState>
    </div>

    <q-dialog v-model="historyOpen">
      <q-card class="cc__dialog">
        <q-card-section class="cc__dialog-head">
          <h3>Histórico do cliente</h3>
        </q-card-section>
        <q-card-section class="cc__dialog-body">
          <CardState :loading="historyLoading" :error="historyError" :empty="!history.length" empty-text="Sem eventos." @retry="openHistory">
            <ol class="cc__timeline">
              <li v-for="e in history" :key="e.id">
                <span class="cc__dot" />
                <p class="cc__event">{{ e.title }}</p>
                <p v-if="e.description" class="cc__meta">{{ e.description }}</p>
                <p class="cc__meta">Por {{ e.actorName ?? e.source ?? 'Sistema' }} • {{ formatDateTime(e.occurredAtUtc) }}</p>
              </li>
            </ol>
          </CardState>
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { AlertTriangle, ShieldCheck } from 'lucide-vue-next';
import CardState from './CardState.vue';
import { useCustomerProfileStore } from 'stores/customer-profile';
import { listTimeline } from 'src/services/customer-profile.service';
import type { TimelineEvent } from 'src/types/api';
import { formatDate, formatDateTime } from 'src/utils/format';

const profile = useCustomerProfileStore();
const card = computed(() => profile.data.overview?.compliance ?? null);
const loading = computed(() => profile.loading.overview);
const error = computed(() => profile.errors.overview);
const alert = computed(() => card.value?.primaryAlert ?? card.value?.summary?.primaryAlert ?? null);
const events = computed(() => (card.value?.recentHistory ?? []).slice(0, 5));

const historyOpen = ref(false);
const history = ref<TimelineEvent[]>([]);
const historyLoading = ref(false);
const historyError = ref<string | null>(null);

async function openHistory() {
  historyOpen.value = true;
  const id = profile.customerId;
  if (!id) return;
  historyLoading.value = true;
  historyError.value = null;
  try {
    history.value = await listTimeline(id);
  } catch (e) {
    historyError.value = e instanceof Error ? e.message : 'Falha';
  } finally {
    historyLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.cc {
  border-left: 4px solid #fbbf24;

  &__head {
    padding: 24px 24px 8px;
  }

  &__title {
    color: #78350f;
  }

  &__body {
    padding: 16px;
  }

  &__alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: var(--amber-50);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #fef3c7;
    margin-bottom: 16px;

    h5 {
      font-size: 12px;
      font-weight: 700;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      margin: 0 0 4px;
    }

    p {
      font-size: 12px;
      color: var(--amber-700);
      line-height: 1.625;
      margin: 0;
    }
  }

  &__alert-ico {
    color: var(--amber-600);
    margin-top: 2px;
    flex-shrink: 0;
  }

  &__history {
    padding-top: 8px;
  }

  &__history-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
  }

  &__timeline {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      position: relative;
      margin-left: 6px;
      padding: 0 0 16px 16px;
      border-left: 1px solid var(--slate-200);
      &:last-child {
        padding-bottom: 0;
        border-left-color: transparent;
      }
    }
  }

  &__dot {
    position: absolute;
    left: -6px;
    top: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--slate-200);
    border: 2px solid #fff;
  }

  &__event {
    font-size: 14px;
    color: var(--slate-700);
    font-weight: 500;
    margin: 0;
  }

  &__meta {
    font-size: 12px;
    color: var(--slate-500);
    margin: 0;
  }

  &__all {
    width: 100%;
    margin-top: 16px;
    height: 32px;
    min-height: 32px;
    font-size: 12px;
  }
}

.cc__none {
  font-size: 13px;
  color: var(--slate-500);
  margin: 0 0 16px;
}
.cc__dialog {
  width: 560px;
  max-width: 92vw;
}
.cc__dialog-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.cc__dialog-body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
