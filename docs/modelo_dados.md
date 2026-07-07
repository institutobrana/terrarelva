# Modelo de Dados Inicial

Este documento descreve as entidades principais do Terra Relva em nível alto. Ele não substitui o desenho físico do banco; serve como base funcional e de arquitetura.

## 1. Produtos

### Descrição

Representa os itens vendidos pela loja, incluindo produtos prontos, kits, combos, itens por peso, itens por unidade e produtos sazonais.

### Campos principais

- id
- nome
- categoria
- custo de produção
- preço de venda
- estoque atual
- estoque mínimo
- validade
- lote
- foto
- descrição
- ingredientes
- status ativo/inativo

### Relacionamentos

- Pode se relacionar com estoque
- Pode se relacionar com produção
- Pode se relacionar com vendas
- Pode se relacionar com pedidos

## 2. Tabelas de insumos

### Descrição

Base operacional de insumos usada em tabelas classificadas por grupo.

### Entidades principais

#### `insumo_tables`

- id
- code
- name
- description
- is_active
- created_at
- updated_at

#### `insumo_table_items`

- id
- table_id
- classification
- internal_code
- material_name
- purchase_unit
- consumption_unit
- relation_quantity
- price
- unit_cost
- average_shelf_life_days
- is_favorite
- manufacturer
- presentation
- notes
- is_active
- created_at
- updated_at

### Relacionamentos

- `insumo_table_items.table_id -> insumo_tables.id`
- `internal_code` é único por tabela
- `classification` vem de `material_groups`
- `purchase_unit` e `consumption_unit` vêm de `measurement_units`
- `manufacturer` vem de `manufacturers`

## 3. Estoque

### Descrição

Controla matéria-prima, produto pronto, entradas, saídas, perdas, vencimentos e alertas.

### Campos principais

- id
- tipo de item
- produto ou insumo vinculado
- quantidade atual
- quantidade mínima
- entrada
- saída
- perda
- vencimento
- lote
- observações

### Relacionamentos

- Relaciona-se com produtos
- Relaciona-se com produção
- Relaciona-se com vendas
- Relaciona-se com pedidos

## 4. Produção

### Descrição

Registra a transformação de matéria-prima em produto acabado.

### Campos principais

- id
- data
- produto final
- insumos consumidos
- embalagens usadas
- custo total
- custo por unidade
- lote
- validade
- quantidade produzida

### Relacionamentos

- Depende de estoque de insumos
- Alimenta estoque de produto pronto
- Pode refletir custo de produção do produto

## 5. Vendas

### Descrição

Registra vendas presenciais e online, incluindo forma de pagamento e valores recebidos ou pendentes.

### Campos principais

- id
- data
- canal de venda
- cliente
- itens
- forma de pagamento
- valor total
- valor recebido
- valor a receber
- status do pagamento

### Relacionamentos

- Relaciona-se com produtos
- Relaciona-se com clientes
- Pode alimentar fluxo de caixa
- Pode baixar estoque

## 6. Clientes

### Descrição

Cadastro de pessoas que compram na Terra Relva, com histórico e dados de contato.

### Campos principais

- id
- nome
- telefone
- WhatsApp
- endereço
- preferências
- histórico de compras
- status

### Relacionamentos

- Relaciona-se com vendas
- Relaciona-se com pedidos
- Pode ser usado em relatórios de recorrência

## 7. Pedidos

### Descrição

Controla pedidos recebidos por WhatsApp, Instagram, loja online ou venda presencial.

### Campos principais

- id
- origem
- cliente
- itens
- status
- pagamento
- data de criação
- data de entrega
- observações

### Relacionamentos

- Relaciona-se com clientes
- Relaciona-se com vendas
- Pode gerar separação de estoque e produção

## 8. Fluxo de Caixa

### Descrição

Registra entradas, saídas, despesas, lucro, pró-labore e saldo.

### Campos principais

- id
- data
- tipo
- categoria
- valor
- descrição
- origem
- competência
- saldo

### Relacionamentos

- Pode receber dados de vendas
- Pode registrar despesas fixas e variáveis
- Pode se relacionar com contas bancárias

## 9. Usuários

### Descrição

Define quem acessa o sistema e com qual perfil.

### Campos principais

- id
- nome
- email
- senha
- perfil
- status
- último acesso

### Relacionamentos

- Acesso ao backend e ao painel administrativo
- Pode controlar permissões futuras
