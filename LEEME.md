# Cuaderno de ejercicios de matemática

Sitio estático (HTML, CSS y JavaScript, sin frameworks ni compilación) para publicar
ejercicios de matemática organizados por **alumno → tema → nivel** (básico, intermedio y
avanzado), con **solucionario paso a paso escrito con [KaTeX](https://katex.org)**.

Pensado para GitHub Pages: se sube al repositorio y queda publicado tal cual.

**Cada alumno recibe el enlace de su propia página** y solo ve sus temas. La lista completa de
alumnos está en un panel para el profesor protegido con una clave, y ninguna página de alumno
tiene enlaces hacia ese panel ni hacia los demás.

Los alumnos se identifican con un **código** (`k7m2p9x4`), no con su nombre, así que sus nombres
no aparecen en ninguna URL.

---

## Cómo se navega

```
Panel del profesor (index.html, pide clave)
   │   copias el enlace de un alumno
   ▼
Página del alumno (/alumno.html?alumno=k7m2p9x4)  →  sus temas
        └── Tema  →  los tres niveles
               └── Sección  →  ejercicios + soluciones desplegables
```

Cada página es un archivo HTML independiente y funciona abriendo los archivos con doble clic,
sin servidor local. Para trabajar con cambios frecuentes usa `node herramientas/servidor.mjs`
(sirve el sitio sin caché; ver «Probar en tu computadora»).

---

## Compartir con los alumnos

1. Entra a `index.html` y escribe la clave del panel (la de fábrica es `profesor`; cámbiala).
2. En la tarjeta de cada alumno, usa **Copiar enlace**.
3. Envía ese enlace. El alumno verá únicamente sus temas.

El enlace tiene esta forma:

```
https://TU-USUARIO.github.io/web-math-exercises/alumno.html?alumno=k7m2p9x4
```

### La clave del panel

Se guarda como hash SHA-256 en `assets/js/clave.js`. Para cambiarla tienes dos caminos:

- desde el panel, sección **Cambiar la clave** (te da el hash listo para pegar);
- desde la terminal: `node herramientas/clave.mjs "mi clave nueva"`.

Usa una clave larga (12 caracteres o una frase) y no la reutilices en otro sitio.


## Activar o desactivar soluciones

Por defecto **ninguna solución se muestra**: los alumnos ven los enunciados, pero no el botón
«Ver solución». Tú decides qué soluciones publicar.

1. En el panel, entra a **Solucionarios** y abre un alumno, un tema y un nivel.
2. Marca la casilla de cada ejercicio cuya solución quieras publicar (desmarcada = apagada).
3. Al terminar, pulsa **Descargar soluciones.js** (o **Copiar contenido**).
4. Reemplaza `assets/js/soluciones.js` con ese archivo y sube el cambio.

El estado queda en `assets/js/soluciones.js` como una lista de claves con `true`; lo que no
aparece queda apagado. El panel reconoce cada ejercicio por su enunciado: si cambias el texto de
un enunciado, ese interruptor vuelve a «desactivado».

> Los interruptores necesitan abrir el panel por HTTP: GitHub Pages o un servidor local
> (mejor `node herramientas/servidor.mjs`). Abriéndolo con doble clic no puede leer los archivos
> de ejercicios.

### Caché: por qué a veces no se ve el cambio

Los navegadores guardan `soluciones.js` un rato. Para que eso no deje a un alumno con una versión
vieja, cada página vuelve a pedir el archivo al servidor con una marca única y, si cambió, aplica
los interruptores sola: **no hace falta borrar la caché, reabrir el navegador ni reiniciar nada**.

Si estás probando en tu computadora, usa el servidor del proyecto para no pelearte con la caché:

```bash
node herramientas/servidor.mjs
```

Sirve el sitio en `http://127.0.0.1:8765/` con `Cache-Control: no-store`, así ves los cambios al
recargar. En GitHub Pages los archivos pueden tardar unos minutos en actualizarse para quien ya
los visitó; el chequeo automático lo resuelve en la siguiente carga de la página.

---

## Privacidad: qué protege y qué no

Conviene tenerlo claro desde el principio.

**Lo que sí hace este sitio**

- Cada alumno entra por su propio enlace y su página no enlaza al panel ni a los demás alumnos.
- Los identificadores son códigos, así que los nombres no aparecen en las URLs.
- El panel con la lista de alumnos pide una clave.
- Todas las páginas llevan `noindex` y hay un `robots.txt`, así que no aparecen en Google.

**Lo que no hace**

- GitHub Pages es un hosting público: **cualquier archivo del sitio se puede abrir si se conoce su
  dirección**.
- La clave del panel se comprueba en el navegador, así que se puede saltar leyendo el código.
- La lista de alumnos, sus nombres y sus códigos están en `assets/js/contenido.js`, que es un
  archivo público.
- Si el repositorio es público, cualquiera puede ver todos los archivos desde GitHub.

Dicho de otro modo: esto evita que un alumno **se tope** con los ejercicios de sus compañeros,
pero no detiene a alguien que se proponga mirarlos.

**Recomendaciones prácticas**

- Publica solo lo que no te importaría que se viera: nombre, curso y ejercicios. Nada sensible.
- Usa una clave larga y distinta de las que usas en otros servicios.
- Si quieres, mantén el repositorio privado. Ojo: GitHub Pages desde un repositorio privado
  requiere un plan de pago, y el sitio publicado sigue siendo público.

**Si necesitas privacidad de verdad**

La única solución real es que el servidor exija identificarse antes de entregar el contenido.
Alternativas:

- **Cloudflare Access** delante del sitio: el alumno entra con un código que recibe por correo.
  Tiene plan gratuito para equipos pequeños y no hay que tocar el código del cuaderno.
- **Un hosting con contraseña**, por ejemplo Netlify en sus planes pagos.
- **Páginas cifradas** antes de publicarlas (por ejemplo PageCrypt): sin la clave, el archivo no
  se puede leer ni mirando el código.
- **Un aula virtual con cuentas** (Google Classroom, Moodle) si ya la usas: el control de acceso
  lo hace la plataforma.

---

## Publicarlo en GitHub Pages

1. Crea un repositorio vacío en GitHub (por ejemplo `web-math-exercises`) y conecta este
   proyecto. El repositorio local ya está inicializado y con un primer commit:

   ```bash
   git remote add origin https://github.com/TU-USUARIO/web-math-exercises.git
   git push -u origin main
   ```

   Si preferías empezar de cero: `rm -rf .git && git init`.

2. En GitHub entra a **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
4. En uno o dos minutos el sitio estará en
   `https://TU-USUARIO.github.io/web-math-exercises/`. Esa dirección es el **panel del
   profesor** y pide la clave; a los alumnos les compartes el enlace de su página, que se copia
   desde el panel.

> Para actualizar el sitio basta con hacer `git add . && git commit -m "..." && git push`.

---

## Estructura del proyecto

```
web-math-exercises/
├── index.html              ← panel del profesor (pide clave)
├── robots.txt              ← pide a los buscadores que no indexen el sitio
├── alumno.html             ← página personal de un alumno
├── tema.html               ← los tres niveles de un tema
├── guia.html               ← guía para el profe (protegida con la misma clave)
├── solucionarios.html      ← activar/desactivar soluciones (para el profe)
├── assets/
│   ├── estilos.css         ← colores, tipografía y diseño
│   ├── favicon.svg
│   └── js/
│       ├── contenido.js    ← ★ el único archivo que hay que editar para ordenar
│       ├── soluciones.js   ← qué soluciones están activadas
│       ├── clave.js        ← clave del panel (hash)
│       ├── acceso.js       ← pantalla de acceso (no editar)
│       ├── comun.js        ← utilidades (no editar)
│       ├── app.js          ← vistas de navegación (no editar)
│       ├── solucionarios.js← panel de solucionarios (no editar)
│       └── seccion.js      ← fórmulas e interruptores (no editar)
├── contenido/
│   ├── k7m2p9x4/           ← carpeta de un alumno (su código)
│   │   ├── fracciones/
│   │   │   ├── basico.html
│   │   │   ├── intermedio.html
│   │   │   └── avanzado.html
│   │   └── ecuaciones/
│   │       └── ...
│   └── zhuxqqwb/
│       └── proporcionalidad/
│           └── ...
├── plantillas/
│   └── seccion.html        ← copia esto para crear una sección nueva
└── herramientas/
    ├── servidor.mjs        ← prueba local sin caché
    ├── clave.mjs           ← genera el hash de la clave
    └── verificar.mjs       ← revisa que no falte nada (opcional)
```

La idea es simple:

- **un alumno = una carpeta** dentro de `contenido/`, nombrada con su código
- **un tema = una subcarpeta**
- **un nivel = un archivo** llamado `basico.html`, `intermedio.html` o `avanzado.html`

Y todo se declara en `assets/js/contenido.js`.

---

## Recetas

### Agregar un alumno

En `assets/js/contenido.js`, dentro de `alumnos`:

```js
{
  id: "k7m2p9x4",              // el código: genera uno desde el panel
  nombre: "Carla Mendoza",
  curso: "3.º de secundaria",  // opcional
  nota: "Números enteros",     // opcional
  temas: []
}
```

El `id` será también el nombre de su carpeta en `contenido/`, y el enlace que recibe el alumno.
Usa **Generar código** en el panel: te da el código y el bloque listo para copiar.

### Agregar un tema

1. Crea la carpeta `contenido/k7m2p9x4/enteros/`.
2. Copia `plantillas/seccion.html` tres veces dentro y renombra las copias como
   `basico.html`, `intermedio.html` y `avanzado.html`.
3. En cada copia cambia:
   - el `<title>`,
   - `data-seccion` del `<body>` (por ejemplo `data-seccion="k7m2p9x4/enteros/basico"`),
   - el contenido entre los comentarios `ESCRIBE AQUÍ` y `FIN DE LOS EJERCICIOS`.
4. Declara el tema en el alumno:

   ```js
   { id: "enteros", titulo: "Números enteros" }
   ```

Si el tema todavía no tiene los tres niveles, indica cuáles existen:

```js
{ id: "enteros", titulo: "Números enteros", niveles: ["basico", "intermedio"] }
```

### Agregar una sección a un tema que ya existe

Crea el archivo del nivel que falta (copiando la plantilla o duplicando otro nivel del mismo
tema) y agrega ese nivel a `niveles` en `contenido.js` si la lista era personalizada.

### Agregar un ejercicio

Dentro de `<ol class="ejercicios">`, pega un bloque como este:

```html
<li class="ejercicio">
  <p class="enunciado">Calcula \(\frac{1}{2}+\frac{1}{3}\).</p>

  <details class="solucion">
    <summary>Ver solución</summary>
    <div class="pasos">
      <p>Se busca el denominador común \(6\):</p>
      <p>\(\frac{3}{6}+\frac{2}{6}=\frac{5}{6}\).</p>
      <p class="respuesta">\(\frac{5}{6}\)</p>
    </div>
  </details>
</li>
```

La numeración de los ejercicios es automática: no hay que escribirla.

Opcionalmente:

- **Pista** antes de la solución:

  ```html
  <details class="pista">
    <summary>Ver pista</summary>
    <p>Recuerda que \(\frac{1}{2}=\frac{3}{6}\).</p>
  </details>
  ```

- **Grupos de ejercicios** con un subtítulo:

  ```html
  <section class="bloque">
    <h2>Suma y resta</h2>
    <ol class="ejercicios">
      ...
    </ol>
  </section>
  ```

- **Recordatorio de fórmulas** al inicio de la sección:

  ```html
  <aside class="recordatorio">
    <p><strong>Recuerda:</strong> ...</p>
  </aside>
  ```

### El solucionario con KaTeX

Las fórmulas van entre `\(` y `\)` si están dentro de una frase, o entre `$$` y `$$` si van
centradas en su propio renglón:

```html
<p>La solución es \(x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}\).</p>

<p>$$ \frac{a}{b}+\frac{c}{d}=\frac{ad+bc}{bd} $$</p>
```

Algunos comandos frecuentes:

| Quiero escribir | Se escribe |
| --- | --- |
| Fracción | `\frac{3}{4}` |
| Raíz | `\sqrt{x}` o `\sqrt[3]{x}` |
| Potencia / subíndice | `x^{2}` y `a_{n}` |
| Multiplicación / división | `\cdot` y `\div` |
| Menor o igual / distinto | `\le` y `\neq` |
| Paréntesis que crecen | `\left( \frac{1}{2} \right)` |
| Infinito, pi, alfa | `\infty`, `\pi`, `\alpha` |
| Texto dentro de una fórmula | `\text{si } x\neq 0` |
| Sistema de ecuaciones | `\begin{cases} x+y=5 \\ x-y=1 \end{cases}` |

Tres advertencias útiles:

1. Los signos `<` y `>` dentro del HTML se escriben `&lt;` y `&gt;`.
2. En un sistema de ecuaciones, cada salto de línea es `\\`.
3. Evita el símbolo `$` suelto en el texto (por ejemplo, precios): el renderizador lo interpreta
   como fórmula. Para precios usa «soles» o escríbelo como `\$`.

### Revisar antes de publicar

```bash
node herramientas/verificar.mjs
```

Comprueba identificadores repetidos, archivos que faltan, archivos sueltos que nadie declara y
`data-seccion` mal escritos. No es obligatorio, pero evita enlaces rotos.

---

## Personalización

- **Nombre y descripción del sitio**: `sitio` en `assets/js/contenido.js`.
- **Colores, tipografía y espaciados**: variables al inicio de `assets/estilos.css`.
- **Textos de los niveles** («Básico», «Intermedio», «Avanzado» y sus descripciones): objeto
  `NIVELES` en `assets/js/comun.js`.
- **Clave del panel**: `assets/js/clave.js` (mejor cámbiala desde el panel).
- **Modo oscuro**: se activa solo según la preferencia del sistema.

## Preguntas frecuentes

**¿Necesito internet para verlo?** Para las fórmulas sí: KaTeX y las tipografías se cargan
desde un CDN. Si necesitas que funcione sin conexión, descarga KaTeX y cambia las rutas de
`<link>` y `<script>` por archivos locales en `assets/`.

**¿Puedo usar esto sin JavaScript?** No, la navegación, el renderizado de fórmulas y la clave
lo necesitan.

**¿Por qué no veo los cambios de `soluciones.js`?** El navegador guarda el archivo. Las páginas lo
vuelven a pedir al cargar y se actualizan solas; si aun así no aparece, recarga con F5. Para
trabajar sin caché usa `node herramientas/servidor.mjs`.

**¿Puedo poner una clave distinta a cada alumno?** Se puede simular, pero en un sitio estático no
aporta seguridad: los archivos siguen siendo públicos y la comprobación ocurre en el navegador.
Lo que sí puedes hacer es dar a cada alumno un enlace distinto (ya está resuelto). Para claves por
alumno de verdad hace falta un servidor que autentique (ver «Privacidad»).

**¿Y si un alumno cambia el código de su enlace por el de otro?** Necesitaría conocer el código
del otro, que no tiene relación con su nombre. Si alguien lee `assets/js/contenido.js` puede verlos
todos, y en GitHub Pages no hay forma de impedirlo del todo (ver «Privacidad»).

**Borrar los ejemplos**: elimina los bloques de Ana y Beto en `contenido.js` y sus carpetas
dentro de `contenido/`.

**¿Cómo agrego una imagen o un gráfico?** Guarda la imagen en `contenido/<alumno>/<tema>/` y
usa `<img src="figura.svg" alt="descripción">` dentro del enunciado.

---

Hecho con KaTeX. Sin dependencias, sin compilación.
