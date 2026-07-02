# Auditoria do Estado Atual do Terra Relva

Data da auditoria: 2026-07-02

## 1. Diretório e Git

- Diretório usado: `D:\TERRA RELVA APP`
- Branch atual no momento da auditoria: `codex/configuracoes-lateral`
- Remoto configurado: `origin -> https://github.com/institutobrana/terrarelva.git`
- Situação inicial: havia alterações preexistentes em arquivos do backend, frontend, docs e alguns arquivos não rastreados

## 2. Estrutura geral do projeto

### Pastas principais

- `frontend-react/`: frontend React novo
- `backend/`: backend HTTP com PostgreSQL
- `www/`: base legada/PWA
- `docs/`: documentação acumulada do projeto

### Tecnologias identificadas

- Frontend novo: React 19, Vite, TypeScript, Ant Design, React Router
- Backend: Node.js, `node:http`, `pg`, `busboy`
- Banco: PostgreSQL
- Legado: HTML/CSS/JS puro com `localStorage`
- PWA: `www/manifest.json` e `www/sw.js`

### Arquivos de configuração e execução

- `package.json` na raiz: scripts para servir o legado e preparar Android via Capacitor
- `frontend-react/package.json`: scripts de desenvolvimento e build do frontend novo
- `backend/package.json`: scripts de migração, seed e dev do backend
- `www/manifest.json`: configuração PWA
- `www/sw.js`: service worker do legado

## 3. Funcionalidades existentes

### Frontend novo

- `admin/hoje`: dashboard inicial
- `admin/produtos`: página de produtos
- `admin/estoque`: página de estoque
- `admin/vendas`: página de vendas
- `admin/producao`: página de produção
- `admin/clientes`: página de clientes
- `admin/fornecedores`: cadastro de fornecedores
- `admin/financeiro` e `admin/financeiro/fluxo-de-caixa`: caixa e fluxo de caixa
- `admin/precificacao`: precificação
- `admin/configuracoes`: configurações gerais
- `admin/configuracoes/usuarios-sistema`: usuários do sistema
- `admin/configuracoes/tabelas-auxiliares`: tabelas auxiliares
- `admin/configuracoes/plano-contas`: plano de contas
- `admin/configuracoes/contas-bancarias`: contas bancárias
- `loja/` e `loja/catalogo`: loja pública em base inicial

### Backend

- Autenticação interna em `/auth/login`, `/auth/me` e `/auth/change-password`
- Cadastro e consulta de clientes
- Cadastro, consulta, edição, remoção e upload de imagem de fornecedores
- Usuários internos com controle de acesso
- Tabelas auxiliares:
  - formas de pagamento
  - motivos de agendamento
  - situações de agendamento
  - tipos de indicação
  - segmentos de fornecedor
  - grupos de materiais
  - ocupações
- Servir arquivos de upload em `/uploads/`

### Legado `www/`

- Cadastro e estado operacional persistidos em `localStorage`
- Service worker para cache offline
- Exportação para Google Sheets / Apps Script
- Base de produtos, clientes, produção, vendas, caixa, estoque e sincronização

## 4. Persistência de dados

### Onde os dados ficam hoje

- PostgreSQL no backend para usuários, clientes, fornecedores, tabelas auxiliares e autenticação
- `localStorage` no frontend React apenas para token de autenticação e filtros de interface
- `localStorage` no legado `www/` para praticamente todo o estado do app
- Arquivos enviados de fornecedores salvos em `backend/uploads/fornecedores/`
- Google Sheets / Apps Script como sincronização ou exportação no legado

### O que fica só no navegador/aparelho

- Token de autenticação do React
- Filtros locais e preferências de tela
- Estado completo do legado em `localStorage`

### O que vai para a nuvem

- Dados cadastrados no backend PostgreSQL
- Exportações e sincronizações que o legado envia para Google Sheets

### Diagnóstico de risco

- Se o dado estiver só em `localStorage`, ele pode ser perdido ao limpar navegador, trocar aparelho ou abrir outro dispositivo
- Se a sincronização com Google falhar, a fila local pode acumular divergências
- Se o backend não cobrir todos os módulos, parte importante do negócio ainda ficará descentralizada
- Os uploads de imagem dependem do armazenamento local do servidor, o que exige backup e política de retenção

## 5. Regras de negócio já implementadas

### Clientes

- Cadastro com nome, documento, dados básicos, telefones, e-mails e endereços
- Detalhe do cliente com histórico e estrutura para relacionamento

### Fornecedores

- Cadastro com razão social/nome fantasia, documento, site, segmento, pagamento e observações
- Telefones, e-mails, endereços e imagem
- Regras de exclusão protegida com validação de uso

