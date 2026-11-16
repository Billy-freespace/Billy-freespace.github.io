/* ============================================================================
   VISTAS DE NAVEGACIÓN: inicio → alumno → tema
   ----------------------------------------------------------------------------
   Dibuja el listado de alumnos, los temas de un alumno y los tres niveles de
   un tema. No hace falta editar este archivo.
   ========================================================================== */

(() => {
  "use strict";

  Sitio.pintarCabecera();

  const pagina = document.body.dataset.pagina;
  if (pagina === "inicio") vistaInicio();
  if (pagina === "alumno") vistaAlumno();
  if (pagina === "tema") vistaTema();

  /* ------------------------------------------------------------------ Inicio */
  function vistaInicio() {
    document.querySelectorAll("[data-sitio]").forEach((nodo) => {
      const valor = Sitio.sitio[nodo.dataset.sitio];
      if (valor) nodo.textContent = valor;
    });
    document.title = Sitio.sitio.nombre;

    const resumen = document.getElementById("resumen-sitio");
    if (resumen) {
      const temas = Sitio.alumnos.reduce((total, alumno) => total + alumno.temas.length, 0);
      const secciones = Sitio.alumnos.reduce(
        (total, alumno) => total + alumno.temas.reduce((suma, tema) => suma + tema.niveles.length, 0),
        0
      );
      resumen.innerHTML = [
        `${Sitio.alumnos.length} alumno${Sitio.alumnos.length === 1 ? "" : "s"}`,
        `${temas} tema${temas === 1 ? "" : "s"}`,
        `${secciones} sección${secciones === 1 ? "" : "es"} de ejercicios`,
      ]
        .map((texto) => `<span>${Sitio.escapar(texto)}</span>`)
        .join("");
    }

    const lista = document.getElementById("lista-alumnos");
    if (!lista) return;

    if (!Sitio.alumnos.length) {
      lista.innerHTML = aviso(
        "Todavía no hay alumnos",
        "Agrega el primer alumno en <code>assets/js/contenido.js</code> y aparecerá aquí.",
        "h2"
      );
      return;
    }

    lista.innerHTML = Sitio.alumnos.map(tarjetaAlumno).join("");
  }

  function tarjetaAlumno(alumno) {
    const temas = alumno.temas.length;
    const secciones = alumno.temas.reduce((total, tema) => total + tema.niveles.length, 0);

    return `<a class="tarjeta tarjeta-alumno" href="${Sitio.urlAlumno(alumno.id)}">
      <span class="avatar" style="--tono: ${Sitio.tono(alumno.id)}" aria-hidden="true">${Sitio.escapar(
        Sitio.iniciales(alumno.nombre)
      )}</span>
      <span class="tarjeta-cuerpo">
        <span class="tarjeta-titulo">${Sitio.escapar(alumno.nombre)}</span>
        ${alumno.curso ? `<span class="tarjeta-meta">${Sitio.escapar(alumno.curso)}</span>` : ""}
        ${alumno.nota ? `<span class="tarjeta-nota">${Sitio.escapar(alumno.nota)}</span>` : ""}
        <span class="tarjeta-pie">${temas} tema${temas === 1 ? "" : "s"} · ${secciones} sección${
          secciones === 1 ? "" : "es"
        } <span class="flecha" aria-hidden="true">→</span></span>
      </span>
    </a>`;
  }

  /* ----------------------------------------------------------------- Alumno */
  function vistaAlumno() {
    const contenedor = document.getElementById("vista-alumno");
    if (!contenedor) return;

    const alumno = Sitio.buscarAlumno(Sitio.param("alumno"));
    if (!alumno) {
      contenedor.innerHTML = aviso(
        "No encontramos ese alumno",
        "Revisa el enlace o vuelve a la lista de alumnos.",
        "h1",
        Sitio.urlInicio(),
        "Ver todos los alumnos"
      );
      return;
    }

    document.title = `${alumno.nombre} · ${Sitio.sitio.nombre}`;
    const temas = alumno.temas.length;

    contenedor.innerHTML = `
      ${Sitio.migas([{ texto: "Alumnos", href: Sitio.urlInicio() }, { texto: alumno.nombre }])}
      <header class="cabecera-vista">
        <p class="eyebrow">Alumno</p>
        <h1>${Sitio.escapar(alumno.nombre)}</h1>
        ${alumno.nota ? `<p class="entradilla">${Sitio.escapar(alumno.nota)}</p>` : ""}
        <div class="meta-fila">
          ${alumno.curso ? `<span class="pildora">${Sitio.escapar(alumno.curso)}</span>` : ""}
          <span class="pildora">${temas} tema${temas === 1 ? "" : "s"}</span>
        </div>
      </header>
      ${
        temas
          ? `<div class="rejilla">${alumno.temas.map((tema) => tarjetaTema(alumno, tema)).join("")}</div>`
          : aviso(
              "Este alumno todavía no tiene temas",
              "Agrega un tema en <code>assets/js/contenido.js</code>.",
              "h2"
            )
      }`;
  }

  function tarjetaTema(alumno, tema) {
    return `<article class="tarjeta tarjeta-tema">
      <div>
        <h2 class="tarjeta-titulo"><a href="${Sitio.urlTema(alumno.id, tema.id)}">${Sitio.escapar(
          tema.titulo
        )}</a></h2>
        ${tema.descripcion ? `<p class="tarjeta-descripcion">${Sitio.escapar(tema.descripcion)}</p>` : ""}
      </div>
      <div class="chips">
        ${tema.niveles
          .map(
            (nivelId) =>
              `<a class="chip nivel-${nivelId}" href="${Sitio.urlSeccion(
                alumno.id,
                tema.id,
                nivelId
              )}">${Sitio.escapar(Sitio.NIVELES[nivelId].etiqueta)}</a>`
          )
          .join("")}
      </div>
      <a class="tarjeta-accion" href="${Sitio.urlTema(alumno.id, tema.id)}">Ver los niveles <span aria-hidden="true">→</span></a>
    </article>`;
  }

  /* ------------------------------------------------------------------- Tema */
  function vistaTema() {
    const contenedor = document.getElementById("vista-tema");
    if (!contenedor) return;

    const alumno = Sitio.buscarAlumno(Sitio.param("alumno"));
    const tema = alumno ? Sitio.buscarTema(alumno.id, Sitio.param("tema")) : null;

    if (!alumno || !tema) {
      contenedor.innerHTML = aviso(
        "No encontramos ese tema",
        "Revisa el enlace o vuelve a la lista de alumnos.",
        "h1",
        Sitio.urlInicio(),
        "Ir al inicio"
      );
      return;
    }

    document.title = `${tema.titulo} · ${alumno.nombre} · ${Sitio.sitio.nombre}`;

    contenedor.innerHTML = `
      ${Sitio.migas([
        { texto: "Alumnos", href: Sitio.urlInicio() },
        { texto: alumno.nombre, href: Sitio.urlAlumno(alumno.id) },
        { texto: tema.titulo },
      ])}
      <header class="cabecera-vista">
        <p class="eyebrow">Tema</p>
        <h1>${Sitio.escapar(tema.titulo)}</h1>
        ${tema.descripcion ? `<p class="entradilla">${Sitio.escapar(tema.descripcion)}</p>` : ""}
        <div class="meta-fila">
          <span class="pildora">${Sitio.escapar(alumno.nombre)}</span>
          <span class="pildora">${tema.niveles.length} nivel${tema.niveles.length === 1 ? "" : "es"}</span>
        </div>
      </header>
      <div class="rejilla rejilla-niveles">
        ${tema.niveles.map((nivelId) => tarjetaNivel(alumno, tema, nivelId)).join("")}
      </div>
      <p class="nota-pie">Empieza por el nivel básico y avanza cuando te sientas seguro. Cada ejercicio guarda su solución.</p>`;
  }

  function tarjetaNivel(alumno, tema, nivelId) {
    const nivel = Sitio.NIVELES[nivelId];
    return `<a class="tarjeta tarjeta-nivel nivel-${nivel.id}" href="${Sitio.urlSeccion(
      alumno.id,
      tema.id,
      nivel.id
    )}">
      <span class="nivel-numero" aria-hidden="true">${nivel.numero}</span>
      <span class="nivel-etiqueta">${Sitio.escapar(nivel.etiqueta)}</span>
      <span class="nivel-descripcion">${Sitio.escapar(nivel.descripcion)}</span>
      <span class="nivel-accion">Ver ejercicios <span aria-hidden="true">→</span></span>
    </a>`;
  }

  /* ---------------------------------------------------------------- Avisos */
  function aviso(titulo, mensajeHtml, etiquetaTitulo = "h2", href = "", textoBoton = "") {
    return `<div class="aviso">
      <p class="aviso-icono" aria-hidden="true">∅</p>
      <${etiquetaTitulo}>${Sitio.escapar(titulo)}</${etiquetaTitulo}>
      <p>${mensajeHtml}</p>
      ${
        href
          ? `<p><a class="boton boton-primario" href="${href}">${Sitio.escapar(textoBoton || "Volver")}</a></p>`
          : ""
      }
    </div>`;
  }
})();
