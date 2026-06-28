# Contas bancarias - etapa 2026-06-28

## Rota

- A entrada `Configuracoes -> Contas bancarias` foi ligada na rota protegida `/admin/configuracoes/contas-bancarias`.

## Barra superior

- O modulo usa a mesma faixa operacional `terra-shell-band` do shell admin.
- Comandos entregues na barra:
  - `Nova conta`
  - `Alterar`
  - `Detalhes`
- O comando `Nova conta` agora abre um modal de formulario no fluxo real da tela.

## Modal nova conta bancaria

- O modal foi implementado com:
  - titulo `Nova conta bancaria`
  - botao `X` no canto superior direito
  - botoes `Gravar conta` e `Cancelar` no rodape
- Campos adicionados:
  - `Nome da conta`
  - `Prestador`
  - `Banco`
  - `Agencia`
  - `Conta`
  - `DV da conta`
  - `Tipo da conta`
  - `Nome do titular`
  - `CPF/CNPJ do titular`
- Organizacao aplicada:
  - labels a esquerda e campos a direita
  - `Banco` e `Tipo da conta` como selecao
  - `Conta` e `DV da conta` lado a lado
  - `Prestador` preparado para selecao/pesquisa

## Validacoes

- Validacoes minimas aplicadas:
  - `Nome da conta` obrigatorio
  - `Banco` obrigatorio
  - `Agencia` obrigatoria
  - `Conta` obrigatoria
  - `Tipo da conta` obrigatorio
- Campos opcionais nesta etapa:
  - `Prestador`
  - `DV da conta`
  - `Nome do titular`
  - `CPF/CNPJ do titular`

## Grade principal

- A tela foi estruturada como grade/listagem central, sem hero interno e sem card de cabecalho.
- Colunas montadas nesta etapa:
  - `Nome da conta/caixa`
  - `Nome do prestador`
  - `Banco`
  - `Agencia`
  - `Conta`

## Rodape da grade

- O rodape segue a mesma logica operacional das outras telas internas:
  - `Visualizar inativos`
  - `Total de registros`

## Estado funcional

- Funcional nesta etapa:
  - rota protegida real
  - barra operacional unida ao shell
  - grade principal
  - selecao de linha
  - abertura real do modal em `Nova conta`
  - validacao de formulario
  - fechamento por `X` e `Cancelar`
  - submit controlado em `Gravar conta`
  - placeholders controlados para `Alterar` e `Detalhes`
- Preparado para evolucao:
  - fonte real de contas bancarias
  - dados de banco, agencia, conta e prestador vindos do backend
  - persistencia real do cadastro
  - acoes reais de edicao e detalhes
