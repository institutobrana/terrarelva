# Usuarios do sistema - etapa 2026-06-28

## Estrutura adotada a partir do print

- Barra superior horizontal de acoes com foco operacional.
- Grade principal com selecao unica por linha.
- Rodape com total de registros e controle de visualizacao de inativos.
- Aparencia administrativa mais densa, sem copiar branding externo e usando a paleta Terra Relva do shell atual.

## Acoes funcionais nesta rodada

- Novo usuario: cria registro real na tabela `users`.
- Habilitar acesso: atualiza `is_active = true`.
- Desabilitar acesso: atualiza `is_active = false`.

## Acoes preparadas nesta rodada

- Alterar.
- Propriedades.
- Permissoes especiais.

Essas acoes ja aparecem na barra operacional, dependem de selecao de linha e ficaram prontas para ganhar fluxo proprio depois.

## Integracao da listagem com o backend

- Backend exposto em `GET /admin/users?status=active|inactive|all`.
- Leitura real da tabela PostgreSQL `users`.
- Filtro aplicado no backend para manter contagem e grade coerentes.
- O campo `Prestador` nao existe no dominio atual de usuarios; a coluna foi mantida como preparada e sinalizada na UI como nao mapeada.

## Controle de ativo e inativo

- O login ja recusava usuarios com `is_active = false`.
- A nova tela usa `PATCH /admin/users/:id/access` para alternar o acesso.
- Como `GET /auth/me` tambem devolve sessao valida apenas para usuario ativo, contas desabilitadas deixam de sustentar acesso autenticado.

## O que falta para concluir as acoes preparadas

- Alterar: fluxo de edicao com update de nome, email, role e talvez reset de senha.
- Propriedades: painel de auditoria com datas, ultimo acesso e metadados adicionais.
- Permissoes especiais: modelagem de permissoes granulares alem do `role` atual.

## Ajuste visual pontual no topo

- Removidos o header alto e os cards de resumo que estavam deixando o topo distante do print de referencia.
- A barra de acoes passou a ser uma faixa continua, integrada ao shell e com comandos na mesma linha.
- A tabela inferior, filtros do rodape e logica funcional de criar, habilitar e desabilitar usuario foram preservados.
