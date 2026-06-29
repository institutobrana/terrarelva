# Tabelas auxiliares - etapa 2026-06-28

## Rota

- A entrada `Configuracoes -> Tabelas auxiliares` foi ligada na rota protegida `/admin/configuracoes/tabelas-auxiliares`.

## Barra superior

- O modulo usa o mesmo slot `terra-shell-band` do shell admin.
- O botao de criacao nao e fixo para a tela inteira.
- A barra superior agora muda conforme a tabela auxiliar selecionada na lateral.
- Lista lateral final valida para o Terra Relva:
  - `Motivos de agendamento` -> `Novo motivo`
  - `Situacoes de agendamento` -> `Nova situacao`
  - `Tipos de indicacao` -> `Novo tipo`
  - `Segmentos de fornecedor` -> `Novo segmento`
  - `Formas de pagamento` -> `Nova forma`
  - `Grupos de material` -> `Novo grupo`
  - `Ocupacao/profissao do cliente` -> `Nova ocupacao`

## Painel lateral interno

- A lateral foi ajustada para exibir somente as tabelas auxiliares validas do Terra Relva:
  - Motivos de agendamento
  - Situacoes de agendamento
  - Tipos de indicacao
  - Segmentos de fornecedor
  - Formas de pagamento
  - Grupos de material
- Ocupacao/profissao do cliente
- Tabelas removidas/ocultadas da lateral nesta etapa:
  - Motivos de retorno
  - Motivos de finalizacao do tratamento
  - Solucoes irrigadoras
  - Especialidades
  - Cimentos obturadores
  - Limas memorias
  - Sistemas de instrumentacao
  - Medicacoes intracanais
  - Fases de procedimento
- Ajuste de linguagem:
  - `Ocupacao/profissao do paciente` foi substituido por `Ocupacao/profissao do cliente`

## Grade principal

- A grade principal foi montada a direita com colunas `Codigo`, `Nome` e `Descricao`.
- Como ainda nao existe base pronta desse dominio no backend atual, a tabela foi deixada como placeholder controlado por item selecionado, sem inventar registros falsos.

## Estado funcional

- Funcional nesta etapa:
  - rota protegida real
  - barra operacional no shell
  - painel lateral interno com selecao
  - grade principal e rodape
- Persistencia real iniciada:
  - `Formas de pagamento` passou a usar banco de dados real
  - a lista agora pode ser carregada do backend
  - o modal pode criar e editar registros persistidos
- Ajuste de entendimento aplicado:
  - o botao `Novo...` e o modal aberto dependem da tabela selecionada
  - o modal de `Motivos de agendamento` deixou de ser tratado como universal
- Motivos de agendamento:
  - abre `Novo motivo de agendamento`
  - campos incluidos: `Codigo`, `Nome`, `Descricao`, `Tipo`, `Cor` e `Compromisso produtivo`
  - `Tipo` possui exatamente `Agendamento` e `Compromisso`
  - quando `Tipo = Agendamento`, a paleta fica apagada/desabilitada, `Cor` deixa de ser obrigatoria e `Compromisso produtivo` fica desabilitado e desmarcado
  - quando `Tipo = Compromisso`, a paleta fica habilitada com 44 cores em 3 linhas (15 + 15 + 14), `Cor` passa a ser obrigatoria e `Compromisso produtivo` fica marcado por padrao, mas pode ser desmarcado
- Segmentos de fornecedor:
  - abre `Novo segmento de fornecedor`
  - campos incluidos: `Codigo`, `Nome` e `Descricao`
  - nao exibe `Tipo`, `Cor` nem `Compromisso produtivo`
- Situacoes de agendamento:
  - abre `Nova situacao de agendamento`
  - campos incluidos: `Codigo`, `Nome`, `Descricao`, `Historico`, `Cor`, `Ocultar agendamento` e `Considerar falta do cliente`
  - nao exibe `Tipo` nem `Compromisso produtivo`
  - reutiliza a mesma paleta de 44 cores em 3 linhas usada por `Motivos de agendamento`
  - os checkboxes iniciam desmarcados
