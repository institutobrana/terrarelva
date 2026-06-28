# Cadastro lateral - etapa 2026-06-28

## Item lateral

- Foi criado um novo item na barra lateral esquerda com o nome `Cadastro`.
- O item foi definido em `frontend-react/src/app/router/adminNavigation.tsx`.

## Painel lateral

- O painel lateral reaproveita a estrutura real do shell admin ja existente:
  - titulo no topo
  - botao de fechar
  - lista vertical de itens
- O modulo foi configurado com:
  - `panelTitle: Cadastro`
  - `panelKicker: Modulo`

## Itens do submenu

- O submenu foi limitado exatamente a:
  - `Clientes`
  - `Fornecedores`

## Navegacao

- `Clientes` ficou ligado a rota real `/admin/clientes`
- `Fornecedores` ficou ligado a rota real `/admin/fornecedores`
