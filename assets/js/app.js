/* ============================================================================
   VISTAS
   ----------------------------------------------------------------------------
   · panel  → acceso del profesor + lista de alumnos con su enlace
   · alumno → la página personal de un alumno (solo sus temas)
   · tema   → los tres niveles de uno de sus temas
   No hace falta editar este archivo.
   ========================================================================== */

(() => {
  "use strict";

  Sitio.pintarCabecera();

  const pagina = document.body.dataset.pagina;
  if (pagina === "panel") vistaPanel();
  if (pagina === "alumno") vistaAlumno();
  if (pagina === "tema") vistaTema();
  if (pagina === "guia") vistaGuia();

  /* =================================================================== PANEL */
  function vistaPanel() {
    const contenedor = document.getElementById("panel");
    if (!contenedor) return;

    document.title = `Panel del profesor · ${Sitio.sitio.nombre}`;

    if (Sitio.hayAccesoProfesor()) {
      pintarPanel(contenedor);
      return;
    }

    Acceso.montar(contenedor, () => {
      Sitio.pintarCabecera();
      pintarPanel(contenedor);
    });
  }

  function pintarPanel(contenedor) {
    const temas = Sitio.alumnos.reduce((total, alumno) => total + alumno.temas.length, 0);
    const secciones = Sitio.alumnos.reduce(
      (total, alumno) => total + alumno.temas.reduce((suma, tema) => suma + tema.niveles.length, 0),
      0
    );

    contenedor.innerHTML = `
      ${Acceso.esClavePorDefecto() ? avisoClavePorDefecto() : ""}

      <header class="cabecera-vista">
        <p class="eyebrow">Panel del profesor</p>
        <h1>Alumnos</h1>
        <p class="entradilla">Cada alumno recibe el enlace de su página y solo ve sus propios temas.
        Aquí puedes copiar esos enlaces. El panel no está enlazado desde ninguna página de alumno.</p>
        <div class="meta-fila">
          <span class="pildora">${Sitio.alumnos.length} alumno${Sitio.alumnos.length === 1 ? "" : "s"}</span>
          <span class="pildora">${temas} tema${temas === 1 ? "" : "s"}</span>
          <span class="pildora">${secciones} sección${secciones === 1 ? "" : "es"}</span>
        </div>
      </header>

      <div class="panel-acciones">
        <a class="boton" href="${Sitio.urlSolucionarios()}">Activar o desactivar soluciones</a>
        <a class="boton boton-plano" href="${Sitio.urlGuia()}">Guía del profe</a>
        <button type="button" class="boton boton-plano" id="boton-salir">Cerrar sesión</button>
      </div>

      ${
        Sitio.alumnos.length
          ? `<div class="rejilla rejilla-panel">${Sitio.alumnos.map(tarjetaPanel).join("")}</div>`
          : aviso(
              "Todavía no hay alumnos",
              "Agrega el primero en <code>assets/js/contenido.js</code>.",
              "h2"
            )
      }

      ${bloqueNuevoAlumno()}
      ${bloqueClave()}`;

    /* Cerrar sesión */
    const salir = contenedor.querySelector("#boton-salir");
    if (salir) {
      salir.addEventListener("click", () => {
        Sitio.olvidarAcceso();
        Sitio.pintarCabecera();
        vistaPanel();
      });
    }

    /* Copiar enlaces (los de alumno y el hash de la clave) */
    contenedor.addEventListener("click", async (evento) => {
      const boton = evento.target.closest("[data-copiar]");
      if (!boton) return;

      const texto = boton.dataset.copiar;
      const etiqueta = boton.dataset.etiqueta || "Copiar";

      if (await Sitio.copiarAlPortapapeles(texto)) {
        boton.textContent = "¡Copiado!";
      } else {
        const zona =
          boton.closest(".tarjeta-panel")?.querySelector(".enlace-alumno") ||
          boton.closest(".resultado-clave")?.querySelector("pre");
        if (zona) Sitio.seleccionarTexto(zona);
        boton.textContent = "Copia el texto de arriba";
      }

      window.setTimeout(() => {
        boton.textContent = etiqueta;
      }, 2400);
    });

    /* Generador de código para un alumno nuevo */
    const generar = contenedor.querySelector("#generar-codigo");
    if (generar) {
      generar.addEventListener("click", () => {
        const codigo = codigoAlumno();
        const bloque = `{\n  id: "${codigo}",\n  nombre: "Nombre del alumno",\n  curso: "",\n  nota: "",\n  temas: [],\n},`;
        const resultado = contenedor.querySelector("#resultado-codigo");
        resultado.innerHTML = `
          <p>Código: <code>${codigo}</code></p>
          <pre><code>${Sitio.escapar(bloque)}</code></pre>
          <p>Crea la carpeta <code>contenido/${codigo}/</code> y dentro el tema con sus tres archivos.
          Su enlace será <code>alumno.html?alumno=${codigo}</code>.</p>
          <button type="button" class="boton" data-copiar="${Sitio.escapar(bloque)}" data-etiqueta="Copiar bloque">Copiar bloque</button>`;
      });
    }

    /* Generador de hash para cambiar la clave */
    const formulario = contenedor.querySelector("#form-clave");
    if (formulario) {
      formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const campo = formulario.querySelector("#nueva-clave");
        const resultado = contenedor.querySelector("#resultado-clave");
        const clave = campo.value.trim();

        if (clave.length < 8) {
          resultado.innerHTML = `<p class="resultado-error">Usa al menos 8 caracteres. Mejor todavía, una frase larga.</p>`;
          campo.focus();
          return;
        }

        const nuevoHash = await Acceso.hash(clave);
        resultado.innerHTML = `
          <p>Pega esta línea dentro de <code>ACCESO</code>, en <code>assets/js/clave.js</code>:</p>
          <pre><code>hash: "${nuevoHash}"</code></pre>
          <p>Después sube el cambio a GitHub. La clave actual del panel pasará a ser la que escribiste.</p>
          <button type="button" class="boton" data-copiar="${nuevoHash}" data-etiqueta="Copiar hash">Copiar hash</button>`;
      });
    }
  }

  function tarjetaPanel(alumno) {
    const temas = alumno.temas.length;
    const secciones = alumno.temas.reduce((total, tema) => total + tema.niveles.length, 0);
    const enlace = new URL(Sitio.urlAlumno(alumno.id), window.location.href).href;

    return `<article class="tarjeta tarjeta-panel">
      <div class="panel-cabeza">
        <span class="avatar" style="--tono: ${Sitio.tono(alumno.id)}" aria-hidden="true">${Sitio.escapar(
          Sitio.iniciales(alumno.nombre)
        )}</span>
        <div class="tarjeta-cuerpo">
          <h2 class="tarjeta-titulo"><a href="${Sitio.urlAlumno(alumno.id)}">${Sitio.escapar(alumno.nombre)}</a></h2>
          ${alumno.curso ? `<span class="tarjeta-meta">${Sitio.escapar(alumno.curso)}</span>` : ""}
          ${alumno.nota ? `<span class="tarjeta-nota">${Sitio.escapar(alumno.nota)}</span>` : ""}
          <span class="tarjeta-pie">${temas} tema${temas === 1 ? "" : "s"} · ${secciones} sección${
            secciones === 1 ? "" : "es"
          }</span>
        </div>
      </div>

      <code class="enlace-alumno">${Sitio.escapar(enlace)}</code>

      <div class="acciones">
        <a class="boton boton-primario" href="${Sitio.urlAlumno(alumno.id)}">Abrir</a>
        <button type="button" class="boton" data-copiar="${Sitio.escapar(enlace)}" data-etiqueta="Copiar enlace">Copiar enlace</button>
      </div>
    </article>`;
  }

  function avisoClavePorDefecto() {
    return `<div class="aviso-clave" role="status">
      <strong>Estás usando la clave de ejemplo «profesor».</strong>
      <p>Cámbiala antes de compartir el sitio con tus alumnos. Tienes el generador al final de esta página.</p>
    </div>`;
  }

  function bloqueNuevoAlumno() {
    return `<section class="paso panel-clave" id="nuevo-alumno" aria-labelledby="titulo-nuevo-alumno">
      <div class="paso-cabeza">
        <h2 id="titulo-nuevo-alumno">Agregar un alumno</h2>
      </div>
      <p>
        El <strong>código</strong> es la carpeta del alumno y también la parte del enlace que él ve,
        así que no contiene su nombre. Genera uno, copia el bloque en
        <code>assets/js/contenido.js</code> y crea la carpeta <code>contenido/…/</code> con sus temas.
      </p>
      <button type="button" class="boton" id="generar-codigo">Generar código</button>
      <div id="resultado-codigo" class="resultado-clave" aria-live="polite"></div>
    </section>`;
  }

  function codigoAlumno() {
    const alfabeto = "abcdefghijkmnpqrstuvwxyz23456789";
    const bytes = new Uint8Array(8);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, (byte) => alfabeto[byte % alfabeto.length]).join("");
  }

  function bloqueClave() {
    return `<section class="paso panel-clave" id="cambiar-clave" aria-labelledby="titulo-clave">
      <div class="paso-cabeza">
        <h2 id="titulo-clave">Cambiar la clave del panel</h2>
      </div>
      <p>Escribe la clave nueva y copia el código que aparece. Luego reemplaza el valor de
      <code>hash</code> en <code>assets/js/clave.js</code> y sube el cambio.</p>
      <form class="form-clave" id="form-clave" novalidate>
        <label for="nueva-clave">Nueva clave (mínimo 8 caracteres)</label>
        <input id="nueva-clave" type="password" autocomplete="new-password" minlength="8" required>
        <button class="boton" type="submit">Generar hash</button>
      </form>
      <div class="resultado-clave" id="resultado-clave" aria-live="polite"></div>
    </section>`;
  }

  /* ================================================================== ALUMNO */
  function vistaAlumno() {
    const contenedor = document.getElementById("vista-alumno");
    if (!contenedor) return;

    const alumno = Sitio.buscarAlumno(Sitio.param("alumno"));

    if (!alumno) {
      contenedor.innerHTML = aviso(
        "No encontramos esta página",
        "Revisa que el enlace esté completo. Si te lo compartió tu profe, pídeselo de nuevo.",
        "h1",
        Sitio.hayAccesoProfesor() ? Sitio.urlInicio() : "",
        "Ir al panel"
      );
      return;
    }

    Sitio.pintarCabecera({ alumno });
    document.title = `Tus ejercicios · ${alumno.nombre}`;

    const temas = alumno.temas.length;

    contenedor.innerHTML = `
      <header class="cabecera-vista">
        <p class="eyebrow">Tus ejercicios</p>
        <h1>${Sitio.escapar(alumno.nombre)}</h1>
        <p class="entradilla">Elige un tema y empieza a practicar. Cada ejercicio guarda su solución:
        ábrela solo después de intentarlo.</p>
        <div class="meta-fila">
          ${alumno.curso ? `<span class="pildora">${Sitio.escapar(alumno.curso)}</span>` : ""}
          <span class="pildora">${temas} tema${temas === 1 ? "" : "s"}</span>
        </div>
      </header>

      ${
        temas
          ? `<div class="rejilla">${alumno.temas.map((tema) => tarjetaTema(alumno, tema)).join("")}</div>`
          : aviso(
              "Todavía no hay temas",
              "Tu profe está preparando los ejercicios. Vuelve a entrar más tarde.",
              "h2"
            )
      }

      <p class="nota-enlace">Guarda este enlace en favoritos: es tu acceso a los ejercicios.</p>`;
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

  /* ==================================================================== TEMA */
  function vistaTema() {
    const contenedor = document.getElementById("vista-tema");
    if (!contenedor) return;

    const alumno = Sitio.buscarAlumno(Sitio.param("alumno"));
    const tema = alumno ? Sitio.buscarTema(alumno.id, Sitio.param("tema")) : null;

    if (!alumno || !tema) {
      contenedor.innerHTML = aviso(
        "No encontramos este tema",
        "Revisa el enlace o vuelve a tu página de ejercicios.",
        "h1",
        alumno ? Sitio.urlAlumno(alumno.id) : "",
        "Volver a mis ejercicios"
      );
      return;
    }

    Sitio.pintarCabecera({ alumno });
    document.title = `${tema.titulo} · ${alumno.nombre}`;

    contenedor.innerHTML = `
      ${Sitio.migas([
        { texto: "Mis ejercicios", href: Sitio.urlAlumno(alumno.id) },
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

  /* ==================================================================== GUÍA */
  function vistaGuia() {
    const contenido = document.getElementById("guia");
    const acceso = document.getElementById("guia-acceso");
    if (!contenido) return;

    const mostrar = () => {
      contenido.hidden = false;
      if (acceso) acceso.remove();
    };

    if (Sitio.hayAccesoProfesor()) {
      mostrar();
      return;
    }

    contenido.hidden = true;
    if (acceso) {
      Acceso.montar(acceso, () => {
        Sitio.pintarCabecera();
        mostrar();
      });
    }
  }

  /* ================================================================ Utilidades */
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
