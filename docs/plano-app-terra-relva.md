# Plano do App Terra Relva

## Objetivo

Criar um sistema muito simples para celular, pensado para a Flávia usar com poucos toques, sem depender de computador no dia a dia, para controlar:

- produtos e estoque
- produção e rendimento da desidratação
- vendas e clientes
- caixa da loja e caixa pessoal separados
- custo real e precificação
- retorno de clientes que sumiram

## Recomendação de arquitetura

### Melhor opção prática

Usar um app web simples no celular, no formato PWA, com seis botões grandes na tela inicial:

- Produtos
- Produção
- Vendas
- Clientes
- Caixa
- Relatórios

O app salva tudo em uma planilha na nuvem da conta exclusiva da Terra Relva.

### Onde salvar os dados

Entre Excel e planilha online, a melhor opção para esse caso é:

1. Google Sheets + Google Apps Script
2. App web/PWA simples conectado a essa planilha

Motivos:

- funciona melhor no celular
- é grátis
- evita instalação complicada
- gera histórico automático
- facilita backup
- permite relatórios e fórmulas
- é mais simples integrar com HTML do que Excel móvel

### Observação importante

Sem nenhuma hospedagem, um app de celular com HTML fica muito limitado para sincronizar dados. A opção mais segura e barata é:

- hospedar o front-end grátis no GitHub Pages ou Netlify
- salvar os dados no Google Sheets da conta da Terra Relva

Isso continua sem custo mensal.

## Como a Flávia vai usar

### Tela inicial

Somente seis botões grandes.

### Tela Produtos

- cadastrar produto
- editar preço
- ver estoque atual
- ver estoque baixo

### Tela Produção

- registrar compra da matéria-prima
- informar peso comprado
- informar valor pago
- informar rendimento após desidratar
- lançar produção pronta no estoque

### Tela Vendas

- escolher cliente ou "cliente avulso"
- tocar no produto
- informar quantidade
- confirmar forma de pagamento
- salvar

### Tela Clientes

- nome
- telefone
- Instagram
- última compra
- observações
- alerta de cliente sem comprar há X dias

### Tela Caixa

Separado em duas partes:

- Caixa Loja
- Caixa Pessoal

No caixa loja:

- entrada de vendas
- saída com embalagens, frutas, gás, energia, insumos, frete

No caixa pessoal:

- pró-labore
- retiradas pessoais
- despesas pessoais

### Tela Relatórios

- lucro por produto
- produtos mais vendidos
- clientes que mais compram
- clientes sumidos
- fluxo do caixa
- comparação entre preço de venda e custo real

## Etapas do projeto

## Etapa 1 - Cadastro mestre dos produtos

Objetivo:
criar a base de tudo que a Terra Relva vende hoje.

Campos:

- código
- categoria
- nome
- apresentação
- peso
- preço de venda
- estoque
- estoque mínimo
- ativo
- receita base

Resultado esperado:

- todos os produtos do catálogo cadastrados
- preços de venda preenchidos
- base pronta para estoque e fichas técnicas

## Etapa 2 - Cadastro mestre de matérias-primas e insumos

Objetivo:
criar a base de custo.

Itens que precisam entrar:

- frutas in natura
- ervas
- flores
- especiarias
- banana desidratada
- manga desidratada
- manga com maracujá desidratada
- abacaxi desidratado
- morango desidratado
- kiwi desidratado
- pitaya desidratada
- maçã desidratada
- cacau
- coco
- amendoim
- tâmara
- canela
- cardamomo
- café
- gengibre
- embalagem
- adesivo
- sacola
- sanitizante
- papel antiaderente

Campos das matérias-primas:

- código
- tipo
- nome
- unidade base
- quantidade comprada
- valor pago
- custo por grama ou unidade
- fornecedor
- observações

Campos extras de insumos de processo:

- sanitizante: quantidade usada por litro, rendimento do frasco, custo por lavagem
- papel antiaderente: metros por rolo, quantas bandejas rende, custo por bandeja
- embalagem: custo unitário
- adesivo: custo unitário
- sacola: custo unitário

## Etapa 3 - Controle de produção e rendimento

