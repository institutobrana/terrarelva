# Terra Relva Backend

Backend minimo para autenticacao interna com PostgreSQL.

## Fluxo previsto

- Nao existe rota publica de cadastro.
- O primeiro administrador e criado apenas via script tecnico.
- O frontend React faz login por `POST /auth/login`.
- Rotas autenticadas usam token `Bearer`.

## Scripts

- `npm run db:migrate`
- `npm run db:seed-admin -- "Nome" email@terrarelva.com senha-forte`
- `npm run db:seed-clients-suppliers`
- `npm run dev`
