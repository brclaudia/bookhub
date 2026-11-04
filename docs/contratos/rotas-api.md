# Rotas da API — BookHub

Planejamento de como o backend deve funcionar. Este arquivo não implementa as rotas. Ele registra método, caminho, objetivo, entrada, validação e respostas, em cima da [modelagem do banco](../dominio/modelagem-banco.md).

## 1. Nomes usados na API

O domínio chama a obra de livro e a categoria de gênero. Na API, os caminhos usam os nomes do enunciado. O banco continua o mesmo.

| Na API | Na modelagem | Observação |
| --- | --- | --- |
| Empresa | `empresa` | Biblioteca que usa o sistema |
| Usuário | `usuario` | Pessoa que entra no sistema |
| Relação usuário–empresa | `usuario.empresa_id` | Cada pessoa pertence a uma única empresa |
| Obra | `livro` | Título, ano, descrição, categoria e autores |
| Categoria | `genero` | Nome único dentro da empresa |
| Autor | `autor` | Entidade própria; a obra aponta para um ou mais autores |
| Perfil | `perfil` | `admin` age pela empresa; `usuario` lê, avalia e busca |
| Avaliação | `avaliacao` | Nota de uma obra, registrada pelo `usuario` |

## 2. Regras que valem para todas as rotas

O BookHub é multiempresa pela coluna `empresa_id`. As bibliotecas compartilham as tabelas, e cada uma só enxerga as próprias linhas.

- A empresa da requisição é a empresa da pessoa autenticada. O corpo não envia `empresa_id` para escolher outra biblioteca.
- Se o corpo trouxer `empresa_id`, a API recusa a requisição.
- Um identificador de outra empresa responde como recurso inexistente, para não revelar dados alheios.
- A senha só entra no cadastro e na troca de senha. A resposta nunca devolve `senha` nem `senha_hash`.
- O corpo das requisições e das respostas viaja em JSON.

### Perfis

| Ação | admin | usuario |
| --- | --- | --- |
| Ler a própria empresa, categorias, autores e obras | sim | sim |
| Buscar obras por título | sim | sim |
| Registrar avaliação de uma obra | não | sim |
| Cadastrar, editar e excluir categorias, autores e obras | sim | não |
| Criar, editar, excluir e listar usuários | sim | não |
| Alterar o nome da própria empresa | sim | não |

A empresa mantém o acervo e administra a biblioteca. Quem executa isso é o perfil `admin`. O `usuario` só faz leitura, avaliação e busca.

### Status usados

| Status | Quando |
| --- | --- |
| 200 OK | Consulta ou atualização concluída |
| 201 Created | Recurso criado |
| 204 No Content | Exclusão concluída, sem corpo |
| 400 Bad Request | Campo obrigatório ausente, tipo inválido ou `empresa_id` enviado no corpo |
| 401 Unauthorized | Rota protegida sem autenticação, ou credencial de login inválida |
| 403 Forbidden | Pessoa autenticada sem permissão para a operação |
| 404 Not Found | Identificador inexistente na empresa da sessão |
| 409 Conflict | Conflito com uma regra já gravada, como e-mail repetido ou categoria em uso |

Lista vazia devolve 200 e uma coleção vazia. Não devolve 404.

## 3. Autenticação

As rotas de empresa, usuário, categoria, autor e obra exigem autenticação. Login e abertura de biblioteca não exigem.

### POST /auth/login

- **Objetivo:** entrar no sistema e obter a sessão da pessoa.
- **Body:** `email`, `senha`.
- **Validação:** os dois campos são obrigatórios. O e-mail precisa ter formato de e-mail.
- **200:** credenciais corretas. A resposta traz o identificador da sessão, `id`, `nome`, `email`, `perfil` (`admin` ou `usuario`) e a empresa (`id` e `nome`).
- **400:** falta campo ou o e-mail é inválido.
- **401:** e-mail ou senha não conferem.

