# Tabelas > Tabela de insumos - Contrato técnico

## 1. Stack

- Frontend: React + TypeScript + Ant Design
- Backend: Node.js ESM
- Banco: PostgreSQL
- Persistência: `pool.query`

## 2. Tabelas PostgreSQL

### `insumo_tables`

- `id UUID`
- `code VARCHAR(60)`
- `name VARCHAR(180)`
- `description TEXT`
- `is_active BOOLEAN`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

### `insumo_table_items`

- `id UUID`
- `table_id UUID`
- `classification VARCHAR(180)`
- `internal_code VARCHAR(60)`
- `material_name VARCHAR(180)`
- `purchase_unit VARCHAR(80)`
- `consumption_unit VARCHAR(80)`
- `relation_quantity NUMERIC(14, 4)`
- `price NUMERIC(14, 2)`
- `unit_cost NUMERIC(14, 2)`
- `average_shelf_life_days INTEGER`
- `is_favorite BOOLEAN`
- `manufacturer VARCHAR(180)`
- `presentation VARCHAR(180)`
- `notes TEXT`
- `is_active BOOLEAN`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

## 3. Mapeamentos

- `classification -> classification`
- `internalCode -> internal_code`
- `materialName -> material_name`
- `purchaseUnit -> purchase_unit`
- `consumptionUnit -> consumption_unit`
- `relationQuantity -> relation_quantity`
- `price -> price`
- `unitCost -> unit_cost`
- `averageShelfLifeDays -> average_shelf_life_days`
- `isFavorite -> is_favorite`
- `manufacturer -> manufacturer`
- `presentation -> presentation`
- `notes -> notes`

## 4. Endpoints

Mesmos listados no contrato funcional.

## 5. Service/repository

- Service: [`backend/src/services/insumoTablesService.js`](../backend/src/services/insumoTablesService.js)
- Repository: [`backend/src/repositories/insumoTablesRepository.js`](../backend/src/repositories/insumoTablesRepository.js)

## 6. Validações frontend/backend

- código interno numérico positivo;
- unicidade por `table_id + internal_code`;
- relação e preço numéricos;
- custo unitário calculado antes do save;
- prevenção de `NaN`, `Infinity` e divisão por zero.

## 7. Cálculo do custo unitário

`unitCost = price / relationQuantity`

Exemplos:

- `10 / 1000 = 0.01`
- `6.75 / 2.5 = 2.70`

## 8. Auxiliares usados

- `Grupos de material`
- `Unidades de medida`
- `Fabricantes`

## 9. Erros tratados

- tabela inexistente;
- item inexistente;
- código interno duplicado;
- código interno inválido;
- tabela sem seleção;
- exclusões com confirmação.

## 10. Pontos de extensão futura

- produção;
- ficha técnica;
- estoque;
- precificação;
- baixa automática de insumos.
