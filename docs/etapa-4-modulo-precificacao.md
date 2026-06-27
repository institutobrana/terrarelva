# Etapa 4 - Modulo Precificacao

## Objetivo

Transformar `Precificacao` no primeiro modulo novo com estrutura real dentro do shell React, em modo leitura e simulacao local, sem trocar a fonte oficial do legado.

## O que foi confirmado no legado

O codigo legado em `app.js` ja possui base objetiva para precificacao:

- `state.settings.hourRate`, `state.settings.taxPercent` e `state.settings.profitPercent`.
- `state.recipes` com `productCode`, `productName`, `taxPercent`, `profitPercent`, `laborMinutes` e `items`.
- `state.supplies` com `name`, `category`, `unit`, `stock` e `unitCost`.
- `state.products` com `code`, `name`, `category`, `presentation`, `price`, `weight` e `recipe`.
- `calculateRecipeCost(recipe)` calcula:
  - custo de materiais somando `quantity * unitCost`;
  - custo de mao de obra por `laborMinutes / 60 * hourRate`;
  - custo total;
  - preco sugerido por `totalCost * (1 + imposto + margem)`;
  - valor de margem sugerida.
- `getProductCostSummary(product)` compara o custo calculado com o preco atual do produto.
- `ensureRecipes()` e `buildRecipeForProduct(product)` existem no legado, mas nesta etapa o React apenas le o snapshot; nao recria nem grava fichas.

## Estrutura criada no React

- `frontend-react/src/modules/pricing/types.ts`
  - contrato tipado do modulo.
- `frontend-react/src/modules/pricing/selectors.ts`
  - leitura derivada, status do produto, breakdown e simulacao.
- `frontend-react/src/modules/pricing/pricingRepository.ts`
  - camada de acesso ao snapshot legado para o modulo.
- `frontend-react/src/modules/pricing/usePricingModule.ts`
  - hook de leitura e estado local da interface.
- `frontend-react/src/modules/pricing/PricingProductsTable.tsx`
  - tabela de produtos para precificacao.
- `frontend-react/src/modules/pricing/PricingProductSummary.tsx`
  - painel de detalhe, composicao e simulacao local.
- `frontend-react/src/pages/admin/PrecificacaoPage.tsx`
  - tela real do modulo.

## O que a tela ja entrega

- lista de produtos com foco em precificacao;
- indicacao de receita encontrada ou ausente;
- custo estimado quando calculavel;
- margem estimada quando calculavel;
- status visual:
  - completo;
  - incompleto;
  - sem base;
- resumo do produto selecionado;
- composicao de insumos encontrada;
- transparencia sobre dados faltantes;
- simulacao local de preco sem persistencia;
- subtelas contextuais:
  - Visao geral;
  - Produtos com receita;
  - Produtos incompletos;
  - Parametros;
  - Simulacao.

## Limites atuais

- o React nao grava em `localStorage` nem no legado;
- o custo depende da qualidade de `recipes` e `supplies` ja presentes no snapshot;
- se o insumo nao existe ou nao tem `unitCost` confiavel, o custo fica parcial ou nao calculavel;
- ainda nao existe consolidacao com producao real, estoque refinado ou perdas detalhadas;
- nao ha banco novo nem backend nesta etapa.

## Proximo passo recomendado

Depois de Precificacao, o melhor encaixe tecnico e migrar `Producao`, porque:

- conversa diretamente com `recipes`;
- ajuda a melhorar insumos, rendimentos e custos;
- reduz incerteza antes de escrita controlada ou banco novo.
