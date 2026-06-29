# Tabelas auxiliares - etapa 2026-06-28

## Rota

- A entrada `Configuracoes -> Tabelas auxiliares` foi ligada na rota protegida `/admin/configuracoes/tabelas-auxiliares`.

## Barra superior

- O modulo usa o mesmo slot `terra-shell-band` do shell admin.
- Comandos entregues nesta etapa:
  - `Novo motivo`
  - `Editar`

## Painel lateral interno

- Foi criado um painel lateral interno com a lista inicial de tabelas auxiliares:
  - Motivos de agendamento
  - Tipos de indicacao
  - Motivos de retorno
  - Situacoes de agendamento
  - Segmentos de fornecedor
  - Formas de pagamento
  - Especialidades
  - Fases de procedimento
  - Grupos de material
  - Motivos de finalizacao do tratamento
  - Solucoes irrigadoras
  - Cimentos obturadores
  - Limas memorias
  - Sistemas de instrumentacao
  - Medicacoes intracanais
  - Ocupacao/profissao do paciente

## Grade principal

- A grade principal foi montada a direita com colunas `Codigo`, `Nome` e `Descricao`.
- Como ainda nao existe base pronta desse dominio no backend atual, a tabela foi deixada como placeholder controlado por item selecionado, sem inventar registros falsos.

## Estado funcional

- Funcional nesta etapa:
  - rota protegida real
  - barra operacional no shell
  - painel lateral interno com selecao
  - grade principal e rodape
- Ajuste complementar:
  - o comando `Novo motivo` agora abre o modal `Novo motivo de agendamento`
  - campos incluidos: `Codigo`, `Nome`, `Descricao`, `Tipo`, `Cor` e `Compromisso produtivo`
  - `Tipo` ficou como seletor controlado com valor inicial `Agendamento`
  - `Cor` passou a usar uma grade simples de cores selecionaveis
  - `Gravar motivo` faz validacao e submit controlado, sem persistencia real nesta rodada
- Preparado para evolucao:
  - dados reais por tabela auxiliar
  - cadastro e edicao persistentes
