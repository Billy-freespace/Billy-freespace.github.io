/* ============================================================================
   PANEL DE SOLUCIONARIOS
   ----------------------------------------------------------------------------
   Permite activar o desactivar la solución de cada ejercicio. El resultado se
   guarda en assets/js/soluciones.js: se descarga desde aquí, se reemplaza el
   archivo y se sube a GitHub.

   Para poder leer los enunciados hay que abrir esta página por HTTP (GitHub
   Pages o un servidor local). Abriéndola con doble clic no se pueden cargar.
   ========================================================================== */

(() => {
  "use strict";

  Sitio.pintarCabecera();

  const contenido = document.getElementById("solucionarios");
  const acceso = document.getElementById("acceso-solucionarios");
  if (!contenido) return;

  document.title = `Solucionarios · ${Sitio.sitio.nombre}`;

  let carga = null;

  /* Se pide soluciones.js con una marca única para saltarse la caché: así el
     panel siempre parte del estado que está publicado. */
  function cargarConfiguracion() {
    if (!carga) {
      carga = new Promise((resolver) => {
        const script = document.createElement("script");
        script.src = `${Sitio.enlace("assets/js/soluciones.js")}?v=${Date.now()}`;
        script.async = true;
        script.onload = () => resolver(true);
        script.onerror = () => resolver(false);
        document.head.appendChild(script);
        window.setTimeout(() => resolver(false), 5000);
      });
    }
    return carga;
  }

  async function mostrar() {
    const cargada = await cargarConfiguracion();
    contenido.hidden = false;
    if (acceso) acceso.remove();

    if (!cargada || !window.SOLUCIONES || typeof window.SOLUCIONES !== "object") {
      contenido.innerHTML = `<div class="aviso">
        <p class="aviso-icono" aria-hidden="true">!</p>
        <h1>No se pudo leer soluciones.js</h1>
        <p>Revisa que el archivo <code>assets/js/soluciones.js</code> exista y tenga el formato que
        genera este panel. Para evitar perder los interruptores, no se muestra nada más.</p>
      </div>`;
      return;
    }

    montar(contenido);
  }

  if (Sitio.hayAccesoProfesor()) {
    mostrar();
  } else {
    contenido.hidden = true;
    if (acceso) {
      Acceso.montar(acceso, () => {
        Sitio.pintarCabecera();
        mostrar();
      });
    }
  }

  function montar(raiz) {
    const estado = Object.assign({}, window.SOLUCIONES);

    const grupos = Sitio.alumnos
      .map((alumno) => ({
        alumno,
        secciones: alumno.temas.flatMap((tema) =>
          tema.niveles.map((nivel) => ({
            tema,
            nivel,
            clave: `${alumno.id}/${tema.id}/${nivel}`,
            archivo: Sitio.rutaSeccion(alumno.id, tema.id, nivel),
          }))
        ),
      }))
      .filter((grupo) => grupo.secciones.length);

    raiz.innerHTML = `
      <header class="cabecera-vista">
        <p class="eyebrow">Panel del profesor</p>
        <h1>Solucionarios</h1>
        <p class="entradilla">Activa o desactiva la solución de cada ejercicio. Cuando termines,
        descarga el archivo y reemplaza <code>assets/js/soluciones.js</code>; después sube el cambio
        a GitHub para que los alumnos lo vean.</p>
      </header>

      <div class="barra-soluciones">
        <p><strong id="contador-soluciones">0</strong> soluciones desactivadas</p>
        <div class="acciones">
          <button type="button" class="boton boton-primario" id="descargar-soluciones">Descargar soluciones.js</button>
          <button type="button" class="boton" id="copiar-soluciones">Copiar contenido</button>
        </div>
      </div>
      <p class="nota-exportar" id="nota-exportar" role="status"></p>
      <div class="previa-soluciones" id="previa-soluciones" hidden></div>

      ${
        grupos.length
          ? grupos
              .map(
                ({ alumno, secciones }) => `<section class="panel-grupo">
                  <div class="panel-grupo-cabeza">
                    <h2>${Sitio.escapar(alumno.nombre)}</h2>
                    <span class="pildora">código ${Sitio.escapar(alumno.id)}</span>
                  </div>
                  ${secciones
                    .map(
                      (seccion) => `<details class="seccion-soluciones" data-clave="${seccion.clave}" data-archivo="${seccion.archivo}">
                        <summary>
                          <span class="seccion-nombre"><strong>${Sitio.escapar(
                            Sitio.NIVELES[seccion.nivel].etiqueta
                          )}</strong> · ${Sitio.escapar(seccion.tema.titulo)}</span>
                          <span class="seccion-estado">Ver ejercicios</span>
                        </summary>
                        <div class="seccion-cuerpo"><p class="mensaje-soluciones">Abriendo…</p></div>
                      </details>`
                    )
                    .join("")}
                </section>`
              )
              .join("")
          : `<p class="mensaje-soluciones">Todavía no hay secciones de ejercicios.</p>`
      }

      <p class="nota-pie">Si cambias el texto de un enunciado, su interruptor se reinicia: el panel
      reconoce los ejercicios por su enunciado.</p>`;

    const contador = raiz.querySelector("#contador-soluciones");
    const nota = raiz.querySelector("#nota-exportar");
    const previa = raiz.querySelector("#previa-soluciones");

    /* Estado y contadores */
    function actualizar() {
      const apagadas = Object.keys(estado).filter((clave) => estado[clave] === false).length;
      contador.textContent = String(apagadas);

      raiz.querySelectorAll(".seccion-soluciones").forEach((detalles) => {
        const casillas = Array.from(detalles.querySelectorAll("input[type=checkbox]"));
        if (!casillas.length) return;

        const sinSolucion = casillas.filter((casilla) => !casilla.checked).length;
        detalles.querySelector(".seccion-estado").textContent =
          `${casillas.length} ejercicio${casillas.length === 1 ? "" : "s"} · ` +
          `${sinSolucion} sin solución`;

        const resumen = detalles.querySelector("[data-resumen]");
        if (resumen) {
          resumen.textContent = sinSolucion ? `${sinSolucion} sin solución` : "todas activas";
        }
      });
    }

    /* Cargar los ejercicios de una sección al abrirla */
    async function cargar(detalles) {
      if (detalles.dataset.cargado) return;
      detalles.dataset.cargado = "1";

      const cuerpo = detalles.querySelector(".seccion-cuerpo");
      const seccion = detalles.dataset.clave;

      try {
        const respuesta = await fetch(detalles.dataset.archivo, { cache: "no-store" });
        if (!respuesta.ok) throw new Error(String(respuesta.status));

        const html = await respuesta.text();
        const documento = new DOMParser().parseFromString(html, "text/html");
        const ejercicios = Array.from(documento.querySelectorAll(".ejercicio"));

        if (!ejercicios.length) {
          cuerpo.innerHTML = `<p class="mensaje-soluciones">Esta sección todavía no tiene ejercicios.</p>`;
          return;
        }

        cuerpo.innerHTML = `
          <div class="mini-acciones">
            <button type="button" class="boton boton-plano" data-todas="1">Activar todas</button>
            <button type="button" class="boton boton-plano" data-todas="0">Desactivar todas</button>
            <span class="pildora" data-resumen></span>
          </div>
          <ul class="lista-soluciones"></ul>`;

        const lista = cuerpo.querySelector(".lista-soluciones");

        ejercicios.forEach((ejercicio, indice) => {
          const enunciado = ejercicio.querySelector(".enunciado");
          const texto = enunciado ? enunciado.textContent : ejercicio.textContent;
          const clave = `${seccion}#${Sitio.claveEjercicio(texto)}`;
          const activa = estado[clave] !== false;

          const fila = document.createElement("li");
          fila.className = "fila-solucion";
          fila.innerHTML = `
            <label class="fila-check">
              <input type="checkbox"${activa ? " checked" : ""} data-clave="${clave}">
              <span class="fila-num">${indice + 1}</span>
              <span class="fila-enunciado"></span>
            </label>`;

          const destino = fila.querySelector(".fila-enunciado");
          if (enunciado) destino.innerHTML = enunciado.innerHTML;
          else destino.textContent = String(texto || "");

          fila.querySelector("input").addEventListener("change", (evento) => {
            const casilla = evento.currentTarget;
            if (casilla.checked) delete estado[casilla.dataset.clave];
            else estado[casilla.dataset.clave] = false;
            actualizar();
          });

          lista.appendChild(fila);
        });

        cuerpo.querySelectorAll("[data-todas]").forEach((boton) => {
          boton.addEventListener("click", () => {
            const activar = boton.dataset.todas === "1";
            lista.querySelectorAll("input[type=checkbox]").forEach((casilla) => {
              casilla.checked = activar;
              if (activar) delete estado[casilla.dataset.clave];
              else estado[casilla.dataset.clave] = false;
            });
            actualizar();
          });
        });

        if (typeof window.renderMathInElement === "function") {
          window.renderMathInElement(cuerpo, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "\\[", right: "\\]", display: true },
              { left: "\\(", right: "\\)", display: false },
              { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
            strict: false,
          });
        }

        actualizar();
      } catch (error) {
        cuerpo.innerHTML = `<p class="mensaje-soluciones">No se pudo leer el archivo. Si abriste
          esta página con doble clic (<code>file://</code>), ábrela desde GitHub Pages o con un
          servidor local (<code>python3 -m http.server</code>).</p>`;
        detalles.dataset.cargado = "";
      }
    }

    raiz.querySelectorAll(".seccion-soluciones").forEach((detalles) => {
      detalles.addEventListener("toggle", () => {
        if (detalles.open) cargar(detalles);
      });
    });

    /* Archivo resultante */
    function generarArchivo() {
      const claves = Object.keys(estado)
        .filter((clave) => estado[clave] === false)
        .sort();
      const lineas = claves.map((clave) => `  "${clave}": false,`).join("\n");
      const objeto = claves.length ? `{\n${lineas}\n}` : "{}";
      const fecha = new Date().toLocaleString("es");

      return `/* ============================================================================
   INTERRUPTORES DEL SOLUCIONARIO
   ----------------------------------------------------------------------------
   Generado desde el panel del profesor el ${fecha}.
   Cada línea apaga la solución de un ejercicio concreto. Si un ejercicio no
   aparece aquí, su solución se muestra normalmente.
   ========================================================================== */

window.SOLUCIONES = ${objeto};
`;
    }

    raiz.querySelector("#descargar-soluciones").addEventListener("click", () => {
      const texto = generarArchivo();
      const blob = new Blob([texto], { type: "text/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "soluciones.js";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      nota.textContent = "Archivo descargado. Reemplaza assets/js/soluciones.js y sube el cambio.";
    });

    raiz.querySelector("#copiar-soluciones").addEventListener("click", async () => {
      const texto = generarArchivo();

      if (await Sitio.copiarAlPortapapeles(texto)) {
        nota.textContent = "Contenido copiado. Pégalo en assets/js/soluciones.js.";
        return;
      }

      previa.hidden = false;
      previa.innerHTML = `<pre><code></code></pre>`;
      const codigo = previa.querySelector("code");
      codigo.textContent = texto;
      Sitio.seleccionarTexto(codigo);
      nota.textContent = "Copia el texto seleccionado y pégalo en assets/js/soluciones.js.";
    });

    actualizar();
  }
})();
