# Etapa 5 - Modulo Producao e ajustes do shell

## Objetivo

Transformar `Producao` no proximo modulo real do frontend React, ainda em leitura estruturada, e limpar o shell visual com branding oficial Terra Relva.

## O que foi confirmado no legado

O legado em `app.js` ja possui base objetiva para producao:

- `state.productions` com:
  - `id`
  - `date`
  - `ingredient`
  - `paidValue`
  - `rawWeight`
  - `finalWeight`
  - `ovenHours`
  - `notes`
- ao salvar uma producao, o legado:
  - grava em `state.productions`
  - faz `queueSync("Producao", "append", production)`
  - identifica um insumo final desidratado em `supplies`
  - atualiza `supply.stock`
  - atualiza `supply.unitCost` com `paidValue / finalWeight`
  - busca produtos ligados por `product.recipe || product.name`
  - incrementa `product.stock`
  - registra `stockMovements` de entrada com motivo `Lote de ...`
- o legado calcula:
  - `yieldPercent = finalWeight / rawWeight * 100`
  - `finalCostPerGram = paidValue / finalWeight`
- nao existe campo estruturado de:
  - lote persistido como entidade propria
  - validade
  - custo completo por producao baseado em ficha tecnica consolidada

## Estrutura criada no React

- `frontend-react/src/modules/production/types.ts`
- `frontend-react/src/modules/production/selectors.ts`
- `frontend-react/src/modules/production/productionRepository.ts`
- `frontend-react/src/modules/production/useProductionModule.ts`
- `frontend-react/src/modules/production/ProductionTable.tsx`
- `frontend-react/src/modules/production/ProductionSummaryPanel.tsx`
- `frontend-react/src/pages/admin/ProducaoPage.tsx`

## O que a tela ja entrega

- lista de producoes do legado;
- produto(s) ligados quando encontrados;
- rendimento quando calculavel;
- custo estimado e custo do registro legado;
- leitura de movimentos de estoque ligados ao lote;
- status visual:
  - completo;
  - incompleto;
  - sem base;
- painel de detalhe da producao selecionada;
- transparencia quando faltam receita, produto ligado, validade ou movimento de estoque.

## Como isso ajuda Precificacao

Esta etapa organiza sinais reais de producao que podem melhorar a Precificacao depois:

- custo por grama final da producao;
- rendimento real;
- ligacao entre materia-prima produzida e produtos vendidos;
- leitura de estoque de entrada originado por lote.

Ainda nao substitui a base teorica de precificacao, mas prepara um caminho melhor para isso.

## Ajustes visuais do shell

Foram feitos dois ajustes obrigatorios:

- remocao dos textos provisórios da sidebar:
  - `Shell administrativo React`
  - `Navegacao principal`
- aplicacao do logo oficial `D:\TERRA RELVA APP\assets\LOGO_TERRA_RELVA.png`
  - na area principal da sidebar
  - no cabeçalho superior do admin

## Fora do escopo nesta etapa

- escrita real em producao;
- banco novo;
- backend novo;
- validade persistida;
- lote como entidade propria;
- baixa automatica real de estoque no novo frontend.