## 4. Empresas

Não existe listagem de todas as bibliotecas. Cada pessoa só alcança a própria.

A abertura de uma biblioteca também cria o primeiro `admin`. Sem isso, a empresa nasceria sem ninguém capaz de administrar os usuários.

### POST /empresas

- **Objetivo:** abrir uma biblioteca e vincular o primeiro administrador a ela.
- **Body:** `nome` da empresa; `admin` com `nome`, `email` e `senha`.
- **Validação:** `nome` da empresa, `nome`, `email` e `senha` do admin são obrigatórios. A senha não pode ser vazia. O e-mail é único no sistema. O perfil deste usuário é sempre `admin`. Não se envia `empresa_id`.
- **201:** empresa e primeiro admin criados. A resposta traz a empresa (`id`, `nome`) e o admin sem senha (`id`, `nome`, `email`, `perfil`).
- **400:** campo obrigatório ausente, e-mail inválido ou senha vazia.
- **409:** o e-mail já está cadastrado.
- **Autenticação:** esta rota é pública. Não retorna 401.

### GET /empresas/atual

- **Objetivo:** consultar a biblioteca da pessoa autenticada.
- **Entrada:** nenhum corpo e nenhum identificador. A empresa sai da sessão.
- **200:** `id` e `nome` da própria empresa.
- **401:** sem autenticação.
- **Permissão:** `admin` e `usuario`.

### PUT /empresas/atual

- **Objetivo:** atualizar o nome da própria biblioteca.
- **Body:** `nome`.
- **Validação:** `nome` é obrigatório e não pode ser vazio.
- **200:** empresa atualizada, com `id` e `nome`.
- **400:** nome ausente ou vazio.
- **401:** sem autenticação.
- **403:** perfil `usuario`.

## 5. Relação entre usuários e empresas

A relação não tem tabela associativa. Ela é o campo `empresa_id` do usuário, definido pelo servidor.

- No `POST /empresas`, o primeiro admin nasce ligado à biblioteca recém-criada.
- No `POST /usuarios`, o `admin` da empresa cria a pessoa, com perfil `admin` ou `usuario`, já ligada a essa empresa.
- Nenhum `PUT` troca a pessoa de biblioteca.
- Consultas de usuários, obras, categorias e autores filtram por essa empresa.
- O mesmo e-mail não se repete em outra empresa, porque `email` é único no sistema.

A resposta de usuário sempre inclui a empresa dele: `empresa.id` e `empresa.nome`. Isso torna a relação visível sem uma rota extra de vínculo.

## 6. Usuários

O `admin` age pela empresa: cria, edita, lista e exclui os usuários da própria biblioteca, inclusive outro `admin`. O `usuario` não administra pessoas.

### GET /usuarios

- **Objetivo:** listar as pessoas da empresa da sessão.
- **Entrada:** sem filtro obrigatório.
- **200:** coleção com `id`, `nome`, `email`, `perfil` e `empresa`. Sem senha.
- **401:** sem autenticação.
- **403:** perfil `usuario`.

### GET /usuarios/eu

- **Objetivo:** consultar a própria pessoa autenticada.
- **200:** `id`, `nome`, `email`, `perfil` e `empresa`.
- **401:** sem autenticação.
- **Permissão:** `admin` e `usuario`.

### GET /usuarios/:id

- **Objetivo:** consultar uma pessoa da própria empresa.
- **Parâmetro:** `id` numérico da pessoa.
- **200:** os mesmos campos de `GET /usuarios/eu`.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** pessoa inexistente na empresa da sessão.

### POST /usuarios

- **Objetivo:** cadastrar uma pessoa na empresa do admin autenticado.
- **Body:** `nome`, `email`, `senha`, `perfil`.
- **Validação:** os quatro campos são obrigatórios. `perfil` aceita somente `admin` ou `usuario`. O e-mail tem formato válido e ainda não existe. A senha não pode ser vazia. `empresa_id` não entra no corpo.
- **201:** pessoa criada, sem senha, já vinculada à empresa da sessão.
- **400:** campo ausente, perfil desconhecido, e-mail inválido ou `empresa_id` enviado.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **409:** e-mail já cadastrado.

