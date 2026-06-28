# Plano de contas - etapa 2026-06-28

## Rota

- A entrada `Configuracoes -> Plano de contas` foi ligada na rota protegida existente `/admin/configuracoes/plano-contas`.

## Barra superior do modulo

- A barra do modulo foi conectada ao mesmo slot estrutural `terra-shell-band` do shell admin.
- Comandos entregues nesta etapa:
  - `Novo grupo`
  - `Nova categoria`
  - `Alterar`
  - `Detalhes`
  - `Preferencias`
  - `Imprimir`

## Grade principal

- A grade principal foi criada com colunas para grupo/categoria, descricao, tributavel, carne leao e codigo interno.
- Como ainda nao existe base pronta deste dominio no backend atual, a tabela permanece como placeholder controlado sem inventar registros falsos.
- O rodape ja traz `Visualizar inativos` e `Total de registros`.

## Estado funcional

- Funcional nesta etapa:
  - rota protegida real
  - barra superior operacional no shell
  - grade principal e rodape
- Preparado para proximas etapas:
  - persistencia real
  - cadastro/edicao
  - detalhes
  - preferencias
  - impressao real
