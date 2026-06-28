# Estabilizacao do login local e em rede - 2026-06-28

## Base oficial

- Diretorio oficial: `D:\TERRA RELVA APP`
- Frontend oficial: `frontend-react/`
- Backend oficial: `backend/`

## Estrategia final do backend

### Host e porta

- `HOST=0.0.0.0`
- `PORT=4000`

Com isso, o backend aceita acesso local e pela rede local.

### CORS

O backend agora aceita uma lista de origens via `CORS_ORIGINS`, separadas por virgula.

Exemplo:

```env
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://192.168.3.41:8080
```

O servidor:

- valida a origem recebida
- responde apenas para origens permitidas
- continua pronto para adicionar dominio externo depois

## Estrategia final do frontend

### Base da API

O frontend segue esta ordem:

1. usa `VITE_API_BASE_URL` se estiver preenchido
2. se nao estiver, monta automaticamente `http(s)://HOST_ATUAL:4000`

Isso permite:

- `localhost:8080` falar com `localhost:4000`
- `192.168.x.x:8080` falar com `192.168.x.x:4000`
- futuro dominio publicado usar override explicito em `VITE_API_BASE_URL`

## Cenarios de uso

### Localhost

- frontend: `http://localhost:8080`
- backend: `http://localhost:4000`

### Rede local

- frontend: `http://IP_DA_MAQUINA:8080`
- backend: `http://IP_DA_MAQUINA:4000`

### Externo/publicado

- adicionar a origem publica em `CORS_ORIGINS`
- definir `VITE_API_BASE_URL` com a URL publica real, se necessario

## Arquivos de ambiente

### Backend `.env`

```env
HOST=0.0.0.0
PORT=4000
DATABASE_URL=postgresql://terra_relva_user:SUA_SENHA@localhost:5432/terra_relva
JWT_SECRET=seu-segredo
JWT_EXPIRES_IN=8h
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://192.168.3.41:8080
```

### Frontend `.env`

Para local e rede, pode ficar vazio:

```env
VITE_API_BASE_URL=
```

Para publicacao externa, preencher explicitamente:

```env
VITE_API_BASE_URL=https://api.seu-dominio.com
```

## Inicializacao oficial

Use:

`D:\TERRA RELVA APP\INICIAR_TERRA_RELVA.bat`

Esse script sobe:

- backend em `4000`
- frontend React em `8080`
- frontend com `--host 0.0.0.0`

## Observacao de seguranca

O login continua exclusivamente interno.

Nao existe:

- `/register`
- criar conta
- onboarding publico
