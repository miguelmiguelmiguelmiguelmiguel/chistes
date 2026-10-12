// Página "Todos los chistes": muestra la lista completa en orden, sin azar.
// Los de humor negro salen tapados con un aviso, igual que en index.html.

const listaChistes = document.getElementById("lista-chistes");
const resumenTodos = document.getElementById("resumen-todos");

const CLAVE_FAVORITOS = "chistes-favoritos"; // la misma que usa index.html

function obtenerFavoritos() {
  try {
    const guardado = localStorage.getItem(CLAVE_FAVORITOS);
    return guardado ? JSON.parse(guardado) : [];
  } catch (error) {
    return [];
  }
}

function pintarListado(chistes) {
  listaChistes.innerHTML = "";
  resumenTodos.textContent = chistes.length + " chistes en total";

  const favoritos = obtenerFavoritos();

  chistes.forEach(chiste => {
    const item = document.createElement("div");
    item.classList.add("item-listado");
    if (chiste.humorNegro === true) item.classList.add("item-negro");

    // Título: "Chiste #3" + marcas
    const titulo = document.createElement("p");
    titulo.classList.add("titulo-listado");
    let textoTitulo = "Chiste #" + chiste.id;
    if (favoritos.includes(chiste.id)) textoTitulo += " ⭐";
    if (chiste.humorNegro === true) textoTitulo += " 🖤";
    if (chiste.audio) textoTitulo += " 🔊";
    titulo.textContent = textoTitulo;
    item.appendChild(titulo);

    // Texto del chiste (tapado si es humor negro)
    const texto = document.createElement("p");
    texto.classList.add("texto-listado");
    item.appendChild(texto);

    const botones = document.createElement("div");

    if (chiste.humorNegro === true) {
      texto.textContent = "⚠️ Humor negro sin filtro (temas sensibles, explícitos o políticamente incorrectos).";

      const btnMostrar = document.createElement("button");
      btnMostrar.textContent = "Mostrar de todos modos";
      btnMostrar.onclick = function() {
        texto.textContent = chiste.texto;
        btnMostrar.remove();
      };
      botones.appendChild(btnMostrar);
    } else {
      texto.textContent = chiste.texto;
    }

    // Enlace para abrir este chiste en la página principal
    const enlace = document.createElement("a");
    enlace.classList.add("enlace-abrir");
    enlace.href = "index.html?chiste=" + chiste.id;
    enlace.textContent = "Abrir en la caja";
    botones.appendChild(enlace);

    item.appendChild(botones);
    listaChistes.appendChild(item);
  });
}

fetch("chistes.json")
  .then(respuesta => respuesta.json())
  .then(datos => {
    // Mismo id automático que en index.html: posición + 1
    for (let i = 0; i < datos.length; i++) {
      datos[i].id = i + 1;
    }
    pintarListado(datos);
  })
  .catch(() => {
    resumenTodos.textContent = "No se han podido cargar los chistes. Prueba a recargar la página.";
  });
