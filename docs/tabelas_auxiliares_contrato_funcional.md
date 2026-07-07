# Tabelas auxiliares - contrato funcional

## Objetivo

Centralizar os cadastros auxiliares usados pelo sistema Terra Relva, com leitura e manutencao pela area de configuracoes.

## Fluxos entregues

- Abertura da rota protegida em `/admin/configuracoes/tabelas-auxiliares`
- Navegacao lateral entre tabelas auxiliares
- Listagem, criacao, edicao, ativacao e inativacao das tabelas persistidas
- Exclusao com checagem previa quando existe dependencia real
- Regras especiais para motivos e situacoes de agendamento

## Tabelas cobertas

- Formas de pagamento
- Tipos de indicacao
- Segmentos de fornecedor
- Grupos de material
- Fabricantes
- Unidades de medida
- Ocupacao/profissao do cliente
- Motivos de agendamento
- Situacoes de agendamento

## Limitacoes conhecidas

- A frente cobre duas familias tecnicas diferentes: tabelas simples persistidas e tabelas especiais de agendamento.
- Nao ha regra de dependencia complexa para fabricantes e unidades de medida.
- Segmentos de fornecedor usam checagem de uso antes da exclusao.

