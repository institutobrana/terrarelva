# Migracao Fase 3 - Leitura Controlada do Legado

## Divergencia operacional

O diretorio oficial do projeto continua sendo `D:\TERRA RELVA APP`, conforme diretriz do projeto.

Nesta sessao, porem, o workspace ativo disponivel para execucao foi `C:\Users\Tel\Documents\TERRA RELVA APP`.

## Contrato real identificado no legado

Chaves lidas:

- principal: `terra-relva-app-state-v5`
- fallback legado: `terra-relva-app-state-v4`

Entidades confirmadas no estado:

- `products`
- `customers`
- `productions`
- `sales`
- `saleItems`
- `purchases`
- `supplies`
- `recipes`
- `cashEntries`
- `stockMovements`
- `syncConfig`
- `syncQueue`
- `lastSyncAt`
- `lastSyncStatus`
- `lastSyncMessage`
- `settings`

Relacoes confirmadas:

- `saleItems.saleId -> sales.id`
- `saleItems.productCode -> products.code`
- `saleItems.customerId -> customers.id`
- `recipes.productCode -> products.code`
- `recipe.items[].supplyName -> supplies.name`
- `stockMovements.productCode -> products.code`

Dados derivados importantes confirmados no legado:

- saldo de caixa por conta (`loja`, `recebiveis`, `pessoal`) calculado a partir de `cashEntries`
- estoque baixo comparando `product.stock <= product.minimumStock`
- resumo mensal a partir de `sales`, `saleItems`, `cashEntries`, `productions`, `purchases` e `stockMovements`
- favoritos de clientes a partir do historico de `saleItems`

## Tipos criados

No novo frontend foram criados tipos tipados para:

- `Product`
- `Customer`
- `Production`
- `Sale`
- `SaleItem`
- `Purchase`
- `Supply`
- `Recipe`
- `RecipeItem`
- `CashEntry`
- `StockMovement`
- `AppSettings`
- `SyncConfig`
- `SyncQueueItem`
- `LegacyAppState`
- `LegacyStorageSnapshot`
- `LegacyDashboardSummary`

## Camada de leitura criada

Arquivos principais:

- `frontend-react/src/services/storage/legacyStorage.ts`
- `frontend-react/src/services/repositories/legacyRepository.ts`

Decisoes:

- o `localStorage` e lido apenas nessa camada
- a camada normaliza estruturas ausentes
- a camada retorna snapshot tipado com avisos e metadata de leitura
- nao ha escrita, mutacao ou migracao destrutiva

## Telas conectadas

### `/admin/dashboard`

Passou a mostrar:

- total de produtos
- total de clientes
- total de vendas
- saldo da conta `loja`, quando houver base
- quantidade de itens com estoque baixo
- chave lida
- horario da ultima leitura
- status e mensagem de sincronizacao legada

### `/admin/produtos`

Passou a mostrar:

- tabela real de produtos com Ant Design
- busca por nome, categoria, codigo, apresentacao e receita
- colunas com nome, categoria, preco, estoque, unidade e status
- indicadores de total, ativos e estoque baixo

## Limitacoes atuais

- leitura depende do `localStorage` do navegador em que o novo frontend esta aberto
- nao existe sincronizacao em tempo real entre janelas
- nao existe escrita controlada ainda
- nao existe banco novo
- Android/Capacitor continuam fora desta fase

## O que falta para a fase de escrita controlada

1. consolidar adaptadores e hooks para outros modulos
2. definir contratos de comando separados da leitura
3. introduzir testes de compatibilidade do estado legado
4. migrar depois fluxos sensiveis de forma incremental