### Tabelas auxiliares

- Cadastro, edição, ativação/desativação, exclusão e substituição
- Restrições para evitar remoção de registros em uso

### Autenticação

- Login por token
- Consulta do usuário atual
- Troca de senha do usuário autenticado
- Controle de administrador para rotas sensíveis

## 6. Lacunas funcionais frente ao escopo desejado

### Existe de forma parcial

- Produtos: existe como tela, mas ainda sem backend completo de domínio
- Estoque: existe como tela, mas sem modelagem completa de matéria-prima, perdas e vencimentos
- Produção: existe como tela, mas sem fluxo produtivo real consolidado no backend
- Precificação: existe como tela, mas sem cálculo completo integrado ao domínio desejado
- Vendas: existe como tela, mas sem o fluxo completo de pedidos e pagamentos descrito no escopo alvo
- Clientes: existe cadastro real no backend
- Configurações: existe com várias seções e tabelas auxiliares

### Ainda ausente ou apenas placeholder

- Pedidos com status operacional completo
- Loja online com catálogo real e carrinho simples conectado ao banco
- Relatórios consolidados
- Fluxo de caixa profissional com lançamentos completos
- Controle unificado de produção, estoque e vendas
- Sincronização robusta com Google como banco principal

## 7. Documentação existente

### Encontrada

- `README.md` na raiz: criado nesta auditoria para visão inicial
- `backend/README.md`: explica o backend mínimo e scripts
- `frontend-react/README.md`: explica a base React nova
- `docs/google-apps-script.md`: orienta a integração com Sheets
- Vários arquivos de etapa em `docs/`, com evolução histórica do projeto
- `frontend-react/src/modules/*/README.md`: pequenos READMEs por módulo
- `frontend-react/src/services/README.md` e subpastas: notas técnicas de serviços

### Situação

- A documentação existe, mas está espalhada
- Parte dela é histórica e parte já indica o rumo atual
- Falta um conjunto documental consolidado com auditoria, contratos e roadmap único

## 8. Documentação que deveria existir

Recomendação mínima:

- `README.md`
- `docs/roadmap.md`
- `docs/arquitetura.md`
- `docs/estado_atual_auditoria.md`
- `docs/contrato_funcional_geral.md`
- `docs/contrato_modulo_produtos.md`
- `docs/contrato_modulo_estoque.md`
- `docs/contrato_modulo_producao.md`
- `docs/contrato_modulo_precificacao.md`
- `docs/contrato_modulo_vendas.md`
- `docs/contrato_modulo_clientes.md`
- `docs/contrato_modulo_pedidos.md`
- `docs/contrato_modulo_fluxo_caixa.md`
- `docs/contrato_modulo_loja_online.md`
- `docs/contrato_modulo_relatorios.md`
- `docs/contrato_dados_persistencia_sincronizacao.md`
- `docs/contrato_ui_ux_mobile_first.md`
- `docs/regras_negocio.md`
- `docs/modelo_dados.md`
- `docs/api_integracoes.md`
- `docs/deploy_execucao.md`
- `docs/changelog.md`
- `docs/decisoes_tecnicas.md`
- `docs/checklist_qualidade.md`
- `docs/padroes_git_commit.md`

## 9. Riscos técnicos

### P1 crítico

- Parte relevante do histórico operacional ainda mora em `localStorage` no legado
- Não há banco único consolidado para todos os módulos de negócio
- A sincronização com Google é acessória, não claramente o banco principal
- Falta cobertura documental unificada de deploy, dados e regras de negócio

### P2 importante

- Módulos importantes ainda estão como placeholders no frontend novo
- Não há documentação formal de contratos por módulo
- Risco de conflito entre legado e nova base enquanto a migração segue
- Não há evidência de testes automatizados cobrindo os fluxos principais

### P3 melhoria

- Padronizar nomenclatura documental
- Separar melhor contratos funcionais, arquitetura e histórico
- Consolidar changelog e decisões técnicas em um fluxo contínuo

## 10. Recomendações de ordem segura

### Fase 1

- Fechar auditoria e documentação base

### Fase 2

- Criar contratos funcionais por módulo

### Fase 3

- Revisar persistência e sincronização

### Fase 4

- Modularizar com segurança

### Fase 5

- Evoluir funcionalidades já mapeadas

### Fase 6

- Fortalecer testes, backup, deploy e segurança

## 11. Conclusão

O Terra Relva já tem uma base importante de administração, autenticação, cadastros e algumas rotas de operação. Porém, ainda existe uma divisão forte entre o legado em `localStorage`, o novo frontend React e o backend PostgreSQL. O próximo passo mais seguro é consolidar documentação e contratos para reduzir risco de migração.

