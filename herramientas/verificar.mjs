#!/usr/bin/env node
/* ============================================================================
   VERIFICADOR DEL CUADERNO
   ----------------------------------------------------------------------------
   Uso (desde la carpeta del proyecto):

       node herramientas/verificar.mjs

   Revisa que contenido.js y los archivos de `contenido/` estén de acuerdo:
   identificadores repetidos, archivos que faltan, archivos huérfanos,
   data-seccion mal escrito y secciones sin ejercicios.

   No es obligatorio para que el sitio funcione: es una ayuda para no publicar
   errores. Si no tienes Node instalado, puedes saltarlo.
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const ARCHIVO_CONTENIDO = path.join(RAIZ, "assets", "js", "contenido.js");
const CARPETA_CONTENIDO = path.join(RAIZ, "contenido");

const NIVELES_VALIDOS = ["basico", "intermedio", "avanzado"];
const ID_VALIDO = /^[a-z0-9][a-z0-9-]*$/;

const errores = [];
const avisos = [];

const error = (mensaje) => errores.push(mensaje);
const aviso = (mensaje) => avisos.push(mensaje);

/* --- 1. Leer contenido.js ------------------------------------------------ */

let contenido;
try {
  const codigo = fs.readFileSync(ARCHIVO_CONTENIDO, "utf8");
  contenido = new Function(`${codigo}\nreturn CONTENIDO;`)();
} catch (e) {
  console.error("✖ No se pudo leer assets/js/contenido.js");
  console.error("  " + e.message);
  process.exit(1);
}

if (!contenido || typeof contenido !== "object") {
  console.error("✖ contenido.js no devuelve un objeto CONTENIDO.");
  process.exit(1);
}

const alumnos = Array.isArray(contenido.alumnos) ? contenido.alumnos : [];

if (!alumnos.length) {
  aviso("Todavía no hay alumnos en contenido.js.");
}

/* --- 1b. Clave del panel ------------------------------------------------- */

const HASH_POR_DEFECTO = "48a8d9ca65d4ffed5d24d09cde13ef76320e7d4ebf468bcfcb5c4a17f87785a9";

try {
  const codigoClave = fs.readFileSync(path.join(RAIZ, "assets", "js", "clave.js"), "utf8");
  const ACCESO = new Function(`${codigoClave}\nreturn ACCESO;`)();

  if (!ACCESO || !/^[a-f0-9]{64}$/.test(String(ACCESO.hash || "").toLowerCase())) {
    error("assets/js/clave.js no tiene un hash SHA-256 válido (64 caracteres hexadecimales).");
  } else if (ACCESO.hash.toLowerCase() === HASH_POR_DEFECTO) {
    aviso('El panel sigue con la clave de ejemplo («profesor»). Cámbiala antes de publicar.');
  }
} catch (e) {
  error("No se pudo leer assets/js/clave.js: " + e.message);
}

if (!fs.existsSync(path.join(RAIZ, "robots.txt"))) {
  aviso("Falta robots.txt en la raíz del proyecto.");
}

/* --- 2. Revisar alumnos y temas ------------------------------------------ */

const idsAlumnos = new Set();
const archivosEsperados = new Set();

for (const alumno of alumnos) {
  if (!alumno || !alumno.id || !alumno.nombre) {
    error("Hay un alumno sin `id` o sin `nombre`.");
    continue;
  }
  if (idsAlumnos.has(alumno.id)) {
    error(`El id de alumno "${alumno.id}" está repetido.`);
  }
  idsAlumnos.add(alumno.id);

  if (!ID_VALIDO.test(alumno.id)) {
    aviso(`El id "${alumno.id}" debería ser minúsculas, sin tildes ni espacios.`);
  }

  const temas = Array.isArray(alumno.temas) ? alumno.temas : [];
  const idsTemas = new Set();

  for (const tema of temas) {
    if (!tema || !tema.id || !tema.titulo) {
      error(`El alumno "${alumno.id}" tiene un tema sin \`id\` o sin \`titulo\`.`);
      continue;
    }
    if (idsTemas.has(tema.id)) {
      error(`El tema "${tema.id}" está repetido en "${alumno.id}".`);
    }
    idsTemas.add(tema.id);

    if (!ID_VALIDO.test(tema.id)) {
      aviso(`El id de tema "${tema.id}" debería ser minúsculas, sin tildes ni espacios.`);
    }

    const pedidos = Array.isArray(tema.niveles) && tema.niveles.length ? tema.niveles : NIVELES_VALIDOS;
    for (const nivel of pedidos) {
      if (!NIVELES_VALIDOS.includes(nivel)) {
        error(`En "${alumno.id}/${tema.id}" el nivel "${nivel}" no existe. Usa basico, intermedio o avanzado.`);
        continue;
      }

      const relativo = path.join("contenido", alumno.id, tema.id, `${nivel}.html`);
      const absoluto = path.join(RAIZ, relativo);
      archivosEsperados.add(path.normalize(relativo));

      if (!fs.existsSync(absoluto)) {
        error(`Falta el archivo ${relativo}`);
        continue;
      }

      const html = fs.readFileSync(absoluto, "utf8");
      const esperado = `data-seccion="${alumno.id}/${tema.id}/${nivel}"`;

      if (!html.includes(esperado)) {
        error(`En ${relativo} el <body> debería tener ${esperado}`);
      }

      if (!html.includes('name="robots"')) {
        aviso(`${relativo} no tiene la etiqueta noindex.`);
      }

      const ejercicios = (html.match(/<li class="ejercicio">/g) || []).length;
      const soluciones = (html.match(/<details class="solucion">/g) || []).length;

      if (!ejercicios) {
        aviso(`${relativo} no tiene ejercicios todavía.`);
      } else if (!soluciones) {
        aviso(`${relativo} tiene ${ejercicios} ejercicios, pero ninguno con solución.`);
      }
    }
  }
}

/* --- 3. Archivos huérfanos ----------------------------------------------- */

function recorrer(carpeta) {
  if (!fs.existsSync(carpeta)) return;
  for (const entrada of fs.readdirSync(carpeta, { withFileTypes: true })) {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) recorrer(ruta);
    else if (entrada.name.endsWith(".html")) {
      const relativo = path.normalize(path.relative(RAIZ, ruta));
      if (!archivosEsperados.has(relativo)) {
        aviso(`${relativo} existe, pero ningún alumno lo declara en contenido.js.`);
      }
    }
  }
}

recorrer(CARPETA_CONTENIDO);

/* --- 4. Informe ---------------------------------------------------------- */

console.log("\n📘 Revisión del cuaderno\n");

if (!errores.length && !avisos.length) console.log("  ✔ Todo en orden.");
for (const mensaje of avisos) console.log(`  ! ${mensaje}`);
for (const mensaje of errores) console.log(`  ✖ ${mensaje}`);

console.log(`\n  ${alumnos.length} alumno(s) · ${archivosEsperados.size} archivo(s) de sección declarados\n`);

if (errores.length) {
  console.log(`  ${errores.length} error(es) que conviene corregir antes de publicar.\n`);
  process.exit(1);
}

if (avisos.length) {
  console.log("  Hay avisos que conviene revisar antes de publicar.\n");
  process.exit(0);
}

console.log("  Listo para subir a GitHub.\n");
