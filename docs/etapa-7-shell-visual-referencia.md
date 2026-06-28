# Etapa 7 - Shell visual com referencia estrutural

## Objetivo

Refatorar o shell do `/admin` para ficar mais proximo da logica estrutural do print de referencia, mantendo identidade visual Terra Relva.

## Como a referencia foi aplicada

O print foi usado como referencia estrutural, nao como copia de marca. A adaptacao no Terra Relva seguiu quatro faixas:

- sidebar esquerda fixa e mais presente;
- topbar principal com branding e area de acoes;
- segunda barra horizontal contextual separada;
- area central mais limpa e organizada.

## Principais elementos reformulados

### Sidebar

- virou um bloco mais estavel e menos provisório;
- ganhou hierarquia vertical mais clara;
- melhorou o destaque do item ativo;
- logo e assinatura do sistema ficaram mais integrados ao layout.

### Topbar principal

- agora funciona como uma faixa propria;
- combina branding, estado do sistema e area de usuario;
- ficou mais proxima de um shell de software maduro.

### Barra contextual

- foi separada da topbar principal;
- passou a concentrar breadcrumb, descricao do modulo, busca futura e abas contextuais;
- ficou mais clara como segunda navegacao horizontal.

### Conteudo

- area central ficou mais aberta e menos encaixotada;
- o shell agora entrega uma base mais forte para cards, tabelas e blocos dos modulos.

## Paleta do logo no shell

As cores seguiram a paleta Terra Relva ja consolidada, com uso principal em:

- navegação ativa;
- gradientes discretos do shell;
- realces da barra contextual;
- campos e componentes principais;
- pontos de identidade.

## Arquivos centrais desta etapa

- `frontend-react/src/layouts/AdminLayout.tsx`
- `frontend-react/src/components/admin/AdminSidebar.tsx`
- `frontend-react/src/components/admin/AdminTopbar.tsx`
- `frontend-react/src/components/admin/AdminContextBar.tsx`
- `frontend-react/src/index.css`
- `frontend-react/src/theme/antdTheme.ts`

## O que fica para depois

- busca real no topo;
- notificacoes reais;
- area de usuario funcional;
- refinamento fino de densidade por modulo;
- novos modulos e persistencia.
