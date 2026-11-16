#!/usr/bin/env node
/* ============================================================================
   GENERADOR DEL HASH DE LA CLAVE DEL PANEL
   ----------------------------------------------------------------------------
   Uso:

       node herramientas/clave.mjs "mi clave nueva"

   Copia la línea que imprime y pégala dentro de ACCESO, en
   assets/js/clave.js. Después sube el cambio a GitHub.
   ========================================================================== */

import { createHash } from "node:crypto";

const clave = process.argv.slice(2).join(" ").trim();

if (!clave) {
  console.log('\nUso: node herramientas/clave.mjs "mi clave nueva"\n');
  process.exit(1);
}

if (clave.length < 8) {
  console.warn("\nAviso: la clave es corta. Mejor usa 12 caracteres o una frase.\n");
}

const hash = createHash("sha256").update(clave).digest("hex");

console.log("\nPega esta línea dentro de ACCESO, en assets/js/clave.js:\n");
console.log(`  hash: "${hash}",\n`);
console.log("Después sube el cambio a GitHub (git add . && git commit && git push).\n");
