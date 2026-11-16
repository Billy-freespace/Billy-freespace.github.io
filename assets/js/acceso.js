/* ============================================================================
   PANTALLA DE ACCESO DEL PROFESOR
   ----------------------------------------------------------------------------
   Compara la clave escrita con el hash SHA-256 guardado en clave.js.
   Si coincide, recuerda el acceso mientras dure la pestaña (sessionStorage).
   No hace falta editar este archivo.
   ========================================================================== */

const Acceso = (() => {
  "use strict";

  const HASH_POR_DEFECTO = "48a8d9ca65d4ffed5d24d09cde13ef76320e7d4ebf468bcfcb5c4a17f87785a9";

  const hashGuardado = () => String((typeof ACCESO !== "undefined" && ACCESO && ACCESO.hash) || "").toLowerCase().trim();

  const esClavePorDefecto = () => hashGuardado() === HASH_POR_DEFECTO;

  /* SHA-256 en hexadecimal. En todos los navegadores modernos, también en file://. */
  async function hash(texto) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Este navegador no permite comprobar la clave. Prueba con uno actualizado.");
    }
    const datos = new TextEncoder().encode(texto);
    const resumen = await window.crypto.subtle.digest("SHA-256", datos);
    return Array.from(new Uint8Array(resumen))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  /* Dibuja la pantalla de acceso dentro de `contenedor`. */
  function montar(contenedor, alEntrar) {
    const pista = (typeof ACCESO !== "undefined" && ACCESO && ACCESO.pista) || "";

    contenedor.innerHTML = `
      <div class="acceso">
        <div class="acceso-caja">
          <span class="acceso-icono" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2.4"></rect>
              <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
            </svg>
          </span>
          <h1>Acceso del profesor</h1>
          <p class="acceso-texto">Este panel es solo para ti. Cada alumno recibe el enlace de su propia página y no ve la de los demás.</p>

          <form class="acceso-form" novalidate>
            <label for="clave">Clave</label>
            <input id="clave" name="clave" type="password" autocomplete="current-password" required>
            <button class="boton boton-primario" type="submit">Entrar</button>
          </form>

          <p class="acceso-error" role="alert" aria-live="polite"></p>
          ${pista ? `<p class="acceso-pista">${Sitio.escapar(pista)}</p>` : ""}
        </div>
      </div>`;

    const caja = contenedor.querySelector(".acceso-caja");
    const formulario = contenedor.querySelector(".acceso-form");
    const campo = contenedor.querySelector("#clave");
    const error = contenedor.querySelector(".acceso-error");
    const boton = contenedor.querySelector(".acceso-form button");

    campo.focus();

    formulario.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      if (!campo.value.trim()) {
        error.textContent = "Escribe la clave.";
        campo.focus();
        return;
      }

      error.textContent = "";
      boton.disabled = true;
      boton.textContent = "Comprobando…";

      try {
        const calculado = await hash(campo.value.trim());
        if (calculado === hashGuardado()) {
          Sitio.recordarAcceso();
          alEntrar();
        } else {
          error.textContent = "Clave incorrecta. Inténtalo de nuevo.";
          campo.select();
          caja.classList.remove("sacudir");
          void caja.offsetWidth;
          caja.classList.add("sacudir");
        }
      } catch (fallo) {
        error.textContent = fallo.message;
      } finally {
        boton.disabled = false;
        boton.textContent = "Entrar";
      }
    });
  }

  return { montar, hash, esClavePorDefecto, HASH_POR_DEFECTO };
})();
