#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { auditarArbol } = require('./check-angular-control-flow.cjs');

const raizTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-control-flow-'));

try {
  // Caso 1: Archivo moderno con @if, @for y @switch en HTML y TS
  fs.writeFileSync(
    path.join(raizTemporal, 'moderno.html'),
    `@if (visible) {
  <p>Visible</p>
}
@for (item of items; track item.id) {
  <span>{{ item.nombre }}</span>
}
@switch (estado) {
  @case ('activo') { <b>Activo</b> }
  @default { <i>Inactivo</i> }
}
`,
  );

  fs.writeFileSync(
    path.join(raizTemporal, 'moderno.ts'),
    `import { Component } from '@angular/core';

@Component({
  template: \`
    @if (cargando) {
      <app-spinner />
    }
  \`,
})
export class ModernoComponent {}
`,
  );

  assert.deepEqual(auditarArbol(raizTemporal), []);

  // Caso 2: Archivo con directivas estructurales legacy en HTML
  fs.writeFileSync(
    path.join(raizTemporal, 'legacy.html'),
    `<div *ngIf="cargando">Cargando</div>
<li *ngFor="let el of lista">{{ el }}</li>
<span *ngSwitchCase="'A'">Opcion A</span>
<span *ngSwitchDefault>Por defecto</span>
`,
  );

  const hallazgosHtml = auditarArbol(raizTemporal);
  assert.equal(hallazgosHtml.length, 4);
  assert.deepEqual(
    hallazgosHtml.map((h) => h.directiva).sort(),
    ['*ngFor', '*ngIf', '*ngSwitchCase', '*ngSwitchDefault'],
  );

  // Caso 3: Archivo con directivas estructurales legacy en inline template TS
  fs.writeFileSync(
    path.join(raizTemporal, 'legacy.ts'),
    `@Component({
  template: '<div *ngIf="activo">Hola</div>'
})
export class LegacyComponent {}
`,
  );

  const hallazgosTotales = auditarArbol(raizTemporal);
  assert.equal(hallazgosTotales.length, 5);
  const directivaTs = hallazgosTotales.find((h) => h.rutaArchivo.endsWith('legacy.ts'));
  assert.ok(directivaTs);
  assert.equal(directivaTs.directiva, '*ngIf');
  assert.equal(directivaTs.linea, 2);

  console.log('Gate Control Flow probado: acepta sintaxis moderna (@if, @for, @switch) y rechaza directivas estructurales legacy (*ngIf, *ngFor, *ngSwitch).');
} finally {
  fs.rmSync(raizTemporal, { recursive: true, force: true });
}
