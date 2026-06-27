# Migracao Fase 2 - Base React

## Onde ficou cada parte

- Legado atual: raiz do projeto `C:\Users\Tel\Documents\TERRA RELVA APP`
- Mobile atual via Capacitor: `www/` e copia sincronizada em `android/`
- Nova base React: `C:\Users\Tel\Documents\TERRA RELVA APP\frontend-react`

## Fonte de evolucao a partir desta fase

A nova evolucao do frontend deve acontecer em `frontend-react/`.

O legado continua preservado na raiz enquanto os modulos sao migrados por etapas.

## Como rodar o legado

Na raiz do projeto:

```bash
python -m http.server 8080
```

## Como rodar o novo frontend

Na pasta `frontend-react/`:

```bash
npm install
npm run dev
```

## Estrategia de migracao daqui para frente

1. Manter o legado operacional sem alterar o fluxo atual do Capacitor.
2. Migrar primeiro modulos de leitura e shells visuais no novo frontend.
3. Introduzir adaptadores para leitura do storage legado antes de portar formularios sensiveis.
4. Migrar gradualmente dashboard, produtos e relatorios.
5. Migrar depois fluxos sensiveis como estoque, producao, vendas e caixa.
6. Somente apos a estabilizacao do novo frontend, revisar o apontamento do mobile para o novo build.
