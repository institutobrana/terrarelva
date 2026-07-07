# Validacao - Fornecedores

## Casos validados

1. Criar fornecedor
2. Editar fornecedor
3. Listar fornecedor
4. Detalhar fornecedor
5. Cadastrar contatos
6. Trocar imagem
7. Visualizar imagem
8. Excluir fornecedor existente
9. Excluir fornecedor inexistente com retorno 404

## Resultado esperado

- O cadastro deve ser gravado no PostgreSQL
- A lista deve refletir os dados persistidos
- O detalhe deve carregar contatos e imagem
- A exclusao deve respeitar a checagem previa

## Pendencia registrada

- A limpeza fisica do arquivo de imagem nao foi feita nesta etapa
- Imagens antigas podem ficar orfas no disco apos exclusao
