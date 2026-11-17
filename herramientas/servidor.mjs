#!/usr/bin/env node
/* ============================================================================
   SERVIDOR LOCAL SIN CACHÉ
   ----------------------------------------------------------------------------
   Uso (desde la carpeta del proyecto):

       node herramientas/servidor.mjs

   Luego abre http://127.0.0.1:8765/ en el navegador.

   Sirve el sitio con Cache-Control: no-store, así que al recargar (F5) siempre
   ves los cambios recién guardados. Con `python3 -m http.server` el navegador
   puede guardar los archivos en caché y mostrarte versiones viejas.

   No es el servidor de producción: GitHub Pages sirve el sitio por su cuenta.
   ========================================================================== */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = Number(process.env.PUERTO || process.argv[2] || 8765);

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

const servidor = http.createServer((peticion, respuesta) => {
  const rutaPedida = decodeURIComponent((peticion.url || "/").split("?")[0]);
  let archivo = path.join(RAIZ, rutaPedida);

  if (rutaPedida.endsWith("/")) archivo = path.join(archivo, "index.html");

  /* No permitir salir de la carpeta del proyecto. */
  if (archivo !== RAIZ && !archivo.startsWith(RAIZ + path.sep)) {
    respuesta.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    respuesta.end("Prohibido");
    return;
  }

  fs.stat(archivo, (fallo, info) => {
    if (fallo || !info.isFile()) {
      respuesta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      respuesta.end("No existe: " + rutaPedida);
      return;
    }

    respuesta.writeHead(200, {
      "Content-Type": TIPOS[path.extname(archivo).toLowerCase()] || "application/octet-stream",
      "Content-Length": info.size,
      "Cache-Control": "no-store, max-age=0",
    });

    if (peticion.method === "HEAD") {
      respuesta.end();
      return;
    }

    fs.createReadStream(archivo).pipe(respuesta);
  });
});

servidor.listen(PUERTO, "127.0.0.1", () => {
  console.log(`\n  Cuaderno de ejercicios`);
  console.log(`  http://127.0.0.1:${PUERTO}/\n`);
  console.log(`  Sin caché: recarga con F5 y ves los cambios al instante.`);
  console.log(`  Ctrl+C para detener.\n`);
});

servidor.on("error", (fallo) => {
  if (fallo.code === "EADDRINUSE") {
    console.error(`\n  El puerto ${PUERTO} está ocupado. Prueba con: node herramientas/servidor.mjs 8766\n`);
  } else {
    console.error( fallo.message );
  }
  process.exit(1);
});
