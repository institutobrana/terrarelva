# Configuracoes na lateral esquerda - etapa inicial - 2026-06-28

## O que foi criado

- Entrada `Configuracoes` na barra lateral esquerda do shell principal.
- Painel lateral de contexto para `Configuracao`.
- Lista inicial de itens de configuracao interna.

## Onde foi implementado

- Navegacao principal e submenu: `frontend-react/src/app/router/adminNavigation.tsx`
- Painel lateral contextual: `frontend-react/src/components/admin/AdminContextPanel.tsx`
- Tipagem de navegacao para titulo e kicker do painel: `frontend-react/src/types/navigation.ts`
- Rotas placeholder dos itens: `frontend-react/src/app/router/routes.tsx`

## Itens iniciais incluidos

- Usuarios do sistema
- Perfis de usuario
- Tabelas auxiliares
- Plano de contas
- Agendas
- Questionarios de anamnese
- Unidades de atendimento
- Campos livres
- Taxas de cobranca
- Contas bancarias

## Preparacao da proxima etapa

- `Usuarios do sistema` ja ficou com rota protegida propria em `/admin/configuracoes/usuarios-sistema`
- a rota esta pronta para evoluir para a tela funcional de gestao interna de usuarios
- os demais itens permanecem como placeholders seguros nesta rodada
