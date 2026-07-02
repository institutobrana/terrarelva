# Terra Relva

Sistema da loja artesanal Terra Relva, da Flávia, para gestão de produtos, estoque, produção, precificação, vendas, clientes, pedidos, caixa, relatórios e configurações.

## Stack encontrada

- Frontend principal: `frontend-react/` com `React`, `Vite`, `TypeScript` e `Ant Design`
- Backend: `backend/` com `Node.js` HTTP server e `PostgreSQL`
- Legado/PWA: `www/` com HTML, CSS, JavaScript, `localStorage`, exportação e `service worker`
- Integração auxiliar: Google Sheets / Google Apps Script via documentação e scripts em `docs/`

## Como rodar localmente

O repositório tem mais de uma base em uso. A base nova está em `frontend-react/`, e o backend mínimo está em `backend/`.

Exemplos identificados:

- `frontend-react/`: `npm run dev`
- `backend/`: `npm run dev`
- legado PWA: `npm run serve:legacy-mobile`

## Estrutura de pastas

- `frontend-react/`: nova interface administrativa e loja
- `backend/`: API HTTP, autenticação, migrações e uploads
- `www/`: versão legada com suporte offline e sincronização
- `docs/`: documentação técnica e funcional em evolução

## Status atual

O projeto está em fase de organização documental e consolidação da arquitetura.

## Documentos principais

- [Índice da documentação](docs/README.md)
- [Auditoria do estado atual](docs/auditoria_estado_atual_terra_relva.md)
- [Plano documental](docs/plano_documentacao_terra_relva.md)
- [Roadmap](docs/roadmap.md)
- [Decisões técnicas](docs/decisoes_tecnicas.md)
- [Checklist de qualidade](docs/checklist_qualidade.md)

