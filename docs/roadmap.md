# Roadmap do Terra Relva

## Já existe

- Frontend React novo com shell administrativo
- Backend HTTP com autenticação e PostgreSQL
- Cadastro de clientes
- Cadastro de fornecedores
- Tabelas auxiliares
- Página de produção
- Página de precificação
- Página de estoque
- Página de vendas
- Página de caixa e fluxo de caixa
- Página de configurações
- Base de loja pública em `/loja`
- Legado com `localStorage`, exportação e sincronização via Apps Script

## Fase crítica

Esta fase precisa acontecer antes de novas expansões de domínio.

- Unificação de dados no PostgreSQL
- Migração do legado
- Desligamento gradual do `localStorage` como banco operacional

### Dependências desta fase

- Modelo de dados mínimo consolidado
- Contrato de persistência e sincronização
- Mapeamento das entidades principais
- Validação dos dados já existentes

### O que não deve ser desenvolvido antes disso

- Novas telas que dependam de dados ainda presos ao legado
- Nova lógica de negócio que assuma duas fontes de verdade ao mesmo tempo
- Expansão de sincronização sem contrato claro
- Rotinas automáticas de escrita em múltiplas bases sem migração definida

## Em auditoria

- Produtos completos
- Estoque com matéria-prima e produto acabado
- Produção com transformação real de insumos
- Precificação com custo total e margem
- Vendas com pagamento e recebimento
- Pedidos com status operacional
- Relatórios consolidados
- Persistência e sincronização

## Concluído

- Tabelas > Tabela de insumos
  - backend real com PostgreSQL
  - frontend operacional
  - modais de tabela
  - modais de insumo
  - combos reais com tabelas auxiliares
  - código interno numérico com menor livre
  - cálculo de custo unitário por `Preço / Relação`
  - filtro por `Grupos de material`
  - pesquisa por nome
  - exclusão de tabela e item
  - validação manual pelo usuário

 - Fornecedores
  - cadastro
  - listagem
  - detalhe
  - ediÃ§Ã£o
  - contatos
  - upload e exibicao de imagem
  - URL publica da imagem
  - exclusao com checagem previa
  - pendencia operacional conhecida: imagem fisica orfa na exclusao

## Pendente

- Banco central único para todos os módulos
- Contratos funcionais por módulo
- Modelo de dados documentado
- Guia de deploy e execução consolidado
- Checklist de qualidade
- Padrões de commit
- Modelagem física final do banco para todos os módulos

## Risco técnico

- Dependência do `localStorage` no legado
- Sincronização parcial com Google Sheets
- Convivência entre legado e nova base sem contrato único
- Falta de documentação consolidada para orientar mudanças seguras
- Possível fragmentação de dados entre navegador, backend e planilhas
- Usuário operar o legado e o React em paralelo sem regra de corte

## Próxima etapa recomendada

1. Congelar o escopo desta fase em documentação
2. Consolidar contratos funcionais dos módulos principais
3. Definir a estratégia de persistência principal
4. Mapear o modelo de dados de produção, estoque, vendas e caixa
5. Depois disso, seguir para modularização segura
6. Integrar a Tabela de insumos com ficha técnica / produção
7. Integrar baixa automática de insumos
8. Integrar entrada de produto acabado
9. Integrar precificação
10. Integrar estoque mínimo e alertas
