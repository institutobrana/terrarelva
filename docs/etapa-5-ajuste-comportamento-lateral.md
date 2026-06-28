# Etapa 5 - Ajuste pontual do comportamento lateral

## Diretorios

- Terra Relva oficial: `D:\TERRA RELVA APP`
- Brana Cloud revisado: `D:\BRANA ARQUIVOS\BRANA CLOUD`

## Arquivos revisados no Brana Cloud

- `frontend-react/src/app/App.jsx`
- `frontend-react/src/layout/BranaIconRail.jsx`
- `frontend-react/src/layout/BranaContextPanel.jsx`

## Comportamento real identificado no Brana Cloud

O Brana Cloud controla o painel lateral pelo estado `panelGroupKey` em `App.jsx`.

- abertura:
  - acontece quando o mouse entra em um item do rail
  - o botao do rail chama `onMouseEnter={() => onOpenGroup?.(group.key)}`
- manutencao aberto:
  - tanto o rail quanto o painel chamam `onMouseEnter={handleContextRegionEnter}`
  - isso limpa qualquer timeout pendente de fechamento
- recolhimento:
  - tanto o rail quanto o painel chamam `onMouseLeave={handleContextRegionLeave}`
  - `handleContextRegionLeave` agenda `setPanelGroupKey('')`
  - existe atraso tecnico de `140ms`

Esse atraso evita flicker quando o mouse sai do rail e entra no painel.

## Correcao aplicada no Terra Relva

O Terra Relva estava reabrindo o painel com base na rota atual, o que deixava a lateral parecendo fixa.

Foi corrigido para seguir a mesma ideia do Brana Cloud:

- o painel lateral comeca fechado
- ele abre por hover na area do rail
- ele permanece aberto ao atravessar do rail para o painel
- ele recolhe automaticamente ao sair da regiao lateral
- o fechamento volta para estado vazio, e nao para o modulo atual da rota

## Arquivo alterado

- `frontend-react/src/layouts/AdminLayout.tsx`
