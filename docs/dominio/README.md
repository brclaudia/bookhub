# Domínio

Linguagem do acervo de livros: o que cada conceito significa e quais regras o BookHub precisa respeitar.

## Conceitos

| Conceito | Significado |
| --- | --- |
| Empresa | Biblioteca que usa o BookHub. Os dados de uma empresa ficam separados dos dados das outras pela coluna `empresa_id` |
| Perfil | Papel da pessoa no sistema: `admin` ou `usuario` |
| Livro | Obra do acervo de uma empresa, identificada por título, autor, gênero, ano de publicação e descrição |
| Acervo | Conjunto de livros de uma empresa |
| Gênero | Categoria da empresa, usada para agrupar e filtrar as obras dela |
| Busca | Consulta por título dentro do acervo da empresa da pessoa autenticada |
| Avaliação | Nota de 1 a 5, com comentário opcional, dada por um usuário a uma obra da própria empresa |

## Regras conhecidas

- Cada livro precisa das informações básicas para ser identificado e organizado.
- Cada livro, gênero, autor e usuário pertence a uma empresa.
- Toda consulta filtra pela `empresa_id` da sessão.
- A empresa, pelo perfil `admin`, mantém o acervo e administra os usuários da biblioteca.
- O perfil `usuario` só faz leitura, avaliação e busca no acervo da própria empresa.

## Fora do domínio por enquanto

_Itens que ainda não fazem parte do problema, como empréstimo. Registrar aqui quando forem explicitamente deixados de fora._

## Modelagem

A estrutura inicial das tabelas, atributos e relacionamentos está em [modelagem do banco](./modelagem-banco.md).

## Glossário

| Termo | Definição |
| --- | --- |
| Obra | Sinônimo de livro neste projeto |
| Categoria | Sinônimo de gênero na descrição do produto |
