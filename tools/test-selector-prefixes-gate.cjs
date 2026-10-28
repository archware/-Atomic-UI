#!/usr/bin/env node

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { auditarSelectores } = require('./check-selector-prefixes.cjs');

const raiz = path.resolve(__dirname, '..');
const compuerta = path.join(raiz, 'tools', 'check-selector-prefixes.cjs');

function ejecutarCli(origen) {
  const res = spawnSync(process.execPath, [compuerta, origen], { encoding: 'utf8' });
  return { codigo: res.status, salida: `${res.stdout}${res.stderr}` };
}

const temporal = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-selectors-'));

try {
  const uiRoot = path.join(temporal, 'ui');
  const atomDir = path.join(uiRoot, 'atoms', 'demo');
  const dirDir = path.join(uiRoot, 'directives');
  fs.mkdirSync(atomDir, { recursive: true });
  fs.mkdirSync(dirDir, { recursive: true });

  const compFile = path.join(atomDir, 'demo.component.ts');
  const dirFile = path.join(dirDir, 'demo.directive.ts');

  const compLimpio = `import { Component } from '@angular/core';
@Component({
  selector: 'app-demo',
  template: '',
})
export class DemoComponent {}
`;
  const dirLimpia = `import { Directive } from '@angular/core';
@Directive({
  selector: '[appDemo], th[app-demo-cell]',
})
export class DemoDirective {}
`;

  // 1. PASA con selectores canonicos app-* y [app...]
  fs.writeFileSync(compFile, compLimpio, 'utf8');
  fs.writeFileSync(dirFile, dirLimpia, 'utf8');

  let r = ejecutarCli(uiRoot);
  assert.equal(r.codigo, 0, `selectores limpios deben pasar:\n${r.salida}`);

  // 2. FALLA con un selector sin prefijo app- ni prest- (el vacio que antes se saltaba)
  fs.writeFileSync(
    compFile,
    `import { Component } from '@angular/core';
@Component({
  selector: 'barracuda-demo',
  template: '',
})
export class DemoComponent {}
`,
    'utf8',
  );
  r = ejecutarCli(uiRoot);
  assert.equal(r.codigo, 1, 'selector barracuda-demo debe fallar');
  assert.match(r.salida, /selector primario "barracuda-demo" debe usar el prefijo canónico app-/u);
  assert.match(r.salida, /prefijo no autorizado/u);

  // 3. FALLA con un alias secundario no autorizado (app-demo, custom-demo)
  fs.writeFileSync(
    compFile,
    `import { Component } from '@angular/core';
@Component({
  selector: 'app-demo, custom-demo',
  template: '',
})
export class DemoComponent {}
`,
    'utf8',
  );
  r = ejecutarCli(uiRoot);
  assert.equal(r.codigo, 1, 'alias secundario custom-demo debe fallar');
  assert.match(r.salida, /selector "custom-demo" usa un prefijo no autorizado/u);

  // 4. FALLA con un alias prest-* fuera de ALIAS_TRANSITORIOS_DEL_ADN
  fs.writeFileSync(
    compFile,
    `import { Component } from '@angular/core';
@Component({
  selector: 'app-demo, prest-demo',
  template: '',
})
export class DemoComponent {}
`,
    'utf8',
  );
  r = ejecutarCli(uiRoot);
  assert.equal(r.codigo, 1, 'alias prest-demo no registrado debe fallar');
  assert.match(r.salida, /no está en la excepción transitoria/u);

  // 5. PASA cuando el archivo esta en el conjunto de excepciones y app-* va primero
  const auditConExcepcion = auditarSelectores(uiRoot, new Set(['atoms/demo/demo.component.ts']));
  assert.deepEqual(auditConExcepcion.hallazgos, []);

  // 6. FALLA cuando prest-* va antes que app-* aunque este en la excepcion
  fs.writeFileSync(
    compFile,
    `import { Component } from '@angular/core';
@Component({
  selector: 'prest-demo, app-demo',
  template: '',
})
export class DemoComponent {}
`,
    'utf8',
  );
  const auditOrdenInvalido = auditarSelectores(uiRoot, new Set(['atoms/demo/demo.component.ts']));
  assert.ok(auditOrdenInvalido.hallazgos.length >= 1, 'prest-demo primero debe fallar');

  // 7. REVERTIDO: vuelve a pasar
  fs.writeFileSync(compFile, compLimpio, 'utf8');
  r = ejecutarCli(uiRoot);
  assert.equal(r.codigo, 0, `al revertir debe volver a pasar:\n${r.salida}`);

  // 8. Barrido vacio devuelve codigo 2 (arnes roto)
  const vacio = path.join(temporal, 'vacio');
  fs.mkdirSync(vacio, { recursive: true });
  r = ejecutarCli(vacio);
  assert.equal(r.codigo, 2, 'barrido sin selectores debe devolver codigo 2');

  // 9. El arbol real src/app/shared/ui pasa
  r = ejecutarCli(path.join(raiz, 'src', 'app', 'shared', 'ui'));
  assert.equal(r.codigo, 0, `el arbol real debe pasar:\n${r.salida}`);

  console.log(
    'Gate de prefijos de selector probado: exige app-/[app...] primario, rechaza prefijos arbitrarios ' +
      'y aliases prest-* no registrados o mal ordenados, vuelve a pasar al revertir y falla en vacio.',
  );
} finally {
  fs.rmSync(temporal, { recursive: true, force: true });
}
