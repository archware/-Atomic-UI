import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

/*
PRUEBA NEGATIVA de la compuerta Anti-Tailwind (scripts/check-no-tailwind.mjs).

Demuestra que la compuerta:
1. Pasa sobre un proyecto limpio sin residuos de Tailwind.
2. Falla cuando aparece `@tailwind` o `@apply` en CSS.
3. Falla cuando existe un archivo `tailwind.config.*`.
4. Falla cuando `package.json` declara `tailwindcss` o `@tailwindcss/*`.
5. Falla cuando aparecen clases utilitarias Tailwind prohibidas en HTML o selectores CSS
   (`pointer-events-none`, `col-span-2`, `mx-6`, `mt-6`, `inline`, `w-[120px]`, `md:flex`, `bg-slate-900`).
6. Vuelve a pasar al revertir el defecto.
7. Falla con codigo 2 (arnes roto) si el barrido no descubre ningun archivo.
8. Pasa sobre el arbol real `src/` de `-Atomic-UI`.
*/

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compuerta = join(raiz, 'scripts', 'check-no-tailwind.mjs');

function ejecutar(origen) {
  const resultado = spawnSync(process.execPath, [compuerta, origen], { encoding: 'utf8' });
  return { codigo: resultado.status, salida: `${resultado.stdout}${resultado.stderr}` };
}

const temporal = mkdtempSync(join(tmpdir(), 'atomic-no-tailwind-'));
try {
  const proyecto = join(temporal, 'proyecto');
  const srcDir = join(proyecto, 'src', 'demo');
  mkdirSync(srcDir, { recursive: true });

  const pkgPath = join(proyecto, 'package.json');
  const htmlPath = join(srcDir, 'demo.component.html');
  const cssPath = join(srcDir, 'demo.component.css');
  const tsPath = join(srcDir, 'demo.component.ts');

  const pkgLimpio = JSON.stringify(
    {
      name: 'demo-atomic',
      dependencies: { '@angular/core': '^22.2.0' },
      devDependencies: { eslint: '^9.39.1' },
    },
    null,
    2,
  );
  const htmlLimpio = '<div class="demo-card mb-4 d-flex items-center"><span class="demo-card__title">Hola</span></div>\n';
  const cssLimpio = '.demo-card {\n  padding: var(--space-4);\n}\n:host(.inline) {\n  display: inline-block;\n}\n';
  const tsLimpio = "import { Component } from '@angular/core';\nexport class DemoComponent {}\n";

  // 1. PASA limpio
  writeFileSync(pkgPath, pkgLimpio);
  writeFileSync(htmlPath, htmlLimpio);
  writeFileSync(cssPath, cssLimpio);
  writeFileSync(tsPath, tsLimpio);

  let r = ejecutar(join(proyecto, 'src'));
  assert.equal(r.codigo, 0, `el proyecto limpio debe pasar:\n${r.salida}`);
  assert.match(r.salida, /3 archivos auditados, 0 residuos de Tailwind/u);

  // 2. FALLA con directiva @tailwind / @apply
  writeFileSync(cssPath, `@tailwind utilities;\n${cssLimpio}`);
  r = ejecutar(join(proyecto, 'src'));
  assert.equal(r.codigo, 1, 'directiva @tailwind debe fallar');
  assert.match(r.salida, /directiva-tailwind/u);
  assert.match(r.salida, /@tailwind utilities/u);
  writeFileSync(cssPath, cssLimpio);

  // 3. FALLA con archivo tailwind.config.js
  const configPath = join(proyecto, 'tailwind.config.js');
  writeFileSync(configPath, 'module.exports = {};\n');
  r = ejecutar(join(proyecto, 'src'));
  assert.equal(r.codigo, 1, 'tailwind.config.js debe fallar');
  assert.match(r.salida, /config-tailwind/u);
  assert.match(r.salida, /tailwind\.config\.js/u);
  unlinkSync(configPath);

  // 4. FALLA con dependencia tailwindcss en package.json
  writeFileSync(
    pkgPath,
    JSON.stringify(
      {
        name: 'demo-atomic',
        devDependencies: { tailwindcss: '^3.4.0' },
      },
      null,
      2,
    ),
  );
  r = ejecutar(join(proyecto, 'src'));
  assert.equal(r.codigo, 1, 'dependencia tailwindcss debe fallar');
  assert.match(r.salida, /dependencia-tailwind/u);
  assert.match(r.salida, /tailwindcss/u);
  writeFileSync(pkgPath, pkgLimpio);

  // 5. FALLA con clases utilitarias Tailwind prohibidas en HTML (una linea, multilinea y [class.x]) y CSS
  writeFileSync(
    htmlPath,
    '<div class="pointer-events-none mx-6"\n  [class.sr-only]="true"\n></div>\n<div\n  class="\n    col-span-2\n    w-[120px]\n    md:flex\n    bg-slate-900\n  "\n></div>\n',
  );
  writeFileSync(cssPath, `${cssLimpio}.col-span-2 { grid-column: span 2; }\n.mt-6 { margin-top: 1.5rem; }\n`);
  r = ejecutar(join(proyecto, 'src'));
  assert.equal(r.codigo, 1, 'clases y selectores Tailwind prohibidos deben fallar');
  for (const esperado of [
    'pointer-events-none',
    'mx-6',
    'sr-only',
    'col-span-2',
    'w-[120px]',
    'md:flex',
    'bg-slate-900',
    '.col-span-2',
    '.mt-6',
  ]) {
    assert.ok(r.salida.includes(esperado), `debe reportar ${esperado} en:\n${r.salida}`);
  }

  // 6. REVERTIDO: vuelve a pasar
  writeFileSync(htmlPath, htmlLimpio);
  writeFileSync(cssPath, cssLimpio);
  r = ejecutar(join(proyecto, 'src'));
  assert.equal(r.codigo, 0, `al revertir debe volver a pasar:\n${r.salida}`);

  // 7. Barrido vacio falla con codigo 2
  const vacio = join(temporal, 'vacio', 'src');
  mkdirSync(vacio, { recursive: true });
  r = ejecutar(vacio);
  assert.equal(r.codigo, 2, 'barrido vacio debe devolver codigo 2');
  assert.match(r.salida, /no descubrio ningun archivo/u);

  // 8. El arbol real pasa
  r = ejecutar(join(raiz, 'src'));
  assert.equal(r.codigo, 0, `el arbol real src/ debe pasar:\n${r.salida}`);

  console.log(
    'Compuerta Anti-Tailwind probada: pasa limpio, rechaza @tailwind, tailwind.config.*, ' +
      'dependencias tailwindcss y clases utilitarias prohibidas, vuelve a pasar al revertir y falla en vacio.',
  );
} finally {
  rmSync(temporal, { recursive: true, force: true });
}