### PUT /usuarios/:id

- **Objetivo:** atualizar nome, e-mail, perfil ou senha de uma pessoa da própria empresa.
- **Parâmetro:** `id` numérico.
- **Body:** `nome`, `email`, `perfil`. `senha` é opcional; quando vem, substitui a senha anterior.
- **Validação:** `nome`, `email` e `perfil` são obrigatórios. O perfil continua restrito a `admin` ou `usuario`. A empresa não muda. Se `senha` vier, não pode ser vazia.
- **200:** pessoa atualizada, sem senha.
- **400:** campo obrigatório ausente, `id` inválido ou tentativa de enviar `empresa_id`.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** pessoa inexistente na empresa da sessão.
- **409:** o e-mail pertence a outra pessoa, ou a troca de perfil deixaria a empresa sem nenhum `admin`.

### DELETE /usuarios/:id

- **Objetivo:** remover uma pessoa da própria empresa.
- **Parâmetro:** `id` numérico.
- **204:** pessoa removida.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** pessoa inexistente na empresa da sessão.
- **409:** a exclusão removeria o último `admin` da empresa.

## 7. Perfis

O catálogo é fixo: `admin` e `usuario`. Não há rota para criar, editar ou apagar perfil.

### GET /perfis

- **Objetivo:** listar os dois perfis para o cadastro de usuários.
- **200:** coleção com `id`, `codigo` e `nome`.
- **401:** sem autenticação.
- **403:** perfil `usuario`. A lista serve para o admin montar o cadastro de pessoas da empresa.

## 8. Categorias

Categoria é o gênero da modelagem. O par empresa + nome é único. O `usuario` apenas lê. Cadastrar, renomear e excluir é função da empresa, feita pelo `admin`.

### GET /categorias

- **Objetivo:** listar as categorias da própria empresa.
- **200:** coleção com `id` e `nome`.
- **401:** sem autenticação.
- **Permissão:** `admin` e `usuario`.

### GET /categorias/:id

- **Objetivo:** consultar uma categoria da própria empresa.
- **Parâmetro:** `id` numérico.
- **200:** `id` e `nome`.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **404:** categoria inexistente na empresa da sessão.

### POST /categorias

- **Objetivo:** cadastrar uma categoria na empresa da sessão.
- **Body:** `nome`.
- **Validação:** `nome` é obrigatório, não vazio, e ainda não existe nesta empresa.
- **201:** categoria criada, com `id` e `nome`.
- **400:** nome ausente, vazio ou `empresa_id` enviado.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **409:** já existe categoria com esse nome na empresa.

### PUT /categorias/:id

- **Objetivo:** renomear uma categoria da própria empresa.
- **Parâmetro:** `id` numérico.
- **Body:** `nome`.
- **Validação:** `nome` é obrigatório e não vazio.
- **200:** categoria atualizada.
- **400:** nome inválido ou `id` inválido.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** categoria inexistente na empresa da sessão.
- **409:** o novo nome já existe na empresa.

### DELETE /categorias/:id

- **Objetivo:** excluir uma categoria sem obras.
- **Parâmetro:** `id` numérico.
- **204:** categoria excluída.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** categoria inexistente na empresa da sessão.
- **409:** ainda existe obra apontando para a categoria. A modelagem não remove categoria em uso.

## 9. Autores

O autor fica separado da obra porque uma obra tem um ou mais autores e o mesmo autor assina várias obras da empresa. O `usuario` apenas lê. Cadastrar, editar e excluir é função da empresa, feita pelo `admin`.

### GET /autores

