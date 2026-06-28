# Etapa 2 - Custos e Precificacao

## Objetivo

Deixar pronta a base para descobrir:

- quanto custa produzir cada materia-prima
- quanto custa montar cada produto final
- quanto sobra de lucro em cada venda

## O que foi concluido

- cadastro base de materias-primas e insumos
- modelo de lancamento de producao com rendimento
- planilha base de precificacao por produto
- parametros gerais de precificacao
- estrutura para custo de sanitizante e papel antiaderente

## Logica de custo

### 1. Compra da materia-prima

Registrar:

- data
- materia-prima
- valor pago
- peso bruto comprado

### 2. Rendimento apos desidratar

Registrar:

- peso final desidratado
- tempo de forno
- observacoes do lote

### 3. Custo da materia-prima final

Formula:

- custo por grama final = valor pago / peso final desidratado

Exemplo:

- banana comprada = R$ 50,00
- peso final desidratado = 900g
- custo por grama = 50 / 900 = R$ 0,0556 por grama

### 4. Custo do produto

Somar:

- ingredientes
- embalagem
- adesivo
- sacola
- sanitizante rateado
- papel antiaderente rateado

### 5. Preco sugerido

Base inicial:

- custo total
- + 10% imposto
- + 20% mao de obra artesanal
- + custos fixos rateados
- + lucro desejado

## Arquivos desta etapa

- `data/materias_primas_modelo.csv`
- `data/producao_lotes.csv`
- `data/parametros_precificacao.csv`
- `data/precificacao_produtos.csv`

## Como usar

### Primeiro preencher

- custo unitario das embalagens
- custo unitario dos adesivos
- custo unitario das sacolas
- valor e quantidade das frutas compradas
- regra de uso do sanitizante
- regra de uso do papel antiaderente

### Depois preencher

- gramagens reais das fichas tecnicas com X, Y, Z

### Depois comparar

- custo total do produto
- preco atual de venda
- lucro em reais
- margem em porcentagem

## Resultado esperado

Ao final do preenchimento, sera possivel descobrir:

- quais produtos dao lucro
- quais produtos estao com preco errado
- quais embalagens pesam demais no custo
- quanto a Flavia pode retirar de pro-labore sem misturar com o caixa da loja
