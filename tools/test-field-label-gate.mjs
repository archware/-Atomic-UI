import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

/*
PRUEBA NEGATIVA de la compuerta de la etiqueta de campo (check-field-label-tokens.mjs).

Una guarda no cuenta como instalada hasta que se demuestra que muerde: pasa, se introduce el
defecto, falla nombrandolo y, al revertirlo, vuelve a pasar. Todo ocurre en un directorio temporal
del sistema, nunca dentro del arbol del repositorio.
*/

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compuerta = join(raiz, 'scripts', 'check-field-label-tokens.mjs');

function ejecutar(origen) {
  const resultado = spawnSync(process.execPath, [compuerta, origen], { encoding: 'utf8' });
  return { codigo: resultado.status, salida: `${resultado.stdout}${resultado.stderr}` };
}

const temporal = mkdtempSync(join(tmpdir(), 'atomic-etiquetas-'));
try {
  const control = join(temporal, 'ui', 'atoms', 'demo');
  mkdirSync(control, { recursive: true });
  writeFileSync(
    join(control, 'demo.component.ts'),
    "import { NG_VALUE_ACCESSOR } from '@angular/forms';\nexport const PROVEEDOR = NG_VALUE_ACCESSOR;\n",
  );
  const hoja = join(control, 'demo.component.css');
  const limpia = `/* control de ejemplo */
.demo__label {
  font-size: var(--field-label-font-size);
  font-weight: var(--field-label-font-weight);
  padding: 0 var(--space-2);
}
.demo__caja {
  font-size: 1rem;
  height: 3rem;
}
`;
  const origen = join(temporal, 'ui');

  // 1. PASA: una etiqueta solo con tokens, y una regla que no es de etiqueta con literales.
  writeFileSync(hoja, limpia);
  let r = ejecutar(origen);
  assert.equal(r.codigo, 0, `la hoja limpia debe pasar:\n${r.salida}`);
  assert.match(r.salida, /1 hojas de controles descubiertas/u);

  // 2. FALLA nombrando fichero, propiedad y literal.
  writeFileSync(hoja, `${limpia}.demo__label--x {\n  font-size: 0.9375rem;\n}\n`);
  r = ejecutar(origen);
  assert.equal(r.codigo, 1, 'un literal rem en una etiqueta debe fallar');
  assert.match(r.salida, /demo\.component\.css:\d+/u);
  assert.match(r.salida, /font-size/u);
  assert.match(r.salida, /0\.9375rem/u);

  // 3. FALLA con mayusculas forzadas.
  writeFileSync(hoja, `${limpia}.demo__label {\n  text-transform: uppercase;\n}\n`);
  r = ejecutar(origen);
  assert.equal(r.codigo, 1);
  assert.match(r.salida, /text-transform/u);

  // 4. FALLA con un literal dentro de un @media y dentro del respaldo de un var().
  writeFileSync(
    hoja,
    `${limpia}@media (max-width: 40rem) {\n  .fl-label--floating {\n    top: -0.625rem;\n  }\n}\n`,
  );
  r = ejecutar(origen);
  assert.equal(r.codigo, 1, 'una regla dentro de @media tambien se audita');
  assert.match(r.salida, /-0\.625rem/u);
  writeFileSync(hoja, `${limpia}.demo__label {\n  left: var(--field-label-inset, 0.75rem);\n}\n`);
  r = ejecutar(origen);
  assert.equal(r.codigo, 1, 'un literal escondido en el respaldo de un var() tambien falla');

  // 5. FALLA con un peso numerico.
  writeFileSync(hoja, `${limpia}.demo__label {\n  font-weight: 600;\n}\n`);
  r = ejecutar(origen);
  assert.equal(r.codigo, 1);
  assert.match(r.salida, /font-weight/u);

  // 6. La excepcion documentada deja pasar; sin motivo no cuenta.
  writeFileSync(
    hoja,
    `${limpia}.demo__label-dias {\n  /* gate-etiqueta-exento: cabecera de columna, no es etiqueta de campo */\n  text-transform: uppercase;\n}\n`,
  );
  r = ejecutar(origen);
  assert.equal(r.codigo, 0, `la excepcion con motivo debe pasar:\n${r.salida}`);
  writeFileSync(hoja, `${limpia}.demo__label-dias {\n  /* gate-etiqueta-exento: */\n  text-transform: uppercase;\n}\n`);
  r = ejecutar(origen);
  assert.equal(r.codigo, 1, 'la excepcion sin motivo no cuenta');

  // 7. REVERTIDO: vuelve a pasar.
  writeFileSync(hoja, limpia);
  r = ejecutar(origen);
  assert.equal(r.codigo, 0, `revertido el defecto debe volver a pasar:\n${r.salida}`);

  // 8. Un control que consume el contrato field-label sin NG_VALUE_ACCESSOR tambien se descubre.
  writeFileSync(
    join(control, 'demo.component.ts'),
    "import { FieldLabelVariant } from '../form-field/field-label';\nexport type Variante = FieldLabelVariant;\n",
  );
  writeFileSync(hoja, `${limpia}.demo__label {\n  font-size: 0.9375rem;\n}\n`);
  r = ejecutar(origen);
  assert.equal(r.codigo, 1, 'un control con field-label sin NG_VALUE_ACCESSOR tambien se audita');
  writeFileSync(hoja, limpia);
  r = ejecutar(origen);
  assert.equal(r.codigo, 0);

  // 9. Una hoja que NO es de un control (sin NG_VALUE_ACCESSOR ni field-label) no se descubre:
  //    sin entrada, la guarda falla (codigo 2, arnes) en vez de certificar en vacio.
  const sinControl = join(temporal, 'vacio', 'atoms', 'adorno');
  mkdirSync(sinControl, { recursive: true });
  writeFileSync(join(sinControl, 'adorno.component.ts'), 'export class Adorno {}\n');
  writeFileSync(join(sinControl, 'adorno.component.css'), '.adorno__label { font-size: 2rem; }\n');
  r = ejecutar(join(temporal, 'vacio'));
  assert.equal(r.codigo, 2, `un barrido vacio debe fallar:\n${r.salida}`);
  assert.match(r.salida, /no descubrio ningun control/u);

  // 10. El arbol real pasa.
  r = ejecutar(join(raiz, 'src', 'app', 'shared', 'ui'));
  assert.equal(r.codigo, 0, `el arbol real debe pasar:\n${r.salida}`);

  console.log(
    'Compuerta de etiqueta de campo probada: pasa limpio, falla nombrando rem/uppercase/peso/@media/var(), ' +
      'respeta la excepcion con motivo, vuelve a pasar al revertir y falla con barrido vacio.',
  );
} finally {
  rmSync(temporal, { recursive: true, force: true });
}
