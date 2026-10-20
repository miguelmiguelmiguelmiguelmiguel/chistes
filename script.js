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

// --- Explicación del chiste (se desbloquea con una palabra secreta) ---
const btnExplicacion = document.getElementById("boton-explicacion");
const elExplicacion = document.getElementById("explicacion-chiste");

// --- Buscador ---
const inputNumero = document.getElementById("input-numero");
const btnBuscar = document.getElementById("boton-buscar");
const mensajeBusqueda = document.getElementById("mensaje-busqueda");

// Panel emergente del buscador (lo usan los resultados y las palabras secretas)
const vistaPanel = document.getElementById("vista-panel");
const tituloPanel = document.getElementById("titulo-panel");
const listaPanel = document.getElementById("lista-panel");
const btnCerrarPanel = document.getElementById("boton-cerrar-panel");

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

    // NUEVO: si venimos de todos.html con ?chiste=N, abrimos ese chiste
    const numeroUrl = parseInt(new URLSearchParams(window.location.search).get("chiste"), 10);
    const chisteDeUrl = todosLosChistes.find(chiste => chiste.id === numeroUrl);

    if (chisteDeUrl) {
      chisteSeleccionado = chisteDeUrl;
      chistesPorVer = chistesPorVer.filter(chiste => chiste.id !== chisteDeUrl.id);
      comprobarChiste();
    } else {
      elegirChisteAlAzar();
    }
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
  ocultarExplicacion(); // la explicación se cierra al cambiar de chiste

  if (chisteSeleccionado.humorNegro === true) {
    caja.classList.add("alerta");
    elTexto.innerText = "⚠️ OJO: Este chiste contiene humor negro sin filtro (temas sensibles, explícitos o políticamente incorrectos). Procede bajo tu propio criterio.";

    btnSiguiente.style.display = "none";
    bloqueAdvertencia.style.display = "block";
    if (btnFavorito) btnFavorito.style.display = "none"; // no se puede marcar favorito hasta verlo
    ocultarBotonAudio(); // tampoco se muestra el altavoz hasta ver el chiste
    ocultarBotonExplicacion(); // ni la explicación (revelaría el chiste)
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
    actualizarBotonExplicacion();
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
  actualizarBotonExplicacion();
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
// BUSCADOR (número, palabra y palabras secretas)
// ============================
// Lo que escribas en el cuadro se interpreta así, por este orden:
//   1. Si es una PALABRA SECRETA  -> hace lo que tú definas abajo.
//   2. Si es un NÚMERO (ej. 17)   -> abre ese chiste.
//   3. Si no, es una PALABRA      -> lista todos los chistes que la contienen.

// ---------------------------------------------------------------
// AJUSTES QUE PUEDES TOCAR
// ---------------------------------------------------------------

// Mínimo de letras para buscar por palabra
const MIN_LETRAS_BUSQUEDA = 2;

// PALABRAS SECRETAS.
// Formato:   "palabra": function() { ...lo que quieres que pase... },
// - No importan las mayúsculas ni las tildes ("Abracadabra" = "abracádabra").
// - Dentro de cada function puedes usar:
//     desbloquearExplicacion();                 -> activa el botón de explicación
//     mostrarTextoEnPanel("Título", "Texto");   -> abre un panel con un mensaje
//     mostrarChistePorId(17);                   -> abre el chiste nº 17
// - Para añadir otra, copia una entrada entera y cambia la palabra y la acción.
const PALABRAS_SECRETAS = {

  "la gracia reside": function() {
    desbloquearExplicacion();
  },

  // "otra palabra": function() {
  //   mostrarChistePorId(1);
  // },

};

// ---------------------------------------------------------------
// FUNCIONES (normalmente no hace falta tocar nada de aquí para abajo)
// ---------------------------------------------------------------

// Quita mayúsculas y tildes para comparar: "Cámara" == "camara"
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function mostrarMensajeBusqueda(texto) {
  if (mensajeBusqueda) mensajeBusqueda.innerText = texto;
}

// --- Panel emergente ---

// Abre el panel con un título y lo deja vacío. Devuelve la zona donde añadir cosas.
function abrirPanel(titulo) {
  tituloPanel.innerText = titulo;
  listaPanel.innerHTML = "";
  vistaPanel.style.display = "block";
  vistaPanel.scrollTop = 0;
  return listaPanel;
}

function cerrarPanel() {
  if (vistaPanel) vistaPanel.style.display = "none";
}

function mostrarTextoEnPanel(titulo, texto) {
  const zona = abrirPanel(titulo);
  const parrafo = document.createElement("p");
  parrafo.innerText = texto;
  zona.appendChild(parrafo);
}

// --- Abrir un chiste concreto en la caja (respeta el aviso de humor negro) ---

function mostrarChistePorId(id) {
  const chiste = todosLosChistes.find(c => c.id === id);
  if (!chiste) return;

  chisteSeleccionado = chiste;

  // Lo quitamos de "por ver" para que no vuelva a salir enseguida al azar
  chistesPorVer = chistesPorVer.filter(c => c.id !== id);

  comprobarChiste();
}

// --- Búsqueda por número ---

function buscarChistePorNumero(numero) {
  const total = todosLosChistes.length;

  if (numero < 1 || numero > total) {
    mostrarMensajeBusqueda("Elige un número entre 1 y " + total);
    return;
  }

  mostrarMensajeBusqueda("");
  mostrarChistePorId(numero);
}

// --- Búsqueda por palabra ---

function buscarChistesPorPalabra(consulta) {
  const buscado = normalizar(consulta);

  if (buscado.length < MIN_LETRAS_BUSQUEDA) {
    mostrarMensajeBusqueda("Escribe al menos " + MIN_LETRAS_BUSQUEDA + " letras");
    return;
  }

  const encontrados = todosLosChistes.filter(c => normalizar(c.texto).includes(buscado));

  if (encontrados.length === 0) {
    mostrarMensajeBusqueda("No hay chistes con «" + consulta + "»");
    return;
  }

  mostrarMensajeBusqueda("");
  mostrarResultados(consulta, encontrados);
}

// Pinta en el panel la lista de chistes encontrados
function mostrarResultados(consulta, lista) {
  const textoTitulo = lista.length === 1
    ? "1 chiste con «" + consulta + "»"
    : lista.length + " chistes con «" + consulta + "»";

  const zona = abrirPanel(textoTitulo);

  lista.forEach(chiste => {
    const esNegro = chiste.humorNegro === true;

    // Usamos las mismas clases que la página todos.html
    const item = document.createElement("div");
    item.classList.add("item-listado");
    if (esNegro) item.classList.add("item-negro");

    const titulo = document.createElement("p");
    titulo.classList.add("titulo-listado");
    titulo.innerText = "Chiste #" + chiste.id;

    const texto = document.createElement("p");
    texto.classList.add("texto-listado");
    // El humor negro no se enseña en la lista: se avisa al abrirlo
    texto.innerText = esNegro
      ? "⚠️ Humor negro (se avisará antes de mostrarlo)"
      : chiste.texto;

    const boton = document.createElement("button");
    boton.innerText = "Ver este chiste";
    boton.onclick = function() {
      cerrarPanel();
      mostrarChistePorId(chiste.id);
    };

    item.append(titulo, texto, boton);
    zona.appendChild(item);
  });
}

// --- Palabras secretas ---

// Devuelve true si lo escrito era una palabra secreta (y ejecuta su acción)
function probarPalabraSecreta(consulta) {
  const buscada = normalizar(consulta);

  for (const palabra in PALABRAS_SECRETAS) {
    if (normalizar(palabra) === buscada) {
      PALABRAS_SECRETAS[palabra]();
      return true;
    }
  }
  return false;
}

// --- Decide qué hacer con lo escrito ---

function ejecutarBusqueda() {
  if (!inputNumero) return;

  const consulta = inputNumero.value.trim();

  if (consulta === "") {
    mostrarMensajeBusqueda("Escribe un número o una palabra");
    return;
  }

  // 1. ¿Palabra secreta?
  if (probarPalabraSecreta(consulta)) {
    inputNumero.value = "";
    mostrarMensajeBusqueda("");
    return;
  }

  if (todosLosChistes.length === 0) return; // el JSON aún no ha cargado

  // 2. ¿Número?   3. Si no, palabra
  if (/^\d+$/.test(consulta)) {
    buscarChistePorNumero(parseInt(consulta, 10));
  } else {
    buscarChistesPorPalabra(consulta);
  }
}

// --- Conexión con los botones ---

if (btnBuscar) {
  btnBuscar.onclick = ejecutarBusqueda;
}

if (inputNumero) {
  inputNumero.addEventListener("keydown", function(evento) {
    if (evento.key === "Enter") ejecutarBusqueda();
  });
}

if (btnCerrarPanel) {
  btnCerrarPanel.onclick = cerrarPanel;
}

// La tecla Escape cierra los paneles emergentes
document.addEventListener("keydown", function(evento) {
  if (evento.key !== "Escape") return;
  cerrarPanel();
  if (vistaFavoritos) vistaFavoritos.style.display = "none";
});

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

// ============================
// EXPLICACIÓN DEL CHISTE (se desbloquea con una palabra secreta)
// ============================
// Al escribir la palabra secreta en el buscador aparece un botón en la caja.
// Al pulsarlo se muestra, debajo del chiste, la explicación de ese chiste
// (y al pulsarlo otra vez se oculta). El botón se queda en todos los chistes
// hasta que se recargue la página.
//
// Cada chiste lleva su explicación en chistes.json, con el campo "explicacion":
//   { "texto": "...", "humorNegro": false, "explicacion": "La gracia está en..." }
// Si un chiste no tiene "explicacion", el botón avisa de que todavía no la tiene.
// Los chistes de humor negro no enseñan el botón hasta que se ve el chiste.

// AJUSTES QUE PUEDES TOCAR
const TEXTO_BOTON_EXPLICACION = "¿Dónde reside la gracia?";                               // lo que pone en el botón
const TEXTO_SIN_EXPLICACION = "Este chiste todavía no tiene explicación."; // si el chiste no la tiene

let explicacionDesbloqueada = false; // pasa a true al escribir la palabra secreta

// La llama la palabra secreta
function desbloquearExplicacion() {
  explicacionDesbloqueada = true;
  if (btnExplicacion) btnExplicacion.innerText = TEXTO_BOTON_EXPLICACION;

  // Si ahora mismo hay un aviso de humor negro en pantalla, el botón espera a que se vea el chiste
  if (bloqueAdvertencia.style.display !== "block") actualizarBotonExplicacion();
}

// Muestra el botón solo si ya se desbloqueó
function actualizarBotonExplicacion() {
  if (!btnExplicacion) return;
  btnExplicacion.style.display = explicacionDesbloqueada ? "block" : "none";
}

function ocultarBotonExplicacion() {
  if (btnExplicacion) btnExplicacion.style.display = "none";
}

// Esconde y vacía el texto de la explicación
function ocultarExplicacion() {
  if (!elExplicacion) return;
  elExplicacion.style.display = "none";
  elExplicacion.innerText = "";
}

// Botón: muestra u oculta la explicación del chiste actual
function alternarExplicacion() {
  if (!chisteSeleccionado || !elExplicacion) return;

  if (elExplicacion.style.display === "block") {
    ocultarExplicacion();
    return;
  }

  elExplicacion.innerText = chisteSeleccionado.explicacion || TEXTO_SIN_EXPLICACION;
  elExplicacion.style.display = "block";
}

if (btnExplicacion) {
  btnExplicacion.onclick = alternarExplicacion;
}

// ============================
// TAMAÑO DEL TEXTO (-A / +A)
// ============================
// Los botones -A y +A cambian el tamaño del texto del chiste.
// El tamaño elegido se guarda en el navegador del visitante.

// AJUSTES QUE PUEDES TOCAR (todo en píxeles)
const TAM_INICIAL = 34;  // tamaño por defecto (ponlo igual que el font-size de #texto-chiste en styles.css)
const TAM_MIN = 18;      // lo más pequeño que se puede poner
const TAM_MAX = 60;      // lo más grande que se puede poner
const TAM_PASO = 4;      // cuánto cambia cada vez que se pulsa

const CLAVE_TAMANO = "chistes-tamano-texto";

const btnTextoMenos = document.getElementById("boton-texto-menos");
const btnTextoMas = document.getElementById("boton-texto-mas");

let tamanoTexto = TAM_INICIAL;

// Lee el tamaño guardado (si lo hay) respetando el mínimo y el máximo.
// El try/catch evita errores en navegadores que bloquean el almacenamiento.
function cargarTamano() {
  let guardado = NaN;
  try {
    guardado = parseInt(localStorage.getItem(CLAVE_TAMANO), 10);
  } catch (error) {}

  if (!Number.isNaN(guardado)) {
    tamanoTexto = Math.min(TAM_MAX, Math.max(TAM_MIN, guardado));
  }
}

function guardarTamano() {
  try {
    localStorage.setItem(CLAVE_TAMANO, tamanoTexto);
  } catch (error) {}
}

// Aplica el tamaño directamente al texto del chiste
function aplicarTamano() {
  elTexto.style.fontSize = tamanoTexto + "px";
  guardarTamano();

  // Se desactiva el botón cuando ya no se puede ir más allá
  if (btnTextoMenos) btnTextoMenos.disabled = tamanoTexto <= TAM_MIN;
  if (btnTextoMas) btnTextoMas.disabled = tamanoTexto >= TAM_MAX;
}

function cambiarTamano(cambio) {
  tamanoTexto = Math.min(TAM_MAX, Math.max(TAM_MIN, tamanoTexto + cambio));
  aplicarTamano();
}

if (btnTextoMenos) btnTextoMenos.onclick = function() { cambiarTamano(-TAM_PASO); };
if (btnTextoMas) btnTextoMas.onclick = function() { cambiarTamano(TAM_PASO); };

// Al cargar la web
cargarTamano();
aplicarTamano();
