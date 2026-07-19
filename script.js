// Variables para guardar los datos
let todosLosChistes = [];
let chisteSeleccionado = null;

// Guardamos los elementos de la pantalla en variables
const caja = document.getElementById("caja-chiste");
const elNumero = document.getElementById("numero-chiste");
const elTexto = document.getElementById("texto-chiste");
const btnSiguiente = document.getElementById("boton-siguiente");
const bloqueAdvertencia = document.getElementById("botones-advertencia");
const btnVerTodo = document.getElementById("boton-ver-todo");
const btnSaltar = document.getElementById("boton-saltar");

// 1. LEER EL ARCHIVO JSON AL ENTRAR A LA WEB
fetch("chistes.json")
  .then(respuesta => respuesta.json())
  .then(datos => {
    todosLosChistes = datos; // Guardamos los chistes del JSON en nuestra lista

    // ASIGNACIÓN DE ID AUTOMÁTICA
    for (let i = 0; i < todosLosChistes.length; i++) {
      todosLosChistes[i].id = i + 1;
    }

    elegirChisteAlAzar();    // Elegimos uno inmediatamente al cargar la web
  });

// 2. FUNCIÓN PARA ELEGIR CUALQUIER CHISTE AL AZAR (SIN REPETIR EL ACTUAL)
function elegirChisteAlAzar() {
  // Si solo tienes un chiste en la lista, no se puede elegir otro diferente
  if (todosLosChistes.length <= 1) {
    chisteSeleccionado = todosLosChistes[0];
    comprobarChiste();
    return;
  }

  let posicionAzar;
  let nuevoChiste;

  // --- EL TRUCO ESTÁ AQUÍ ---
  // Hacemos el sorteo la primera vez, y si coincide con el actual, 
  // el "do-while" obliga a repetir el sorteo hasta que salga uno distinto.
  do {
    posicionAzar = Math.floor(Math.random() * todosLosChistes.length);
    nuevoChiste = todosLosChistes[posicionAzar];
  } while (chisteSeleccionado !== null && nuevoChiste.id === chisteSeleccionado.id);
  // --------------------------

  // Guardamos el nuevo chiste elegido como el chiste actual
  chisteSeleccionado = nuevoChiste;
  
  comprobarChiste();
}

// 3. COMPROBAR SI ES HUMOR NEGRO O NORMAL
function comprobarChiste() {
  elNumero.innerText = "Chiste #" + chisteSeleccionado.id;

  if (chisteSeleccionado.humorNegro === true) {
    caja.classList.add("alerta");
    elTexto.innerText = "⚠️ OJO: Este chiste contiene humor negro y puede resultar incómodo.";
    
    btnSiguiente.style.display = "none";       
    bloqueAdvertencia.style.display = "block"; 
  } else {
    caja.classList.remove("alerta");
    elTexto.innerText = chisteSeleccionado.texto;
    
    btnSiguiente.style.display = "block";
    bloqueAdvertencia.style.display = "none";
  }
}

// 4. BOTÓN: "VER CHISTE DE TODOS MODOS"
btnVerTodo.onclick = function() {
  caja.classList.remove("alerta");             
  elTexto.innerText = chisteSeleccionado.texto; 
  
  btnSiguiente.style.display = "block";       
  bloqueAdvertencia.style.display = "none";    
};

// 5. BOTÓN: "SALTAR (QUIERO UN CHISTE BLANCO)"
btnSaltar.onclick = function() {
  let soloBlancos = todosLosChistes.filter(chiste => chiste.humorNegro === false);
  
  // Si solo hay un chiste blanco o ninguno, mostramos lo que haya
  if (soloBlancos.length === 0) return;
  
  let posicionAzar;
  let nuevoChiste;

  // Hacemos lo mismo aquí: asegurar que el chiste blanco al azar no sea el mismo que ya está en pantalla
  do {
    posicionAzar = Math.floor(Math.random() * soloBlancos.length);
    nuevoChiste = soloBlancos[posicionAzar];
  } while (soloBlancos.length > 1 && chisteSeleccionado !== null && nuevoChiste.id === chisteSeleccionado.id);
  
  chisteSeleccionado = nuevoChiste;
  comprobarChiste();
};

// 6. BOTÓN PRINCIPAL: AL HACER CLICK MUESTRA OTRO CHISTE
btnSiguiente.onclick = elegirChisteAlAzar;