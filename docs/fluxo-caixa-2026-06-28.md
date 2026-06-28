# Fluxo de caixa - etapa 2026-06-28

## Rota

- A entrada `Financeiro -> Fluxo de caixa` foi ligada na rota protegida `/admin/financeiro/fluxo-de-caixa`.

## Barra superior

- O modulo usa a mesma faixa operacional `terra-shell-band` do shell admin.
- Comandos entregues a esquerda:
  - `Novo` com menu dropdown
  - `Alterar`
  - `Excluir`
  - `Detalhes`
- Controles preparados a direita:
  - conta/caixa atual
  - periodo com seletor dropdown
  - data inicial
  - data final
  - pesquisar
  - configuracoes com menu dropdown
  - imprimir
  - exportar

## Seletor de periodo

- O controle `Mes atual` passou a abrir menu dropdown na propria barra.
- Opcoes adicionadas:
  - `Mes atual`
  - `Mes anterior`
  - `Proximo mes`
  - `Semana atual`
  - `Semana anterior`
  - `Proxima semana`
  - `Ano atual`
  - `Ultimos 12 meses`
  - `Periodo livre`
- A selecao ja atualiza o rotulo visivel no React.
- A filtragem real por periodo ainda ficou preparada para a proxima etapa.

## Menu do botao Novo

- O comando `Novo` agora abre menu com:
  - `Recebimento`
  - `Despesa`
  - `Transferencia`
  - `Saldo inicial`
- Nesta etapa, cada item ficou funcional como placeholder controlado por mensagem.

## Menu da engrenagem

- A engrenagem no canto direito passou a abrir menu dropdown alinhado a propria barra.
- Opcoes adicionadas:
  - `Cadastrar fornecedores`
  - `Configurar plano de contas`
  - `Configurar contas bancarias`
  - `Configurar formas de pagamento`
- Ligacoes aplicadas nesta etapa:
  - `Cadastrar fornecedores` -> `/admin/fornecedores`
  - `Configurar plano de contas` -> `/admin/configuracoes/plano-contas`
  - `Configurar contas bancarias` -> `/admin/configuracoes/contas-bancarias`
  - `Configurar formas de pagamento` -> base atual em `/admin/configuracoes/tabelas-auxiliares`, com aviso orientando o recorte preparado

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
  - seletor de periodo com estado visual
  - grade principal
  - estrutura de abas
  - rodape de totais
- Preparado para evolucao:
  - leitura real de movimentacoes
  - filtro real por periodo
  - persistencia
  - calculo de totais
