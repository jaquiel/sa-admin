import type { RouteRecordRaw } from 'vue-router';

/**
 * Todas as páginas são carregadas sob demanda (import dinâmico → um chunk por página).
 * meta.public: não exige login · meta.permission: permissão exigida (localStorage SA_permissions)
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/auth/LoginPage.vue'),
    meta: { public: true, title: 'Entrar' },
  },
  {
    path: '/sistemas',
    name: 'select-system',
    component: () => import('pages/system/SelectSystemPage.vue'),
    meta: { title: 'Selecionar Sistema' },
  },
  {
    path: '/landing-page',
    component: () => import('layouts/LandingEditorLayout.vue'),
    children: [
      {
        path: '',
        name: 'landing-editor',
        component: () => import('pages/landing/LandingPageEditorPage.vue'),
        meta: { title: 'Edição de Landing Page', permission: 'landing:edit' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: { name: 'customers' },
    children: [
      {
        path: 'clientes',
        name: 'customers',
        component: () => import('pages/customers/SelectCustomerPage.vue'),
        meta: { title: 'Clientes', menu: 'customers', permission: 'customers:read' },
      },
      {
        path: 'clientes/:id',
        name: 'customer-profile',
        component: () => import('pages/customers/CustomerProfilePage.vue'),
        props: true,
        meta: { title: 'Perfil do Cliente', menu: 'customers', permission: 'customers:read' },
      },
      {
        path: 'contratos',
        name: 'contracts',
        component: () => import('pages/contracts/ContractsListPage.vue'),
        meta: { title: 'Contratos', menu: 'contracts', permission: 'contracts:read' },
      },
      {
        path: 'contratos/novo',
        name: 'contract-create',
        component: () => import('pages/contracts/CreateContractPage.vue'),
        meta: { title: 'Novo Contrato', menu: 'contracts', permission: 'contracts:write' },
      },
      {
        path: 'contratos/:id',
        name: 'contract-detail',
        component: () => import('pages/contracts/ContractDetailPage.vue'),
        props: true,
        meta: { title: 'Contrato', menu: 'contracts', permission: 'contracts:read' },
      },
      {
        path: 'contratos/:id/logica',
        name: 'contract-logic',
        component: () => import('pages/contracts/ContractLogicPage.vue'),
        props: true,
        meta: { title: 'Lógica do Contrato', menu: 'contracts', permission: 'contracts:read' },
      },
      {
        path: 'logicas',
        name: 'logics',
        component: () => import('pages/logics/LogicsPage.vue'),
        meta: { title: 'Lógicas', menu: 'logics', permission: 'logics:read' },
      },
      {
        path: 'transacoes',
        name: 'transactions',
        component: () => import('pages/transactions/TransactionsPage.vue'),
        meta: { title: 'Transações', menu: 'transactions', permission: 'transactions:read' },
      },
      {
        path: 'credito',
        name: 'credit',
        component: () => import('pages/credit/CreditPage.vue'),
        meta: { title: 'Crédito', menu: 'credit', permission: 'credit:read' },
      },
      {
        path: 'comunicados',
        name: 'communication',
        component: () => import('pages/communication/CommunicationPage.vue'),
        meta: { title: 'Comunicados', menu: 'communication', permission: 'communication:read' },
      },
      {
        path: 'configuracoes',
        name: 'settings',
        component: () => import('pages/settings/SettingsPage.vue'),
        meta: { title: 'Configurações', menu: 'settings' },
      },
      {
        path: 'sem-permissao',
        name: 'forbidden',
        component: () => import('pages/ForbiddenPage.vue'),
        meta: { title: 'Acesso negado' },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { public: true },
  },
];

export default routes;
