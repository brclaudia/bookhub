# System design

Desenho do BookHub em funcionamento: quem chama quem, onde o livro fica guardado e o que acontece em cada operação principal.

A estrutura dos componentes está em [arquitetura](../arquitetura/README.md). O formato dos dados está em [contratos](../contratos/README.md).

## Fluxos

### Cadastrar livro

1. A pessoa informa título, autor, gênero, ano e descrição.
2. A aplicação valida os dados.
3. O livro é persistido e passa a aparecer na listagem.

### Consultar e filtrar

1. A pessoa informa um título ou escolhe um gênero.
2. A aplicação devolve só as obras que combinam com o critério.

### Editar e excluir

1. A pessoa escolhe um livro já cadastrado.
2. A alteração ou a remoção é persistida.
3. A listagem reflete o novo estado do acervo.

## Persistência

_A definir: onde os livros ficam armazenados e como cada obra é identificada._

## Diagrama

_Substituir este esboço quando o desenho estiver fechado._

```text
Pessoa
  → Interface (lista, formulário, busca)
    → Regras do acervo
      → Armazenamento dos livros
```
