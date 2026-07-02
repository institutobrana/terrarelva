# Decisões Técnicas

## Objetivo

Registrar decisões técnicas relevantes para reduzir retrabalho e deixar o histórico do Terra Relva mais claro.

## Decisões já observáveis no código

- O frontend novo foi separado em `frontend-react/`
- O backend mínimo usa Node.js com HTTP nativo
- A autenticação é interna e baseada em token
- O legado em `www/` continua como referência funcional e PWA
- A persistência principal atual do backend é PostgreSQL
- A persistência do legado ainda depende de `localStorage`
- Google Sheets / Apps Script aparecem como camada de sincronização ou exportação

## Decisões recomendadas para registrar daqui para frente

- Qual será o banco principal do produto
- Qual base será considerada fonte da verdade
- Como a sincronização com Google será tratada
- Como uploads e imagens serão armazenados e versionados
- Como separar módulos novos de módulos legados
- Quais rotas ainda podem operar apenas como placeholder

## Regra prática

Se uma decisão afeta:

- persistência
- segurança
- autenticação
- sincronização
- deploy
- migração de legado

ela deve virar uma decisão técnica documentada.

