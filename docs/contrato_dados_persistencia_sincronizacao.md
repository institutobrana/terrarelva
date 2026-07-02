# Contrato de Dados, Persistência e Sincronização

## 1. Fonte de verdade

O PostgreSQL é a única fonte de verdade do sistema Terra Relva.

### Por que esta decisão existe

- O sistema precisa de consistência entre produtos, estoque, produção, vendas, clientes, pedidos e caixa
- O banco relacional permite integridade, relacionamentos, validação e histórico mais seguro
- A operação precisa sobreviver a troca de navegador, troca de aparelho e limpeza de cache
- O modelo atual do legado em `localStorage` não garante confiabilidade profissional para o negócio
- Google Sheets é útil para consulta, espelho e exportação, mas não deve controlar a verdade dos dados

### O que não pode ser fonte principal

- `localStorage`
  - fica no navegador do usuário
  - pode ser limpo manualmente
  - depende do aparelho atual
  - não é adequado para multiusuário nem para histórico confiável

- Google Sheets
  - é bom para visualização e apoio operacional
  - não é banco transacional do sistema
  - pode sofrer atraso, conflito ou alteração manual fora do fluxo oficial
  - não deve decidir sozinho o estado real do negócio

## 2. Papel de cada camada

### Backend

- Centraliza regra de negócio
- Grava e lê dados do PostgreSQL
- Valida operações críticas
- Expõe APIs para o frontend

### Frontend React

- É a interface oficial de operação
- Consome o backend
- Não deve ser a origem dos dados
- Não deve conter estado operacional durável fora do necessário para sessão e interface

### Legado `www/`

- Serve apenas como base temporária
- Continua útil enquanto a migração não estiver concluída
- Não deve receber novas dependências estratégicas
- Deve ser tratado como transição, não como destino

## 3. Situação atual resumida

### Ainda está no `localStorage`

- Estado completo do legado
- Produtos do legado
- Clientes do legado
- Produções do legado
- Vendas do legado
- Compras do legado
- Itens de estoque do legado
- Caixas e lançamentos do legado
- Configurações de sincronização do legado

### Já está no backend

- Autenticação
- Usuários internos
- Clientes
- Fornecedores
- Telefones, e-mails e endereços de clientes e fornecedores
- Tabelas auxiliares
- Upload de imagens de fornecedor

### Ainda depende de Google

- Exportação e sincronização do legado
- Fluxos de planilha e Apps Script documentados como apoio operacional

## 4. Estratégia de migração

### Direção

- Migrar os dados operacionais para PostgreSQL
- Manter o legado apenas durante a transição
- Reduzir gradualmente a dependência de `localStorage`

### Como sair do `localStorage`

- Mapear entidades do legado para tabelas reais do backend
- Criar rotinas de importação de dados existentes quando for seguro
- Validar o resultado da migração antes de desligar o uso operacional do legado

### Como lidar com os dados existentes

- Os dados antigos não devem ser descartados sem plano
- A migração deve preservar histórico útil sempre que possível
- Se houver inconsistência, o registro oficial deve vir do PostgreSQL após validação

### Script de migração

- Um script de migração será recomendado quando houver modelagem mínima consolidada
- O uso do script deve ser controlado e documentado
- Migração automática só deve acontecer com mapeamento claro e teste de conferência

### Legado congelado ou temporário

- O legado deve ser mantido temporariamente
- Ele não deve receber novas evoluções estruturais
- Funciona como ponte até o frontend React e o backend cobrirem o domínio necessário

## 5. Sincronização com Google

### Decisão

- Google Sheets não é banco principal
- A integração com Google fica como apoio secundário
- Se mantida, deve operar como exportação, consulta auxiliar ou espelho

### Papel recomendado

- Não decidir estado real do sistema
- Não substituir a persistência do PostgreSQL
- Não ser a origem oficial de alterações críticas

## 6. Riscos e cuidados

### Perda de dados

- O `localStorage` pode ser apagado
- O legado pode divergir do backend
- Uploads locais precisam de política de backup

### Duplicidade

- O uso simultâneo de duas bases pode gerar registros duplicados
- Uma mesma informação pode existir no legado, no backend e na planilha

### Inconsistência

- Alterações em um sistema podem não refletir imediatamente no outro
- O usuário pode ter a sensação de que salvou algo, mas em outra tela ver estado diferente

### Dois sistemas ao mesmo tempo

- Usar o legado e o React em paralelo sem regra clara aumenta risco de conflito
- A transição precisa ser controlada e documentada

## 7. Regra definitiva

Enquanto a migração não terminar:

- PostgreSQL é a verdade oficial
- Frontend React é a interface oficial
- O legado é transitório
- Google é apoio secundário

