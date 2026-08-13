/*
El catalogo tiene que decir la verdad sobre la API de cada componente.

=== POR QUE EXISTE ESTA COMPUERTA ===

El 2026-08-13, al unificar la API de `alert`, se migro el componente, sus usos
internos y las historias. Se quedaron atras el catalogo, el generador de UI y
el test del generador. Los tres los encontro `governance:check`, pero DE UNO EN
UNO y en corridas distintas, porque la cadena se detiene en el primer paso
rojo: tres vueltas completas para descubrir que el radio de una ruptura de API
es mas ancho que sus llamadas.

De esas tres superficies, el catalogo es la peor de tener desactualizada, y no
por lo que rompe sino por lo que NO rompe: nada. Ningun compilador lo lee.
Quien lo lee son las herramientas y quien pide un componente sin abrir su
codigo. Un catalogo que declara `variant`, `size` y `message` sobre un
componente que ya solo entiende `kind` no da error: da respuestas equivocadas,
con toda confianza, hasta que alguien escribe una plantilla que no compila y no
entiende por que.

Esta compuerta convierte esa divergencia silenciosa en un fallo de gate en el
mismo momento en que se escribe.

=== LO QUE COMPRUEBA, Y LO QUE NO ===

Compara los nombres de entrada declarados en `catalog/components/*.json` con
los que el componente declara de verdad en su fuente, en las dos formas que
conviven en este repositorio: el decorador `@Input()` y la funcion `input()`
de signals.

NO comprueba tipos ni valores por omision. Seria tentador, pero exigiria
resolver el sistema de tipos y el resultado seria una compuerta fragil que
la gente aprende a rodear. Los NOMBRES bastan para atrapar el fallo real: una
entrada renombrada, anadida o retirada sin actualizar el catalogo.
*/
const fs = require('node:fs');
const path = require('node:path');

const catalogRoot = path.resolve('catalog/components');
const violations = [];
let comparedEntries = 0;
let comparedInputs = 0;

/*
Las dos formas de declarar una entrada que conviven aqui. Se aceptan las dos a
proposito: exigir una sola convertiria esta compuerta en una migracion
encubierta, y esa decision no es suya.
*/
/* El `(?!set|get)` no es adorno: sin el, `@Input() set columnTemplate(v)`
   capturaba literalmente `set` como nombre de entrada. Lo destapo esta misma
   compuerta en su primera ejecucion, sobre pagination y scroll-overlay. */
const DECORATOR_INPUT =
  /@Input\(\s*(?:\{[^}]*\}\s*)?\)\s*(?:readonly\s+)?(?!set\s|get\s)([A-Za-z_$][\w$]*)/gu;
/* `model()` tambien es una entrada —ademas de una salida—, y omitirlo hacia que
   esta compuerta denunciara como «retirada» una entrada perfectamente viva:
   paso con `opened` de form-dialog en su primera ejecucion, y estuvo a punto de
   costar un «arreglo» del catalogo que lo habria estropeado. */
const SIGNAL_INPUT =
  /(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*=\s*(?:input|model)(?:\.required)?\s*[<(]/gu;
/*
Un `set nombre(...)` publico tambien es una entrada cuando lleva `@Input()`
encima, y ese caso ya lo cubre DECORATOR_INPUT. Aqui se recoge la variante en
la que el decorador va en la linea anterior al `set`, que el patron de arriba
no alcanza.
*/
const DECORATED_SETTER = /@Input\(\s*(?:\{[^}]*\}\s*)?\)\s*(?:\r?\n\s*)?set\s+([A-Za-z_$][\w$]*)\s*\(/gu;

function declaredInSource(source) {
  const names = new Set();
  for (const pattern of [DECORATOR_INPUT, SIGNAL_INPUT, DECORATED_SETTER]) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      names.add(match[1]);
    }
  }
  return names;
}

for (const entry of fs.readdirSync(catalogRoot).sort()) {
  if (!entry.endsWith('.json')) continue;
  const catalogPath = path.join(catalogRoot, entry);
  const declared = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const inputs = declared.inputs;
  if (!Array.isArray(inputs) || inputs.length === 0) continue;

  const sourcePath = declared.source;
  if (typeof sourcePath !== 'string' || !fs.existsSync(sourcePath)) {
    violations.push(
      `catalog/components/${entry}: declara inputs pero su \`source\` no apunta a un fichero existente (${sourcePath}).`,
    );
    continue;
  }

  comparedEntries += 1;
  const real = declaredInSource(fs.readFileSync(sourcePath, 'utf8'));
  const catalogued = new Set(inputs.map((input) => input.name));
  comparedInputs += catalogued.size;

  for (const name of catalogued) {
    if (!real.has(name)) {
      violations.push(
        `catalog/components/${entry}: declara la entrada \`${name}\`, que ${sourcePath} ya no tiene. ` +
          `Renombrada o retirada sin actualizar el catalogo.`,
      );
    }
  }
  for (const name of real) {
    if (!catalogued.has(name)) {
      violations.push(
        `catalog/components/${entry}: ${sourcePath} expone la entrada \`${name}\`, que el catalogo no documenta. ` +
          `Una entrada sin documentar no existe para quien lee el catalogo.`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error('El catalogo no coincide con la API real de los componentes.\n');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Catalogo alineado con la API real: ${comparedEntries} componentes y ${comparedInputs} entradas comprobadas.`,
  );
}
