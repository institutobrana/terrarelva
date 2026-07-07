# Tabelas > Tabela de insumos - Contrato funcional

## 1. Objetivo

O módulo `Tabelas > Tabela de insumos` organiza insumos do sistema em tabelas operacionais com classificação, cálculo de custo unitário e base para usos futuros em produção, ficha técnica, precificação e estoque.

## 2. Decisão de modelagem

O Terra Relva adota uma única estrutura de insumos, diferenciada pelo campo `Classificação`.

Não foram criadas tabelas separadas por tipo de insumo. A segmentação funcional acontece por classificação, carregada da tabela auxiliar `Grupos de material`.

## 3. Relação com o futuro módulo de produção

A tabela de insumos é a base para:

- ficha técnica e receita de produção;
- baixa automática de insumos;
- entrada automática de produto acabado;
- custo de produção;
- precificação;
- alertas de estoque.

## 4. Navegação

Menu lateral:

- `Tabelas`
  - `Tabela de produtos`
  - `Tabela de insumos`

## 5. Estrutura da barra operacional

Na tela de tabela de insumos:

- seleção da tabela ativa;
- filtro de classificação;
- pesquisa por nome do insumo.

O filtro de classificação carrega grupos reais e mantém a opção local `Todas`.

## 6. Estrutura do grid

Colunas principais:

- Código
- Insumo
- Preço R$
- Relação / Qtde
- Custo R$

O grid usa o padrão visual das tabelas do Terra Relva, com cabeçalho interativo para ordenação e visibilidade de colunas.

## 7. Modais de tabela

### Nova tabela de insumos

- sem campo `Código`;
- `Nome da tabela`;
- `Descrição`;
- opção `Criar uma tabela em branco`;
- opção `Copiar itens da tabela de insumos`;
- `Tabela de origem` habilitada apenas ao copiar;
- botões `Cancelar` e `Gravar tabela`.

### Alterar tabela de insumos

- com `Código`;
- `Nome da tabela`;
- `Descrição`;
- `Tabela ativa`;
- botões `Cancelar` e `Gravar tabela`.

## 8. Modal Novo/Alterar insumo

O modal possui duas abas:

- `Principal`
- `Detalhes`

### Aba Principal

- Classificação
- Código interno
- Nome do material
- Unidade de compra
- Unidade de consumo
- Relação
- Preço
- Valor de custo unitário
- Validade média
- Incluir na lista de preferidos

### Aba Detalhes

- Fabricante
- Apresentação
- Observações

## 9. Combos e origem dos dados auxiliares

- Classificação: `Grupos de material`
- Unidade de compra: `Unidades de medida`
- Unidade de consumo: `Unidades de medida`
- Fabricante: `Fabricantes`

Todos exibem somente o nome do item, sem código.

## 10. Regras do código interno

- inteiro positivo;
- sugere o menor código livre ao abrir `Novo insumo`;
- pode ser editado manualmente;
- não aceita repetição dentro da mesma tabela;
- frontend e backend validam;
- mantém `UNIQUE (table_id, internal_code)`.

## 11. Relação, Preço e Custo unitário

- Relação: número de conversão/quantidade, aceita decimal e não é moeda.
- Preço: moeda em R$, aceita vírgula ou ponto.
- Valor de custo unitário: calculado automaticamente por `Preço / Relação`.
- O custo unitário é readonly e recalcula ao alterar Preço ou Relação.

## 12. Regras de exclusão

- excluir item;
- excluir tabela.

Os fluxos já estão ligados à persistência real.

## 13. Endpoints envolvidos

- `GET /admin/insumo-tables`
- `POST /admin/insumo-tables`
- `PUT /admin/insumo-tables/:id`
- `PATCH /admin/insumo-tables/:id/status`
- `DELETE /admin/insumo-tables/:id`
- `GET /admin/insumo-tables/:id/items`
- `POST /admin/insumo-tables/:id/items`
- `PUT /admin/insumo-tables/:tableId/items/:itemId`
- `PATCH /admin/insumo-tables/:tableId/items/:itemId/status`
- `DELETE /admin/insumo-tables/:tableId/items/:itemId`
- `POST /admin/insumo-tables/:id/copy-items`

## 14. Tabelas de banco envolvidas

- `insumo_tables`
- `insumo_table_items`
- `material_groups`
- `measurement_units`
- `manufacturers`

## 15. Testes manuais validados

- abrir tabela de insumos;
- criar tabela;
- alterar tabela;
- excluir tabela;
- criar insumo;
- alterar insumo;
- excluir insumo;
- combos reais;
- filtro por classificação;
- pesquisa por nome;
- código interno sugerido e validado;
- código duplicado bloqueado;
- custo unitário com decimais preservados;
- `10 / 1000 = 0.01`;
- `6.75 / 2.5 = 2.70`.

## 16. Limitações conhecidas

- o layout foi priorizado para estabilidade e operação;
- a validação visual automatizada pode depender do ambiente local de navegador.

## 17. Próximas integrações previstas

- ficha técnica / receita de produção;
- baixa automática de insumos;
- entrada de produto acabado;
- precificação;
- estoque mínimo e alertas.