- **Objetivo:** listar os autores da própria empresa.
- **200:** coleção com `id` e `nome`.
- **401:** sem autenticação.
- **Permissão:** `admin` e `usuario`.

### GET /autores/:id

- **Objetivo:** consultar um autor da própria empresa.
- **Parâmetro:** `id` numérico.
- **200:** `id` e `nome`.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **404:** autor inexistente na empresa da sessão.

### POST /autores

- **Objetivo:** cadastrar um autor na empresa da sessão.
- **Body:** `nome`.
- **Validação:** `nome` é obrigatório e não vazio.
- **201:** autor criado, com `id` e `nome`.
- **400:** nome ausente, vazio ou `empresa_id` enviado.
- **401:** sem autenticação.
- **403:** perfil `usuario`.

### PUT /autores/:id

- **Objetivo:** atualizar o nome de um autor da própria empresa.
- **Parâmetro:** `id` numérico.
- **Body:** `nome`.
- **Validação:** `nome` é obrigatório e não vazio.
- **200:** autor atualizado.
- **400:** nome inválido ou `id` inválido.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** autor inexistente na empresa da sessão.

### DELETE /autores/:id

- **Objetivo:** excluir um autor que não esteja ligado a obra.
- **Parâmetro:** `id` numérico.
- **204:** autor excluído.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** autor inexistente na empresa da sessão.
- **409:** o autor ainda está ligado a alguma obra.

## 10. Obras

A obra guarda `titulo`, `ano_publicacao`, `descricao`, uma categoria e ao menos um autor. A empresa da obra é a da sessão. O mesmo título pode existir em outra empresa, em outra linha. O `usuario` lê e busca. Cadastrar, editar e excluir é função da empresa, feita pelo `admin`.

A resposta de obra traz:

- `id`
- `titulo`
- `ano_publicacao`
- `descricao`
- `categoria`, com `id` e `nome`
- `autores`, lista com `id`, `nome` e `ordem`
- `empresa`, com `id` e `nome`

### GET /obras

- **Objetivo:** listar, buscar e filtrar o acervo da própria empresa.
- **Consulta:** `titulo` e `categoria_id` são opcionais. `titulo` busca por parte do nome. `categoria_id` restringe à categoria informada. Sem parâmetros, a rota devolve o acervo da empresa.
- **Validação:** se `categoria_id` vier, precisa ser numérico e pertencer à empresa da sessão.
- **200:** coleção de obras. Pode vir vazia.
- **400:** `categoria_id` inválido ou de outra empresa.
- **401:** sem autenticação.
- **Permissão:** `admin` e `usuario`.

### GET /obras/:id

- **Objetivo:** consultar uma obra da própria empresa.
- **Parâmetro:** `id` numérico.
- **200:** a obra completa.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **404:** obra inexistente na empresa da sessão.
- **Permissão:** `admin` e `usuario`.

### POST /obras

- **Objetivo:** cadastrar uma obra na empresa da sessão.
- **Body:** `titulo`, `ano_publicacao`, `descricao`, `categoria_id`, `autores`.
- **Validação:**
  - `titulo`, `ano_publicacao`, `descricao` e `categoria_id` são obrigatórios;
  - `ano_publicacao` é um inteiro maior que zero;
  - `categoria_id` existe na empresa da sessão;
  - `autores` traz ao menos um item, cada um com `autor_id` e `ordem`;
  - cada `autor_id` existe na empresa da sessão e não se repete na mesma obra;
  - `ordem` começa em 1 e não se repete;
  - `empresa_id` não entra no corpo.
- **201:** obra criada, com categoria, autores e empresa.
- **400:** campo ausente, ano inválido, autor repetido, ordem inválida ou categoria/autor de outra empresa.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** a categoria ou algum autor não existe na empresa da sessão.

### PUT /obras/:id

