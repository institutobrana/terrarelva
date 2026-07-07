# Contrato Funcional - Fornecedores

## 1. Objetivo do modulo

Gerenciar a base de fornecedores da Terra Relva com cadastro, consulta, edicao, contatos e imagem do fornecedor.

## 2. Fluxos entregues

- Cadastro de fornecedor
- Listagem de fornecedores
- Detalhe do fornecedor
- Edicao de dados do fornecedor
- Cadastro de enderecos
- Cadastro de telefones
- Cadastro de e-mails
- Upload e exibicao de imagem do fornecedor
- Exclusao com checagem previa

## 3. Listagem

- Exibe nome fantasia, segmento, documento, telefone principal, e-mail principal, status e imagem quando existir
- Permite busca e leitura rapida da base

## 4. Detalhe

- Mostra dados cadastrais do fornecedor
- Exibe enderecos, telefones, e-mails e imagem
- A URL da imagem eh montada a partir do caminho persistido no backend

## 5. Criacao

- Permite criar fornecedor com dados basicos e contatos principais
- O cadastro usa PostgreSQL como fonte de verdade

## 6. Edicao

- Permite atualizar dados do fornecedor
- Permite alterar contatos
- Permite trocar a imagem do fornecedor

## 7. Contatos

- Telefones
- E-mails
- Enderecos

## 8. Imagem do fornecedor

- O usuario pode selecionar imagem do disco ou capturar pela camera
- A imagem eh enviada ao backend e exibida no cadastro e no detalhe

## 9. Exclusao

- A exclusao passa por checagem previa no backend
- Se o fornecedor nao existir, a operacao retorna erro 404
- Se o fornecedor existir e nao houver bloqueio externo real, a exclusao eh permitida

## 10. Pendencia conhecida

- A exclusao nao remove fisicamente o arquivo da imagem em `backend/uploads/fornecedores/`
- Isso fica como pendencia operacional futura, sem bloquear o fluxo funcional
