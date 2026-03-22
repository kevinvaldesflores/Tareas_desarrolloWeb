document.getElementById('boton').onclick = function() {
  // Obtener texto
  let texto = document.getElementById('entrada').value;
  
  // Limpiar minúsculas, solo letras y números
  let limpio = texto.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Obtener resultado
  let resultado = document.getElementById('resultado');
  
  if (limpio === '') {
    resultado.innerHTML = 'Escribe algo...';
    return;
  }
  
  // Invertir
  let invertido = limpio.split('').reverse().join('');
  
  // Comparar
  if (limpio === invertido) {
    resultado.innerHTML = 'SÍ es palíndromo';
  } else {
    resultado.innerHTML = 'NO es palíndromo';
  }
};

// Pulsar Enter
document.getElementById('entrada').onkeypress = function(e) {
  if (e.key === 'Enter') {
    document.getElementById('boton').click();
  }
};