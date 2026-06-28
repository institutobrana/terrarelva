# Etapa 3 - Gramatica visual interna dos modulos do admin

## Objetivo

Padronizar a composicao visual interna dos modulos do `/admin` antes da migracao de persistencia, banco e escrita controlada.

## Gramatica definida

Os modulos administrativos passam a seguir a mesma hierarquia:

1. `ModulePageHeader`
   - titulo, descricao curta, status do modulo e acoes primarias
2. `ModuleSummaryRow`
   - faixa superior de indicadores sinteticos
3. `ModuleActionBar`
   - contexto da lista principal, tags de leitura e controles de busca
4. `ModuleSectionCard`
   - wrapper base para blocos principais do conteudo
5. `ModuleDetailPanel`
   - painel secundario com item selecionado
6. `ModuleAlertStack`
   - alertas repetiveis para base parcial, divergencias e lacunas
7. `ModuleEmptyState`
   - tratamento visual padronizado para ausencia de dados

## Componentes criados

Arquivos em `frontend-react/src/components/admin/`:

- `ModulePageHeader.tsx`
- `ModuleSummaryCard.tsx`
- `ModuleSummaryRow.tsx`
- `ModuleActionBar.tsx`
- `ModuleSectionCard.tsx`
- `ModuleDetailPanel.tsx`
- `ModuleEmptyState.tsx`
- `ModuleAlertStack.tsx`

## Aplicacao em Precificacao

- cabecalho interno substitui o hero especifico da pagina
- cards de resumo mostram volume, receitas, incompletude e divergencias
- barra de acao concentra busca, contexto da base hibrida e tags sem duplicar markup
- tabela principal ficou dentro do wrapper padronizado
- painel de detalhe usa o mesmo padrao secundario dos outros modulos
- estados parciais e ausencia de composicao ganharam tratamento visual proprio

## Aplicacao em Producao

- cabecalho interno unificado com o mesmo comportamento de precificacao
- faixa superior resume leitura, producoes, incompletude e custo total
- bloco principal de lista recebeu a mesma barra de acao e mesma estrutura de wrapper
- painel de detalhe usa o mesmo componente secundario da precificacao
- observacoes vazias e integridade parcial agora seguem o mesmo padrao

## O que isso prepara

Essa camada reduz divergencia estrutural entre modulos e deixa um caminho mais seguro para encaixar:

- `Estoque`
- telas de criacao e edicao futuras
- persistencia nova
- backend e escrita controlada
