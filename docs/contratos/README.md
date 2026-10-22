# Contratos

Formatos combinados entre as partes do BookHub: campos de um livro, respostas de erro e, quando existir, a superfície HTTP ou de eventos.

O significado de cada conceito fica em [domínio](../dominio/README.md). Aqui fica a forma exata dos dados.

## Livro

Campos previstos para identificação e organização da obra. Tipos e obrigatoriedade ainda serão fechados.

| Campo | Descrição | Obrigatório |
| --- | --- | --- |
| titulo | Nome da obra | a definir |
| autor | Autor ou autores | a definir |
| genero | Categoria usada na organização | a definir |
| anoPublicacao | Ano de publicação | a definir |
| descricao | Texto curto sobre a obra | a definir |

## Operações previstas

| Operação | Entrada | Saída |
| --- | --- | --- |
| Listar | filtros opcionais de busca e gênero | coleção de livros |
| Consultar | identificador do livro | um livro |
| Cadastrar | dados do livro | livro criado |
| Editar | identificador e dados alterados | livro atualizado |
| Excluir | identificador do livro | confirmação |

## Erros

_A definir: formato da mensagem, códigos e o que a interface mostra ao usuário._
