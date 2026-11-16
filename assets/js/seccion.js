/* ============================================================================
   PÁGINA DE UNA SECCIÓN DE EJERCICIOS
   ----------------------------------------------------------------------------
   Se encarga de:
     · dibujar las migas de pan y el título a partir del atributo
       data-seccion="alumno/tema/nivel" del <body>;
     · agregar el botón para mostrar u ocultar todas las soluciones;
     · escribir las fórmulas con KaTeX.
   No hace falta editar este archivo.
   ========================================================================== */

(() => {
  "use strict";

  const [alumnoId, temaId, nivelId] = (document.body.dataset.seccion || "").split("/");
  const alumno = Sitio.buscarAlumno(alumnoId);
  const tema = alumno ? Sitio.buscarTema(alumno.id, temaId) : null;
  const nivel = Sitio.NIVELES[nivelId];

  /* La marca de la cabecera vuelve a la página del alumno, nunca al panel. */
  Sitio.pintarCabecera({ alumno });

  const encabezado = document.getElementById("encabezado-seccion");
  const soluciones = Array.from(document.querySelectorAll("details.solucion"));
  const ejercicios = document.querySelectorAll(".ejercicio");
  const contextoValido = Boolean(alumno && tema && nivel);

  if (encabezado) {
    if (contextoValido) {
      document.title = `${nivel.etiqueta} · ${tema.titulo} · ${alumno.nombre}`;
      encabezado.innerHTML = `
        ${Sitio.migas([
          { texto: "Mis ejercicios", href: Sitio.urlAlumno(alumno.id) },
          { texto: tema.titulo, href: Sitio.urlTema(alumno.id, tema.id) },
          { texto: nivel.etiqueta },
        ])}
        <header class="cabecera-vista">
          <p class="insignia nivel-${nivel.id}">Nivel ${Sitio.escapar(nivel.etiqueta.toLowerCase())}</p>
          <h1>${Sitio.escapar(tema.titulo)}</h1>
          <p class="entradilla">${Sitio.escapar(nivel.descripcion)}</p>
          <div class="meta-fila">
            <span class="pildora">${Sitio.escapar(alumno.nombre)}</span>
            <span class="pildora">${ejercicios.length} ejercicio${ejercicios.length === 1 ? "" : "s"}${
              soluciones.length ? ` · ${soluciones.length} con solución` : ""
            }</span>
          </div>
        </header>`;
    } else {
      encabezado.innerHTML = `<div class="aviso">
        <p class="aviso-icono" aria-hidden="true">∅</p>
        <h1>Esta sección no está registrada</h1>
        <p>Revisa que <code>data-seccion</code> coincida con el alumno, el tema y el nivel de
        <code>assets/js/contenido.js</code>.</p>
        <p><a class="boton boton-primario" href="${Sitio.urlInicio()}">Ir al inicio</a></p>
      </div>`;
    }
  }

  if (contextoValido) {
    pintarNavegacion(alumno, tema, nivel);
    pintarHerramientas(soluciones);
  }

  escribirFormulas();

  /* ------------------------------------------------------ Navegación final */
  function pintarNavegacion(alumnoActual, temaActual, nivelActual) {
    const principal = document.getElementById("contenido");
    if (!principal) return;

    const posicion = temaActual.niveles.indexOf(nivelActual.id);
    const anterior = posicion > 0 ? temaActual.niveles[posicion - 1] : null;
    const siguiente = posicion < temaActual.niveles.length - 1 ? temaActual.niveles[posicion + 1] : null;

    const enlaceNivel = (id, esAnterior) => {
      const datos = Sitio.NIVELES[id];
      return `<a class="nav-nivel ${esAnterior ? "nav-anterior" : "nav-siguiente"}" href="${Sitio.urlSeccion(alumnoActual.id, temaActual.id, id)}">
        <span class="nav-dir">${esAnterior ? "← Anterior" : "Siguiente →"}</span>
        <span class="nav-nombre">${Sitio.escapar(datos.etiqueta)}</span>
      </a>`;
    };

    const nav = document.createElement("nav");
    nav.className = "nav-niveles";
    nav.setAttribute("aria-label", "Otros niveles de este tema");
    nav.innerHTML = `
      ${anterior ? enlaceNivel(anterior, true) : "<span></span>"}
      ${siguiente ? enlaceNivel(siguiente, false) : "<span></span>"}
      <a class="nav-volver" href="${Sitio.urlTema(alumnoActual.id, temaActual.id)}">Ver todos los niveles de ${Sitio.escapar(
        temaActual.titulo
      )}</a>`;
    principal.appendChild(nav);
  }

  /* ------------------------------------------------------------ Herramientas */
  function pintarHerramientas(detalles) {
    const barra = document.getElementById("barra-herramientas");
    if (!barra || !detalles.length) return;

    barra.hidden = false;
    barra.innerHTML = `
      <button type="button" class="boton" id="boton-soluciones">Mostrar soluciones</button>
      <button type="button" class="boton boton-plano" id="boton-imprimir">Imprimir</button>`;

    const botonSoluciones = barra.querySelector("#boton-soluciones");
    const botonImprimir = barra.querySelector("#boton-imprimir");

    const sincronizar = () => {
      const todasAbiertas = detalles.every((detalle) => detalle.open);
      botonSoluciones.textContent = todasAbiertas ? "Ocultar soluciones" : "Mostrar soluciones";
      botonSoluciones.setAttribute("aria-pressed", String(todasAbiertas));
    };

    botonSoluciones.addEventListener("click", () => {
      const abrir = !detalles.every((detalle) => detalle.open);
      detalles.forEach((detalle) => {
        detalle.open = abrir;
      });
      sincronizar();
    });

    detalles.forEach((detalle) => detalle.addEventListener("toggle", sincronizar));
    botonImprimir.addEventListener("click", () => window.print());

    /* Al imprimir, las soluciones deben salir siempre visibles. */
    window.addEventListener("beforeprint", () => detalles.forEach((detalle) => (detalle.open = true)));

    sincronizar();
  }

  /* ---------------------------------------------------------------- KaTeX */
  function escribirFormulas() {
    if (typeof window.renderMathInElement !== "function") {
      console.warn("KaTeX no se cargó: revisa la conexión a internet.");
      return;
    }

    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
      errorColor: "#c0263f",
      strict: false,
    });
  }
})();
