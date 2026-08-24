#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { auditarArbol } = require('./check-angular-signals.cjs');

const raizTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-signals-'));

try {
  fs.writeFileSync(
    path.join(raizTemporal, 'moderno.ts'),
    "import { input, output } from '@angular/core';\nexport const valor = input(0);\n",
  );
  assert.deepEqual(auditarArbol(raizTemporal), []);

  fs.writeFileSync(
    path.join(raizTemporal, 'heredado.ts'),
    "import { Input as Entrada, Output, EventEmitter } from '@angular/core';\n",
  );
  const hallazgos = auditarArbol(raizTemporal);
  assert.deepEqual(
    hallazgos.map((hallazgo) => hallazgo.simbolo).sort(),
    ['EventEmitter', 'Input', 'Output'],
  );
  assert.ok(hallazgos.every((hallazgo) => hallazgo.linea === 1));
  console.log('Gate Signals probado: acepta APIs modernas y rechaza decoradores heredados con alias.');
} finally {
  fs.rmSync(raizTemporal, { recursive: true, force: true });
}