- Formas de pagamento:
  - abre `Nova forma de pagamento`
  - persiste `id`, `codigo`, `nome`, `descricao`, `ativo`, `criadoEm` e `atualizadoEm`
  - `Nome` e obrigatorio
  - `Codigo` pode ser manual; quando vazio, o backend gera codigo automatico simples no formato `FP-001`
  - `Descricao` e opcional
  - a lista da tela carrega dados reais do backend
  - a acao `Editar` foi ligada para abrir o modal preenchido e salvar alteracoes
  - recebeu carga inicial padrao via seed idempotente
  - a coluna `Descricao` permanece vazia nos registros padrao
  - novo cadastro nasce ativo automaticamente
  - o checkbox `Forma de pagamento ativa` aparece apenas na edicao
  - a edicao grava os dados basicos via `PUT` e o status via `PATCH /status` quando houver mudanca
  - a lista recarrega do backend apos salvar para refletir o estado persistido
  - o modal `Alterar forma de pagamento` volta a abrir preenchido com o item selecionado
- Paleta de cores:
  - foi centralizada em uma constante reutilizavel com 44 cores
  - usada por `Motivos de agendamento` quando `Tipo = Compromisso`
  - usada tambem por `Situacoes de agendamento`
- Persistencia:
  - nao foi usado `localStorage`
  - o backend segue o padrao atual do projeto com `pg`, migrations SQL e camada `repository/service`
  - nesta etapa foi implementada persistencia real apenas para `Formas de pagamento`
  - tabelas auxiliares simples devem seguir o padrao: `id`, `codigo`, `nome`, `descricao`, `ativo`, `criadoEm`, `atualizadoEm`
  - tabelas com campos especificos permanecem separadas:
    - `Motivos de agendamento`: `tipo`, `cor`, `compromissoProdutivo`
    - `Situacoes de agendamento`: `historico`, `cor`, `ocultarAgendamento`, `considerarFaltaCliente`
- Status visual e filtros:
  - a grade passou a separar colunas tecnicas finais em `Cor`, `Bloqueio` e `Status`
  - em `Formas de pagamento`, a grade fica: `Codigo | Nome | Descricao | Bloqueio | Status`
  - em `Motivos de agendamento` e `Situacoes de agendamento`, a grade fica: `Codigo | Nome | Descricao | Cor | Bloqueio | Status`
  - a coluna `Cor` aparece somente nas tabelas que realmente usam cor
  - itens ativos usam bolinha verde
  - itens inativos usam bolinha vermelha
  - o status fica alinhado na ultima coluna da direita
  - o cabecalho de `Codigo`, `Nome` e `Descricao` ganhou menu compacto no estilo EasyDental com:
    - `Ordem Ascendente`
    - `Ordem Descendente`
    - `Colunas`
    - selecao de colunas visiveis
  - em `Formas de pagamento`, o menu `Colunas` mostra `Codigo`, `Nome`, `Descricao`, `Bloqueio` e `Status`
  - em tabelas com cor, o menu `Colunas` tambem mostra `Cor`
  - o menu nao usa mais botoes grandes nem campo textual de filtro
- Preparado para evolucao:
  - ativacao/inativacao no frontend de `Formas de pagamento`
  - dados reais para as demais tabelas auxiliares
  - cadastro e edicao persistentes das tabelas ainda em placeholder
  - renomeacao tecnica interna de `considerarFaltaPaciente` para `considerarFaltaCliente`, se essa troca for feita no backend sem risco

## Backend desta etapa

- Migration criada:
  - `backend/src/db/migrations/004_create_payment_methods.sql`
- Tabela criada:
  - `payment_methods`
- Rotas/API criadas:
  - `GET /admin/auxiliary-tables/payment-methods`
  - `POST /admin/auxiliary-tables/payment-methods`
  - `PUT /admin/auxiliary-tables/payment-methods/:id`
  - `PATCH /admin/auxiliary-tables/payment-methods/:id/status`
