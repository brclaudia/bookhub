const form = document.querySelector("#form-obra");
const lista = document.querySelector("#lista-obras");
const listaVazia = document.querySelector("#lista-vazia");
const mensagem = document.querySelector("#mensagem-form");
const obras = [];

form.addEventListener("submit", cadastrarObra);

function cadastrarObra(evento) {
  evento.preventDefault();

  const obra = lerFormulario();
  const erro = validar(obra);

  if (erro) {
    mostrarMensagem(erro, true);
    return;
  }

  obras.push(obra);
  form.reset();
  mostrarMensagem("Obra cadastrada.", false);
  mostrarObras();
}

function lerFormulario() {
  return {
    titulo: form.titulo.value.trim(),
    autor: form.autor.value.trim(),
    categoria: form.categoria.value.trim(),
    ano: form.ano.value.trim(),
    descricao: form.descricao.value.trim()
  };
}

function validar(obra) {
  if (!obra.titulo || !obra.autor || !obra.categoria || !obra.ano || !obra.descricao) {
    return "Preencha todos os campos.";
  }

  const ano = Number(obra.ano);
  if (!Number.isInteger(ano) || ano < 1) {
    return "Informe um ano de publicação válido.";
  }

  return "";
}

function mostrarObras() {
  lista.replaceChildren();
  listaVazia.hidden = obras.length > 0;

  obras.forEach(function (obra) {
    const item = document.createElement("li");
    item.className = "obra";

    const titulo = document.createElement("h3");
    titulo.textContent = obra.titulo;

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = obra.autor + " · " + obra.categoria + " · " + obra.ano;

    const descricao = document.createElement("p");
    descricao.textContent = obra.descricao;

    item.append(titulo, meta, descricao);
    lista.append(item);
  });
}

function mostrarMensagem(texto, erro) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}
