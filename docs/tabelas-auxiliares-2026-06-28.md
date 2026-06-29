# Tabelas auxiliares - etapa 2026-06-28

## Rota

- A entrada `Configuracoes -> Tabelas auxiliares` foi ligada na rota protegida `/admin/configuracoes/tabelas-auxiliares`.

## Barra superior

- O modulo usa o mesmo slot `terra-shell-band` do shell admin.
- O botao de criacao nao e fixo para a tela inteira.
- A barra superior agora muda conforme a tabela auxiliar selecionada na lateral.
- Exemplos implementados nesta etapa:
  - `Motivos de agendamento` -> `Novo motivo`
  - `Situacoes de agendamento` -> `Nova situacao`
  - `Segmentos de fornecedor` -> `Novo segmento`
  - `Fases de procedimento` -> `Nova fase`
  - demais tabelas usam configuracao simples preparada por item

## Painel lateral interno

- Foi criado um painel lateral interno com a lista inicial de tabelas auxiliares:
  - Motivos de agendamento
  - Tipos de indicacao
  - Motivos de retorno
  - Situacoes de agendamento
  - Segmentos de fornecedor
  - Formas de pagamento
  - Especialidades
  - Fases de procedimento
  - Grupos de material
  - Motivos de finalizacao do tratamento
  - Solucoes irrigadoras
  - Cimentos obturadores
  - Limas memorias
  - Sistemas de instrumentacao
  - Medicacoes intracanais
  - Ocupacao/profissao do paciente

## Grade principal

- A grade principal foi montada a direita com colunas `Codigo`, `Nome` e `Descricao`.
- Como ainda nao existe base pronta desse dominio no backend atual, a tabela foi deixada como placeholder controlado por item selecionado, sem inventar registros falsos.

## Estado funcional

- Funcional nesta etapa:
  - rota protegida real
  - barra operacional no shell
  - painel lateral interno com selecao
  - grade principal e rodape
- Ajuste de entendimento aplicado:
  - o botao `Novo...` e o modal aberto dependem da tabela selecionada
  - o modal de `Motivos de agendamento` deixou de ser tratado como universal
- Motivos de agendamento:
  - abre `Novo motivo de agendamento`
  - campos incluidos: `Codigo`, `Nome`, `Descricao`, `Tipo`, `Cor` e `Compromisso produtivo`
  - `Tipo` possui exatamente `Agendamento` e `Compromisso`
  - quando `Tipo = Agendamento`, a paleta fica apagada/desabilitada, `Cor` deixa de ser obrigatoria e `Compromisso produtivo` fica desabilitado e desmarcado
  - quando `Tipo = Compromisso`, a paleta fica habilitada com 44 cores em 3 linhas (15 + 15 + 14), `Cor` passa a ser obrigatoria e `Compromisso produtivo` fica marcado por padrao, mas pode ser desmarcado
- Segmentos de fornecedor:
  - abre `Novo segmento de fornecedor`
  - campos incluidos: `Codigo`, `Nome` e `Descricao`
  - nao exibe `Tipo`, `Cor` nem `Compromisso produtivo`
- Situacoes de agendamento:
  - abre `Nova situacao de agendamento`
  - campos incluidos: `Codigo`, `Nome`, `Descricao`, `Historico`, `Cor`, `Ocultar agendamento` e `Considerar falta do paciente`
  - nao exibe `Tipo` nem `Compromisso produtivo`
  - reutiliza a mesma paleta de 44 cores em 3 linhas usada por `Motivos de agendamento`
  - os checkboxes iniciam desmarcados
- Fases de procedimento:
  - abre `Nova fase de procedimento`
  - campos incluidos: `Codigo`, `Nome`, `Tempo de execucao` e `Descricao`
  - `Tempo de execucao` foi implementado como campo numerico com unidade `min` a direita
  - o campo aceita vazio nesta etapa, mas nao aceita valor negativo
  - nao exibe `Tipo`, `Cor`, `Compromisso produtivo`, `Historico`, `Ocultar agendamento` nem `Considerar falta do paciente`
- Paleta de cores:
  - foi centralizada em uma constante reutilizavel com 44 cores
  - usada por `Motivos de agendamento` quando `Tipo = Compromisso`
  - usada tambem por `Situacoes de agendamento`
- Regra de tempo:
  - `Tempo de execucao` representa minutos medios de execucao
  - o valor e opcional nesta etapa
  - quando preenchido, deve ser maior ou igual a zero
- Persistencia:
  - nesta etapa nao houve persistencia real nem localStorage
  - `Gravar ...` faz validacao e submit controlado, mantendo o fluxo preparado para backend futuro
- Preparado para evolucao:
  - dados reais por tabela auxiliar
  - cadastro e edicao persistentes

## Como validar no navegador

1. Abrir `Configuracoes -> Tabelas auxiliares`.
2. Selecionar `Motivos de agendamento`.
3. Confirmar que a barra superior mostra `Novo motivo`.
4. Abrir o modal e validar `Codigo`, `Nome`, `Descricao`, `Tipo`, `Cor` e `Compromisso produtivo`.
5. Em `Agendamento`, confirmar paleta apagada/desabilitada, checkbox desabilitado/desmarcado e ausencia de obrigatoriedade de cor.
6. Em `Compromisso`, confirmar paleta habilitada com 44 cores, checkbox habilitado e marcado por padrao e obrigatoriedade de cor.
7. Fechar o modal, selecionar `Segmentos de fornecedor` e confirmar o botao `Novo segmento`.
8. Abrir o modal e validar que aparecem apenas `Codigo`, `Nome` e `Descricao`.
9. Selecionar `Situacoes de agendamento` e confirmar o botao `Nova situacao`.
10. Abrir o modal e validar `Codigo`, `Nome`, `Descricao`, `Historico`, `Cor`, `Ocultar agendamento` e `Considerar falta do paciente`.
11. Confirmar que a paleta de 44 cores fica habilitada desde o inicio.
12. Confirmar que os dois checkboxes iniciam desmarcados.
13. Selecionar `Fases de procedimento` e confirmar o botao `Nova fase`.
14. Abrir o modal e validar `Codigo`, `Nome`, `Tempo de execucao` e `Descricao`.
15. Confirmar que `Tempo de execucao` e numerico e mostra `min` a direita.
16. Confirmar ausencia de `Tipo`, `Cor`, `Compromisso produtivo`, `Historico`, `Ocultar agendamento` e `Considerar falta do paciente`.
