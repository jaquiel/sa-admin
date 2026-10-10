# Tasks

## Transactions

| O que está no mock | Endpoint no backend? | ToDo |
|---|---|---|
| ✔️ **Diálogo "Executar Transação"** (`internalWallets`) | ✅ Sim | Carteiras do cliente: `GET /admin/customers/{id}/wallets`. Criação: `POST /admin/transactions/deposits`, `/withdrawals`, `/wallet-transfers` e `/contract-operations`. |
| ✔️ **Painel operacional, fila de solicitações** (`opHistoryMock`) | 🟡 Parcial | A lista sai de `GET /admin/transactions?status=PendingValidation` (ou com `attentionRequired=true`). Aprovar ou rejeitar: `POST /admin/transactions/{id}/actions` (Validate, Approve, Reject, RequestCorrection, Execute, Cancel). O que não existe são os tipos **Mint**, **Burn** e **Liquidation** do mock. O backend só tem Deposit, Withdrawal, WalletTransfer e ContractOperation. |
| ✔️ **Painel, seleção de cliente e banco** (`opClientsDb`) | ✅ Sim | `GET /admin/customers/quick-search` (ou `/lookup`) e `GET /admin/customers/{id}/bank-accounts`. |
| **Painel, contratos para liquidar** (`contractsForLiquidation`) | 🟡 Parcial | `GET /admin/contracts` traz a lista com o capital atual, mas não existe uma operação de "liquidação". |
| **Painel, moedas para Mint** (`mintCurrencies`) | ❌ Não | A tabela `core.currencies` existe, mas não há endpoint admin para listar moedas. |
| **Cards do topo** (`financialSummary`: Total, Livre, Aplicada, Contratos) | ❌ Não | Não há endpoint com os saldos somados de todos os clientes nem com a cotação USD→BRL. Só existe o portfólio de um cliente por vez (`/admin/customers/{id}/portfolio`). |
| **Carteiras Livres / Aplicadas** (`freeWalletsMock`, `appliedWalletsMock`) | ❌ Não, para a lista geral | Só existe `GET /admin/customers/{id}/wallets`, de um cliente por vez. Daria para montar com `/admin/customers/cards` e uma chamada por cliente, mas fica lento com muitos clientes. |
| ✔️ **Carteira de Contratos** (`contractWalletsMock`) | 🟡 Parcial | Lista, busca e cards usam `GET /admin/contracts`. O que ficou faltando está no tópico Contratos. |

## Contratos

Pendências da Carteira de Contratos (`/transacoes/carteira-contratos`), que já usa `GET /admin/contracts`:

| O que falta | Endpoint no backend? | ToDo |
|---|---|---|
| **Performance em pontos e YTD** | ❌ Não | A tela mostra só a variação do capital atual sobre o inicial contratado. Falta um endpoint com a performance do contrato (pontos, %, desde o início e no ano). |
| **Valor em USD e BRL com cotação** | ❌ Não | O valor aparece só na moeda do contrato. Falta um endpoint de cotações (USD→BRL e USD→moeda do contrato) para mostrar o valor consolidado nas três moedas, como no layout original. |
| **Carteira de cada cliente no contrato** | 🟡 Parcial | A listagem traz só nome e tipo (PF/PJ) dos clientes. O detalhe `GET /admin/contracts/{id}` traz os participantes com valor alocado; dá para mostrar no clique, sem uma chamada por contrato na lista. |
| **Conta vinculada ao contrato** | ❌ Não | O layout original tinha um campo "Conta" (ex.: Carteira A). A API não tem esse dado; no lugar mostro o motor principal (`primaryEngine`). |
| **Capital atual do contrato** | ❌ Não | `GET /admin/contracts` devolve `currentCapital: null` fixo (ainda não existe saldo do contrato). A tela mostra "—" no capital atual e "Capital atual ainda não disponível" na variação. |

Telas de Contratos (`/contratos`): lista, detalhe e criação já usam a API (`GET/PATCH /admin/contracts`, `/status`, `/participants`, `/drafts`, `/finalize` e o catálogo). O que continua mock:

| O que falta | Endpoint no backend? | ToDo |
|---|---|---|
| **Lógica Contratual** (`/contratos/:id/logica`) e cards de lógica/dividendos no detalhe | ❌ Não | Não há módulo de lógicas no backend. No detalhe os cards ficam só leitura e com aviso de "dados de exemplo". |
| **Histórico de aportes e tabela de performance** no detalhe | ❌ Não | Sem endpoints de aportes/performance do contrato. Aparecem com aviso de "dados de exemplo". |
| **Editar rascunho** | ✅ Sim | `PUT /admin/contracts/{id}/draft` existe (substitui o rascunho inteiro), mas o detalhe só oferece "Finalizar" para rascunhos. Falta a tela de edição do rascunho. |
| **Lista de moedas** | ❌ Não | A criação usa os ids fixos do seed do backend (BRL, USD, EUR — as únicas ativas). Falta um endpoint de moedas. |
| **Valor alocado ao adicionar cliente em contrato já criado** | 🟡 Parcial | `POST /participants` aceita `allocatedAmount`, mas a edição do detalhe ainda vincula sem valor. |