Objetivo:
registrar o que entra cru e o que sai pronto.

Fluxo simples:

1. Flávia compra a fruta
2. lança valor pago e peso bruto
3. corta e desidrata
4. registra o peso final
5. o sistema calcula rendimento e custo por grama final

Exemplo:

- banana comprada: R$50,00
- peso bruto: 5.000g
- peso final desidratado: 900g
- rendimento final: 18%
- custo da banana desidratada: R$50,00 ÷ 900g

Campos da produção:

- data
- lote
- fruta ou matéria-prima
- peso bruto
- valor pago
- tempo de forno
- peso líquido desidratado
- rendimento em %
- observações

Isso resolve a dúvida do lançamento de produção:
sim, esse processo precisa existir dentro do app, porque é ele que transforma fruta comprada em custo real por grama do produto final.

## Etapa 4 - Fichas técnicas

Objetivo:
descobrir o custo real de cada item vendido.

Cada ficha técnica terá três colunas principais:

- item
- quantidade
- valor

E também:

- custo total
- preço de venda
- margem bruta
- margem líquida estimada

### Regras de composição

- produtos simples usam uma receita base
- produtos mistos combinam várias receitas base
- embalagens entram sempre no custo
- adesivo entra no custo
- sacola pode entrar como custo fixo por venda ou por produto

### Exemplo de regra de precificação

Preço de venda sugerido =

- custo total do produto
- + 10% impostos
- + 20% mão de obra artesanal
- + parcela dos custos fixos
- + margem de lucro desejada

## Etapa 5 - Caixa separado

Objetivo:
separar o dinheiro da empresa do dinheiro pessoal.

### Caixa 1 - Loja

Entradas:

- vendas em dinheiro
- pix
- cartão

Saídas:

- compra de frutas
- embalagens
- adesivos
- sacolas
- gás
- energia
- transporte
- outros custos da loja

### Caixa 2 - Pessoal

Entradas:

- pró-labore

Saídas:

- despesas pessoais
- retiradas extras

Regra importante:

- Flávia não deve misturar compras pessoais com caixa da loja
- toda retirada deve ser registrada

## Etapa 6 - Vendas e estoque

Objetivo:
diminuir esquecimento e atualizar estoque automaticamente.

Fluxo:

1. tocar em "Vendas"
2. escolher cliente
3. escolher produto
4. escolher quantidade
5. salvar

Automático:

- baixa no estoque
- entrada no caixa
- atualização da última compra do cliente

## Etapa 7 - CRM simples de clientes

Objetivo:
aproveitar recompra.

Dados mínimos:

- nome
- telefone
- Instagram
- aniversário
- preferências
- última compra
- valor total comprado

Alertas:

- cliente sem comprar há 30 dias
- cliente sem comprar há 60 dias
- cliente VIP

Ação:

- gerar lista para mensagem no WhatsApp com promoção

## Etapa 8 - Relatórios de gestão

Relatórios principais:

- lucro por produto
- produtos com preço errado
- produtos que vendem bem e dão pouco lucro
- estoque parado
- clientes recorrentes
- clientes inativos
- fechamento mensal da loja

## Ordem recomendada de execução

1. cadastrar todos os produtos do catálogo
2. cadastrar matérias-primas e embalagens
3. cadastrar receitas base
4. criar lançamento de produção com rendimento
5. criar lançamento de venda
6. criar caixa loja e caixa pessoal
7. criar clientes
8. criar relatórios

## MVP ideal

Para começar sem travar a Flávia, o MVP deve ter só:

- Produtos
- Produção
- Vendas
- Clientes
- Caixa

Relatórios podem entrar depois.

## Regras de simplicidade para a interface

- fonte grande
- poucos campos por tela
- botão salvar sempre visível
- cores claras para cada área
- termos simples
- sem telas cheias
- sem menu escondido
- sem configurar nada manualmente

## Próximos passos práticos

1. validar o cadastro mestre dos produtos extraído do catálogo
2. preencher custo das matérias-primas e embalagens
3. definir pesos reais das receitas
4. montar a planilha base
5. transformar a planilha em app simples para celular
