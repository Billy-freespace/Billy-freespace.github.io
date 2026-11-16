/* ============================================================================
   UTILIDADES COMPARTIDAS
   ----------------------------------------------------------------------------
   Lee el contenido de `contenido.js`, construye los enlaces y dibuja la
   cabecera y las migas de pan. No hace falta editar este archivo.
   ========================================================================== */

const Sitio = (() => {
  "use strict";

  /* Los tres niveles de dificultad. El orden es el orden en que se muestran. */
  const NIVELES = {
    basico: {
      id: "basico",
      etiqueta: "Básico",
      numero: "01",
      descripcion: "Ejercicios directos para afianzar la técnica y ganar confianza.",
    },
    intermedio: {
      id: "intermedio",
      etiqueta: "Intermedio",
      numero: "02",
      descripcion: "Varios pasos por ejercicio: hay que elegir la estrategia.",
    },
    avanzado: {
      id: "avanzado",
      etiqueta: "Avanzado",
      numero: "03",
      descripcion: "Problemas con contexto, justificación y casos especiales.",
    },
  };

  const ORDEN_NIVELES = ["basico", "intermedio", "avanzado"];

  /* En las páginas dentro de `contenido/` el body lleva data-base="../../../" */
  const BASE = document.body.dataset.base || "";

  const escapar = (texto) =>
    String(texto ?? "").replace(/[&<>"']/g, (caracter) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[caracter]));

  /* --- Lectura y normalización del contenido ---------------------------- */

  function leerContenido() {
    try {
      if (typeof CONTENIDO === "undefined" || !CONTENIDO) {
        console.error("No se encontró CONTENIDO. Revisa assets/js/contenido.js.");
        return {};
      }
      return CONTENIDO;
    } catch (error) {
      console.error("No se pudo leer contenido.js:", error);
      return {};
    }
  }

  function normalizar() {
    const crudo = leerContenido();
    const sitio = {
      nombre: "Ejercicios de matemática",
      descripcion: "",
      ...(crudo.sitio || {}),
    };

    const alumnos = (Array.isArray(crudo.alumnos) ? crudo.alumnos : [])
      .filter((alumno) => alumno && alumno.id && alumno.nombre)
      .map((alumno) => ({
        ...alumno,
        id: String(alumno.id),
        temas: (Array.isArray(alumno.temas) ? alumno.temas : [])
          .filter((tema) => tema && tema.id && tema.titulo)
          .map((tema) => {
            const pedidos = Array.isArray(tema.niveles) && tema.niveles.length
              ? tema.niveles
              : ORDEN_NIVELES;
            const niveles = pedidos.filter((nivel) => NIVELES[nivel]);
            return {
              ...tema,
              id: String(tema.id),
              niveles: niveles.length ? niveles : [...ORDEN_NIVELES],
            };
          }),
      }));

    return { sitio, alumnos };
  }

  const { sitio, alumnos } = normalizar();

  /* --- Enlaces ----------------------------------------------------------- */

  const enlace = (ruta) => BASE + ruta;
  const urlInicio = () => enlace("index.html");
  const urlGuia = () => enlace("guia.html");
  const urlAlumno = (alumnoId) => enlace(`alumno.html?alumno=${encodeURIComponent(alumnoId)}`);
  const urlTema = (alumnoId, temaId) =>
    enlace(`tema.html?alumno=${encodeURIComponent(alumnoId)}&tema=${encodeURIComponent(temaId)}`);
  const rutaSeccion = (alumnoId, temaId, nivelId) => `contenido/${alumnoId}/${temaId}/${nivelId}.html`;
  const urlSeccion = (alumnoId, temaId, nivelId) => enlace(rutaSeccion(alumnoId, temaId, nivelId));

  const param = (nombre) => new URLSearchParams(window.location.search).get(nombre) || "";

  /* --- Sesión del profesor ------------------------------------------------
     Solo se recuerda mientras la pestaña esté abierta. Es una comodidad para
     el profe, no un mecanismo de seguridad (ver LEEME.md). */

  const CLAVE_SESION = "acceso-profesor";

  function hayAccesoProfesor() {
    try {
      return sessionStorage.getItem(CLAVE_SESION) === "1";
    } catch (error) {
      return false;
    }
  }

  function recordarAcceso() {
    try {
      sessionStorage.setItem(CLAVE_SESION, "1");
    } catch (error) {
      /* sin almacenamiento: el acceso dura solo esta página */
    }
  }

  function olvidarAcceso() {
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch (error) {
      /* nada que borrar */
    }
  }

  /* --- Búsquedas --------------------------------------------------------- */

  const buscarAlumno = (id) => alumnos.find((alumno) => alumno.id === id) || null;

  function buscarTema(alumnoId, temaId) {
    const alumno = buscarAlumno(alumnoId);
    if (!alumno) return null;
    return alumno.temas.find((tema) => tema.id === temaId) || null;
  }

  /* --- Detalles visuales ------------------------------------------------- */

  function iniciales(nombre) {
    const partes = String(nombre).trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return "?";
    const primera = partes[0][0] || "";
    const segunda = partes.length > 1 ? partes[1][0] || "" : "";
    return (primera + segunda).toUpperCase();
  }

  const TONOS = [225, 205, 265, 340, 12, 168, 190, 300];

  function tono(id) {
    let hash = 0;
    for (const caracter of String(id)) hash = (hash * 31 + caracter.charCodeAt(0)) % 9973;
    return TONOS[hash % TONOS.length];
  }

  /* --- Cabecera y migas de pan ------------------------------------------- */

  function pintarCabecera(opciones = {}) {
    const contenedor = document.getElementById("cabecera-sitio");
    if (!contenedor) return;

    const { alumno = null } = opciones;
    const destinoMarca = alumno ? urlAlumno(alumno.id) : urlInicio();

    /* Los alumnos no ven ninguna salida hacia el panel ni hacia otros alumnos.
       El profe, con la sesión abierta, sí tiene sus accesos. */
    const navProfesor = hayAccesoProfesor()
      ? `<nav class="cabecera-nav" aria-label="Navegación del profesor">
           <a href="${urlInicio()}">Panel</a>
           <a href="${urlGuia()}">Guía</a>
         </nav>`
      : "";

    contenedor.className = "cabecera-sitio";
    contenedor.innerHTML = `
      <div class="contenedor cabecera-interior">
        <a class="marca" href="${destinoMarca}">
          <span class="marca-icono" aria-hidden="true">∑</span>
          <span class="marca-texto">${escapar(sitio.nombre)}</span>
        </a>
        ${navProfesor}
      </div>`;

    contenedor.querySelectorAll(".cabecera-nav a").forEach((enlaceNav) => {
      if (new URL(enlaceNav.href).pathname === window.location.pathname) {
        enlaceNav.setAttribute("aria-current", "page");
      }
    });
  }

  function migas(items) {
    const lista = items
      .map((item) =>
        item.href
          ? `<li><a href="${item.href}">${escapar(item.texto)}</a></li>`
          : `<li><span aria-current="page">${escapar(item.texto)}</span></li>`
      )
      .join("");
    return `<nav class="migas" aria-label="Ruta de navegación"><ol>${lista}</ol></nav>`;
  }

  return {
    NIVELES,
    ORDEN_NIVELES,
    sitio,
    alumnos,
    enlace,
    escapar,
    param,
    urlInicio,
    urlGuia,
    urlAlumno,
    urlTema,
    urlSeccion,
    rutaSeccion,
    buscarAlumno,
    buscarTema,
    iniciales,
    tono,
    pintarCabecera,
    migas,
    hayAccesoProfesor,
    recordarAcceso,
    olvidarAcceso,
  };
})();
