# Financeiro - ajuste de nomenclatura 2026-06-28

## Renomeacao do modulo

- O modulo lateral `Caixa` foi renomeado para `Financeiro` em `adminNavigation.tsx`.
- A navegacao secundaria do modulo tambem passou a refletir `Financeiro` nos labels visiveis.

## Fluxo de caixa

- Foi adicionado o item `Fluxo de caixa` no submenu do modulo financeiro.
- A rota criada para este item foi `/admin/financeiro/fluxo-de-caixa`.
- Nesta etapa a nova rota ficou funcional como placeholder controlado.

## Arquivos alterados

- `frontend-react/src/app/router/adminNavigation.tsx`
- `frontend-react/src/app/router/routes.tsx`
