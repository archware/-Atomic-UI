import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditarPesos } from '../scripts/check-typography-scale.mjs';

/*
PRUEBA NEGATIVA de la compuerta de la escala tipografica (check-typography-scale.mjs).

Verifica que `auditarPesos` ignore `_tokens-primitives.css`, `_fonts.css`, comentarios de
bloque CSS (incluidos los que contienen llaves `{...}` dentro de `@font-face`) y bloques
`@font-face` en cualquier hoja, mientras detecta con numero de linea exacto cualquier
peso numerico escrito a mano en selectores regulares y clasifica `fueraDeEscala`.
*/

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporal = mkdtempSync(join(tmpdir(), 'atomic-tipografia-'));

try {
  const temas = join(temporal, 'styles', 'themes');
  const componente = join(temporal, 'app', 'shared', 'ui', 'atoms', 'demo');
  mkdirSync(temas, { recursive: true });
  mkdirSync(componente, { recursive: true });

  // 1. Los ficheros autorizados (_tokens-primitives.css y _fonts.css) se ignoran.
  writeFileSync(
    join(temas, '_tokens-primitives.css'),
    ':root {\n  --font-weight-body: 400;\n  --font-weight-emphasis: 600;\n  --font-weight-title: 700;\n}\n',
  );
  writeFileSync(
    join(temas, '_fonts.css'),
    "@font-face {\n  font-family: 'Quicksand';\n  font-weight: 500;\n  src: url('./fonts/quicksand-all-500-normal.woff2') format('woff2');\n}\n",
  );

  const hojaComponente = join(componente, 'demo.component.css');
  const hojaLimpia = `/*
  Comentario con peso comentado: font-weight: 500;
*/
@font-face {
  /* Comentario con llaves { subset: latin } dentro de @font-face */
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./fonts/open-sans-latin-500-normal.woff2') format('woff2');
}

.demo__titulo {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-title);
}
`;

  // 2. PASA: con @font-face, comentarios con llaves y tokens semanticos no hay hallazgos.
  writeFileSync(hojaComponente, hojaLimpia);
  let hallazgos = auditarPesos(temporal, temporal);
  assert.deepEqual(hallazgos, [], 'la hoja con @font-face y tokens semanticos no debe producir hallazgos');

  // 3. FALLA: al introducir pesos numericos en selectores regulares se detectan con linea exacta.
  writeFileSync(
    hojaComponente,
    `${hojaLimpia}.demo__malo {\n  font-weight: 500;\n}\n.demo__deuda {\n  font-weight: 600;\n}\n`,
  );
  hallazgos = auditarPesos(temporal, temporal);
  assert.equal(hallazgos.length, 2, 'debe detectar los dos pesos numericos en selectores regulares');
  assert.deepEqual(hallazgos[0], {
    archivo: 'app/shared/ui/atoms/demo/demo.component.css',
    linea: 18,
    peso: '500',
    fueraDeEscala: true,
  });
  assert.deepEqual(hallazgos[1], {
    archivo: 'app/shared/ui/atoms/demo/demo.component.css',
    linea: 21,
    peso: '600',
    fueraDeEscala: false,
  });

  // 4. REVERTIDO: al retirar los pesos numericos vuelve a pasar.
  writeFileSync(hojaComponente, hojaLimpia);
  hallazgos = auditarPesos(temporal, temporal);
  assert.deepEqual(hallazgos, [], 'revertido el defecto debe volver a dar 0 hallazgos');

  // 5. El arbol real de Atomic UI pasa con 0 hallazgos.
  const hallazgosReales = auditarPesos(join(raiz, 'src'), raiz);
  assert.deepEqual(hallazgosReales, [], 'el arbol src/ de Atomic UI debe tener 0 pesos escritos a mano');

  console.log(
    'Compuerta de escala tipografica probada: ignora _fonts.css/@font-face/comentarios, ' +
      'detecta pesos en selectores con linea exacta y valida el arbol real.',
  );
} finally {
  rmSync(temporal, { recursive: true, force: true });
}
