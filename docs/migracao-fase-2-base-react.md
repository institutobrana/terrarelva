# Migracao Fase 2 - Base React

## Onde ficou cada parte

- Frontend oficial: `D:\TERRA RELVA APP\frontend-react`
- Backend oficial: `D:\TERRA RELVA APP\backend`
- Mobile temporario via Capacitor: `www/` e copia sincronizada em `android/`
- Frontend legado removido da raiz do projeto

## Fonte de evolucao a partir desta fase

A nova evolucao do frontend deve acontecer em `frontend-react/`.

Os arquivos estaticos antigos da raiz foram descontinuados para evitar ambiguidade com a base oficial.

## Como rodar o novo frontend

Na pasta `frontend-react/`:

```bash
npm.cmd install
npm.cmd run dev
```

## Estrategia de migracao daqui para frente

1. Manter `www/` e `android/` apenas enquanto existir vinculo real com o empacotamento mobile.
2. Evoluir frontend e autenticacao somente em `frontend-react/`.
3. Introduzir adaptadores para leitura do storage legado antes de portar formularios sensiveis.
4. Migrar gradualmente dashboard, produtos e relatorios.
5. Migrar depois fluxos sensiveis como estoque, producao, vendas e caixa.
6. Somente apos a estabilizacao do novo frontend, revisar o apontamento do mobile para o build oficial React.