- Camadas adicionadas:
  - `backend/src/repositories/paymentMethodsRepository.js`
  - `backend/src/services/paymentMethodsService.js`
- Seed adicionado:
  - `backend/src/scripts/seed-payment-methods.js`
  - comando: `npm run db:seed-payment-methods`

## Seed de formas de pagamento

- Registros padrao inseridos:
  - `BOL` -> `Boleto bancário`
  - `CHE` -> `Cheque`
  - `CON` -> `Débito em conta`
  - `CRE` -> `Cartão de crédito`
  - `DEB` -> `Cartão de débito`
  - `DIN` -> `Dinheiro`
  - `PIX` -> `Pix`
  - `PRE` -> `Cheque pré-datado`
  - `TER` -> `Cheque de terceiro`
  - `TRF` -> `Transferência`
- A descricao e salva vazia (`""`) para todos os registros padrao.
- O seed evita duplicidade usando `ON CONFLICT (code) DO UPDATE`.
- Se o codigo ja existir:
  - o nome e atualizado para o padrao esperado
  - a descricao e normalizada para vazia
  - o registro permanece ativo

## Como validar no navegador

1. Abrir `Configuracoes -> Tabelas auxiliares`.
2. Confirmar que a lateral exibe somente:
   - `Motivos de agendamento`
   - `Situacoes de agendamento`
   - `Tipos de indicacao`
   - `Segmentos de fornecedor`
   - `Formas de pagamento`
   - `Grupos de material`
   - `Ocupacao/profissao do cliente`
3. Confirmar que nao aparecem mais:
   - `Motivos de retorno`
   - `Motivos de finalizacao do tratamento`
   - `Solucoes irrigadoras`
   - `Especialidades`
   - `Cimentos obturadores`
   - `Limas memorias`
   - `Sistemas de instrumentacao`
   - `Medicacoes intracanais`
   - `Fases de procedimento`
4. Selecionar `Formas de pagamento` e confirmar o botao `Nova forma`.
5. Abrir o modal `Nova forma de pagamento`.
6. Preencher `Codigo: PIX`, `Nome: Pix` e `Descricao: Pagamento via Pix`.
7. Gravar e confirmar que o item aparece na lista.
8. Recarregar a pagina e confirmar que o registro continua visivel, vindo do banco.
9. Selecionar a linha, clicar em `Editar`, alterar os dados e confirmar persistencia apos novo carregamento.
10. Rodar `npm run db:seed-payment-methods` novamente e confirmar que nao aparecem duplicados na lista.
11. Editar um item ativo, desmarcar `Forma de pagamento ativa`, gravar e confirmar bolinha vermelha apos recarregar.
12. Editar novamente, marcar `Forma de pagamento ativa`, gravar e confirmar bolinha verde apos recarregar.
13. Selecionar uma linha, clicar em `Editar` e confirmar que o modal abre preenchido com o item selecionado.
14. Abrir o menu de cabecalho em `Codigo`, `Nome` ou `Descricao` e validar:
    - `Ordem Ascendente`
    - `Ordem Descendente`
    - menu `Colunas`
15. Ocultar `Descricao` e confirmar que a coluna some.
16. Reexibir `Descricao` e confirmar que a coluna volta.
17. Em `Formas de pagamento`, confirmar grade como `Codigo | Nome | Descricao | Bloqueio | Status`.
18. Em `Motivos de agendamento` e `Situacoes de agendamento`, confirmar grade como `Codigo | Nome | Descricao | Cor | Bloqueio | Status`.

## Como validar no backend

1. Rodar `npm run db:migrate`.
2. Rodar `npm run db:seed-payment-methods`.
3. Rodar o mesmo seed novamente e confirmar que continua existindo apenas um registro por codigo.
4. Validar a listagem de `Formas de pagamento` no banco ou pelo endpoint `GET /admin/auxiliary-tables/payment-methods`.
