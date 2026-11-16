# Cuaderno de ejercicios de matemática

Sitio estático (HTML, CSS y JavaScript, sin frameworks ni compilación) para publicar
ejercicios de matemática organizados por **alumno → tema → nivel** (básico, intermedio y
avanzado), con **solucionario paso a paso escrito con [KaTeX](https://katex.org)**.

Pensado para GitHub Pages: se sube al repositorio y queda publicado tal cual.

---

## Cómo se navega

```
Portada (lista de alumnos)
   └── Alumno  →  sus temas
          └── Tema  →  los tres niveles
                 └── Sección  →  ejercicios + soluciones desplegables
```

Cada página es un archivo HTML independiente. Funciona abriendo `index.html` con doble clic,
sin servidor local.

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
   `https://TU-USUARIO.github.io/web-math-exercises/`.

> Para actualizar el sitio basta con hacer `git add . && git commit -m "..." && git push`.

---

## Estructura del proyecto

```
web-math-exercises/
├── index.html              ← portada: lista de alumnos
├── alumno.html             ← temas de un alumno
├── tema.html               ← los tres niveles de un tema
├── guia.html               ← guía para el profe (la misma información, en el sitio)
├── assets/
│   ├── estilos.css         ← colores, tipografía y diseño
│   ├── favicon.svg
│   └── js/
│       ├── contenido.js    ← ★ el único archivo que hay que editar para ordenar
│       ├── comun.js        ← utilidades (no editar)
│       ├── app.js          ← vistas de navegación (no editar)
│       └── seccion.js      ← soluciones y fórmulas (no editar)
├── contenido/
│   ├── ana/
│   │   ├── fracciones/
│   │   │   ├── basico.html
│   │   │   ├── intermedio.html
│   │   │   └── avanzado.html
│   │   └── ecuaciones/
│   │       └── ...
│   └── beto/
│       └── proporcionalidad/
│           └── ...
├── plantillas/
│   └── seccion.html        ← copia esto para crear una sección nueva
└── herramientas/
    └── verificar.mjs       ← revisa que no falte nada (opcional)
```

La idea es simple:

- **un alumno = una carpeta** dentro de `contenido/`
- **un tema = una subcarpeta**
- **un nivel = un archivo** llamado `basico.html`, `intermedio.html` o `avanzado.html`

Y todo se declara en `assets/js/contenido.js`.

---

## Recetas

### Agregar un alumno

En `assets/js/contenido.js`, dentro de `alumnos`:

```js
{
  id: "carla",                 // minúsculas, sin tildes ni espacios
  nombre: "Carla Mendoza",
  curso: "3.º de secundaria",  // opcional
  nota: "Números enteros",     // opcional
  temas: []
}
```

El `id` será también el nombre de su carpeta en `contenido/`.

### Agregar un tema

1. Crea la carpeta `contenido/carla/enteros/`.
2. Copia `plantillas/seccion.html` tres veces dentro y renombra las copias como
   `basico.html`, `intermedio.html` y `avanzado.html`.
3. En cada copia cambia:
   - el `<title>`,
   - `data-seccion` del `<body>` (por ejemplo `data-seccion="carla/enteros/basico"`),
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
- **Modo oscuro**: se activa solo según la preferencia del sistema.

## Preguntas frecuentes

**¿Necesito internet para verlo?** Para las fórmulas sí: KaTeX y las tipografías se cargan
desde un CDN. Si necesitas que funcione sin conexión, descarga KaTeX y cambia las rutas de
`<link>` y `<script>` por archivos locales en `assets/`.

**¿Puedo usar esto sin JavaScript?** No, la navegación y el renderizado de fórmulas lo
necesitan.

**Borrar los ejemplos**: elimina los bloques de Ana y Beto en `contenido.js` y sus carpetas
dentro de `contenido/`.

**¿Cómo agrego una imagen o un gráfico?** Guarda la imagen en `contenido/<alumno>/<tema>/` y
usa `<img src="figura.svg" alt="descripción">` dentro del enunciado.

---

Hecho con KaTeX. Sin dependencias, sin compilación.
