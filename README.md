# Strategy Analytics — Inserção de Dados (Admin)

Port do protótipo do Figma Make **"Inserção de dados (DESIGN)"** para a stack:

| Camada | Tecnologia |
|---|---|
| UI | Vue 3.5.22 + Quasar 2.18.5 (`@quasar/app-vite`, monta em `#q-app`) |
| Build | Vite — cada página é um chunk carregado sob demanda |
| Rotas / estado | Vue Router 4 (history) · Pinia 3 |
| HTTP | Axios com interceptors (Bearer + refresh com fila) |
| Gráficos | ApexCharts (`vue3-apexcharts`, registrado como `<apexchart>` assíncrono) |
| Analytics | Google Analytics 4 via `gtag` (page_view por rota + `trackEvent`) |
| Ícones | `lucide-vue-next` (mesmo set do protótipo) |

## Rodando

```bash
npm install
npm run dev        # http://localhost:9000
npm run build      # dist/spa
npm run typecheck  # vue-tsc
```

Variáveis de ambiente lidas no build por `quasar.config.ts → build.env` (ex.: `API_BASE_URL=https://api.exemplo.com npm run build`; valores em `.env.example`):

- `API_BASE_URL` — base da API (padrão `/api`; para o backend real use `/api/v1`)
- `API_PROXY_TARGET` — em `quasar dev`, repassa `/api` para este host (o backend não envia CORS). Ex.: `https://strategyanalytics.codebiz.com.br`. Atalho: `.\run.ps1` já usa esse backend; `.\run.ps1 -Mocks` usa os dados de exemplo
- `USE_MOCKS` — `true` usa os dados do protótipo sem backend (padrão `true`)
- `GA_MEASUREMENT_ID` — ID do GA4; vazio desliga o gtag

## Autenticação

- Cookies `SA_token` (1 dia), `SA_refresh` (30 dias) e `SA_user` (JSON), todos com `secure` e `sameSite=None` — `src/services/auth-storage.ts`.
- Permissões em `localStorage['SA_permissions']` como JSON puro.
- `router.beforeEach` exige sessão em toda rota sem `meta.public` e checa `meta.permission`; sem permissão → `/sem-permissao`.
- 401 dispara um único `POST {API_BASE_URL}/auth/refresh { refreshToken }` → `{ token, refreshToken? }`; se falhar, limpa a sessão e volta ao login com `?redirect=`.
- Contrato esperado do login: `POST /auth/login { email, password }` → `{ token, refreshToken, user, permissions[] }`.

> `sameSite=None` exige `secure`: em desenvolvimento use `localhost` (contexto seguro) ou HTTPS.

## Integração com a API

Endpoints conforme `strategy-analytics.postman_collection.json` / `/openapi/v1.json`. Respostas vêm em `{ data, success, errors }` (`services/api-envelope.ts`); escritas levam `Idempotency-Key` automaticamente.

| Tela | Endpoints |
|---|---|
| Login | `POST /auth/login` · `GET /auth/me` · `POST /auth/refresh` · `POST /auth/logout` |
| Sistemas | `GET /me/systems` |
| Clientes | `GET /admin/customers/cards` · `POST /admin/customers` (+ `PUT …/professional-profile`, `POST …/financial-profiles`) |
| Perfil — cabeçalho, financeiro, segurança, preferências, compliance | `GET /admin/customers/{id}/summary` · `PATCH …/status` · `PATCH …/preferences` · `GET …/timeline` |
| Perfil — identificação | `GET …/identification` |
| Perfil — documentação | `GET …/documents/grouped` |
| Perfil — contas bancárias | `GET/POST/PATCH …/bank-accounts` · `POST …/bank-accounts/{id}/archive` · `GET /admin/banks` |
| Perfil — carteira | `GET …/portfolio` · `GET …/portfolio/composition` · `GET …/statement/export` · `GET /admin/contracts?clientId=` · `GET /admin/transactions?clientId=` |
| Perfil — patrimônio | `GET/POST …/assets` · `POST …/assets/{id}/archive` · `GET …/assets/{id}/documents` |

Cada card do perfil lê sua seção de `stores/customer-profile.ts`; as seções carregam em paralelo e falham isoladamente. Com `USE_MOCKS=true` os serviços devolvem `mocks/customer-profile.ts`, no mesmo formato da API.

Enums que a collection não documenta (tipo PJ, `assetType`, tipos de imóvel/veículo/consórcio/investimento, tema `Dark`/`System`) usam PascalCase em inglês e estão concentrados em `components/customer-profile/assets/asset-request.ts`, `utils/labels.ts` e `services/customers.service.ts`.

## Estrutura

```
src/
  boot/          axios.ts · apexcharts.ts · gtag.ts
  router/        routes.ts (lazy) · index.ts (guards)
  stores/        auth · ui (sidebar) · customers
  services/      auth-storage · auth.service · customers.service
  layouts/       MainLayout (sidebar) · LandingEditorLayout
  pages/         auth · system · customers · contracts · logics · transactions · credit · communication · landing · settings
  components/
    ui/                SaField · SaInput · SaSelect · MoneyInput · UserAvatar · PendingModule
    customers/         CustomerBadge · DocLevelIndicator · CreateCustomerDialog (wizard 8 etapas)
    customer-profile/  cards do perfil + assets/ (acordeões e drawers de Imóvel, Veículo, Consórcio, Investimento)
  mocks/         dados do protótipo
```

## Status do port

| Tela (Figma Make) | Rota | Status |
|---|---|---|
| LoginScreen | `/login` | ✅ |
| SelectSystemScreen | `/sistemas` | ✅ |
| Layout com sidebar recolhível | `/` | ✅ |
| SelectCustomerScreen (cards/lista, filtros, ordenação) | `/clientes` | ✅ |
| CreateCustomerFlow (wizard 8 etapas) | modal em `/clientes` | ✅ |
| Perfil do cliente (todos os cards + 4 drawers de patrimônio) | `/clientes/:id` | ✅ |
| ContractsListScreen / ContractsScreen / CreateContract / ContractLogic | `/contratos…` | 🔜 rota criada |
| LogicsManager / CreateLogic / MotorEngine | `/logicas` | 🔜 rota criada |
| TransactionsScreen (+ views de carteiras) | `/transacoes` | 🔜 rota criada |
| CreditScreen | `/credito` | 🔜 rota criada |
| CommunicationScreen / AnnouncementsManager | `/comunicados` | 🔜 rota criada |
| LandingPageEditor / Viewer | `/landing-page` | 🔜 rota criada |

## Diferenças intencionais em relação ao protótipo

- Os selects de filtro da lista de clientes agora filtram de fato (no protótipo só a busca filtrava).
- Os totais do card "Documentação" são calculados a partir dos itens (o protótipo mostrava "12 / 2 / 1" fixos).
- Interruptores "Está quitado?", "Prazo determinado" e o status do consórcio habilitam/escondem os campos dependentes.
- O campo "Trocar cliente" do cabeçalho do perfil só aparece a partir de 1600px (em 1280px ele sobrepunha os indicadores).
- **Logo:** `src/assets/sa-logo.svg` é um placeholder. Substitua pelo `src/imports/SA.png` do Figma Make (o conector não expôs esse arquivo).
