# Arquitetura

Visão de como o BookHub se organiza: camadas, responsabilidades e como as partes se conversam.

O desenho detalhado de fluxos e persistência fica em [system design](../system-design/README.md). Decisões que justificam esta estrutura ficam em [ADR](../adr/README.md).

## Contexto

O BookHub organiza um acervo de livros. A aplicação precisa permitir visualizar, cadastrar, editar, excluir, pesquisar e filtrar obras.

## Visão geral

_A definir quando a stack e a estrutura de pastas forem escolhidas._

```text
[ interface ]  →  [ regras do acervo ]  →  [ persistência ]
```

## Componentes

| Componente | Responsabilidade | Estado |
| --- | --- | --- |
| Interface | Telas de listagem, cadastro, edição e busca | a definir |
| Regras do acervo | Validação e organização dos livros | a definir |
| Persistência | Guarda e consulta dos livros | a definir |

## Princípios

- Separar apresentação, regras e dados.
- Reaproveitar o que já existir antes de criar um caminho novo.
- Registrar em ADR qualquer escolha que feche uma alternativa importante.
