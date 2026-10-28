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
import { NgClass, NgTemplateOutlet } from '@angular/common';

@Component({
  imports: [NgClass, NgTemplateOutlet],
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

  // Caso 3: Archivo con directivas estructurales legacy en inline template TS, CommonModule y * as common
  fs.writeFileSync(
    path.join(raizTemporal, 'legacy.ts'),
    `import { CommonModule } from '@angular/common';
import * as common from '@angular/common';

@Component({
  imports: [CommonModule, common.CommonModule],
  template: '<div *ngIf="activo">Hola</div>'
})
export class LegacyComponent {}
`,
  );

  const hallazgosTotales = auditarArbol(raizTemporal);
  assert.equal(hallazgosTotales.length, 7);
  const hallazgosTs = hallazgosTotales.filter((h) => h.rutaArchivo.endsWith('legacy.ts'));
  assert.equal(hallazgosTs.length, 3);
  assert.deepEqual(
    hallazgosTs.map((h) => ({ directiva: h.directiva, linea: h.linea })),
    [
      { directiva: '*ngIf', linea: 6 },
      { directiva: 'CommonModule', linea: 1 },
      { directiva: '* as common', linea: 2 },
    ],
  );

  // Caso 4: Barrido vacio falla con codigo 2 (arnes roto)
  const { spawnSync } = require('node:child_process');
  const vacio = path.join(raizTemporal, 'vacio');
  fs.mkdirSync(vacio, { recursive: true });
  const cliVacio = spawnSync(
    process.execPath,
    [path.join(__dirname, 'check-angular-control-flow.cjs'), vacio],
    { encoding: 'utf8' },
  );
  assert.equal(cliVacio.status, 2, 'barrido vacio debe devolver codigo 2');

  console.log('Gate Control Flow probado: acepta sintaxis moderna (@if, @for, @switch, NgClass, NgTemplateOutlet) y rechaza directivas estructurales legacy (*ngIf, *ngFor, *ngSwitch), CommonModule, * as @angular/common y barrido vacio.');
} finally {
  fs.rmSync(raizTemporal, { recursive: true, force: true });
}
