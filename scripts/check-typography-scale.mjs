import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/*
TRINQUETE DE LA ESCALA TIPOGRAFICA — capitulo 13 de la doctrina.

El tamaño de letra ya vive en tokens y nadie lo discute. El PESO no tenia escala
ninguna, y por ese hueco se colaron seis valores compitiendo: 400, 500, 600, 650,
700, 800 y hasta 900.

La mitad de esas distinciones no se ven. La familia declarada es
`'Open Sans', system-ui, …`, pero no hay ningun `@font-face`, no se sirve ningun
fichero de fuente, y la CSP del consumidor dice `font-src 'self'`: Open Sans no
se carga nunca. Se cae a `system-ui` —Segoe UI en Windows, una familia
ESTATICA—, asi que 650 y 700 aterrizan en el mismo trazo, y 750 y 800 en otro.
Alguien afino un contraste que el navegador colapsa sin decirlo.

POR QUE UN TRINQUETE Y NO UNA PROHIBICION. Barrer los 147 usos de golpe cambia el
dibujo de la interfaz entera sin que nadie lo mire; 500 -> 600 engorda y 900 ->
700 adelgaza. La migracion va componente a componente, cuando se toca por otra
razon y se puede ver el resultado. Mientras tanto esto impide que el numero suba,
que es la unica forma de que una deuda medida no crezca mientras se paga.

El numero SOLO PUEDE BAJAR. Bajarlo exige editar esta constante, y ese cambio se
ve en el diff.
*/

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origen = resolve(raiz, 'src');

// Pesos escritos a mano. Cada migracion a var(--font-weight-*) baja este numero.
//
// 147 al fijar el trinquete -> 48 tras migrar los 99 que eran EXACTOS (400, 600 y
// 700 coinciden con body, emphasis y title, asi que el dibujo no cambia ni un
// pixel). Los 48 que quedan son 500, 650, 800 y 900: cambiarlos SI altera el
// trazo, asi que van componente a componente, mirando el resultado.
const MAXIMO_PESOS_A_MANO = 48;

const EXTENSIONES = new Set(['.css', '.scss', '.ts', '.html']);
const PESO_A_MANO = /font-weight\s*:\s*(\d{3})\b/g;
const ESCALA = new Map([
  ['400', '--font-weight-body'],
  ['600', '--font-weight-emphasis'],
  ['700', '--font-weight-title'],
]);

function recolectar(directorio) {
  const encontrados = [];
  for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      encontrados.push(...recolectar(ruta));
    } else if (EXTENSIONES.has(extname(entrada.name))) {
      encontrados.push(ruta);
    }
  }
  return encontrados;
}

const hallazgos = [];
for (const ruta of recolectar(origen)) {
  // El fichero que PUBLICA la escala es el unico que puede escribir los numeros.
  if (ruta.endsWith('_tokens-primitives.css')) {
    continue;
  }
  const contenido = readFileSync(ruta, 'utf8');
  for (const coincidencia of contenido.matchAll(PESO_A_MANO)) {
    const peso = coincidencia[1];
    hallazgos.push({
      archivo: relative(raiz, ruta).replaceAll('\\', '/'),
      peso,
      // Los que ni siquiera tienen destino en la escala son los urgentes: no es
      // que esten sin migrar, es que piden un trazo que la fuente no dibuja.
      fueraDeEscala: !ESCALA.has(peso),
    });
  }
}

const fallos = [];
if (hallazgos.length > MAXIMO_PESOS_A_MANO) {
  const nuevos = hallazgos.length - MAXIMO_PESOS_A_MANO;
  fallos.push(
    `Pesos tipograficos escritos a mano: ${hallazgos.length}, ` +
      `${nuevos} mas que el trinquete (${MAXIMO_PESOS_A_MANO}). ` +
      'Use var(--font-weight-body|emphasis|title). Capitulo 13.',
  );
}

if (fallos.length > 0) {
  for (const fallo of fallos) {
    console.error(`- ${fallo}`);
  }
  const fuera = hallazgos.filter((hallazgo) => hallazgo.fueraDeEscala);
  if (fuera.length > 0) {
    console.error(
      `  Sin destino en la escala (${fuera.length}): ` +
        [...new Set(fuera.map((hallazgo) => hallazgo.peso))].sort().join(', '),
    );
  }
  process.exit(1);
}

const fuera = hallazgos.filter((hallazgo) => hallazgo.fueraDeEscala).length;
console.log(
  `Escala tipografica verificada: ${hallazgos.length}/${MAXIMO_PESOS_A_MANO} pesos a mano ` +
    `(${fuera} sin destino en la escala). El numero solo puede bajar.`,
);
