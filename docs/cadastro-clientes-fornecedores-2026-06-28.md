# Cadastro clientes e fornecedores - etapa 2026-06-28

## Rotas

- `Cadastro -> Clientes` foi ligado em `/admin/cadastro/clientes`
- `Cadastro -> Fornecedores` foi ligado em `/admin/cadastro/fornecedores`
- Para preservar compatibilidade com a navegacao existente:
  - `/admin/clientes` continua funcionando e abre a nova tela de clientes
  - `/admin/fornecedores` continua funcionando e abre a nova tela de fornecedores

## Tela de clientes

- A tela de clientes foi reconstruida no padrao operacional seco:
  - barra superior unida ao shell
  - comandos do modulo
  - filtro dropdown antes da pesquisa
  - nome do registro selecionado no topo direito
  - busca no canto direito
  - grade principal abaixo
  - rodape com `Visualizar inativos` e `Total de registros`
- Comandos aplicados:
  - `Novo cliente`
  - `Alterar`
  - `Detalhes`
  - `Imprimir`
  - `Ficha clinica`
- `Ficha clinica` foi mantida como placeholder controlado para evolucao futura.
- O botao `Novo cliente` agora abre modal `Novo cliente - Dados principais`.
- Opcoes adicionadas ao filtro de busca:
  - `Nome do cliente`
  - `Nome do responsavel`
  - `CPF do cliente`
  - `CPF do responsavel`
  - `E-mail principal`
  - `Telefone principal`
  - `Codigo do cliente`
- Campos adicionados no modal:
  - `Nome`
  - `Sexo`
  - `Data de nascimento`
  - `CPF`
  - `Documento`
  - `Numero do documento`
  - `Responsavel principal`
  - `Telefone 1`
  - `Telefone 2`
  - `E-mail 1`
- O modal inclui:
  - `Importar`
  - `Gravar cliente`
  - `Cancelar`
- Nesta etapa, `Gravar cliente` faz validacao e submit controlado, sem persistencia real ainda.
- Refinamento visual posterior:
  - `Telefone 1` e `Telefone 2` foram reestruturados em `tipo`, `DDD`, `numero` e `ramal`
  - `E-mail 1` foi reestruturado em `tipo` + `endereco`
  - `Documento` foi mantido em `tipo` + `numero`
  - o modal ficou menos arredondado, mais compacto e com cabecalho mais tecnico
- Refinamento posterior na acao `Alterar`:
  - o botao `Alterar` passou a abrir o modal `Altera cliente` somente quando ha cliente selecionado
  - sem selecao, o botao permanece desabilitado
  - a aba `Dados principais` recebeu bloco de beneficio, codigo, situacao e area de avatar
  - a aba `Contatos` recebeu telefone principal, e-mail e enderecos com acoes de criacao
  - a aba `Dados complementares` recebeu os campos operacionais do print adaptados ao dominio de cliente
  - as abas `Campos livres` e `Observacoes` nasceram preparadas para evolucao futura

## Tela de fornecedores

- A tela de fornecedores foi estruturada no padrao operacional do primeiro print:
  - barra superior unida ao shell
  - acoes do modulo
  - filtro por segmento no canto direito
  - busca de fornecedor no canto direito
  - grade principal abaixo
- Comandos aplicados:
  - `Novo fornecedor`
  - `Alterar`
  - `Detalhes`
- O botao `Novo fornecedor` agora abre modal `Novo fornecedor - Dados principais`.
- Campos adicionados no modal:
  - `Nome do fornecedor`
  - `Razao social`
  - `CPF/CNPJ`
  - `Segmento`
  - `Telefone 1`
  - `Telefone 2`
  - `E-mail 1`
- Estrutura de contatos aplicada:
  - `Telefone 1` e `Telefone 2` com `tipo`, `DDD`, `numero` e `ramal`
  - `E-mail 1` com `tipo` + `endereco`
- O modal inclui:
  - `Gravar fornecedor`
  - `Cancelar`
- Nesta etapa, `Gravar fornecedor` faz validacao e submit controlado, sem persistencia real ainda.
- Refinamento posterior na acao `Alterar`:
  - o botao `Alterar` passou a abrir o modal `Altera fornecedor` somente quando ha fornecedor selecionado
  - sem selecao, o botao permanece desabilitado
  - a aba `Dados principais` recebeu campos de cadastro, observacoes, pagamento e estado ativo
  - a aba `Dados de contato` nasceu com blocos separados para `Enderecos`, `Telefones` e `E-mails`
  - a estrutura detalhada desses blocos ficou preparada para evolucao futura

## Estrutura de dados

- Nenhum dado falso foi inventado nesta etapa.
- As duas grades ficaram prontas com colunas estruturadas e placeholders controlados onde o dominio real ainda nao esta conectado.

## Estado funcional

- Funcional nesta etapa:
  - rotas protegidas reais
  - barras operacionais
  - busca e filtros visuais
  - grades principais
  - rodape da tela de clientes
- Preparado para evolucao:
  - leitura real de clientes e fornecedores
  - persistencia
  - detalhamento real de ficha clinica
