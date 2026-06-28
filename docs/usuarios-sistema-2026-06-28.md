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

## Ajuste fino de integracao com a lateral

- A faixa superior recebeu a mesma familia de cor do rail esquerdo para parecer uma extensao do shell.
- Foram reduzidos borda, arredondamento e sombra para remover a sensacao de card independente.
- A logica visual foi alinhada ao shell do Brana Cloud como referencia estrutural de continuidade lateral para barra horizontal, sem copiar branding.

## Refinamento estrutural do topo

- O titulo deixou de ocupar uma faixa propria e passou a viver dentro da mesma barra operacional das acoes.
- O bloco verde isolado da esquerda foi reduzido para uma emenda visual curta, evitando a leitura de duas pecas acopladas.
- A tabela inferior permaneceu intacta; o ajuste ficou concentrado na arquitetura visual do topo.

## Alinhamento ao padrao do Dashboard

- A referencia estrutural desta etapa passou a ser a propria tela `DashboardPage` do Terra Relva.
- A tela de usuarios foi reencaixada no mesmo esqueleto de `Row` + `PageHero` + bloco de conteudo abaixo, em vez de manter um topo proprio paralelo.
- Foram preservadas as acoes, filtros e a tabela funcional de usuarios; o que mudou foi a arquitetura visual do topo para herdar o mesmo padrao do Dashboard.

## Correcao de entendimento do layout

- O `PageHero` interno foi removido porque ainda criava um cabecalho de pagina grande, o que nao era desejado para uma tela operacional.
- No lugar dele, a tela agora comeca em uma faixa horizontal unica de comandos, com metadados discretos na mesma regiao.
- A grade de usuarios voltou a ser o elemento principal da tela, sem cards de resumo nem hero section acima.

## Correcao estrutural definitiva do topo

- A barra de usuarios deixou de ser renderizada dentro da pagina e passou a ocupar o slot real `terra-shell-band` do `AdminLayout`.
- A referencia estrutural usada foi o proprio shell do Dashboard, especialmente `AdminLayout.tsx` e `AdminActionTopbar.tsx`, onde a faixa superior nasce da lateral.
- A tela de usuarios agora injeta apenas o conteudo operacional dessa faixa; a estrutura de encaixe com a lateral passou a ser a mesma do shell, nao mais uma simulacao local por CSS.

## Ajuste fino final da faixa superior

- O fundo da faixa passou a seguir continuo por toda a largura util, sem trecho neutro destacado no fim.
- A altura da barra foi reduzida para uma leitura mais seca e mais proxima de toolbar operacional.
- A linha inferior com `Filtro`, `Ativos`, `Inativos` e `Selecionado` foi removida completamente.

## Acabamento visual dos comandos

- Os comandos da faixa superior foram achatados para uma leitura mais de toolbar textual e menos de botao elevado.
- Fundo, borda e sombra dos botoes foram removidos dentro da faixa, preservando apenas estados de hover, desabilitado e destaque principal mais discreto.
