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

## Em auditoria

- Produtos completos
- Estoque com matéria-prima e produto acabado
- Produção com transformação real de insumos
- Precificação com custo total e margem
- Vendas com pagamento e recebimento
- Pedidos com status operacional
- Relatórios consolidados
- Persistência e sincronização

## Pendente

- Banco central único para todos os módulos
- Contratos funcionais por módulo
- Modelo de dados documentado
- Guia de deploy e execução consolidado
- Checklist de qualidade
- Padrões de commit

## Risco técnico

- Dependência do `localStorage` no legado
- Sincronização parcial com Google Sheets
- Convivência entre legado e nova base sem contrato único
- Falta de documentação consolidada para orientar mudanças seguras
- Possível fragmentação de dados entre navegador, backend e planilhas

## Próxima etapa recomendada

1. Congelar o escopo desta fase em documentação
2. Consolidar contratos funcionais dos módulos principais
3. Definir a estratégia de persistência principal
4. Mapear o modelo de dados de produção, estoque, vendas e caixa
5. Depois disso, seguir para modularização segura

