# Google Sheets + Apps Script

## Objetivo

Salvar os lancamentos do app direto na nuvem da conta da Terra Relva.

## Abas da planilha

Criar uma planilha Google com estas abas:

- `Produtos`
- `Clientes`
- `Vendas`
- `Caixa`
- `Producao`
- `Estoque`
- `Logs`

## Como publicar

1. Abrir `script.google.com`
2. Criar um projeto novo
3. Colar o codigo de [apps-script-sync.js](C:/Users/Tel/Documents/TERRA%20RELVA%20APP/docs/apps-script-sync.js)
4. Salvar
5. Ir em `Implantar` -> `Nova implantacao`
6. Escolher `Aplicativo da Web`
7. Executar como `Voce`
8. Quem tem acesso: `Qualquer pessoa com o link`
9. Copiar a URL gerada
10. Colar essa URL no campo `URL do Apps Script` no app

## Como o app vai funcionar

- se tiver internet, tenta enviar os lancamentos na hora
- se falhar, guarda tudo numa fila local
- depois basta tocar em `Sincronizar nuvem`

## Observacao

Na primeira vez, o Apps Script cria automaticamente o cabecalho de cada aba conforme os dados enviados.
