# Etapa 3 - Shell administrativo React

## Objetivo

Consolidar o shell principal do `/admin` dentro do frontend React, sem depender do `index.html` legado como casco do novo sistema.

## Estrutura implementada

- Barra lateral principal com os modulos: Hoje, Vendas, Producao, Produtos, Estoque, Clientes, Caixa e Mais.
- Barra superior horizontal conectada ao modulo atual, com subtelas e atalhos contextuais.
- Area central unica para cards, tabelas e paginas.
- Agrupamento secundario em `Mais` para Precificacao, Pedidos, Fornecedores, Relatorios, Configuracoes e Loja.

## Arquivos centrais

- `frontend-react/src/app/router/adminNavigation.tsx`
  - Fonte unica do mapa de navegacao do admin.
- `frontend-react/src/layouts/AdminLayout.tsx`
  - Casco principal do `/admin`.
- `frontend-react/src/components/admin/AdminSidebar.tsx`
  - Navegacao lateral estrutural.
- `frontend-react/src/components/admin/AdminTopbar.tsx`
  - Barra superior contextual por modulo.
- `frontend-react/src/app/router/routes.tsx`
  - Rotas ajustadas e placeholders seguros para subtelas.
- `frontend-react/src/types/navigation.ts`
  - Tipos de navegacao do shell.
- `frontend-react/src/utils/navigation.ts`
  - Resolucao do modulo atual a partir da rota.
- `frontend-react/src/pages/admin/AdminPlaceholderPage.tsx`
  - Placeholder padronizado para modulos e subtelas ainda nao migrados.

## Por que o index.html legado nao e o shell novo

O `index.html` legado continua sendo a entrada do sistema antigo. O shell novo agora vive no React para:

- manter a separacao entre legado e migracao;
- permitir roteamento real por modulo;
- evitar acoplamento visual do novo admin ao HTML antigo;
- preparar o sistema para futuras regras, dados e formularios sem espalhar estrutura fora do app React.

## Rotas e navegacao

- `/admin` redireciona para `/admin/hoje`.
- `/admin/dashboard` continua aceito, mas redireciona para `/admin/hoje`.
- Os modulos principais entram no novo shell.
- As subtelas da barra superior ja possuem rotas seguras quando ajudam a firmar a estrutura.
- `/loja` continua no mesmo frontend, mas fora do shell administrativo.

## Fora do escopo nesta etapa

- Banco de dados novo.
- Backend novo.
- Escrita no React.
- Migracao real dos formularios e regras de negocio.
- Alteracao do storage oficial do legado.
- Android/Capacitor e sincronizacao nova.

## Proxima fase recomendada

Migrar um modulo de dominio com leitura forte e escrita controlada, priorizando:

1. modelagem de dados do modulo;
2. repositorio com fonte de leitura bem definida;
3. formularios e validacoes no React;
4. persistencia nova sem quebrar o legado.
