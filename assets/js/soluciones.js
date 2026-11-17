/* ============================================================================
   INTERRUPTORES DEL SOLUCIONARIO
   ----------------------------------------------------------------------------
   Los genera el panel del profesor: «Solucionarios» → descargar el archivo.
   Cada línea apaga la solución de UN ejercicio concreto:

       "alumno/tema/nivel#clave": false,

   · "alumno/tema/nivel" es el valor de data-seccion de esa página
   · "clave" es un código que se calcula a partir del enunciado (no lo escribas
     a mano: lo pone el panel por ti)

   Si un ejercicio no aparece aquí, su solución se muestra normalmente.
   Si cambias el texto de un enunciado, su clave cambia y el interruptor de ese
   ejercicio vuelve a «mostrar».

   Se asigna a window.SOLUCIONES (y no a una constante) para que las páginas
   puedan volver a leerlo desde el servidor y actualizarse sin borrar la caché.
   ========================================================================== */

window.SOLUCIONES = {};
