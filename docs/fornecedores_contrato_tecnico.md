# Contrato Tecnico - Fornecedores

## 1. Stack

- Backend Node.js com HTTP nativo
- PostgreSQL como fonte de verdade
- Frontend React com TypeScript e Ant Design

## 2. Tabelas envolvidas

- `suppliers`
- `supplier_addresses`
- `supplier_phones`
- `supplier_emails`
- `supplier_segments`

## 3. Campos principais

- `trade_name`
- `company_name`
- `cpf_cnpj`
- `state_registration`
- `website`
- `segment_text`
- `payment_details`
- `notes`
- `is_active`
- `image_path`

## 4. Upload de imagem

- O backend recebe multipart/form-data
- A imagem eh salva em `backend/uploads/fornecedores/`
- O nome do arquivo eh sanitizado e enriquecido com `supplierId`, timestamp e UUID

## 5. `image_path`

- O caminho relativo do arquivo eh persistido na tabela `suppliers`
- O caminho nao guarda binario, apenas a referencia local do arquivo

## 6. `imageUrl`

- O backend converte `image_path` em URL publica via `toPublicUrl`
- O frontend consome essa URL para exibir a imagem

## 7. services/repositories

- `supplierContactsRepository.js` faz CRUD do fornecedor e dos contatos
- `supplierContactsService.js` expoe a camada de servico e a checagem de exclusao
- `suppliersRepository.js` lista fornecedores com imagem e contato primario
- `suppliersService.js` adapta o retorno para o frontend

## 8. `checkDeleteSupplierRecord`

- Valida se o fornecedor existe
- Retorna 404 se o registro nao existir
- Para fornecedor existente, permite exclusao porque hoje nao ha vinculo externo real identificado que bloqueie

## 9. Limites conhecidos

- A exclusao nao remove o arquivo fisico da imagem
- A checagem de exclusao nao bloqueia por vinculos externos porque nenhum vinculo externo real foi identificado nesta etapa
- A migration de base com Clientes continua compartilhada e nao entra neste fechamento
