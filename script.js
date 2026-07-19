// Variables para guardar los datos
let todosLosChistes = [];
let chistesPorVer = []; // <- NUEVO: Aquí guardamos solo los que faltan por salir
let chisteSeleccionado = null;

// Guardamos los elementos de la pantalla en variables
const caja = document.getElementById("caja-chiste");
const elNumero = document.getElementById("numero-chiste");
const elTexto = document.getElementById("texto-chiste");
const btnSiguiente = document.getElementById("btn-siguiente");
const bloqueAdvertencia = document.getElementById("botones-advertencia");
const btnVerTodo = document.getElementById("btn-ver-todo");
const btnSaltar = document.getElementById("btn-saltar");

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

    elegirChisteAlAzar();    
  });

// 2. FUNCIÓN PARA ELEGIR SIN REPETIR HASTA QUE SE ACABEN
function elegirChisteAlAzar() {
  // Si ya salieron todos los chistes, volvemos a recargar la lista completa
  if (chistesPorVer.length === 0) {
    chistesPorVer = [...todosLosChistes];
  }

  // Elegimos uno al azar pero SOLO de los que quedan por ver
  let posicionAzar = Math.floor(Math.random() * chistesPorVer.length);
  chisteSeleccionado = chistesPorVer[posicionAzar];
  
  // EL TRUCO: Quitamos este chiste de la lista de pendientes para que no vuelva a salir
  chistesPorVer.splice(posicionAzar, 1);
  
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
  // Filtramos los chistes que quedan por ver para buscar solo los blancos
  let blancosDisponibles = chistesPorVer.filter(chiste => chiste.humorNegro === false);
  
  // Si no quedan chistes blancos en la lista de pendientes, buscamos en la lista total
  if (blancosDisponibles.length === 0) {
    let todosLosBlancos = todosLosChistes.filter(chiste => chiste.humorNegro === false);
    chistesPorVer = [...todosLosBlancos]; // Reiniciamos los pendientes solo con blancos
    blancosDisponibles = chistesPorVer;
  }
  
  // Elegimos uno al azar de los blancos que quedan
  let posicionAzar = Math.floor(Math.random() * blancosDisponibles.length);
  chisteSeleccionado = blancosDisponibles[posicionAzar];
  
  // Lo quitamos de la lista general de pendientes usando su ID único
  chistesPorVer = chistesPorVer.filter(chiste => chiste.id !== chisteSeleccionado.id);
  
  comprobarChiste();
};

// 6. BOTÓN PRINCIPAL: AL HACER CLICK MUESTRA OTRO CHISTE
btnSiguiente.onclick = elegirChisteAlAzar;