# Tabelas auxiliares - contrato tecnico

## Estrutura geral

- Backend em `repository/service` com PostgreSQL.
- Frontend React com uma pagina consolidada de configuracao.
- Endpoints separados por grupo:
  - `payment-methods`
  - `indication-types`
  - `supplier-segments`
  - `material-groups`
  - `manufacturers`
  - `measurement-units`
  - `occupations`
  - `appointment-reasons`
  - `appointment-statuses`

## Persistencia

- Tabelas simples usam os campos:
  - `id`
  - `code`
  - `name`
  - `description`
  - `is_active`
  - `created_at`
  - `updated_at`
- Tabelas de agendamento usam campos especificos de regra de negocio alem da base comum.

## Exclusao

- `payment-methods`, `indication-types`, `material-groups`, `manufacturers`, `measurement-units` e `occupations` podem ser excluidas diretamente quando permitidas pela interface.
- `supplier-segments` avalia uso em fornecedores antes da exclusao.
- `appointment-reasons` e `appointment-statuses` avaliam uso em agendamentos antes da exclusao.

## Navegacao

- A pagina usa lateral interna, grade principal e menu contextual por tabela.
- O componente de filtro de coluna foi extraido para reaproveitar o padrao visual.

