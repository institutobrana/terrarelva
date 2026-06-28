# Descontinuacao controlada do frontend legado - 2026-06-28

## Base oficial

- Frontend oficial: `frontend-react/`
- Backend oficial: `backend/`
- Diretorio canônico: `D:\TERRA RELVA APP`

## Inventario auditado na raiz

### Legado estatico na raiz

- `index.html`
- `app.js`
- `styles.css`
- `sw.js`
- `manifest.json`

Esses arquivos formavam a antiga entrada web direta da aplicacao e nao sao mais usados pelo frontend React oficial.

### Estrutura mantida temporariamente

- `www/`
- `android/`
- `package.json`
- `package-lock.json`
- `node_modules/`
- `capacitor.config.json`

Esses itens continuam ligados ao empacotamento Android legado via Capacitor e, por isso, nao foram removidos nesta rodada.

### Estrutura preservada por ser oficial

- `frontend-react/`
- `backend/`
- `docs/`
- `assets/`

## Camadas de remocao

### Camada 1 - remocao segura imediata

- `index.html`
- `app.js`
- `styles.css`
- `sw.js`
- `manifest.json`

### Camada 2 - remocao condicional

- `www/`
- `android/`
- `package.json`
- `package-lock.json`
- `node_modules/`
- `capacitor.config.json`

Esses itens so devem sair quando o empacotamento Android for oficialmente repontado do legado para o build correto do React.

## Resultado

O frontend legado da raiz foi descontinuado sem tocar na base oficial React, no backend nem na trilha temporaria de mobile.
