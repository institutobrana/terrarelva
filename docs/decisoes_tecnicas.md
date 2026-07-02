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

## Decisão formal: PostgreSQL como fonte única de verdade do sistema Terra Relva

### Contexto

O Terra Relva nasceu com três camadas convivendo ao mesmo tempo:

- um legado em `www/` com `localStorage`
- um frontend React em evolução
- um backend com PostgreSQL ainda parcial

Isso criou risco de duplicidade, perda de dados e divergência entre versões.

### Problema anterior

- O legado guardava dados operacionais no navegador
- O Google Sheets participava do fluxo como apoio
- O backend ainda não centralizava todo o domínio
- Não existia uma fonte oficial única para o negócio

### Decisão tomada

- PostgreSQL passa a ser a fonte única de verdade do sistema
- O backend é o responsável por persistência e regra de negócio
- O frontend React é a interface oficial
- O legado continua apenas como transição até a migração ser concluída

### Impacto no projeto

- Reduz o risco de conflito entre versões
- Permite integridade relacional e histórico mais seguro
- Facilita expansão de módulos de forma profissional
- Obriga a tratar Google Sheets como integração secundária
- Exige documentação e migração controlada antes de novas funcionalidades

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
