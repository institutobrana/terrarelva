# Ajuste pontual - modal Alterar senha - 2026-06-28

## Onde a acao foi ligada

- Menu do canto superior direito em `frontend-react/src/components/admin/AdminActionTopbar.tsx`
- Item do dropdown: `alterar-senha`

## O que foi implementado

- A acao `Alterar senha` agora abre um modal real no frontend React.
- O modal segue a referencia visual recebida:
  - titulo centralizado
  - botao de fechar no canto superior direito
  - campos para senha atual, nova senha e confirmacao
  - botoes `Gravar senha` e `Cancelar`

## Validacoes atuais

- senha atual obrigatoria
- nova senha obrigatoria
- confirmacao obrigatoria
- confirmacao precisa coincidir com a nova senha

## Integracao com backend

- Ainda nao houve troca real de senha no backend nesta etapa.
- O submit esta preparado no frontend e hoje retorna feedback controlado de fluxo ainda nao conectado.

## Arquivos alterados

- `frontend-react/src/components/admin/AdminActionTopbar.tsx`
- `frontend-react/src/index.css`
