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
