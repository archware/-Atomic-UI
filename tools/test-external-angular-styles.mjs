#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { auditarArbol } from './check-external-angular-styles.mjs';

const raizTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-external-styles-'));

try {
  fs.writeFileSync(
    path.join(raizTemporal, 'moderno.ts'),
    `import { Component } from '@angular/core';
@Component({
  selector: 'app-moderno',
  template: \`<div [appVariablesCss]="{ '--ancho': ancho() }"></div>\`,
  styleUrl: './moderno.css',
})
export class Moderno {}
`,
  );
  fs.writeFileSync(path.join(raizTemporal, 'moderno.html'), '<div class="externo"></div>\n');
  assert.deepEqual(auditarArbol(raizTemporal), []);

  fs.writeFileSync(
    path.join(raizTemporal, 'heredado.ts'),
    `import { Component, HostBinding as EnlaceHost } from '@angular/core';
@Component({
  selector: 'app-heredado',
  template: \`<div style="width: 1rem" [style.height]="alto"></div>\`,
  styles: [\`:host { display: block; }\`],
  host: { '[style.color]': 'color' },
})
export class Heredado {
  @EnlaceHost('style.width') ancho = '1rem';
}
`,
  );
  fs.writeFileSync(
    path.join(raizTemporal, 'heredado.html'),
    '<div [style]="estilos" [attr.style]="estilos"></div>\n',
  );

  const hallazgos = auditarArbol(raizTemporal);
  const tipos = hallazgos.map((hallazgo) => hallazgo.tipo);
  for (const tipo of [
    'atributo style',
    'binding de estilo',
    'metadato Component.styles',
    'binding de estilo en host',
    'HostBinding de estilo',
  ]) {
    assert.ok(tipos.includes(tipo), `La compuerta debe detectar: ${tipo}.`);
  }
  assert.ok(tipos.filter((tipo) => tipo === 'binding de estilo').length >= 3);
  console.log('Gate de estilos externos probado: acepta variables CSS y rechaza estilos Angular embebidos.');
} finally {
  fs.rmSync(raizTemporal, { recursive: true, force: true });
}
