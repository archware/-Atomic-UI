import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// `[selectorA, selectorB, …].join(',')` alimentando un `querySelector` PARECE una
// lista de prioridad y no lo es: `querySelector` con comas devuelve el primer
// elemento en ORDEN DE DOM, no el primero de la lista. El array suele estar
// ordenado con intencion —el autor del formulario marca donde quiere el foco con
// `[data-dialog-initial-focus]`— y esa intencion la derrota cualquier `<input>`
// que aparezca antes en el marcado.
//
// El patron se copio TRES veces antes de detectarse: el foco inicial de
// `crud-dialog`, su `focusInvalid()` y `form-dialog`. Como se lee bien, nadie lo
// reviso. Este trinquete lo convierte en fallo de gate.
//
// La forma correcta es recorrer la lista en orden y enfocar el primero que
// exista, que es lo que hace `focusFirst()` en `crud-dialog.ts`.

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, 'src');

// Un selector CSS de foco contiene casi siempre uno de estos. Se exige para no
// marcar cualquier `join(',')` sobre texto corriente.
const SELECTOR_HINT = /[[\].#:]/;

// UNA LISTA PUEDE SER UN CONJUNTO, NO UNA PRIORIDAD.
//
// `['button', 'input', 'select', …]` enumera tipos de control equivalentes: ahi
// el orden de DOM es justo lo que se quiere, porque se busca el primer control
// del marcado y no «los botones antes que los campos». Marcar eso como fallo
// seria un falso positivo, y un trinquete que grita en falso acaba desactivado
// —y entonces deja de proteger tambien los casos de verdad—.
//
// Se admite declararlo, con dos condiciones: la marca va pegada a la lista y
// LLEVA MOTIVO ESCRITO. Un silenciador mudo es lo que convierte una compuerta
// en decoracion; obligar a escribir por que fuerza a pensarlo una vez.
const ORDEN_DOM_DECLARADO = /\/\*\s*orden-dom:\s*\S[\s\S]*?\*\//;
const JOIN_CALL = /\]\s*\.join\(\s*(['"`])\s*,\s*\1\s*\)/;

function sourceFiles(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...sourceFiles(full));
    else if (/\.ts$/.test(entry.name)) found.push(full);
  }
  return found;
}

/** Devuelve el literal de array que precede al `.join(',')` que termina en `end`. */
function arrayLiteralBefore(source, end) {
  let depth = 0;
  for (let index = end; index >= 0; index -= 1) {
    const character = source[index];
    if (character === ']') depth += 1;
    else if (character === '[') {
      depth -= 1;
      if (depth === 0) return source.slice(index, end + 1);
    }
  }
  return null;
}

const failures = [];

for (const file of sourceFiles(sourceRoot)) {
  const source = readFileSync(file, 'utf8');
  // `querySelectorAll` NO es el problema: recoge todos los coincidentes y el
  // orden de DOM es justo lo que quiere un cepo de foco. El defecto vive solo
  // en el singular, donde el primero de la lista deberia ganar y no gana.
  if (!/querySelector\s*[(<]/.test(source)) continue;

  let cursor = 0;
  while (cursor < source.length) {
    const match = JOIN_CALL.exec(source.slice(cursor));
    if (!match) break;
    const absolute = cursor + match.index;
    const literal = arrayLiteralBefore(source, absolute);
    const joinEnd = absolute + match[0].length;
    cursor = joinEnd;
    if (!literal) continue;

    const entries = literal.match(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g) ?? [];
    const selectorish = entries.filter((entry) => SELECTOR_HINT.test(entry));
    // Un solo elemento no expresa prioridad; dos o mas si.
    if (selectorish.length < 2) continue;

    // Intencion declarada: el autor afirma que la lista es un conjunto y que el
    // orden de DOM es el correcto. Se busca la marca justo encima de la lista.
    const antesDeLaLista = source.slice(
      Math.max(0, literalStart(source, absolute) - 600),
      literalStart(source, absolute),
    );
    if (ORDEN_DOM_DECLARADO.test(antesDeLaLista)) continue;

    // Se marca solo si ESTE valor llega a un `querySelector` singular: o bien
    // porque la llamada lo envuelve, o bien a traves del identificador al que
    // se asigna.
    const inlineTarget = /querySelector\s*(?:<[^>]*>)?\s*\(\s*$/.test(
      source.slice(Math.max(0, absolute - 400), literalStart(source, absolute)),
    );
    const assigned = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*$/.exec(
      source.slice(Math.max(0, absolute - 400), literalStart(source, absolute)),
    );
    const reachesSingular =
      inlineTarget ||
      (assigned !== null &&
        new RegExp(
          `querySelector\\s*(?:<[^>]*>)?\\s*\\(\\s*${assigned[1]}\\b`,
        ).test(source));
    if (!reachesSingular) continue;

    const line = source.slice(0, absolute).split('\n').length;
    failures.push(
      `${relative(projectRoot, file)}:${line}: une ${selectorish.length} selectores con ` +
        `.join(',') y el resultado alimenta un \`querySelector\` singular. Eso pierde la ` +
        `prioridad de la lista: querySelector devuelve el primer elemento en orden de DOM, ` +
        `no el primero de la lista. Recorra el array en orden (vea focusFirst en crud-dialog.ts).`,
    );
  }
}

/** Posicion de apertura del literal de array que precede a `end`. */
function literalStart(source, end) {
  let depth = 0;
  for (let index = end; index >= 0; index -= 1) {
    if (source[index] === ']') depth += 1;
    else if (source[index] === '[') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return end;
}

if (failures.length > 0) {
  console.error('Selectores de foco: se perdio la prioridad de la lista.\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  'Selectores de foco verificados: ninguna lista de prioridad degradada a selector unico.',
);
