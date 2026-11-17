/* ============================================================================
   INTERRUPTORES DEL SOLUCIONARIO
   ----------------------------------------------------------------------------
   Por defecto TODAS las soluciones están desactivadas: el alumno ve el
   ejercicio, pero no el botón «Ver solución».
   Cada línea activa la solución de UN ejercicio concreto:

       "alumno/tema/nivel#clave": true,

   · "alumno/tema/nivel" es el valor de data-seccion de esa página
   · "clave" es un código que se calcula a partir del enunciado (no lo escribas
     a mano: lo pone el panel por ti)

   Si un ejercicio no aparece aquí, su solución queda desactivada.
   Si cambias el texto de un enunciado, su clave cambia y el interruptor de ese
   ejercicio vuelve a «desactivado».

   Se asigna a window.SOLUCIONES (y no a una constante) para que las páginas
   puedan volver a leerlo desde el servidor y actualizarse sin borrar la caché.
   ========================================================================== */

window.SOLUCIONES = {};
