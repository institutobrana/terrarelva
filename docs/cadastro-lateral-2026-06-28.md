# Cadastro lateral - correcao 2026-06-28

## Correcao aplicada

- O item lateral `Cadastro` criado separadamente foi removido.
- O modulo lateral que antes aparecia como `Clientes` passou a se chamar `Cadastro`.

## Painel lateral

- O painel lateral continua reutilizando a estrutura real do shell admin:
  - titulo no topo
  - botao de fechar
  - lista vertical de itens
- O modulo reaproveitado foi configurado com:
  - `panelTitle: Cadastro`
  - `panelKicker: Modulo`

## Novo submenu

- O submenu do modulo ficou limitado exatamente a:
  - `Clientes`
  - `Fornecedores`

## Navegacao

- `Clientes` continua ligado a rota real `/admin/clientes`
- `Fornecedores` continua ligado a rota real `/admin/fornecedores`
