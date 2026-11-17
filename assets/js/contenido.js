/* ============================================================================
   CONTENIDO DEL SITIO
   ----------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para ordenar el sitio.
   Aquí se declaran los alumnos y los temas. Los ejercicios NO van acá:
   van en los archivos HTML de la carpeta `contenido/`.

   Reglas de oro para los identificadores (`id`):
     · minúsculas, sin espacios y sin tildes  →  "juan-perez", "ecuaciones"
     · el id del alumno y el del tema también son nombres de carpeta
     · una vez publicado un id, no lo cambies (los enlaces dejarían de funcionar)

   Para agregar un TEMA solo necesitas una línea como esta:
       { id: "enteros", titulo: "Números enteros" }
   y crear la carpeta `contenido/<alumno>/enteros/` con los archivos
   `basico.html`, `intermedio.html` y `avanzado.html`.

   Si un tema tiene menos niveles, se indica así:
       { id: "repaso", titulo: "Repaso", niveles: ["basico", "intermedio"] }
   ========================================================================== */

const CONTENIDO = {
  /* --- Nombre y descripción que aparecen en la portada ------------------- */
  sitio: {
    nombre: "Cuaderno de matemática",
    descripcion:
      "Ejercicios organizados por alumno, tema y nivel de dificultad, con solucionario paso a paso.",
  },

  /* --- Alumnos ----------------------------------------------------------- */
  alumnos: [
    {
      id: "ykfiv2iw",
      nombre: "Mariapaz Poma F.",
      curso: "1º de secundaria",
      nota: "Operaciones combinadas y ecuaciones de primer grado",
      temas: [
        {
          id: "operaciones_combinadas",
          titulo: "Operaciones Combinadas",
          descripcion:
            "Suma, resta, multiplicación, división con números asociados.",
        },
        {
          id: "ecuaciones",
          titulo: "Ecuaciones de primer grado",
          descripcion: "Despejar la incógnita, resolver y plantear ecuaciones.",
        },
      ],
    },
    {
      id: "zhuxqqwb",
      nombre: "Gabriel Poma C.",
      curso: "3º de secundaria",
      nota: "Proporcionalidad, porcentajes y repartos",
      temas: [
        {
          id: "fracciones",
          titulo: "Fracciones",
          descripcion:
            "Suma, resta, multiplicación, división y problemas con fracciones.",
        },
        {
          id: "proporcionalidad",
          titulo: "Proporcionalidad",
          descripcion:
            "Regla de tres, porcentajes, escalas y repartos proporcionales.",
        },
      ],
    },
  ],
};
