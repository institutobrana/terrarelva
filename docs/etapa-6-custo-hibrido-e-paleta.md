# Etapa 6 - Custo hibrido e paleta Terra Relva

## Objetivo

Consolidar a identidade visual do novo admin com base no logo oficial e aproximar `Producao` e `Precificacao` por uma camada hibrida de custo.

## Paleta adotada a partir do logo

O logo oficial sugere uma base de verdes naturais com neutros claros. A paleta aplicada no frontend foi:

- verde principal: `#436245`
- verde estrutural escuro: `#36513d`
- verde complementar: `#6e875f`
- verde suave de apoio: `#e5ede0`
- areia/neutro quente: `#d6c4a5`
- fundo claro: `#f3eee6`
- painel claro: `#fefcf8`

## Onde a paleta foi aplicada

- `theme/antdTheme.ts`
  - `colorPrimary`
  - `colorInfo`
  - `colorSuccess`
  - fundos e bordas do tema
- `index.css`
  - gradiente de fundo
  - estado ativo da sidebar
  - tabs do topo
  - cards e elementos de identidade
  - destaques do shell

## Critério de legibilidade

- o verde forte ficou concentrado em navegação ativa, CTA e identidade;
- os fundos continuam claros e quentes;
- o contraste principal fica entre verde escuro e off-white;
- os verdes suaves entram como apoio, sem saturar a tela.

## Estrategia hibrida entre Producao e Precificacao

### Base teorica

Vem da ficha tecnica:

- itens da receita
- custos unitarios de `supplies`
- mao de obra por `laborMinutes`
- parametros de imposto e margem

### Base observada

Vem das producoes reais:

- `paidValue`
- `finalWeight`
- custo observado por grama
- lotes associados ao mesmo ingrediente

### Como os dois mundos passaram a conversar

- o modulo de Producao agora expõe referencias observadas por ingrediente;
- a Precificacao procura referencias observadas compativeis com cada produto;
- quando encontra, substitui a parcela do insumo-base da receita pelo custo observado por grama da producao;
- embalagem, adicionais e mao de obra continuam seguindo a base tipada da receita quando isso for seguro.

## Cenarios tratados

- Somente receita
  - usa custo teorico.
- Somente producao
  - usa custo observado apenas quando a base teorica nao fecha, mas com transparência.
- Receita + producao compativeis
  - a tela pode adotar a base observada.
- Receita + producao divergentes
  - a tela mostra a divergencia e nao adota automaticamente um custo unico.
- Base insuficiente
  - a tela assume explicitamente que ainda nao ha base segura.

## Limites atuais

- a producao observada no legado ainda nao e uma entidade completa de lote;
- nao ha validade estruturada;
- o custo observado depende da qualidade de `paidValue` e `finalWeight`;
- nao existe escrita controlada nem banco novo;
- a divergencia ainda precisa de revisao humana quando passa do limite seguro.

## Proximo passo natural

O proximo encaixe tecnico e criar uma camada de conciliacao operacional:

- rendimento esperado vs. rendimento observado;
- alertas de divergencia por ingrediente;
- refinamento da relacao entre lote, estoque e precificacao.
