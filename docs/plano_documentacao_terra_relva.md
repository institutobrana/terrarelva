# Plano de Documentação do Terra Relva

## Objetivo

Organizar a documentação do projeto de forma profissional, centralizando o que existe hoje e criando contratos claros para os módulos principais.

## Princípios

- Não duplicar informação sem necessidade
- Manter linguagem simples e objetiva
- Separar estado atual, decisão técnica, contrato funcional e roadmap
- Documentar antes de ampliar comportamento
- Tratar o legado como referência histórica, não como destino final

## Estrutura documental proposta

### Raiz

- `README.md`

### Pasta `docs/`

- `roadmap.md`
- `arquitetura.md`
- `estado_atual_auditoria.md`
- `contrato_funcional_geral.md`
- `contrato_modulo_produtos.md`
- `contrato_modulo_estoque.md`
- `contrato_modulo_producao.md`
- `contrato_modulo_precificacao.md`
- `contrato_modulo_vendas.md`
- `contrato_modulo_clientes.md`
- `contrato_modulo_pedidos.md`
- `contrato_modulo_fluxo_caixa.md`
- `contrato_modulo_loja_online.md`
- `contrato_modulo_relatorios.md`
- `contrato_dados_persistencia_sincronizacao.md`
- `contrato_ui_ux_mobile_first.md`
- `regras_negocio.md`
- `modelo_dados.md`
- `api_integracoes.md`
- `deploy_execucao.md`
- `changelog.md`
- `decisoes_tecnicas.md`
- `checklist_qualidade.md`
- `padroes_git_commit.md`

## O que já existe

- `backend/README.md`
- `frontend-react/README.md`
- `docs/google-apps-script.md`
- `docs/plano-app-terra-relva.md`
- `docs/*-2026-06-28.md`
- `frontend-react/src/modules/*/README.md`
- `frontend-react/src/services/*/README.md`

## O que precisa ser consolidado

- Um documento único de estado atual
- Um roadmap vivo com prioridade e risco
- Contratos funcionais por módulo
- Documento de persistência e sincronização
- Documento de regras de negócio
- Documento de modelo de dados
- Guia de deploy e execução

## Sequência recomendada de produção

### Etapa 1

- Consolidar a auditoria atual em um documento oficial
- Criar o README raiz

### Etapa 2

- Escrever o contrato funcional geral
- Escrever contratos por módulo prioritário

### Etapa 3

- Documentar persistência, sincronização e integrações
- Documentar o modelo de dados

### Etapa 4

- Documentar arquitetura, deploy e padrões de commit

### Etapa 5

- Manter changelog e decisões técnicas atualizados

### Etapa 6

- Revisar documentação sempre que um módulo mudar

## Prioridade dos próximos documentos

1. `docs/roadmap.md`
2. `docs/decisoes_tecnicas.md`
3. `docs/checklist_qualidade.md`
4. `docs/estado_atual_auditoria.md`
5. `docs/contrato_funcional_geral.md`
6. `docs/contrato_dados_persistencia_sincronizacao.md`

## Critério de qualidade

Uma boa documentação do Terra Relva precisa permitir que qualquer pessoa do time entenda:

- o que existe hoje
- o que ainda é legado
- onde os dados ficam
- o que pode quebrar
- qual é a próxima etapa segura

