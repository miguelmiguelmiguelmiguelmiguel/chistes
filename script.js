// Variables para guardar los datos
let todosLosChistes = [];
let chistesPorVer = []; // Aquí guardamos solo los que faltan por salir
let chisteSeleccionado = null;

// Guardamos los elementos de la pantalla en variables
const caja = document.getElementById("caja-chiste");
const elNumero = document.getElementById("numero-chiste");
const elTexto = document.getElementById("texto-chiste");
const btnSiguiente = document.getElementById("boton-siguiente");
const bloqueAdvertencia = document.getElementById("botones-advertencia");
const btnVerTodo = document.getElementById("boton-ver-todo");
const btnSaltar = document.getElementById("boton-saltar");

// --- Favoritos ---
const btnFavorito = document.getElementById("boton-favorito");
const btnVerFavoritos = document.getElementById("boton-ver-favoritos");
const vistaFavoritos = document.getElementById("vista-favoritos");
const listaFavoritos = document.getElementById("lista-favoritos");
const btnCerrarFavoritos = document.getElementById("boton-cerrar-favoritos");

const CLAVE_FAVORITOS = "chistes-favoritos";

// --- Audio por chiste ---
const btnAudio = document.getElementById("boton-audio");
const CARPETA_SONIDOS = "sonidos/"; // carpeta donde subirás los mp3

// --- NUEVO: buscador por número ---
const inputNumero = document.getElementById("input-numero");
const btnBuscar = document.getElementById("boton-buscar");
const mensajeBusqueda = document.getElementById("mensaje-busqueda");

// 1. LEER EL ARCHIVO JSON AL ENTRAR A LA WEB
fetch("chistes.json")
  .then(respuesta => respuesta.json())
  .then(datos => {
    todosLosChistes = datos;

    // ASIGNACIÓN DE ID AUTOMÁTICA
    for (let i = 0; i < todosLosChistes.length; i++) {
      todosLosChistes[i].id = i + 1;
    }

    // Clonamos todos los chistes en nuestra lista de "por ver"
    chistesPorVer = [...todosLosChistes];

    // NUEVO: ajustamos los límites del buscador
    if (inputNumero) {
      inputNumero.min = 1;
      inputNumero.max = todosLosChistes.length;
      inputNumero.placeholder = "1 - " + todosLosChistes.length;
    }

    elegirChisteAlAzar();
  });

// 2. FUNCIÓN PARA ELEGIR SIN REPETIR HASTA QUE SE ACABEN
function elegirChisteAlAzar() {
  if (chistesPorVer.length === 0) {
    chistesPorVer = [...todosLosChistes];
  }

  let posicionAzar = Math.floor(Math.random() * chistesPorVer.length);
  chisteSeleccionado = chistesPorVer[posicionAzar];

  chistesPorVer.splice(posicionAzar, 1);

  comprobarChiste();
}

// 3. COMPROBAR SI ES HUMOR NEGRO O NORMAL
function comprobarChiste() {
  elNumero.innerText = "Chiste #" + chisteSeleccionado.id;

  if (chisteSeleccionado.humorNegro === true) {
    caja.classList.add("alerta");
    elTexto.innerText = "⚠️ OJO: Este chiste contiene humor negro sin filtro (temas sensibles, explícitos o políticamente incorrectos). Procede bajo tu propio criterio.";

    btnSiguiente.style.display = "none";
    bloqueAdvertencia.style.display = "block";
    if (btnFavorito) btnFavorito.style.display = "none"; // no se puede marcar favorito hasta verlo
    ocultarBotonAudio(); // tampoco se muestra el altavoz hasta ver el chiste
  } else {
    caja.classList.remove("alerta");
    elTexto.innerText = chisteSeleccionado.texto;

    btnSiguiente.style.display = "block";
    bloqueAdvertencia.style.display = "none";
    if (btnFavorito) {
      btnFavorito.style.display = "inline-block";
      actualizarEstrella();
    }
    actualizarBotonAudio();
  }
}

// 4. BOTÓN: "VER CHISTE DE TODOS MODOS"
btnVerTodo.onclick = function() {
  caja.classList.remove("alerta");
  elTexto.innerText = chisteSeleccionado.texto;

  btnSiguiente.style.display = "block";
  bloqueAdvertencia.style.display = "none";
  if (btnFavorito) {
    btnFavorito.style.display = "inline-block";
    actualizarEstrella();
  }
  actualizarBotonAudio();
};

// 5. BOTÓN: "SALTAR (QUIERO UN CHISTE BLANCO)"
btnSaltar.onclick = function() {
  let blancosDisponibles = chistesPorVer.filter(chiste => chiste.humorNegro === false);

  if (blancosDisponibles.length === 0) {
    let todosLosBlancos = todosLosChistes.filter(chiste => chiste.humorNegro === false);
    chistesPorVer = [...todosLosBlancos];
    blancosDisponibles = chistesPorVer;
  }

  let posicionAzar = Math.floor(Math.random() * blancosDisponibles.length);
  chisteSeleccionado = blancosDisponibles[posicionAzar];

  chistesPorVer = chistesPorVer.filter(chiste => chiste.id !== chisteSeleccionado.id);

  comprobarChiste();
};

