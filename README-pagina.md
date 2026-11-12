# BookHub — primeira tela

Página inicial do acervo de obras. Ela permite cadastrar um livro e vê-lo na listagem, sem backend. Os dados ficam só na memória do navegador e somem ao recarregar a página.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `index.html` | Estrutura da página: título, formulário e listagem |
| `css/estilos.css` | Estilo visual |
| `js/obras.js` | Validação do formulário e atualização da lista |

HTML, CSS e JavaScript ficam em arquivos separados. O HTML apenas liga os outros dois.

## O que a página faz

O formulário pede título, autor, categoria, ano de publicação e descrição. Ao cadastrar, o JavaScript confere se os campos foram preenchidos e se o ano é um número válido. Com os dados certos, a obra entra na lista, o formulário é limpo e a página informa que o cadastro foi feito. Se faltar algo, a obra não é listada e a mensagem de erro aparece no formulário.

## Como abrir

Abra o `index.html` com a extensão Live Server do VS Code.
