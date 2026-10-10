<template>
  <q-dialog v-model="open" persistent>
    <div class="ccf">
      <!-- Steps sidebar -->
      <aside class="ccf__steps">
        <div class="ccf__steps-head">
          <h3>Cadastrar Novo Cliente</h3>
          <p>Etapa {{ step }} de {{ STEPS.length }}</p>
        </div>
        <ol class="ccf__steps-list">
          <li
            v-for="s in STEPS"
            :key="s.id"
            class="ccf__step"
            :class="{
              'ccf__step--active': s.id === step,
              'ccf__step--done': s.id < step,
              'ccf__step--todo': s.id > step,
            }"
          >
            <span class="ccf__step-icon">
              <CheckCircle2 v-if="s.id < step" :size="16" />
              <component :is="s.icon" v-else :size="16" />
            </span>
            <span class="ccf__step-name">{{ s.name }}</span>
          </li>
        </ol>
      </aside>

      <!-- Main -->
      <section class="ccf__main">
        <header class="ccf__header">
          <div>
            <h2>{{ STEPS[step - 1]!.name }}</h2>
            <p>{{ STEP_DESCRIPTIONS[step - 1] }}</p>
          </div>
          <q-btn flat round dense aria-label="Fechar" @click="close"><X :size="20" /></q-btn>
        </header>

        <div class="ccf__body">
          <!-- 1. Tipo -->
          <div v-if="step === 1" class="ccf__section">
            <div>
              <div class="ccf__label-lg">Selecione o Tipo de Cliente</div>
              <div class="ccf__type-grid">
                <button
                  v-for="t in typeCards"
                  :key="t.value"
                  type="button"
                  class="ccf__type"
                  :class="{ 'ccf__type--active': customerType === t.value }"
                  @click="customerType = t.value"
                >
                  <component :is="t.icon" :size="40" class="ccf__type-icon" />
                  <h3>{{ t.title }}</h3>
                  <p>{{ t.subtitle }}</p>
                </button>
              </div>
            </div>

            <div v-if="customerType === 'PF'" class="ccf__subsection">
              <h4>Dados da Pessoa Física</h4>
              <div class="ccf__grid">
                <SaField label="Nome Completo *" full><SaInput v-model="form.fullName" placeholder="Nome completo do cliente" /></SaField>
                <SaField label="CPF *"><SaInput v-model="form.cpf" placeholder="000.000.000-00" /></SaField>
                <SaField label="RG ou Documento"><SaInput v-model="form.rg" placeholder="RG ou documento equivalente" /></SaField>
                <SaField label="Data de Nascimento *"><SaInput v-model="form.birthDate" type="date" /></SaField>
                <SaField label="Estado Civil"><SaSelect v-model="form.maritalStatus" :options="maritalOptions" /></SaField>
                <SaField label="E-mail *"><SaInput v-model="form.email" type="email" placeholder="email@exemplo.com" /></SaField>
                <SaField label="Telefone / WhatsApp *"><SaInput v-model="form.phone" placeholder="(00) 00000-0000" /></SaField>
                <SaField label="Endereço Completo *" full>
                  <SaInput v-model="form.address" type="textarea" :rows="2" placeholder="Rua, número, complemento, bairro, cidade, estado, CEP" />
                </SaField>
                <SaField label="Profissão"><SaInput v-model="form.profession" placeholder="Profissão do cliente" /></SaField>
                <SaField label="Nacionalidade"><SaInput v-model="form.nationality" /></SaField>
                <SaField label="Renda Mensal Estimada"><SaInput v-model="form.monthlyIncome" type="number" placeholder="0,00" /></SaField>
                <SaField label="Patrimônio Declarado"><SaInput v-model="form.declaredAssets" type="number" placeholder="0,00" /></SaField>
              </div>
            </div>

            <div v-if="customerType === 'PJ'" class="ccf__subsection">
              <h4>Dados da Pessoa Jurídica</h4>
              <div class="ccf__grid">
                <SaField label="Razão Social *" full><SaInput v-model="form.companyName" placeholder="Razão social completa" /></SaField>
                <SaField label="Nome Fantasia"><SaInput v-model="form.tradeName" placeholder="Nome fantasia" /></SaField>
                <SaField label="CNPJ *"><SaInput v-model="form.cnpj" placeholder="00.000.000/0000-00" /></SaField>
                <SaField label="Inscrição Estadual"><SaInput v-model="form.stateRegistration" placeholder="Se houver" /></SaField>
                <SaField label="Inscrição Municipal"><SaInput v-model="form.cityRegistration" placeholder="Se houver" /></SaField>
                <SaField label="E-mail Corporativo *"><SaInput v-model="form.corporateEmail" type="email" placeholder="contato@empresa.com" /></SaField>
                <SaField label="Telefone / WhatsApp *"><SaInput v-model="form.corporatePhone" placeholder="(00) 0000-0000" /></SaField>
                <SaField label="Endereço Completo *" full>
                  <SaInput v-model="form.corporateAddress" type="textarea" :rows="2" placeholder="Endereço da sede" />
                </SaField>
                <SaField label="CNAE Principal"><SaInput v-model="form.mainCnae" placeholder="Código CNAE" /></SaField>
                <SaField label="Faturamento Mensal Estimado"><SaInput v-model="form.monthlyRevenue" type="number" placeholder="0,00" /></SaField>
                <SaField label="Representante Legal *" full>
                  <SaInput v-model="form.legalRepresentative" placeholder="Nome completo do representante" />
                </SaField>
                <SaField label="CPF do Representante Legal *"><SaInput v-model="form.legalRepCpf" placeholder="000.000.000-00" /></SaField>
                <SaField label="Patrimônio/Caixa Declarado"><SaInput v-model="form.companyCash" type="number" placeholder="0,00" /></SaField>
              </div>
            </div>
          </div>

          <!-- 2. Classificação -->
          <div v-else-if="step === 2" class="ccf__section">
            <div class="ccf__grid">
              <SaField label="Classificação do Cliente *"><SaSelect v-model="form.classification" :options="classificationOptions" /></SaField>
              <SaField label="Status Inicial *"><SaSelect v-model="form.status" :options="statusOptions" /></SaField>
              <SaField label="Assessor Responsável *"><SaSelect v-model="form.advisor" :options="advisorOptions" /></SaField>
              <SaField label="Origem do Cliente"><SaSelect v-model="form.origin" :options="originOptions" /></SaField>
              <SaField label="Observações Comerciais Internas" full>
                <SaInput v-model="form.commercialNotes" type="textarea" :rows="4" placeholder="Notas sobre negociação, perfil comercial, potencial, etc." />
              </SaField>
            </div>
          </div>

          <!-- 3. Compliance -->
          <div v-else-if="step === 3" class="ccf__section">
            <div class="ccf__grid">
              <SaField label="Nível Documental *"><SaSelect v-model="form.docLevel" :options="docLevelOptions" /></SaField>
              <SaField label="Status de Compliance *"><SaSelect v-model="form.complianceStatus" :options="complianceStatusOptions" /></SaField>
              <SaField label="Perfil de Risco *"><SaSelect v-model="form.riskProfile" :options="riskOptions" /></SaField>
              <SaField label="Pessoa Politicamente Exposta (PEP)"><SaSelect v-model="form.isPep" :options="noYesOptions" /></SaField>
              <SaField label="Declaração de Origem dos Recursos *" full>
                <SaInput v-model="form.resourceOrigin" type="textarea" :rows="3" placeholder="Descreva a origem dos recursos do cliente" />
              </SaField>
              <SaField label="Restrições ou Pendências Internas" full>
                <SaInput v-model="form.restrictions" type="textarea" :rows="2" placeholder="Alguma pendência, restrição ou observação relevante" />
              </SaField>
              <SaField label="Observações de Compliance" full>
                <SaInput v-model="form.complianceNotes" type="textarea" :rows="3" placeholder="Notas internas sobre análise de compliance" />
              </SaField>
            </div>
          </div>

          <!-- 4. Carteiras -->
          <div v-else-if="step === 4" class="ccf__section">
            <div class="ccf__note ccf__note--blue">
              <strong>Criação Automática:</strong> O sistema criará automaticamente as carteiras Livre e Aplicada para este cliente.
            </div>
            <div>
              <div class="ccf__label-lg">Moeda-Base do Cliente *</div>
              <p class="ccf__hint">Define a moeda principal de referência. O cliente pode ter outras moedas posteriormente.</p>
              <SaSelect v-model="form.baseCurrency" :options="currencyOptions" />
            </div>
            <div class="ccf__subsection">
              <h4>Carteiras que Serão Criadas</h4>
              <div class="ccf__wallets">
                <div class="ccf__wallet ccf__wallet--green">
                  <span class="ccf__wallet-icon"><Wallet :size="20" /></span>
                  <div class="ccf__wallet-text">
                    <h5>Carteira Livre</h5>
                    <p>Para entrada e saída de recursos. Depósitos entram aqui, saques saem daqui.</p>
                  </div>
                  <span class="ccf__wallet-badge">Automática</span>
                </div>
                <div class="ccf__wallet ccf__wallet--indigo">
                  <span class="ccf__wallet-icon"><Wallet :size="20" /></span>
                  <div class="ccf__wallet-text">
                    <h5>Carteira Aplicada</h5>
                    <p>Para recursos alocados em operações, contratos ou estratégias.</p>
                  </div>
                  <span class="ccf__wallet-badge">Automática</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Dados bancários -->
          <div v-else-if="step === 5" class="ccf__section">
            <div class="ccf__note ccf__note--amber">Você pode cadastrar contas bancárias agora ou após criar o cliente.</div>
            <div class="ccf__grid">
              <SaField label="Banco"><SaInput v-model="bank.name" placeholder="Nome do banco" /></SaField>
              <SaField label="Agência"><SaInput v-model="bank.agency" placeholder="0000" /></SaField>
              <SaField label="Conta"><SaInput v-model="bank.account" placeholder="00000-0" /></SaField>
              <SaField label="Tipo de Conta"><SaSelect v-model="bank.type" :options="bankTypeOptions" /></SaField>
              <SaField label="Moeda Compatível"><SaSelect v-model="bank.currency" :options="bankCurrencyOptions" /></SaField>
              <SaField label="Chave Pix"><SaInput v-model="bank.pix" placeholder="CPF, e-mail, telefone ou chave aleatória" /></SaField>
              <SaField label="Observação" full>
                <SaInput v-model="bank.notes" type="textarea" :rows="2" placeholder="Informações sobre a conta bancária" />
              </SaField>
            </div>
            <q-btn outline no-caps class="sa-btn sa-btn--outline full-width" @click="addBank">
              <Landmark :size="16" class="q-mr-sm" /> Adicionar Conta Bancária
            </q-btn>
            <ul v-if="banks.length" class="ccf__bank-list">
              <li v-for="(b, i) in banks" :key="i">
                <Landmark :size="14" /> {{ b.name || 'Banco' }} · Ag {{ b.agency || '—' }} · Conta {{ b.account || '—' }}
              </li>
            </ul>
          </div>

          <!-- 6. Documentos -->
          <div v-else-if="step === 6" class="ccf__section">
            <div class="ccf__note ccf__note--amber">
              Cliente pode ser cadastrado com documentos pendentes, mas ficará com status "Em análise".
            </div>
            <h4 class="ccf__h4">Documentos para {{ customerType === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física' }}</h4>
            <div class="ccf__docs">
              <div v-for="doc in requiredDocs" :key="doc" class="ccf__doc">
                <div class="ccf__doc-info">
                  <Upload :size="20" class="text-slate-400" />
                  <div>
                    <p class="ccf__doc-name">{{ doc }}</p>
                    <p class="ccf__doc-hint">PDF, PNG ou JPG</p>
                  </div>
                </div>
                <q-file
                  v-model="files[doc]"
                  outlined
                  dense
                  class="sa-control ccf__file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  label="Escolher arquivo"
                  hide-bottom-space
                />
              </div>
            </div>
          </div>

          <!-- 7. Acesso -->
          <div v-else-if="step === 7" class="ccf__section">
            <div>
              <div class="ccf__label-lg">Criar Acesso para o Cliente</div>
              <SaSelect v-model="form.createAccess" :options="accessOptions" />
            </div>
            <div v-if="form.createAccess" class="ccf__subsection">
              <SaField label="E-mail de Acesso *">
                <SaInput v-model="form.accessEmail" type="email" placeholder="email@cliente.com" />
              </SaField>
              <h4>Permissões da Área do Cliente</h4>
              <div class="ccf__perms">
                <div v-for="p in permissionRows" :key="p.key" class="ccf__perm">
                  <div>
                    <p class="ccf__doc-name">{{ p.title }}</p>
                    <p class="ccf__doc-hint">{{ p.description }}</p>
                  </div>
                  <SaSelect v-model="form[p.key]" :options="yesNoOptions" width="100px" />
                </div>
              </div>
            </div>
          </div>

          <!-- 8. Resumo -->
          <div v-else class="ccf__section ccf__section--wide">
            <div class="ccf__note ccf__note--blue">
              <strong>Revise as informações antes de cadastrar.</strong> Você poderá editar posteriormente.
            </div>
            <div class="ccf__summary">
              <div v-for="card in summary" :key="card.title" class="ccf__summary-card">
                <h4>{{ card.title }}</h4>
                <div v-for="row in card.rows" :key="row.label" class="ccf__summary-row">
                  <span class="text-slate-500">{{ row.label }}</span>
                  <span v-if="row.badge" class="sa-badge" :class="row.badge === 'solid' ? 'ccf__badge-solid' : 'sa-badge--outline'">{{ row.value }}</span>
                  <span v-else class="ccf__summary-value">{{ row.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer class="ccf__footer">
          <q-btn outline no-caps class="sa-btn sa-btn--outline" :disable="step === 1" @click="step--">
            <ChevronLeft :size="16" class="q-mr-sm" /> Anterior
          </q-btn>
          <div class="ccf__footer-actions">
            <template v-if="step === STEPS.length">
              <q-btn outline no-caps class="sa-btn sa-btn--outline" label="Cancelar" @click="close" />
              <q-btn outline no-caps class="sa-btn sa-btn--outline" label="Salvar como Rascunho" @click="saveDraft" />
              <q-btn unelevated no-caps class="sa-btn ccf__submit" :loading="saving" @click="submit">
                <CheckCircle2 :size="16" class="q-mr-sm" /> Cadastrar Cliente
              </q-btn>
            </template>
            <q-btn v-else unelevated no-caps class="sa-btn ccf__next" :disable="step === 1 && !customerType" @click="step++">
              Próximo <ChevronRight :size="16" class="q-ml-sm" />
            </q-btn>
          </div>
        </footer>
      </section>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Key,
  Landmark,
  Shield,
  Upload,
  User,
  Wallet,
  X,
} from 'lucide-vue-next';
import SaField from 'components/ui/SaField.vue';
import SaInput from 'components/ui/SaInput.vue';
import SaSelect, { type SaOption } from 'components/ui/SaSelect.vue';
import { createCustomer } from 'src/services/customers.service';
import { trackEvent } from 'boot/gtag';

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{ created: [id: string] }>();
const $q = useQuasar();

const STEPS = [
  { id: 1, name: 'Tipo de Cliente', icon: User },
  { id: 2, name: 'Classificação', icon: Shield },
  { id: 3, name: 'Compliance/KYC', icon: FileCheck },
  { id: 4, name: 'Carteiras', icon: Wallet },
  { id: 5, name: 'Dados Bancários', icon: Landmark },
  { id: 6, name: 'Documentos', icon: Upload },
  { id: 7, name: 'Acesso', icon: Key },
  { id: 8, name: 'Resumo', icon: CheckCircle2 },
];

const STEP_DESCRIPTIONS = [
  'Defina se o cliente é Pessoa Física ou Jurídica',
  'Configure classificação e assessor responsável',
  'Defina perfil de risco e compliance',
  'Carteiras automáticas e moeda-base',
  'Cadastre contas bancárias do cliente',
  'Faça upload dos documentos necessários',
  'Configure acesso à Área do Cliente',
  'Revise as informações antes de cadastrar',
];

const typeCards = [
  { value: 'PF' as const, icon: User, title: 'Pessoa Física', subtitle: 'CPF, RG, dados pessoais' },
  { value: 'PJ' as const, icon: Building2, title: 'Pessoa Jurídica', subtitle: 'CNPJ, dados empresariais' },
];

const initialForm = () => ({
  fullName: '', cpf: '', rg: '', birthDate: '', email: '', phone: '', address: '',
  nationality: 'Brasileiro', maritalStatus: '', profession: '', monthlyIncome: '', declaredAssets: '',
  companyName: '', tradeName: '', cnpj: '', stateRegistration: '', cityRegistration: '',
  corporateEmail: '', corporatePhone: '', corporateAddress: '', mainCnae: '', monthlyRevenue: '',
  companyCash: '', legalRepresentative: '', legalRepCpf: '',
  classification: '', status: 'Em análise', advisor: '', origin: '', commercialNotes: '',
  docLevel: '1', complianceStatus: 'Pendente', riskProfile: 'Médio', resourceOrigin: '',
  isPep: false, restrictions: '', complianceNotes: '',
  baseCurrency: 'BRL',
  createAccess: false, accessEmail: '',
  allowViewWallets: true, allowViewContracts: true, allowViewStatements: true, allowRequests: false,
});

const step = ref(1);
const customerType = ref<'PF' | 'PJ' | null>(null);
const form = reactive(initialForm());
const saving = ref(false);

const emptyBank = () => ({ name: '', agency: '', account: '', type: '', currency: '', pix: '', notes: '' });
const bank = reactive(emptyBank());
const banks = ref<ReturnType<typeof emptyBank>[]>([]);
const files = reactive<Record<string, File | null>>({});

function addBank() {
  banks.value.push({ ...bank });
  Object.assign(bank, emptyBank());
}

function reset() {
  step.value = 1;
  customerType.value = null;
  Object.assign(form, initialForm());
  Object.assign(bank, emptyBank());
  banks.value = [];
  for (const k of Object.keys(files)) delete files[k];
}

watch(open, (v) => {
  if (!v) reset();
});

function close() {
  open.value = false;
}

// ---- opções ----
const maritalOptions: SaOption[] = [
  { label: 'Solteiro(a)', value: 'solteiro' },
  { label: 'Casado(a)', value: 'casado' },
  { label: 'Divorciado(a)', value: 'divorciado' },
  { label: 'Viúvo(a)', value: 'viuvo' },
];
const classificationOptions: SaOption[] = [
  { label: 'Standard', value: 'standard' },
  { label: 'Private', value: 'private' },
  { label: 'Alta Renda', value: 'alta-renda' },
  { label: 'Estratégico', value: 'estrategico' },
  { label: 'Institucional', value: 'institucional' },
];
const statusOptions: SaOption[] = ['Ativo', 'Em análise', 'Bloqueado', 'Inativo'].map((v) => ({ label: v, value: v }));
const advisorOptions: SaOption[] = [
  { label: 'Mariana Alencar', value: 'mariana' },
  { label: 'Carlos Monteiro', value: 'carlos' },
  { label: 'Paula Silva', value: 'paula' },
];
const originOptions: SaOption[] = [
  { label: 'Indicação', value: 'indicacao' },
  { label: 'Tráfego Pago', value: 'trafego' },
  { label: 'Parceiro', value: 'parceiro' },
  { label: 'Prospecção Direta', value: 'prospeccao' },
  { label: 'Base Interna', value: 'base' },
  { label: 'Outro', value: 'outro' },
];
const docLevelOptions: SaOption[] = [
  { label: 'Nível 1', value: '1' },
  { label: 'Nível 2', value: '2' },
  { label: 'Nível 3 (Completo)', value: '3' },
];
const complianceStatusOptions: SaOption[] = ['Pendente', 'Em análise', 'Aprovado', 'Reprovado'].map((v) => ({ label: v, value: v }));
const riskOptions: SaOption[] = ['Baixo', 'Médio', 'Alto'].map((v) => ({ label: v, value: v }));
const noYesOptions: SaOption[] = [
  { label: 'Não', value: false },
  { label: 'Sim', value: true },
];
const yesNoOptions: SaOption[] = [
  { label: 'Sim', value: true },
  { label: 'Não', value: false },
];
const accessOptions: SaOption[] = [
  { label: 'Não criar acesso', value: false },
  { label: 'Sim, criar acesso', value: true },
];
const currencyOptions: SaOption[] = [
  { label: 'BRL - Real Brasileiro', value: 'BRL' },
  { label: 'USD - Dólar Americano', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'USDT - Tether', value: 'USDT' },
];
const bankTypeOptions: SaOption[] = [
  { label: 'Corrente', value: 'corrente' },
  { label: 'Poupança', value: 'poupanca' },
  { label: 'Pagamento', value: 'pagamento' },
  { label: 'Internacional', value: 'internacional' },
  { label: 'Cripto', value: 'cripto' },
];
const bankCurrencyOptions: SaOption[] = ['BRL', 'USD', 'EUR'].map((v) => ({ label: v, value: v }));

const permissionRows = [
  { key: 'allowViewWallets' as const, title: 'Visualizar Carteiras', description: 'Cliente pode ver saldos e movimentações' },
  { key: 'allowViewContracts' as const, title: 'Visualizar Contratos', description: 'Cliente pode ver seus contratos ativos' },
  { key: 'allowViewStatements' as const, title: 'Visualizar Extratos', description: 'Cliente pode baixar extratos e relatórios' },
  { key: 'allowRequests' as const, title: 'Fazer Solicitações', description: 'Cliente pode solicitar saques, aportes, etc.' },
];

const requiredDocs = computed(() =>
  customerType.value === 'PJ'
    ? [
        'Cartão CNPJ',
        'Contrato social',
        'Última alteração contratual',
        'Documento dos sócios/representantes',
        'Comprovante de endereço',
        'Declaração de origem dos recursos',
        'Contrato assinado',
      ]
    : [
        'Documento com foto',
        'Comprovante de residência',
        'Comprovante de renda',
        'Declaração de origem dos recursos',
        'Contrato assinado',
      ],
);

const labelOf = (opts: SaOption[], v: unknown) => opts.find((o) => o.value === v)?.label;

const summary = computed(() => {
  const pf = customerType.value === 'PF';
  return [
    {
      title: 'Dados Principais',
      rows: [
        { label: 'Tipo:', value: pf ? 'Pessoa Física' : 'Pessoa Jurídica' },
        { label: 'Nome:', value: pf ? form.fullName : form.companyName },
        { label: 'Documento:', value: pf ? form.cpf : form.cnpj },
        { label: 'E-mail:', value: pf ? form.email : form.corporateEmail },
      ],
    },
    {
      title: 'Classificação',
      rows: [
        { label: 'Classificação:', value: labelOf(classificationOptions, form.classification) ?? 'Não definida' },
        { label: 'Status:', value: form.status, badge: 'solid' },
        { label: 'Assessor:', value: labelOf(advisorOptions, form.advisor) ?? 'Não definido' },
      ],
    },
    {
      title: 'Compliance',
      rows: [
        { label: 'Nível Doc.:', value: `Nível ${form.docLevel}` },
        { label: 'Status:', value: form.complianceStatus, badge: 'outline' },
        { label: 'Risco:', value: form.riskProfile },
        { label: 'PEP:', value: form.isPep ? 'Sim' : 'Não' },
      ],
    },
    {
      title: 'Carteiras e Acesso',
      rows: [
        { label: 'Moeda-base:', value: form.baseCurrency },
        { label: 'Carteiras:', value: 'Livre + Aplicada' },
        { label: 'Acesso cliente:', value: form.createAccess ? 'Sim' : 'Não' },
      ],
    },
  ];
});

async function submit() {
  if (!customerType.value) return;
  saving.value = true;
  try {
    const { id } = await createCustomer({ type: customerType.value, ...form, bankAccounts: banks.value });
    trackEvent('customer_created', { type: customerType.value });
    $q.notify({ type: 'positive', message: 'Cliente cadastrado com sucesso.' });
    emit('created', id);
    close();
  } catch {
    $q.notify({ type: 'negative', message: 'Não foi possível cadastrar o cliente.' });
  } finally {
    saving.value = false;
  }
}

function saveDraft() {
  $q.notify({ message: 'Rascunho salvo.' });
}
</script>

<style scoped lang="scss">
.ccf {
  width: 1024px;
  max-width: 95vw !important;
  height: 90vh;
  max-height: 90vh !important;
  background: #fff;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  &__steps {
    width: 256px;
    flex-shrink: 0;
    background: var(--slate-50);
    border-right: 1px solid var(--slate-200);
    padding: 24px;
    overflow-y: auto;
  }

  &__steps-head {
    margin-bottom: 24px;
    h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--slate-900);
      margin: 0 0 4px;
      line-height: 1.5;
    }
    p {
      font-size: 12px;
      color: var(--slate-500);
      margin: 0;
    }
  }

  &__steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid var(--slate-200);
    transition: all 0.15s;

    &--todo {
      opacity: 0.5;
    }
    &--active {
      background: var(--blue-50);
      border-color: var(--blue-200);
    }
  }

  &__step-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--slate-200);
    color: var(--slate-400);
    flex-shrink: 0;

    .ccf__step--active & {
      background: var(--blue-600);
      color: #fff;
    }
    .ccf__step--done & {
      background: var(--green-600);
      color: #fff;
    }
  }

  &__step-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--slate-400);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .ccf__step--active & {
      color: #1e3a8a;
    }
    .ccf__step--done & {
      color: var(--slate-700);
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__header {
    border-bottom: 1px solid var(--slate-200);
    padding: 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    h2 {
      font-size: 20px;
      line-height: 28px;
      font-weight: 700;
      color: var(--slate-900);
      margin: 0;
    }
    p {
      font-size: 14px;
      color: var(--slate-500);
      margin: 4px 0 0;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  &__section {
    max-width: 672px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    &--wide {
      max-width: 768px;
    }
  }

  &__subsection {
    padding-top: 16px;
    border-top: 1px solid var(--slate-200);
    display: flex;
    flex-direction: column;
    gap: 16px;
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--slate-900);
      margin: 0;
      line-height: 1.5;
    }
  }

  &__h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--slate-900);
    margin: 0;
  }

  &__label-lg {
    font-size: 16px;
    font-weight: 600;
    color: var(--slate-900);
    margin-bottom: 12px;
  }

  &__hint {
    font-size: 12px;
    color: var(--slate-500);
    margin: -4px 0 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  &__type-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  &__type {
    padding: 24px;
    border: 2px solid var(--slate-200);
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    text-align: center;
    font: inherit;
    transition: all 0.15s;
    &:hover {
      border-color: var(--slate-300);
    }
    &--active,
    &--active:hover {
      border-color: var(--blue-500);
      background: var(--blue-50);
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--slate-900);
      margin: 0 0 4px;
      line-height: 1.5;
    }
    p {
      font-size: 12px;
      color: var(--slate-500);
      margin: 0;
    }
  }

  &__type-icon {
    color: var(--blue-600);
    margin: 0 auto 12px;
    display: block;
  }

  &__note {
    border-radius: 8px;
    padding: 16px;
    font-size: 14px;
    &--blue {
      background: var(--blue-50);
      border: 1px solid var(--blue-200);
      color: var(--blue-800);
    }
    &--amber {
      background: var(--amber-50);
      border: 1px solid var(--amber-200);
      color: #92400e;
    }
  }

  &__wallets {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__wallet {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 10px;
    border: 1px solid;

    &--green {
      --w: var(--green-600);
      background: var(--green-50);
      border-color: var(--green-200);
    }
    &--indigo {
      --w: #4f46e5;
      background: #eef2ff;
      border-color: #c7d2fe;
    }
  }

  &__wallet-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--w);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__wallet-text {
    flex: 1;
    h5 {
      font-size: 14px;
      font-weight: 600;
      color: var(--slate-900);
      margin: 0;
    }
    p {
      font-size: 12px;
      color: var(--slate-600);
      margin: 4px 0 0;
    }
  }

  &__wallet-badge {
    background: var(--w);
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    padding: 2px 8px;
  }

  &__bank-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--slate-600);
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 6px;
      padding: 6px 10px;
    }
  }

  &__docs,
  &__perms {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__doc,
  &__perm {
    border: 1px solid var(--slate-200);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__perm {
    padding: 12px;
  }

  &__doc-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__doc-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--slate-900);
    margin: 0;
  }

  &__doc-hint {
    font-size: 12px;
    color: var(--slate-500);
    margin: 0;
  }

  &__file {
    max-width: 200px;
    width: 200px;
    :deep(.q-field__label) {
      font-size: 13px;
      top: 9px;
    }
  }

  &__summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  &__summary-card {
    border: 1px solid var(--slate-200);
    border-radius: 10px;
    padding: 16px;
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--slate-900);
      margin: 0 0 12px;
    }
  }

  &__summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    & + & {
      margin-top: 8px;
    }
  }

  &__summary-value {
    font-weight: 500;
  }

  &__badge-solid {
    background: #030213;
    color: #fff;
  }

  &__footer {
    border-top: 1px solid var(--slate-200);
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__footer-actions {
    display: flex;
    gap: 12px;
  }

  &__next {
    background: #030213;
    color: #fff;
  }

  &__submit {
    background: var(--blue-600);
    color: #fff;
    &:hover {
      background: var(--blue-700);
    }
  }
}
</style>