// 6. BOTÓN PRINCIPAL: AL HACER CLICK MUESTRA OTRO CHISTE
btnSiguiente.onclick = elegirChisteAlAzar;

// ============================
// NUEVO: BUSCADOR POR NÚMERO
// ============================
// Escribes un número, pulsas "Ir" (o Enter) y sale ese chiste.
// Si es de humor negro, sigue pasando por la advertencia de siempre.

function buscarChistePorNumero() {
  if (!inputNumero) return;

  const numero = parseInt(inputNumero.value, 10);
  const total = todosLosChistes.length;

  if (total === 0) return; // el JSON aún no ha cargado

  if (Number.isNaN(numero) || numero < 1 || numero > total) {
    if (mensajeBusqueda) {
      mensajeBusqueda.innerText = "Elige un número entre 1 y " + total;
    }
    return;
  }

  if (mensajeBusqueda) mensajeBusqueda.innerText = "";

  chisteSeleccionado = todosLosChistes.find(chiste => chiste.id === numero);

  // Lo quitamos de "por ver" para que no vuelva a salir enseguida al azar
  chistesPorVer = chistesPorVer.filter(chiste => chiste.id !== numero);

  comprobarChiste();
}

if (btnBuscar) {
  btnBuscar.onclick = buscarChistePorNumero;
}

if (inputNumero) {
  inputNumero.addEventListener("keydown", function(evento) {
    if (evento.key === "Enter") buscarChistePorNumero();
  });
}

// ============================
// FAVORITOS
// ============================

function obtenerFavoritos() {
  const guardado = localStorage.getItem(CLAVE_FAVORITOS);
  return guardado ? JSON.parse(guardado) : [];
}

function guardarFavoritos(lista) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(lista));
}

function esFavorito(id) {
  return obtenerFavoritos().includes(id);
}

function actualizarEstrella() {
  if (!btnFavorito || !chisteSeleccionado) return;
  btnFavorito.innerText = esFavorito(chisteSeleccionado.id) ? "★" : "☆";
}

if (btnFavorito) {
  btnFavorito.onclick = function() {
    let favoritos = obtenerFavoritos();
    const id = chisteSeleccionado.id;

    if (favoritos.includes(id)) {
      favoritos = favoritos.filter(favId => favId !== id);
    } else {
      favoritos.push(id);
    }

    guardarFavoritos(favoritos);
    actualizarEstrella();
  };
}

function mostrarFavoritos() {
  const idsFavoritos = obtenerFavoritos();
  listaFavoritos.innerHTML = "";

  if (idsFavoritos.length === 0) {
    listaFavoritos.innerHTML = "<p>Aún no tienes chistes favoritos. Márcalos con la ⭐ mientras los lees.</p>";
    return;
  }

  const chistesFavoritos = todosLosChistes.filter(chiste => idsFavoritos.includes(chiste.id));

  chistesFavoritos.forEach(chiste => {
    const item = document.createElement("div");
    item.classList.add("item-favorito");
    item.innerHTML = `
      <p><strong>Chiste #${chiste.id}</strong></p>
      <p>${chiste.texto.replace(/\n/g, "<br>")}</p>
      <button class="boton-quitar-favorito" data-id="${chiste.id}">Quitar de favoritos</button>
      <hr>
    `;
    listaFavoritos.appendChild(item);
  });

  document.querySelectorAll(".boton-quitar-favorito").forEach(boton => {
    boton.onclick = function() {
      const id = parseInt(boton.dataset.id);
      let favoritos = obtenerFavoritos().filter(favId => favId !== id);
      guardarFavoritos(favoritos);
      mostrarFavoritos();
      actualizarEstrella();
    };
  });
}

if (btnVerFavoritos) {
  btnVerFavoritos.onclick = function() {
    mostrarFavoritos();
    vistaFavoritos.style.display = "block";
  };
}

if (btnCerrarFavoritos) {
  btnCerrarFavoritos.onclick = function() {
    vistaFavoritos.style.display = "none";
  };
}

// ============================
// AUDIO POR CHISTE
// ============================
// Un chiste puede llevar en el JSON un campo "audio": "nombre.mp3"
// Si lo tiene, aparece el botón 🔊. Al pulsarlo (solo con click del
// usuario, nunca automático) se reproduce ese sonido una vez.

function actualizarBotonAudio() {
  if (!btnAudio) return;

  if (chisteSeleccionado && chisteSeleccionado.audio) {
    btnAudio.style.display = "inline-block";
  } else {
    btnAudio.style.display = "none";
  }
}

function ocultarBotonAudio() {
  if (btnAudio) btnAudio.style.display = "none";
}

if (btnAudio) {
  btnAudio.onclick = function() {
    if (!chisteSeleccionado || !chisteSeleccionado.audio) return;

    const sonido = new Audio(CARPETA_SONIDOS + chisteSeleccionado.audio);
    sonido.volume = 0.15;
    sonido.play();
  };
}