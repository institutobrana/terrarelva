# Base minima de clientes e fornecedores - etapa 2026-06-28

## Migrations criadas

- Foi criada a migration `backend/src/db/migrations/003_create_clients_and_suppliers.sql`.

## Tabelas de clientes

- `clients`
- `client_phones`
- `client_emails`
- `client_addresses`

Campos principais em `clients`:
- `id`
- `full_name`
- `gender`
- `birth_date`
- `internal_code`
- `cpf`
- `document_type_text`
- `document_number`
- `responsible_name`
- `responsible_cpf`
- `status_text`
- `notes`
- `is_active`
- `created_at`
- `updated_at`

## Tabelas de fornecedores

- `suppliers`
- `supplier_phones`
- `supplier_emails`
- `supplier_addresses`

Campos principais em `suppliers`:
- `id`
- `trade_name`
- `company_name`
- `cpf_cnpj`
- `state_registration`
- `website`
- `segment_text`
- `payment_details`
- `notes`
- `is_active`
- `created_at`
- `updated_at`

## Relacionamentos

- `client_phones.client_id -> clients.id`
- `client_emails.client_id -> clients.id`
- `client_addresses.client_id -> clients.id`
- `supplier_phones.supplier_id -> suppliers.id`
- `supplier_emails.supplier_id -> suppliers.id`
- `supplier_addresses.supplier_id -> suppliers.id`

Todos os relacionamentos usam `ON DELETE CASCADE`.

## Decisao por texto simples

- Campos como tipo de documento, tipo de telefone, tipo de e-mail, segmento e status ficaram como texto simples nesta etapa.
- Isso foi feito para manter o escopo minimo e funcional, sem criar tabelas auxiliares antes da hora.

## Seed minima

- Foi criado o script `backend/src/scripts/seed-clients-suppliers.js`.
- Ele insere:
  - 2 clientes
  - 1 telefone para cada cliente
  - 1 e-mail para cada cliente
  - 2 fornecedores
  - 1 telefone para cada fornecedor
  - 1 e-mail para cada fornecedor

## Como rodar

- Migrations:
  - `npm run db:migrate`
- Seed tecnica:
  - `npm run db:seed-clients-suppliers`

## Como validar os dados

- Listar clientes:
  - `SELECT full_name, internal_code, status_text FROM clients;`
- Listar telefones de clientes:
  - `SELECT client_id, phone_type_text, ddd, phone_number FROM client_phones;`
- Listar fornecedores:
  - `SELECT trade_name, segment_text, cpf_cnpj FROM suppliers;`
- Listar e-mails de fornecedores:
  - `SELECT supplier_id, email_type_text, email FROM supplier_emails;`

## Etapa funcional posterior

- Endpoints protegidos criados:
  - `GET /admin/clients`
  - `GET /admin/suppliers`
- Os retornos trazem:
  - dados principais das tabelas base
  - telefone principal resumido
  - e-mail principal resumido
- As grades de `Cadastro -> Clientes` e `Cadastro -> Fornecedores` passaram a consumir esses endpoints reais.