- **Objetivo:** substituir os dados editáveis de uma obra da própria empresa.
- **Parâmetro:** `id` numérico.
- **Body:** os mesmos campos do `POST /obras`.
- **Validação:** as mesmas regras do cadastro. A lista de autores enviada passa a ser a lista da obra.
- **200:** obra atualizada.
- **400:** corpo inválido ou `id` inválido.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** obra, categoria ou autor inexistente na empresa da sessão.

### DELETE /obras/:id

- **Objetivo:** excluir uma obra da própria empresa.
- **Parâmetro:** `id` numérico.
- **Efeito:** a obra sai do acervo. Os vínculos com autores e as avaliações dessa obra também saem. Autores e categoria permanecem.
- **204:** obra excluída.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **403:** perfil `usuario`.
- **404:** obra inexistente na empresa da sessão.

## 11. Avaliações

Avaliação é a nota de um `usuario` sobre uma obra da própria empresa. O `admin` não avalia. Ele pode ler as avaliações da biblioteca.

A resposta traz `id`, `nota`, `comentario`, `obra` (`id` e `titulo`) e `usuario` (`id` e `nome`).

### POST /obras/:id/avaliacoes

- **Objetivo:** registrar a avaliação de uma obra da própria empresa.
- **Parâmetro:** `id` numérico da obra.
- **Body:** `nota` e `comentario`.
- **Validação:** `nota` é obrigatória e inteira, de 1 a 5. `comentario` é opcional. A obra precisa existir na empresa da sessão. A mesma pessoa não avalia a mesma obra duas vezes.
- **201:** avaliação criada.
- **400:** nota ausente ou fora de 1 a 5.
- **401:** sem autenticação.
- **403:** perfil `admin`.
- **404:** obra inexistente na empresa da sessão.
- **409:** essa pessoa já avaliou a obra.

### GET /obras/:id/avaliacoes

- **Objetivo:** ler as avaliações de uma obra da própria empresa.
- **Parâmetro:** `id` numérico da obra.
- **200:** coleção de avaliações. Pode vir vazia.
- **400:** `id` não numérico.
- **401:** sem autenticação.
- **404:** obra inexistente na empresa da sessão.
- **Permissão:** `admin` e `usuario`.

## 12. Mapa das rotas

| Método | Caminho | Quem pode | Sucesso |
| --- | --- | --- | --- |
| POST | /auth/login | público | 200 |
| POST | /empresas | público | 201 |
| GET | /empresas/atual | admin e usuario | 200 |
| PUT | /empresas/atual | admin | 200 |
| GET | /usuarios | admin | 200 |
| GET | /usuarios/eu | admin e usuario | 200 |
| GET | /usuarios/:id | admin | 200 |
| POST | /usuarios | admin | 201 |
| PUT | /usuarios/:id | admin | 200 |
| DELETE | /usuarios/:id | admin | 204 |
| GET | /perfis | admin | 200 |
| GET | /categorias | admin e usuario | 200 |
| GET | /categorias/:id | admin e usuario | 200 |
| POST | /categorias | admin | 201 |
| PUT | /categorias/:id | admin | 200 |
| DELETE | /categorias/:id | admin | 204 |
| GET | /autores | admin e usuario | 200 |
| GET | /autores/:id | admin e usuario | 200 |
| POST | /autores | admin | 201 |
| PUT | /autores/:id | admin | 200 |
| DELETE | /autores/:id | admin | 204 |
| GET | /obras | admin e usuario | 200 |
| GET | /obras/:id | admin e usuario | 200 |
| POST | /obras | admin | 201 |
| PUT | /obras/:id | admin | 200 |
| DELETE | /obras/:id | admin | 204 |
| POST | /obras/:id/avaliacoes | usuario | 201 |
| GET | /obras/:id/avaliacoes | admin e usuario | 200 |

## 13. Fora destas rotas

Empréstimo, editora e estoque continuam fora do desenho. Também não há rota para listar bibliotecas alheias, mover uma pessoa de empresa ou gravar senha em texto puro.
