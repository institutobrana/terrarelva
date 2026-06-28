# Etapa 3: autenticacao interna com PostgreSQL

## Decisao de stack

- Frontend existente: React 19 + Vite + Ant Design em `frontend-react/`.
- Backend introduzido nesta etapa: Node.js nativo com modulos ESM e API HTTP minima em `backend/`.
- Banco: PostgreSQL existente `terra_relva`.

Esta abordagem foi escolhida para criar a fundacao correta de autenticacao sem acoplar uma estrutura grande demais ao projeto.

## O que foi criado

- Configuracao de ambiente em `backend/.env.example`.
- Conexao com PostgreSQL via `DATABASE_URL`.
- Migracao SQL para tabela `users`.
- Estrutura de autenticacao com:
  - hash de senha via `scrypt`
  - token JWT assinado com HMAC SHA-256
  - endpoint `POST /auth/login`
  - endpoint protegido `GET /auth/me`
- Script tecnico para criar o primeiro administrador.

## Estrutura da tabela `users`

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `is_active`
- `last_login_at`
- `created_at`
- `updated_at`

## Como criar o admin inicial

1. Copiar `backend/.env.example` para `backend/.env`.
2. Preencher `DATABASE_URL` com a senha real do usuario `terra_relva_user`.
3. Definir `JWT_SECRET`.
4. Executar:

```bash
npm run db:seed-admin -- "Administrador Terra Relva" admin@terrarelva.com senha-forte
```

Esse fluxo nao cria interface publica nem endpoint aberto de cadastro.

## Rotas disponiveis

- `POST /auth/login`
- `GET /auth/me`
- `GET /health`

Nao existe `POST /register`, rota de signup, botao de criar conta ou onboarding publico.

## Preparacao no frontend

- `AuthProvider` para carregar sessao.
- `ProtectedRoute` para proteger `/admin`.
- `LoginPage` tecnica para validacao do backend.
- `VITE_API_BASE_URL` para apontar ao backend local.

## Validacao local e em rede

### Estado validado nesta rodada

- A base oficial validada foi `D:\TERRA RELVA APP`.
- O PostgreSQL local em `localhost:5432` respondeu com `pg_isready`.
- O backend continua preparado para ler `DATABASE_URL`, `JWT_SECRET`, `HOST` e `CORS_ORIGINS` via ambiente.
- O frontend agora trata login, bootstrap de sessao, redirecionamento para `/admin` e logout.
- A estrategia de API base agora atende localhost, rede local e futura publicacao externa.

### Pendencia manual atual

- A senha efetiva do usuario `terra_relva_user` nao estava disponivel na sessao.
- Sem essa senha nao foi possivel executar a migration e o seed reais contra `terra_relva` nesta rodada.
- Assim que a senha local for preenchida no `backend/.env`, o fluxo abaixo pode ser executado sem alterar a base.

### Backend

```bash
cd backend
copy .env.example .env
npm.cmd install
npm.cmd run db:migrate
npm.cmd run db:seed-admin -- "Administrador Terra Relva" admin@terrarelva.com senha-forte
npm.cmd run dev
```

### Frontend

```bash
cd frontend-react
copy .env.example .env
npm.cmd install
npm.cmd run dev
```

Com isso, a tela `/auth/login` pode autenticar e liberar acesso ao `/admin`.
