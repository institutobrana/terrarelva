# Etapa 4 - Correcao de rumo do shell administrativo

## Diretórios de referencia

- Terra Relva oficial: `D:\TERRA RELVA APP`
- Brana Cloud analisado: `D:\BRANA ARQUIVOS\BRANA CLOUD`

## Arquivos do Brana Cloud usados como referencia estrutural

- `frontend-react/src/app/App.jsx`
- `frontend-react/src/layout/BranaActionTopbar.jsx`
- `frontend-react/src/layout/BranaIconRail.jsx`
- `frontend-react/src/layout/BranaContextPanel.jsx`
- `frontend-react/src/layout/BranaWorkspace.jsx`
- `frontend-react/src/styles/globals.css`

## Estrutura identificada no Brana Cloud

O shell operacional atual do Brana Cloud nao eh um `Layout.Sider/Header` classico. A estrutura real eh:

1. topbar horizontal sticky em largura total
2. grid principal logo abaixo
3. rail vertical estreito na primeira coluna
4. painel contextual lateral na segunda coluna
5. workspace principal na terceira coluna
6. faixa auxiliar sob a topbar em paginas especificas

## O que foi reproduzido no Terra Relva

- topbar horizontal em largura total
- grid estrutural com rail + painel contextual + workspace
- mesma logica de rail expansivel
- mesmo encaixe entre topo e lateral
- mesma logica de painel lateral contextual
- mesma composicao de toolbar superior com grupos de acoes e busca
- mesmos icones da toolbar horizontal do Brana Cloud

## Adaptacoes permitidas aplicadas

- branding trocado para Terra Relva
- logo trocado para `assets/LOGO_TERRA_RELVA.png`
- paleta ajustada para os verdes e neutros da marca Terra Relva
- modulos do rail lateral trocados para os modulos do Terra Relva
- destinos de navegacao da toolbar ligados as rotas reais do Terra Relva

## Arquivos alterados no Terra Relva

- `frontend-react/src/layouts/AdminLayout.tsx`
- `frontend-react/src/index.css`
- `frontend-react/src/components/admin/AdminActionTopbar.tsx`
- `frontend-react/src/components/admin/AdminIconRail.tsx`
- `frontend-react/src/components/admin/AdminContextPanel.tsx`
- `frontend-react/src/components/admin/AdminWorkspace.tsx`

## Fora do escopo desta rodada

- novos modulos
- backend
- persistencia nova
- banco novo
- Android/Capacitor
- integracoes externas
