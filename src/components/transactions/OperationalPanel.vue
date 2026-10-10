<template>
  <section class="sa-card op">
    <header class="op__head">
      <div>
        <h2><Activity :size="20" class="text-indigo-600" /> Painel Operacional</h2>
        <p>Gestão de tesouraria, liquidação de contratos e controle de emissão.</p>
      </div>
      <div class="op__tabs">
        <button type="button" :class="{ active: tab === 'internal' }" @click="tab = 'internal'"><ArrowRightLeft :size="14" /> Movimentações Internas</button>
        <button type="button" :class="{ active: tab === 'contracts' }" @click="tab = 'contracts'"><FileSignature :size="14" /> Gestão de Contratos</button>
        <button type="button" :class="{ active: tab === 'system' }" @click="tab = 'system'"><ShieldAlert :size="14" /> Sistema</button>
      </div>
    </header>

    <div class="op__body">
      <!-- ===== TAB 1: Movimentações internas ===== -->
      <div v-if="tab === 'internal'" class="op__stack">
        <div class="op__two">
          <!-- Origem -->
          <div class="op__block">
            <h4 class="op__block-title"><ArrowDownLeft :size="16" class="op__ico-rose" /> Origem (Saída)</h4>
            <div class="op__field">
              <label class="op__label">Cliente de Origem</label>
              <SaSelect v-model="src.client" placeholder="Selecione..." :options="clientOptions" @update:model-value="src.wallet = null" />
            </div>
            <div class="op__field">
              <label class="op__label">Carteira de Origem</label>
              <SaSelect v-model="src.wallet" placeholder="Selecione..." :options="walletOptions(src.client)" :disable="!src.client" />
            </div>
            <div v-if="srcWallet" class="op__wallet-wrap">
              <div class="op__wallet">
                <div class="op__wallet-top">
                  <div>
                    <span class="op__wallet-name">{{ srcWallet.name }}</span>
                    <span class="op__wallet-id font-mono">ID: {{ srcWallet.id }}</span>
                  </div>
                  <span class="sa-badge sa-badge--xs sa-badge--outline sa-badge--upper">{{ srcWallet.currency }}</span>
                </div>
                <span class="sa-label-xs">Saldo Atual</span>
                <span class="op__wallet-balance" :class="{ 'text-rose-600': insufficient }">{{ formatCurrencyIn(srcWallet.balance, srcWallet.currency) }}</span>
                <div v-if="insufficient" class="op__warn"><AlertCircle :size="12" /> Saldo insuficiente</div>
              </div>
            </div>
            <div v-else class="op__placeholder">Selecione a origem</div>
          </div>

          <!-- Destino -->
          <div class="op__block">
            <h4 class="op__block-title"><ArrowUpRight :size="16" class="op__ico-emerald" /> Destino (Entrada)</h4>
            <div class="op__field">
              <label class="op__label">Cliente de Destino</label>
              <SaSelect v-model="dst.client" placeholder="Selecione..." :options="clientOptions" @update:model-value="dst.wallet = null" />
            </div>
            <div class="op__field">
              <label class="op__label">Carteira de Destino</label>
              <SaSelect v-model="dst.wallet" placeholder="Selecione..." :options="walletOptions(dst.client)" :disable="!dst.client" />
            </div>
            <div v-if="dstWallet" class="op__wallet-wrap">
              <div class="op__wallet">
                <span v-if="srcWallet" class="op__wallet-origin">Origem: {{ srcWallet.id }}</span>
                <div class="op__wallet-top">
                  <div>
                    <span class="op__wallet-name">{{ dstWallet.name }}</span>
                    <span class="op__wallet-id font-mono">ID: {{ dstWallet.id }}</span>
                  </div>
                  <span class="sa-badge sa-badge--xs sa-badge--outline sa-badge--upper">{{ dstWallet.currency }}</span>
                </div>
                <div class="op__projected">
                  <div>
                    <span class="sa-label-xs op__muted-label">Saldo Atual</span>
                    <span class="op__projected-cur">{{ formatCurrencyIn(dstWallet.balance, dstWallet.currency) }}</span>
                  </div>
                  <div class="op__projected-new">
                    <span class="sa-label-xs op__emerald-label">Saldo Projetado</span>
                    <span class="op__projected-val">{{ formatCurrencyIn(dstWallet.balance + transferAmount, dstWallet.currency) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="op__placeholder">Selecione o destino</div>
          </div>
        </div>

        <div class="op__details">
          <h4 class="op__details-title"><Activity :size="20" class="text-indigo-600" /> Detalhes da Operação</h4>
          <div class="op__two op__two--md">
            <div class="op__field">
              <label class="op__label op__label--xs">Valor da Transferência</label>
              <SaInput v-model="transferValue" type="number" placeholder="0.00" class="op__big" :class="{ 'op__big--error': insufficient }">
                <template #prepend><span class="op__prefix">{{ srcWallet ? srcWallet.currency : '$' }}</span></template>
              </SaInput>
            </div>
            <div class="op__field">
              <label class="op__label op__label--xs">Observação (Auditável)</label>
              <SaInput v-model="transferObs" placeholder="Motivo da transferência..." class="op__big" />
            </div>
          </div>
          <div class="op__exec">
            <div class="op__fees">
              <div><span>Taxa de Operação:</span><span class="font-mono">0.00% (Isento)</span></div>
              <div><span>Tempo Estimado:</span><span class="font-mono">Imediato (T0)</span></div>
            </div>
            <q-btn
              unelevated
              no-caps
              class="sa-btn op__exec-btn"
              :class="insufficient ? 'op__exec-btn--blocked' : 'sa-btn--primary'"
              :disable="!srcWallet || !dstWallet || !transferAmount || insufficient"
              :label="insufficient ? 'Saldo Insuficiente' : 'Executar Transferência'"
              @click="internalTransfer"
            />
          </div>
        </div>
      </div>

      <!-- ===== TAB 2: Gestão de contratos ===== -->
      <div v-else-if="tab === 'contracts'" class="op__contracts">
        <div class="op__contracts-head">
          <div>
            <h3><FileSignature :size="20" class="text-indigo-600" /> Gestão de Contratos</h3>
            <p>Selecione um contrato para visualizar carteiras vinculadas e executar liquidação.</p>
          </div>
          <SaSelect v-model="contractId" placeholder="Selecione um contrato..." :options="contractOptions" width="350px" />
        </div>
        <hr class="sa-separator" />

        <div v-if="contract" class="op__stack">
          <div class="op__two op__two--xl">
            <div class="op__identity">
              <FileText :size="192" class="op__identity-bg" />
              <span class="op__identity-kicker">Informações do Contrato</span>
              <h2>{{ contract.name }}</h2>
              <div class="op__identity-badges">
                <span class="sa-badge sa-badge--outline">ID: {{ contract.id }}</span>
                <span class="sa-badge sa-badge--emerald-soft">Ativo</span>
                <span class="sa-badge sa-badge--outline">Base: USD</span>
              </div>
              <hr class="op__identity-sep" />
              <span class="sa-label-xs">Valor Total Atual</span>
              <div class="op__identity-values">
                <div><span class="op__code">USD</span><span class="op__usd">{{ formatCurrencyIn(contract.value, 'USD') }}</span></div>
                <div>
                  <span class="op__code">BRL</span>
                  <span class="op__brl">{{ formatCurrencyIn(contract.value * rate, 'BRL') }}</span>
                  <span class="op__rate font-mono">Taxa: {{ rate.toFixed(4) }}</span>
                </div>
              </div>
            </div>

            <div class="op__linked">
              <div class="op__linked-head">
                <h4><Wallet :size="16" class="text-slate-500" /> Carteiras Vinculadas</h4>
                <span class="sa-badge sa-badge--outline">{{ contract.clients.length }} Carteiras</span>
              </div>
              <table class="sa-table op__mini">
                <thead><tr><th>Carteira / Cliente</th><th class="text-right">Part. %</th><th class="text-right">Valor Ref.</th></tr></thead>
                <tbody>
                  <tr v-for="cl in contract.clients" :key="cl.id">
                    <td>
                      <span class="op__mini-wallet">{{ cl.wallet }}</span>
                      <span class="op__mini-id font-mono">ID: {{ cl.id }}</span>
                      <span class="op__mini-client"><User :size="12" /> {{ cl.name }}</span>
                    </td>
                    <td class="text-right"><span class="sa-badge sa-badge--slate font-mono op__pct">{{ (cl.percent * 100).toFixed(0) }}%</span></td>
                    <td class="text-right">
                      <span class="op__mini-usd">{{ formatCurrencyIn(contract.value * cl.percent, 'USD') }}</span>
                      <span class="op__mini-brl">{{ formatCurrencyIn(contract.value * cl.percent * rate, 'BRL') }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="op__danger">
            <div class="op__danger-info">
              <span class="op__danger-icon"><AlertTriangle :size="24" /></span>
              <div>
                <h4>Zona de Liquidação</h4>
                <p>
                  Esta ação encerrará o contrato <strong>{{ contract.id }}</strong> permanentemente. Os valores serão distribuídos
                  imediatamente para as carteiras listadas acima.
                </p>
              </div>
            </div>
            <q-btn unelevated no-caps class="sa-btn op__danger-btn" label="Confirmar Liquidação Total" @click="liquidate" />
          </div>
        </div>
        <div v-else class="op__no-contract">
          <span class="op__no-contract-icon"><Search :size="24" /></span>
          <h3>Nenhum contrato selecionado</h3>
          <p>Utilize o seletor acima para buscar um contrato ativo e visualizar detalhes de liquidação.</p>
        </div>

        <div class="op__log">
          <h3><span class="op__log-icon"><Clock :size="16" /></span> Log de Liquidações</h3>
          <div class="op__log-table">
            <table class="sa-table op__mini">
              <thead>
                <tr><th style="width: 140px">Data / Hash</th><th style="width: 180px">Contrato</th><th>Distribuição (Audit)</th><th class="text-right" style="width: 140px">Valor Total</th></tr>
              </thead>
              <tbody>
                <tr v-if="!liquidations.length"><td colspan="4" class="op__empty-row">Nenhuma liquidação registrada no histórico recente.</td></tr>
                <tr v-for="op in liquidations" :key="op.id">
                  <td class="op__top">
                    <span class="op__log-date">{{ new Date(op.date).toLocaleDateString('pt-BR') }}</span>
                    <span class="op__log-time font-mono">{{ new Date(op.date).toLocaleTimeString('pt-BR') }}</span>
                    <span class="op__log-hash font-mono">{{ op.hash }}</span>
                  </td>
                  <td class="op__top">
                    <span class="op__log-contract">{{ op.origin }}</span>
                    <span class="op__log-cid">ID: {{ contractIdOf(op.details) }}</span>
                    <span class="sa-badge sa-badge--xs sa-badge--emerald op__log-badge">Liquidado</span>
                  </td>
                  <td class="op__top"><p class="op__log-audit font-mono">{{ op.details?.split('DISTRIBUIÇÃO:')[1] || op.details || 'Sem detalhes de distribuição.' }}</p></td>
                  <td class="op__top text-right"><span class="op__log-value">{{ formatCurrencyIn(op.value, 'USD') }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== TAB 3: Sistema (Mint / Burn) ===== -->
      <div v-else class="op__two op__two--md">
        <!-- MINT -->
        <div class="op__mint">
          <div class="op__mint-head">
            <h3><Plus :size="16" /> Mint (Emissão)</h3>
            <div class="op__mint-mode">
              <button type="button" :class="{ active: mintMode === 'direct' }" @click="mintMode = 'direct'">Direta</button>
              <button type="button" :class="{ active: mintMode === 'parity' }" @click="mintMode = 'parity'">Paridade</button>
            </div>
          </div>
          <div class="op__mint-ref">
            <div><span class="op__mint-kicker">Moeda de Referência</span><strong>USD (Dólar Americano)</strong></div>
            <div class="text-right"><span class="op__mint-kicker op__mint-kicker--soft">Cotação Atual</span><strong class="font-mono">USD → BRL = {{ rate.toFixed(2) }}</strong></div>
          </div>

          <div class="op__mint-target">
            <span class="op__mint-label">Destino da Emissão</span>
            <div class="op__two op__two--tight">
              <div class="op__field">
                <label class="op__label op__label--emerald">Cliente</label>
                <SaSelect v-model="mint.client" placeholder="Selecione..." :options="clientOptions" @update:model-value="mint.wallet = null; mint.bank = ''" />
              </div>
              <div class="op__field">
                <label class="op__label op__label--emerald">Carteira</label>
                <SaSelect v-model="mint.wallet" placeholder="Selecione..." :options="walletOptions(mint.client)" :disable="!mint.client" />
              </div>
            </div>
            <BankPicker v-if="mintClient" v-model="mint.bank" :banks="mintClient.banks" tone="emerald" />
            <div v-if="mintWallet" class="op__mint-selected">
              <Wallet :size="12" /> Carteira selecionada: <strong>{{ mintWallet.name }}</strong> ({{ mintWallet.currency }})
            </div>
          </div>

          <div v-if="mintMode === 'parity'" class="op__parity">
            <div class="op__parity-box">
              <div class="op__field">
                <label class="op__label op__label--emerald">Selecionar Moeda de Emissão</label>
                <SaSelect v-model="mint.currency" :options="mintCurrencyOptions" />
              </div>
              <div class="op__field">
                <label class="op__label op__label--emerald">Valor em {{ mint.currency }}</label>
                <SaInput v-model="mint.input" type="number" placeholder="0.00">
                  <template #prepend><span class="op__prefix op__prefix--emerald">{{ mintCurrency?.symbol }}</span></template>
                </SaInput>
              </div>
              <div v-if="parityInput > 0" class="op__parity-calc">
                <div class="op__parity-rate"><span>Cotação {{ mint.currency }} → USD:</span><span class="font-mono">{{ mintCurrency?.rateToUsd.toFixed(4) }}</span></div>
                <div class="op__parity-qty">
                  <span>Quantidade a Emitir</span>
                  <div><strong>{{ formatNumber(parityQty) }}</strong><small class="font-mono">(Equivalente USD)</small></div>
                </div>
              </div>
            </div>
            <div v-if="parityInput > 0" class="op__parity-summary">
              <span class="op__parity-summary-title">Resumo da Emissão</span>
              <div class="op__parity-grid">
                <div><span>Tipo:</span><strong>Mint (Paridade)</strong></div>
                <div class="text-right"><span>Moeda Ref.:</span><strong>USD</strong></div>
                <div><span>Origem:</span><strong>{{ mint.currency }}</strong></div>
                <div class="text-right"><span>Destino:</span><strong class="op__ellipsis">{{ mintWallet?.name ?? '—' }}</strong></div>
                <div><span>Valor Info:</span><strong>{{ formatNumber(parityInput) }} {{ mint.currency }}</strong></div>
                <div class="op__parity-final"><span>Qtd. Final:</span><strong>{{ formatNumber(parityQty) }}</strong></div>
              </div>
            </div>
          </div>
          <div v-else class="op__field">
            <label class="op__label op__label--plain">Quantidade</label>
            <SaInput v-model="mint.amount" type="number" placeholder="0.00" />
          </div>

          <div class="op__field">
            <label class="op__label op__label--plain">Referência / Justificativa</label>
            <SaInput v-model="mint.ref" placeholder="Ex: Aporte de capital..." />
          </div>
          <q-btn
            unelevated
            no-caps
            class="sa-btn op__mint-btn"
            label="Confirmar Emissão"
            :disable="!mintWallet || !mint.bank || (!mint.amount && !mint.input)"
            @click="doMint"
          />
        </div>

        <!-- BURN -->
        <div class="op__burn">
          <h3><Flame :size="16" /> Burn (Queima)</h3>
          <p class="op__burn-desc">Destruir moedas de uma carteira específica para reduzir o supply.</p>
          <div class="op__field">
            <label class="op__label op__label--rose">Cliente</label>
            <SaSelect v-model="burn.client" placeholder="Selecione..." :options="clientOptions" @update:model-value="burn.wallet = null; burn.bank = ''" />
          </div>
          <BankPicker v-if="burnClient" v-model="burn.bank" :banks="burnClient.banks" tone="rose" />
          <div class="op__field">
            <label class="op__label op__label--rose">Carteira</label>
            <SaSelect v-model="burn.wallet" placeholder="Selecione..." :options="walletOptions(burn.client)" :disable="!burn.client" />
          </div>

          <div v-if="burnWallet" class="op__burn-card">
            <div class="op__wallet-top">
              <div>
                <span class="op__burn-kicker">Carteira Selecionada</span>
                <span class="op__wallet-name">{{ burnWallet.name }}</span>
                <span class="op__wallet-id font-mono">ID: {{ burnWallet.id }}</span>
              </div>
              <span class="sa-badge sa-badge--xs sa-badge--rose">{{ burnWallet.currency }}</span>
            </div>
            <hr class="op__burn-sep" />
            <div class="op__field">
              <label class="op__label op__label--rose">Valor para Queima</label>
              <SaInput v-model="burn.amount" type="number" placeholder="0.00" class="op__burn-input" :class="{ 'op__big--error': burnInvalid }" />
            </div>
            <div class="op__burn-grid">
              <div class="op__burn-cell"><span>Saldo Atual</span><strong>{{ formatNumber(burnWallet.balance) }}</strong></div>
              <div class="op__burn-cell op__burn-cell--rose"><span>Após Burn</span><strong>{{ burnInvalid ? '---' : formatNumber(burnWallet.balance - burnAmount) }}</strong></div>
            </div>
            <div v-if="burnInvalid" class="op__burn-warn"><AlertCircle :size="12" /> Saldo insuficiente para queima</div>
          </div>

          <div class="op__field">
            <label class="op__label op__label--plain">Referência / Justificativa</label>
            <SaInput v-model="burn.ref" placeholder="Ex: Correção de supply..." />
          </div>

          <div v-if="burnWallet && burnAmount > 0 && !burnInvalid" class="op__burn-summary">
            <div><span>Tipo:</span><strong>BURN</strong></div>
            <div><span>Carteira:</span><span class="font-mono">{{ burnWallet.id }}</span></div>
            <div class="op__burn-total"><span>Total Queimado:</span><strong>{{ formatCurrencyIn(burnAmount, burnWallet.currency) }}</strong></div>
          </div>

          <q-btn
            unelevated
            no-caps
            class="sa-btn op__burn-btn"
            label="Confirmar Queima"
            :disable="!burnWallet || !burn.bank || !burnAmount || burnInvalid"
            @click="doBurn"
          />
        </div>
      </div>

      <!-- ===== Histórico (filtrado por aba) ===== -->
      <div class="op__history">
        <h4><span class="op__log-icon"><Clock :size="16" /></span> {{ historyTitle }}</h4>
        <div class="op__log-table">
          <table class="sa-table op__mini op__hist-table">
            <thead>
              <tr>
                <th style="width: 150px">Data/Hora</th>
                <th style="width: 180px">Operação</th>
                <th>Detalhes</th>
                <th style="width: 150px">Solicitante</th>
                <th class="text-center" style="width: 120px">Status</th>
                <th class="text-center" style="width: 120px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredHistory.length"><td colspan="6" class="op__empty-row">Nenhuma movimentação registrada para esta seção.</td></tr>
              <tr v-for="item in filteredHistory" :key="item.id" :class="{ 'op__pending': item.status === 'Pending' }">
                <td>
                  <span class="op__log-date">{{ new Date(item.date).toLocaleDateString('pt-BR') }}</span>
                  <span class="op__log-time">{{ new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</span>
                </td>
                <td>
                  <span class="op__op-type"><component :is="OP_CFG[item.type].icon" :size="12" :class="OP_CFG[item.type].cls" /> {{ OP_CFG[item.type].label }}</span>
                  <span class="op__op-hash font-mono"><Hash :size="10" /> {{ item.hash }}</span>
                </td>
                <td>
                  <span class="op__op-value">{{ formatCurrencyIn(item.value, 'USD') }}</span>
                  <span class="op__op-line" :title="item.origin">{{ labelsFor(item.type)[0] }} {{ item.origin }}</span>
                  <span class="op__op-line" :title="item.destination">{{ labelsFor(item.type)[1] }} {{ item.destination }}</span>
                </td>
                <td>
                  <span class="op__requester"><i>{{ item.requester.charAt(0) }}</i> {{ item.requester }}</span>
                </td>
                <td class="text-center">
                  <span class="sa-badge sa-badge--xs" :class="STATUS_CFG[item.status].cls">{{ STATUS_CFG[item.status].label }}</span>
                </td>
                <td class="text-center">
                  <div v-if="item.status === 'Pending'" class="op__approve">
                    <q-btn unelevated dense class="op__approve-btn op__approve-btn--ok" title="Aprovar Movimentação" @click="approve(item.id)"><Check :size="14" /></q-btn>
                    <q-btn unelevated dense class="op__approve-btn op__approve-btn--no" title="Negar Movimentação" @click="reject(item.id)"><X :size="14" /></q-btn>
                  </div>
                  <span v-else class="op__done">{{ item.status === 'Approved' ? 'Registrado' : 'Cancelado' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Check,
  Clock,
  FileSignature,
  FileText,
  Flame,
  Hash,
  Plus,
  Search,
  ShieldAlert,
  User,
  Wallet,
  X,
} from 'lucide-vue-next';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect from 'components/ui/SaSelect.vue';
import BankPicker from './BankPicker.vue';
import { useQuasar } from 'quasar';
import {
  contractsForLiquidation,
  financialSummary,
  mintCurrencies,
  opHistoryMock,
  type OpClient,
  type OpRequest,
  type OpRequestStatus,
  type OpRequestType,
} from 'src/mocks/transactions';
import { useCustomerAccounts } from 'src/composables/useCustomerAccounts';
import { apiErrorMessage } from 'src/services/api-envelope';
import { formatCurrencyIn } from 'src/utils/format';

type Sel = string | number | boolean | null;
type Txt = string | number | null;

const tab = ref<'internal' | 'contracts' | 'system'>('internal');
const history = ref<OpRequest[]>([...opHistoryMock]);
const rate = financialSummary.total.rate;

const formatNumber = (v: number) => new Intl.NumberFormat('pt-BR').format(v);
const num = (v: Txt) => parseFloat(String(v ?? '')) || 0;
const provHash = () => `0x${Math.random().toString(16).slice(2, 8)}... (Prov)`;
const newId = () => `OP-${Math.floor(Math.random() * 1000)}`;

// Clientes, carteiras e contas bancárias vêm da API; as operações deste painel ainda são locais (mock).
const $q = useQuasar();
const { customers, accounts, loadCustomers, loadAccounts, walletLabel, bankName, accountTypeLabel } = useCustomerAccounts();
const notifyError = (fallback: string) => (e: unknown) => $q.notify({ type: 'negative', message: apiErrorMessage(e, fallback) });

const clientOptions = computed(() => customers.value.map((c) => ({ label: c.name, value: c.id })));
const clientOf = (id: Sel): OpClient | undefined => {
  const customer = customers.value.find((c) => c.id === id);
  if (!customer) return undefined;
  const acc = accounts[customer.id];
  return {
    id: customer.id,
    name: customer.name,
    wallets: (acc?.wallets ?? []).map((w) => ({
      id: w.id,
      name: walletLabel(w),
      currency: w.currencyIsoCode,
      balance: Number(w.available),
      type: w.type,
    })),
    banks: (acc?.bankAccounts ?? []).map((a) => ({
      id: a.id,
      name: bankName(a),
      agency: a.branch,
      account: [a.accountNumberMasked ?? a.accountNumber, a.accountDigit].filter(Boolean).join('-'),
      type: accountTypeLabel(a),
      pix: a.pixKeyMasked,
    })),
  };
};

loadCustomers().catch(notifyError('Não foi possível carregar os clientes.'));
const ensureAccounts = (id: Sel) => {
  if (typeof id === 'string') loadAccounts(id).catch(notifyError('Não foi possível carregar as carteiras e contas do cliente.'));
};
const walletOptions = (clientId: Sel) => (clientOf(clientId)?.wallets ?? []).map((w) => ({ label: w.name, value: w.id }));
const walletOf = (clientId: Sel, walletId: Sel) => clientOf(clientId)?.wallets.find((w) => w.id === walletId);

function push(item: Omit<OpRequest, 'id' | 'hash' | 'requester' | 'date' | 'status'>) {
  history.value = [
    { ...item, id: newId(), hash: provHash(), requester: 'Usuário Atual', date: new Date().toISOString(), status: 'Pending' },
    ...history.value,
  ];
}

// ---------- Movimentação interna ----------
const src = reactive<{ client: Sel; wallet: Sel }>({ client: null, wallet: null });
const dst = reactive<{ client: Sel; wallet: Sel }>({ client: null, wallet: null });
const transferValue = ref<Txt>('');
const transferObs = ref<Txt>('');

const srcWallet = computed(() => walletOf(src.client, src.wallet));
const dstWallet = computed(() => walletOf(dst.client, dst.wallet));
const transferAmount = computed(() => num(transferValue.value));
const insufficient = computed(() => (srcWallet.value ? transferAmount.value > srcWallet.value.balance : false));

function internalTransfer() {
  const s = srcWallet.value;
  const d = dstWallet.value;
  if (!s || !d) return;
  push({
    type: 'Internal',
    origin: s.name,
    destination: d.name,
    value: transferAmount.value,
    details: `${String(transferObs.value || 'Transferência entre carteiras')} | De: ${clientOf(src.client)?.name} (${s.id}) -> Para: ${clientOf(dst.client)?.name} (${d.id})`,
  });
  transferValue.value = '';
  transferObs.value = '';
}

// ---------- Liquidação ----------
const contractId = ref<Sel>(null);
const contractOptions = contractsForLiquidation.map((c) => ({ label: `${c.name} (${c.id})`, value: c.id }));
const contract = computed(() => contractsForLiquidation.find((c) => c.id === contractId.value));
const liquidations = computed(() => history.value.filter((o) => o.type === 'Liquidation'));

const contractIdOf = (details?: string) => /CONTRATO:.*?\((.*?)\)/.exec(details ?? '')?.[1] ?? '---';

function liquidate() {
  const c = contract.value;
  if (!c) return;
  const dist = c.clients
    .map((cl) => {
      const usd = c.value * cl.percent;
      return `[Cliente: ${cl.name} (${cl.id}) | Carteira: ${cl.wallet} | Rec: ${formatCurrencyIn(usd, 'USD')} / ${formatCurrencyIn(usd * rate, 'BRL')} (${(cl.percent * 100).toFixed(0)}%)]`;
    })
    .join('  ');
  push({
    type: 'Liquidation',
    origin: c.name,
    destination: 'Múltiplos (Split)',
    value: c.value,
    details: `CONTRATO: ${c.name} (${c.id}) | VALOR TOTAL: ${formatCurrencyIn(c.value, 'USD')} / ${formatCurrencyIn(c.value * rate, 'BRL')} | DISTRIBUIÇÃO: ${dist}`,
  });
  contractId.value = null;
}

// ---------- Mint ----------
const mintMode = ref<'direct' | 'parity'>('direct');
const mint = reactive<{ client: Sel; wallet: Sel; bank: string; amount: Txt; input: Txt; ref: Txt; currency: Sel }>({
  client: null, wallet: null, bank: '', amount: '', input: '', ref: '', currency: 'AUD',
});
const mintCurrencyOptions = mintCurrencies.map((c) => ({ label: `${c.code} - ${c.name}`, value: c.code }));
const mintClient = computed(() => clientOf(mint.client));
const mintWallet = computed(() => walletOf(mint.client, mint.wallet));
const mintCurrency = computed(() => mintCurrencies.find((c) => c.code === mint.currency));
const parityInput = computed(() => num(mint.input));
const parityQty = computed(() => parityInput.value * (mintCurrency.value?.rateToUsd ?? 0));

function doMint() {
  const w = mintWallet.value;
  const bank = mintClient.value?.banks.find((b) => b.id === mint.bank);
  if (!w || !bank) return;
  let qty = num(mint.amount);
  let details = String(mint.ref || 'Emissão de novas moedas');
  if (mintMode.value === 'parity' && mintCurrency.value) {
    const cur = mintCurrency.value;
    qty = parityQty.value;
    details = `${mint.ref ? `${String(mint.ref)} | ` : ''}Mint Paridade: ${formatCurrencyIn(parityInput.value, cur.code)} (${cur.code}) -> USD Rate: ${cur.rateToUsd.toFixed(4)} -> Final: ${formatCurrencyIn(qty, 'USD')}`;
  }
  push({
    type: 'Mint',
    origin: `Banco: ${bank.name}`,
    destination: w.name,
    value: qty,
    details: `${details} | Destino: ${mintClient.value?.name} (${w.id}) | Via Banco: ${bank.name} (Ag: ${bank.agency} CC: ${bank.account})`,
  });
  Object.assign(mint, { client: null, wallet: null, bank: '', amount: '', input: '', ref: '' });
}

// ---------- Burn ----------
const burn = reactive<{ client: Sel; wallet: Sel; bank: string; amount: Txt; ref: Txt }>({ client: null, wallet: null, bank: '', amount: '', ref: '' });
const burnClient = computed(() => clientOf(burn.client));
const burnWallet = computed(() => walletOf(burn.client, burn.wallet));
const burnAmount = computed(() => num(burn.amount));
const burnInvalid = computed(() => (burnWallet.value ? burnAmount.value > burnWallet.value.balance : false));

function doBurn() {
  const w = burnWallet.value;
  const bank = burnClient.value?.banks.find((b) => b.id === burn.bank);
  if (!w || !bank || burnInvalid.value) return;
  push({
    type: 'Burn',
    origin: w.name,
    destination: 'Null (Burn)',
    value: burnAmount.value,
    details: `${String(burn.ref || 'Queima de moedas')} | Carteira: ${w.id} (${burnClient.value?.name}) | Saldo Anterior: ${formatCurrencyIn(w.balance, w.currency)} -> Final: ${formatCurrencyIn(w.balance - burnAmount.value, w.currency)} | Banco Ref: ${bank.name}`,
  });
  Object.assign(burn, { client: null, wallet: null, bank: '', amount: '', ref: '' });
}

// Carteiras e contas do cliente carregam quando ele é escolhido em qualquer formulário.
watch(() => [src.client, dst.client, mint.client, burn.client], (ids) => ids.forEach(ensureAccounts));

// ---------- Histórico / aprovação ----------
const filteredHistory = computed(() =>
  history.value.filter((i) =>
    tab.value === 'internal' ? i.type === 'Internal' : tab.value === 'contracts' ? i.type === 'Liquidation' : i.type === 'Mint' || i.type === 'Burn',
  ),
);

const historyTitle = computed(
  () => ({ internal: 'Histórico de Movimentações Internas', contracts: 'Histórico de Liquidações', system: 'Histórico de Operações do Sistema' })[tab.value],
);

const OP_CFG: Record<OpRequestType, { label: string; icon: typeof Plus; cls: string }> = {
  Internal: { label: 'Movimentação', icon: ArrowRightLeft, cls: 'op__ico-blue' },
  Liquidation: { label: 'Liquidação', icon: FileSignature, cls: 'op__ico-amber' },
  Mint: { label: 'Mint (Emissão)', icon: Plus, cls: 'op__ico-emerald' },
  Burn: { label: 'Burn (Queima)', icon: Flame, cls: 'op__ico-rose' },
};

const STATUS_CFG: Record<OpRequestStatus, { label: string; cls: string }> = {
  Pending: { label: 'Pendente', cls: 'sa-badge--amber op__pulse' },
  Approved: { label: 'Concluída', cls: 'sa-badge--emerald' },
  Rejected: { label: 'Negada', cls: 'sa-badge--rose' },
};

const labelsFor = (type: OpRequestType) =>
  type === 'Liquidation' ? ['Contrato:', 'Destino:'] : type === 'Internal' ? ['De:', 'Para:'] : ['Origem:', 'Destino:'];

function approve(id: string) {
  history.value = history.value.map((i) =>
    i.id === id ? { ...i, status: 'Approved', hash: `0x${Math.random().toString(16).slice(2, 14)}... (Final)` } : i,
  );
}

function reject(id: string) {
  history.value = history.value.map((i) => (i.id === id ? { ...i, status: 'Rejected' } : i));
}
</script>

<style scoped lang="scss">
.op {
  &__head {
    background: var(--slate-50);
    border-bottom: 1px solid var(--slate-200);
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    @media (min-width: 768px) { flex-direction: row; align-items: center; }
    h2 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: var(--slate-900); }
    p { margin: 4px 0 0; font-size: 14px; color: var(--slate-500); }
  }

  &__tabs {
    display: flex;
    flex-wrap: wrap;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      color: var(--slate-500);
      cursor: pointer;
      &:hover { background: var(--slate-50); }
      &.active { background: var(--slate-100); color: var(--slate-900); }
    }
  }

  &__body { padding: 24px; }
  &__stack { display: flex; flex-direction: column; gap: 24px; }

  &__two {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    @media (min-width: 1024px) { grid-template-columns: 1fr 1fr; }
    &--md { @media (min-width: 768px) { grid-template-columns: 1fr 1fr; } }
    &--xl { gap: 32px; @media (min-width: 1024px) { grid-template-columns: 1fr; } @media (min-width: 1280px) { grid-template-columns: 1fr 1fr; } }
    &--tight { grid-template-columns: 1fr 1fr !important; gap: 12px; }
  }

  &__block {
    padding: 20px;
    background: rgba(248, 250, 252, 0.5);
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__block-title {
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--slate-200);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: var(--slate-700);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__ico-rose { color: var(--rose-500); }
  &__ico-emerald { color: var(--emerald-500); }
  :deep(.op__ico-blue) { color: var(--blue-500); }
  :deep(.op__ico-amber) { color: var(--amber-500); }
  :deep(.op__ico-emerald) { color: var(--emerald-500); }
  :deep(.op__ico-rose) { color: var(--rose-500); }

  &__field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }

  &__label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--slate-500);
    &--xs { font-size: 12px; }
    &--emerald { color: var(--emerald-700); }
    &--rose { color: var(--rose-800); }
    &--plain { font-size: 12px; font-weight: 500; text-transform: none; color: var(--slate-700); }
  }

  &__wallet-wrap { margin-top: auto; padding-top: 16px; }

  &__wallet {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  }

  &__wallet-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; > div { display: flex; flex-direction: column; } }
  &__wallet-name { font-size: 12px; font-weight: 700; color: var(--slate-800); }
  &__wallet-id { font-size: 10px; color: var(--slate-400); }
  &__wallet-balance { font-size: 18px; font-weight: 700; color: var(--slate-900); }

  &__wallet-origin {
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px 8px;
    background: var(--indigo-50);
    color: var(--indigo-600);
    border-bottom: 1px solid var(--indigo-100);
    border-left: 1px solid var(--indigo-100);
    border-bottom-left-radius: 4px;
    font-size: 9px;
    font-weight: 500;
  }

  &__warn {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--rose-600);
    background: var(--rose-50);
    border: 1px solid var(--rose-100);
    border-radius: 4px;
  }

  &__placeholder {
    flex: 1;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--slate-400);
    background: var(--slate-50);
    border: 2px dashed var(--slate-200);
    border-radius: 8px;
  }

  &__projected { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; > div { display: flex; flex-direction: column; gap: 2px; } }
  &__projected-new { text-align: right; border-left: 1px solid var(--slate-100); padding-left: 16px; }
  &__muted-label { color: var(--slate-400); }
  &__emerald-label { color: var(--emerald-600); }
  &__projected-cur { font-size: 14px; font-weight: 600; color: var(--slate-700); }
  &__projected-val { font-size: 14px; font-weight: 700; color: var(--emerald-700); }

  &__details { padding: 24px; background: #fff; border: 1px solid var(--slate-200); border-radius: 8px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05); }

  &__details-title {
    margin: 0 0 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--slate-100);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    color: var(--slate-900);
  }

  &__big :deep(.q-field__control) { height: 48px !important; min-height: 48px !important; background: var(--slate-50); }
  &__big :deep(.q-field__native) { min-height: 48px !important; font-size: 18px; font-weight: 700; }
  &__big--error :deep(.q-field__control:before) { border-color: var(--rose-300) !important; }
  &__prefix { font-size: 14px; font-weight: 700; color: var(--slate-400); &--emerald { font-size: 12px; color: var(--emerald-600); } }

  &__exec { margin-top: 24px; display: flex; flex-direction: column; align-items: center; gap: 24px; @media (min-width: 768px) { flex-direction: row; } }

  &__fees {
    width: 100%;
    min-width: 200px;
    padding: 12px;
    background: var(--slate-100);
    border-radius: 4px;
    font-size: 10px;
    color: var(--slate-500);
    display: flex;
    flex-direction: column;
    gap: 4px;
    @media (min-width: 768px) { width: auto; }
    div { display: flex; justify-content: space-between; gap: 16px; }
  }

  &__exec-btn { width: 100%; height: 48px; font-size: 16px; font-weight: 700; @media (min-width: 768px) { flex: 1; } &--blocked { background: var(--slate-200) !important; color: var(--slate-400) !important; } }

  // ---------- Contratos ----------
  &__contracts {
    min-height: 600px;
    padding: 24px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  &__contracts-head {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    @media (min-width: 768px) { flex-direction: row; align-items: center; }
    h3 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: var(--slate-800); }
    p { margin: 4px 0 0; font-size: 14px; color: var(--slate-500); }
  }

  &__identity {
    position: relative;
    overflow: hidden;
    padding: 24px;
    background: rgba(238, 242, 255, 0.5);
    border: 1px solid var(--indigo-100);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    h2 { position: relative; margin: 0 0 8px; font-size: 24px; font-weight: 700; line-height: 1.2; color: var(--slate-900); }
  }

  &__identity-bg { position: absolute; top: 16px; right: 16px; opacity: 0.05; color: var(--indigo-900); pointer-events: none; }
  &__identity-kicker { position: relative; margin-bottom: 8px; font-size: 12px; font-weight: 700; color: var(--indigo-600); text-transform: uppercase; letter-spacing: 0.05em; }
  &__identity-badges { position: relative; display: flex; flex-wrap: wrap; gap: 8px; }
  &__identity-sep { position: relative; width: 100%; height: 1px; border: 0; background: rgba(199, 210, 254, 0.5); margin: 24px 0; }
  &__identity-values { position: relative; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; > div { display: flex; align-items: center; gap: 12px; } }
  &__code { width: 32px; font-size: 14px; font-weight: 700; color: var(--slate-400); }
  &__usd { font-size: 30px; font-weight: 700; letter-spacing: -0.025em; color: var(--slate-900); }
  &__brl { font-size: 18px; font-weight: 700; color: var(--slate-600); }
  &__rate { font-size: 10px; color: var(--slate-400); background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--slate-100); }

  &__linked { min-height: 300px; background: #fff; border: 1px solid var(--slate-200); border-radius: 8px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05); overflow: hidden; }

  &__linked-head {
    padding: 16px;
    background: var(--slate-50);
    border-bottom: 1px solid var(--slate-200);
    display: flex;
    align-items: center;
    justify-content: space-between;
    h4 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--slate-700); text-transform: uppercase; letter-spacing: 0.05em; }
  }

  &__mini {
    th { height: 36px; font-size: 10px; font-weight: 700; color: var(--slate-600); background: rgba(248, 250, 252, 0.5); }
    td { padding: 12px 8px; }
    th:first-child, td:first-child { padding-left: 16px; }
    th:last-child, td:last-child { padding-right: 16px; }
  }

  &__mini-wallet { display: block; font-size: 12px; font-weight: 700; color: var(--slate-800); }
  &__mini-id { display: block; font-size: 10px; color: var(--slate-400); }
  &__mini-client { display: flex; align-items: center; gap: 4px; margin-top: 2px; font-size: 10px; font-weight: 500; color: var(--indigo-600); }
  &__pct { font-weight: 700; color: var(--slate-700); }
  &__mini-usd { display: block; font-size: 12px; font-weight: 700; color: var(--emerald-700); }
  &__mini-brl { display: block; font-size: 10px; color: var(--slate-500); }

  &__danger {
    padding: 24px;
    background: var(--rose-50);
    border: 1px solid var(--rose-100);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    @media (min-width: 768px) { flex-direction: row; }
  }

  &__danger-info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    h4 { margin: 0; font-size: 16px; font-weight: 700; color: var(--rose-800); }
    p { margin: 4px 0 0; max-width: 672px; font-size: 14px; color: rgba(225, 29, 72, 0.8); }
  }

  &__danger-icon { padding: 8px; background: var(--rose-100); color: var(--rose-600); border-radius: 8px; display: flex; flex-shrink: 0; }
  &__danger-btn { height: 48px; padding: 0 32px; background: var(--rose-600); color: #fff; font-size: 16px; font-weight: 700; white-space: nowrap; &:hover { background: var(--rose-700); } }

  &__no-contract {
    padding: 64px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background: rgba(248, 250, 252, 0.5);
    border: 2px dashed var(--slate-200);
    border-radius: 8px;
    h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--slate-900); }
    p { margin: 4px 0 0; max-width: 300px; font-size: 12px; color: var(--slate-500); }
  }

  &__no-contract-icon { width: 48px; height: 48px; margin-bottom: 12px; border-radius: 50%; background: var(--slate-100); color: var(--slate-400); display: flex; align-items: center; justify-content: center; }

  &__log {
    margin-top: auto;
    padding-top: 32px;
    border-top: 1px solid var(--slate-200);
    h3 { margin: 0 0 16px; display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: var(--slate-800); text-transform: uppercase; letter-spacing: 0.05em; }
  }

  &__log-icon { padding: 6px; background: var(--slate-100); color: var(--slate-600); border-radius: 4px; display: flex; }
  &__log-table { border: 1px solid var(--slate-200); border-radius: 8px; overflow-x: auto; }
  &__top { vertical-align: top !important; }
  &__empty-row { padding: 32px 8px !important; text-align: center; font-size: 12px; color: var(--slate-400) !important; }
  &__log-date { display: block; font-size: 12px; font-weight: 700; color: var(--slate-700); }
  &__log-time { display: block; font-size: 10px; color: var(--slate-400); }
  &__log-hash { display: block; margin-top: 4px; font-size: 9px; color: var(--indigo-400); }
  &__log-contract { display: block; font-size: 12px; font-weight: 700; color: var(--slate-800); }
  &__log-cid { display: block; font-size: 10px; color: var(--slate-500); }
  &__log-badge { margin-top: 4px; font-size: 9px; }
  &__log-audit { margin: 0; padding: 8px; font-size: 10px; line-height: 1.6; color: var(--slate-600); background: var(--slate-50); border: 1px solid var(--slate-100); border-radius: 4px; white-space: normal; }
  &__log-value { font-size: 12px; font-weight: 700; color: var(--emerald-700); }

  // ---------- Mint / Burn ----------
  &__mint, &__burn {
    padding: 0 24px 24px;
    border: 1px solid;
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__mint { border-color: var(--emerald-200); background: rgba(236, 253, 245, 0.3); }
  &__burn { border-color: var(--rose-200); background: rgba(255, 241, 242, 0.3); }

  &__mint-head { padding-top: 24px; display: flex; align-items: center; justify-content: space-between; h3 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; } }

  &__mint-mode {
    display: flex;
    padding: 2px;
    background: rgba(209, 250, 229, 0.5);
    border: 1px solid var(--emerald-200);
    border-radius: 8px;
    button {
      padding: 4px 8px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      font: inherit;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--emerald-600);
      cursor: pointer;
      &:hover { background: var(--emerald-100); }
      &.active { background: #fff; color: var(--emerald-800); box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05); }
    }
  }

  &__mint-ref {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background: rgba(209, 250, 229, 0.4);
    border: 1px solid rgba(167, 243, 208, 0.6);
    border-radius: 4px;
    > div { display: flex; flex-direction: column; }
    strong { font-size: 12px; color: var(--emerald-900); }
    .font-mono { color: var(--emerald-800); }
  }

  &__mint-kicker { font-size: 10px; font-weight: 700; color: var(--emerald-700); text-transform: uppercase; letter-spacing: 0.05em; &--soft { font-weight: 500; color: var(--emerald-600); text-transform: none; letter-spacing: 0; } }

  &__mint-target { padding-bottom: 16px; border-bottom: 1px solid var(--emerald-100); display: flex; flex-direction: column; gap: 16px; }
  &__mint-label { font-size: 10px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; }

  &__mint-selected {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    font-size: 10px;
    font-weight: 500;
    color: var(--emerald-800);
    background: var(--emerald-50);
    border: 1px solid rgba(209, 250, 229, 0.5);
    border-radius: 4px;
    svg { color: var(--emerald-600); }
  }

  &__parity { display: flex; flex-direction: column; gap: 16px; }
  &__parity-box { padding: 12px; background: rgba(255, 255, 255, 0.6); border: 1px solid var(--emerald-100); border-radius: 8px; display: flex; flex-direction: column; gap: 12px; }
  &__parity-calc { padding-top: 8px; border-top: 1px solid rgba(209, 250, 229, 0.5); display: flex; flex-direction: column; gap: 8px; }
  &__parity-rate { display: flex; justify-content: space-between; font-size: 10px; color: var(--emerald-700); .font-mono { font-weight: 700; } }

  &__parity-qty {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background: rgba(209, 250, 229, 0.5);
    border: 1px solid rgba(167, 243, 208, 0.5);
    border-radius: 4px;
    > span { font-size: 10px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; }
    div { text-align: right; }
    strong { display: block; font-size: 14px; color: var(--emerald-900); }
    small { font-size: 9px; color: var(--emerald-600); }
  }

  &__parity-summary { padding: 12px; background: rgba(209, 250, 229, 0.8); border: 1px solid var(--emerald-200); border-radius: 8px; }
  &__parity-summary-title { display: block; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid var(--emerald-200); font-size: 10px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; }

  &__parity-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 10px;
    > div { display: flex; flex-direction: column; }
    span { color: var(--emerald-600); }
    strong { color: var(--emerald-900); }
  }

  &__parity-final {
    grid-column: span 2;
    flex-direction: row !important;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
    margin-top: 4px;
    border-top: 1px solid var(--emerald-200);
    span { font-weight: 700; color: var(--emerald-800); text-transform: uppercase; }
    strong { font-size: 12px; }
  }

  &__ellipsis { max-width: 100px; margin-left: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  &__mint-btn { width: 100%; background: var(--emerald-600); color: #fff; &:hover { background: var(--emerald-700); } }
  &__burn-btn { width: 100%; background: var(--rose-600); color: #fff; &:hover { background: var(--rose-700); } }

  &__burn h3 { margin: 0; padding-top: 24px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--rose-800); text-transform: uppercase; }
  &__burn-desc { margin: 0; font-size: 12px; color: var(--rose-700); }

  &__burn-card { padding: 12px; background: #fff; border: 1px solid var(--rose-200); border-radius: 8px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05); display: flex; flex-direction: column; gap: 12px; }
  &__burn-kicker { font-size: 10px; font-weight: 700; color: var(--rose-800); text-transform: uppercase; }
  &__burn-sep { width: 100%; height: 1px; border: 0; margin: 0; background: var(--rose-100); }
  &__burn-input :deep(.q-field__control) { background: rgba(255, 241, 242, 0.5); }
  &__burn-input :deep(.q-field__native) { font-weight: 700; }

  &__burn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; }
  &__burn-cell {
    display: flex;
    flex-direction: column;
    padding: 8px;
    background: var(--slate-50);
    border: 1px solid var(--slate-100);
    border-radius: 4px;
    span { font-size: 10px; font-weight: 500; color: var(--slate-500); }
    strong { color: var(--slate-700); }
    &--rose { background: var(--rose-50); border-color: var(--rose-100); span { color: var(--rose-600); } strong { color: var(--rose-700); } }
  }

  &__burn-warn { display: flex; align-items: center; gap: 6px; padding: 6px; font-size: 10px; font-weight: 700; color: var(--rose-600); background: rgba(255, 228, 230, 0.5); border-radius: 4px; }

  &__burn-summary {
    padding: 8px;
    font-size: 10px;
    color: var(--rose-800);
    background: rgba(255, 228, 230, 0.3);
    border: 1px solid var(--rose-100);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    div { display: flex; justify-content: space-between; }
  }

  &__burn-total { padding-top: 4px; margin-top: 4px; border-top: 1px solid var(--rose-200); }

  // ---------- Histórico ----------
  &__history {
    margin-top: 40px;
    padding-top: 32px;
    border-top: 1px solid var(--slate-200);
    h4 { margin: 0 0 16px; display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: var(--slate-800); }
  }

  &__hist-table td { padding: 12px 8px; }
  &__pending td { background: rgba(255, 251, 235, 0.3); }
  &__op-type { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--slate-800); }
  &__op-hash { display: flex; align-items: center; gap: 4px; margin-top: 2px; font-size: 10px; color: var(--slate-400); }
  &__op-value { display: block; font-size: 12px; font-weight: 700; color: var(--slate-900); }
  &__op-line { display: block; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; color: var(--slate-500); }

  &__requester {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 140px;
    font-size: 12px;
    color: var(--slate-600);
    i { width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%; background: var(--indigo-100); color: var(--indigo-700); font-style: normal; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  }

  :deep(.op__pulse) { animation: op-pulse 2s ease-in-out infinite; }

  &__approve { display: flex; align-items: center; justify-content: center; gap: 4px; }
  &__approve-btn {
    width: 28px;
    height: 28px;
    min-height: 28px;
    border-radius: 6px;
    &--ok { background: var(--emerald-100); color: var(--emerald-700); &:hover { background: var(--emerald-200); } }
    &--no { background: var(--rose-100); color: var(--rose-700); &:hover { background: var(--rose-200); } }
  }

  &__done { font-size: 10px; font-style: italic; color: var(--slate-400); }
}

@keyframes op-pulse {
  50% { opacity: 0.5; }
}
</style>
