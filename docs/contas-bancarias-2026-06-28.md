# Contas bancarias - etapa 2026-06-28

## Rota

- A entrada `Configuracoes -> Contas bancarias` foi ligada na rota protegida `/admin/configuracoes/contas-bancarias`.

## Barra superior

- O modulo usa a mesma faixa operacional `terra-shell-band` do shell admin.
- Comandos entregues na barra:
  - `Nova conta`
  - `Alterar`
  - `Detalhes`

## Grade principal

- A tela foi estruturada como grade/listagem central, sem hero interno e sem card de cabecalho.
- Colunas montadas nesta etapa:
  - `Nome da conta/caixa`
  - `Nome do prestador`
  - `Banco`
  - `Agencia`
  - `Conta`

## Rodape da grade

- O rodape segue a mesma logica operacional das outras telas internas:
  - `Visualizar inativos`
  - `Total de registros`

## Estado funcional

- Funcional nesta etapa:
  - rota protegida real
  - barra operacional unida ao shell
  - grade principal
  - selecao de linha
  - placeholders controlados para `Nova conta`, `Alterar` e `Detalhes`
- Preparado para evolucao:
  - fonte real de contas bancarias
  - dados de banco, agencia, conta e prestador vindos do backend
  - acoes reais de cadastro, edicao e detalhes
