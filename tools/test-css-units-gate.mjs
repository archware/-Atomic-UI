import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditarUnidadesCss } from '../scripts/check-css-units.mjs';

/*
PRUEBA NEGATIVA de la compuerta de unidades CSS (check-css-units.mjs).

Demuestra los cuatro estados exigidos por la doctrina:
1. PASA con 0 hallazgos sobre hojas limpias (tokens, rem, trazos finos 1px/2px en border/outline/box-shadow,
   @media con px y reglas de ocultacion accesible 1px/-1px).
2. FALLA (exit 1) nombrando archivo, linea, propiedad y unidad cuando se introduce `padding: 12px` o `max-width: 300px`.
3. REVIERTE y vuelve a pasar con 0 hallazgos.
4. FALLA con codigo 2 (arnes roto) si el directorio barrido contiene 0 hojas `.css`/`.scss`.
*/

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scriptCli = join(raiz, 'scripts', 'check-css-units.mjs');
const temporal = mkdtempSync(join(tmpdir(), 'atomic-css-units-'));

try {
  const dirVacio = join(temporal, 'vacio');
  const dirComponentes = join(temporal, 'ui');
  mkdirSync(dirVacio, { recursive: true });
  mkdirSync(dirComponentes, { recursive: true });

  // 1. Directorio vacio -> el CLI debe fallar con codigo 2 (arnes roto).
  const cliVacio = spawnSync(process.execPath, [scriptCli, '--root', dirVacio], {
    encoding: 'utf8',
  });
  assert.equal(
    cliVacio.status,
    2,
    `un barrido con 0 hojas debe devolver codigo 2 (recibido: ${cliVacio.status})`,
  );

  const hojaComponente = join(dirComponentes, 'sample.component.scss');
  const hojaLimpia = `/*
  Comentario con medida comentada: padding: 12px; max-width: 300px;
*/
@media screen and (min-width: 320px)
  and (max-width: 768px) {
  .sample {
    padding: var(--space-3); // nota: 12px;
    max-width: 18.75rem;
    border: 1px solid var(--border-color);
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    box-shadow: 0 1px 2px var(--shadow-color);
  }
}

@container (min-width: 240px)
  and (max-width: 640px) {
  .sample__inner {
    border-bottom: 0.5px solid var(--border-color);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  clip: rect(0, 0, 0, 0);
}
`;

  // 2. PASA: la hoja limpia (incluyendo @media y @container multilinea con px) no produce hallazgos y el CLI devuelve codigo 0.
  writeFileSync(hojaComponente, hojaLimpia, 'utf8');
  let resultado = auditarUnidadesCss(dirComponentes, { raizRelativa: temporal });
  assert.equal(resultado.archivosAuditados, 1);
  assert.deepEqual(resultado.hallazgos, [], 'la hoja limpia no debe producir hallazgos');

  const cliLimpio = spawnSync(process.execPath, [scriptCli, '--root', dirComponentes], {
    encoding: 'utf8',
  });
  assert.equal(cliLimpio.status, 0, 'el CLI debe devolver 0 sobre la hoja limpia');

  // 3. FALLA: al introducir padding: 12px, max-width: 300px, border-radius: 2px y letter-spacing: .5px tras @media/@container multilinea, falla con codigo 1 y preserva lineas exactas.
  writeFileSync(
    hojaComponente,
    `${hojaLimpia}.sample--roto {\r\n  padding: 12px;\r\n  max-width: 300px;\r\n  border-radius: 2px;\r\n  letter-spacing: .5px;\r\n}\r\n`,
    'utf8',
  );
  resultado = auditarUnidadesCss(dirComponentes, { raizRelativa: temporal });
  assert.equal(resultado.hallazgos.length, 4, 'debe detectar las cuatro medidas px prohibidas');
  assert.equal(resultado.hallazgos[0].archivo, 'ui/sample.component.scss');
  assert.equal(resultado.hallazgos[0].linea, 31);
  assert.equal(resultado.hallazgos[0].propiedad, 'padding');
  assert.equal(resultado.hallazgos[0].valorPx, '12px');
  assert.equal(resultado.hallazgos[1].archivo, 'ui/sample.component.scss');
  assert.equal(resultado.hallazgos[1].linea, 32);
  assert.equal(resultado.hallazgos[1].propiedad, 'max-width');
  assert.equal(resultado.hallazgos[1].valorPx, '300px');
  assert.equal(resultado.hallazgos[2].archivo, 'ui/sample.component.scss');
  assert.equal(resultado.hallazgos[2].linea, 33);
  assert.equal(resultado.hallazgos[2].propiedad, 'border-radius');
  assert.equal(resultado.hallazgos[2].valorPx, '2px');
  assert.equal(resultado.hallazgos[3].archivo, 'ui/sample.component.scss');
  assert.equal(resultado.hallazgos[3].linea, 34);
  assert.equal(resultado.hallazgos[3].propiedad, 'letter-spacing');
  assert.equal(resultado.hallazgos[3].valorPx, '.5px');

  const cliRoto = spawnSync(process.execPath, [scriptCli, '--root', dirComponentes], {
    encoding: 'utf8',
  });
  assert.equal(cliRoto.status, 1, 'el CLI debe devolver 1 ante medidas px prohibidas');
  assert.match(cliRoto.stderr, /sample\.component\.scss:31/);
  assert.match(cliRoto.stderr, /padding/);

  // 4. REVERTIDO: al restaurar la hoja limpia vuelve a pasar con 0 hallazgos.
  writeFileSync(hojaComponente, hojaLimpia, 'utf8');
  resultado = auditarUnidadesCss(dirComponentes, { raizRelativa: temporal });
  assert.deepEqual(resultado.hallazgos, [], 'revertido el defecto debe volver a dar 0 hallazgos');

  // 5. El arbol real de Atomic UI pasa con 0 hallazgos.
  const resultadoReal = auditarUnidadesCss();
  assert.ok(resultadoReal.archivosAuditados > 0, 'el barrido real debe auditar hojas CSS');
  assert.deepEqual(
    resultadoReal.hallazgos,
    [],
    'el arbol real de Atomic UI debe tener 0 medidas px rigidas prohibidas',
  );

  console.log(
    'Compuerta de unidades CSS probada: rechaza barrido vacio (exit 2), permite trazos finos 1px/2px, ' +
      'detecta px rigidos con linea exacta (exit 1) y valida el arbol real.',
  );
} finally {
  rmSync(temporal, { recursive: true, force: true });
}
