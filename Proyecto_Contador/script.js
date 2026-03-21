
let valorActual = 0;
let clicsIncremento = 0;
let clicsDecremento = 0;

const valorActualElement = document.getElementById('valorActual');
const contadorIncElement = document.getElementById('contadorInc');
const contadorDecElement = document.getElementById('contadorDec');
const btnIncrementar = document.getElementById('btnIncrementar');
const btnDecrementar = document.getElementById('btnDecrementar');

// Actualizar
function actualizarUI() {
    valorActualElement.textContent = valorActual;
    contadorIncElement.textContent = clicsIncremento;
    contadorDecElement.textContent = clicsDecremento;
}

// Incremento
function incrementar() {

    valorActual++;

    clicsIncremento++;
    
    // Reiniciar si >= 10
    if (clicsIncremento >= 10) {
        clicsIncremento = 0;
    }
    
    actualizarUI();
}

// Decremento
function decrementar() {
  
    valorActual--;

    clicsDecremento++;
    
    // Reiniciar si >= 10
    if (clicsDecremento >= 10) 
    {
        clicsDecremento = 0;
    }
    
    actualizarUI();
}

// Agregar eventos a los botones
btnIncrementar.addEventListener('click', incrementar);
btnDecrementar.addEventListener('click', decrementar);

actualizarUI();