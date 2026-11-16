/* ============================================================================
   CLAVE DEL PANEL DEL PROFESOR
   ----------------------------------------------------------------------------
   La clave de fábrica es:  profesor
   Cámbiala antes de compartir el sitio. Para generar el hash de otra clave
   tienes dos caminos:

     · desde el propio panel: sección «Cambiar la clave» (te da el hash listo)
     · desde la terminal:     node herramientas/clave.mjs "mi clave nueva"

   IMPORTANTE: esta clave es una cortina para que un alumno curioso no vea la
   lista de sus compañeros, NO es seguridad real. Todo lo que se publica en
   GitHub Pages es público y se puede leer mirando el código. Los detalles y
   las alternativas de verdadero control de acceso están en LEEME.md.
   ========================================================================== */

const ACCESO = {
  /* SHA-256 de la clave. No pongas la clave en texto plano. */
  hash: "48a8d9ca65d4ffed5d24d09cde13ef76320e7d4ebf468bcfcb5c4a17f87785a9",

  /* Texto opcional de ayuda que aparece bajo el campo de la clave. */
  pista: "",
};
