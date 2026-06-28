# Fluxo de caixa - etapa 2026-06-28

## Rota

- A entrada `Financeiro -> Fluxo de caixa` foi ligada na rota protegida `/admin/financeiro/fluxo-de-caixa`.

## Barra superior

- O modulo usa a mesma faixa operacional `terra-shell-band` do shell admin.
- Comandos entregues a esquerda:
  - `Novo`
  - `Alterar`
  - `Excluir`
  - `Detalhes`
- Controles preparados a direita:
  - conta/caixa atual
  - periodo
  - data inicial
  - data final
  - pesquisar
  - icones auxiliares

## Grade principal

- A grade principal foi montada com colunas para data, pagador/fornecedor, categoria, descricao, tipo, numero, pag, valor e saldo.
- Como ainda nao existe base real pronta de movimentacoes no backend atual, a tabela foi deixada como placeholder controlado sem inventar dados falsos.

## Abas e rodape

- A estrutura de abas foi preparada com `Movimentacao` ativa e `Painel` pronta para evolucao futura.
- O rodape foi tratado como area de totais com `Total de receitas`, `Total de despesas` e `Resultado total`, todos preparados para calculo futuro.

## Estado funcional

- Funcional nesta etapa:
  - rota protegida real
  - barra operacional no shell
  - controles de topo
  - grade principal
  - estrutura de abas
  - rodape de totais
- Preparado para evolucao:
  - leitura real de movimentacoes
  - persistencia
  - calculo de totais
