# Gestao interna de usuarios - troca real de senha - 2026-06-28

## Objetivo

Conectar o modal `Alterar senha` ao backend real com persistencia no PostgreSQL.

## Backend

### Endpoint criado

- `POST /auth/change-password`

### Regras aplicadas

- rota protegida por token `Bearer`
- troca vinculada apenas ao usuario autenticado
- exige:
  - `currentPassword`
  - `newPassword`
  - `confirmPassword`
- valida:
  - senha atual obrigatoria
  - nova senha obrigatoria
  - confirmacao obrigatoria
  - confirmacao igual a nova senha
  - senha atual correta contra `password_hash`

### Persistencia

- o backend gera novo hash com `scrypt`
- atualiza `password_hash` na tabela `users`
- o `updated_at` segue sendo atualizado pelo trigger ja existente no banco

## Frontend

- o modal existente em `AdminActionTopbar.tsx` passou a chamar o endpoint real
- loading mantido no botao `Gravar senha`
- erros amigaveis mostrados no formulario
- sucesso seguido de logout forcado no frontend

## Comportamento apos troca

Foi adotado logout forcado no frontend apos sucesso.

Motivo:

- a arquitetura atual usa JWT stateless
- nao existe, nesta etapa, mecanismo de revogacao imediata de token no servidor
- por isso, a medida mais coerente e segura dentro da base atual e limpar a sessao local e exigir novo login com a nova senha

## Validacao executada

Fluxo testado com usuario real de banco:

1. login com senha atual
2. `POST /auth/change-password`
3. login com senha antiga falhando
4. login com senha nova funcionando
5. senha revertida para o valor original do usuario de teste

## Arquivos alterados

- `backend/src/repositories/usersRepository.js`
- `backend/src/services/authService.js`
- `backend/src/server.js`
- `frontend-react/src/services/auth/authApi.ts`
- `frontend-react/src/components/admin/AdminActionTopbar.tsx`
