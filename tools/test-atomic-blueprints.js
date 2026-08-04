#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  checkAtomicBlueprints,
  main,
  propertyLiterals,
} = require('./check-atomic-blueprints.js');

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function captureIo() {
  const output = [];
  const errors = [];
  return {
    output,
    errors,
    io: {
      log(value) { output.push(String(value)); },
      error(value) { errors.push(String(value)); },
    },
  };
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-blueprint-gate-'));
try {
  write(
    path.join(tempRoot, 'src/blueprints/valid/valid.component.ts'),
    [
      "import { ChangeDetectionStrategy, Component } from '@angular/core';",
      '@Component({',
      "  selector: 'atomic-valid',",
      '  changeDetection: ChangeDetectionStrategy.OnPush,',
      '  template: `<atomic-button>Guardar</atomic-button>`,',
      '  styles: [`:host { display: block; gap: var(--space-2); }`],',
      '})',
      'export class ValidComponent {}',
      '',
    ].join('\n'),
  );
  write(
    path.join(tempRoot, 'tools/create-project.js'),
    "const GOVERNANCE_INSTALLER = 'install-consumer-governance';\n",
  );
  for (const artifact of [
    'governance/consumer/ATOMIC_GOVERNANCE.md',
    'governance/consumer/AGENTS.template.md',
    'governance/consumer/atomic-provenance.template.json',
    'governance/consumer/check-atomic-provenance.mjs',
    'governance/consumer/atomic-governance.yml',
    'tools/install-consumer-governance.js',
  ]) {
    write(path.join(tempRoot, artifact), 'fixture\n');
  }

  const valid = checkAtomicBlueprints({ atomicRoot: tempRoot });
  assert.deepEqual(valid.failures, []);

  const embedded = [
    "import { Component } from '@angular/core';",
    '@Component({',
    "  selector: 'atomic-invalid',",
    '  template: `<button style="color: #fff">Demo</button>`,',
    '  styles: [`input { width: 12px; color: rgb(1, 2, 3); }`],',
    '})',
    'export class InvalidComponent {',
    '  value: any;',
    '  readonly mockData = true;',
    '  start(): void { setInterval(() => undefined, 100); }',
    '}',
    '',
  ].join('\n');
  const invalidPath = path.join(tempRoot, 'src/blueprints/invalid/invalid.component.ts');
  write(invalidPath, embedded);
  const invalid = checkAtomicBlueprints({ atomicRoot: tempRoot });
  for (const expected of [
    'sin ChangeDetectionStrategy.OnPush',
    'tipo any expl\u00edcito',
    'timer imperativo',
    'mock productivo',
    'primitiva visual nativa',
    'estilo inline',
    'selector visual nativo',
    'px hardcodeado',
    'color fijo',
  ]) {
    assert.ok(
      invalid.failures.some((failure) => failure.includes(expected)),
      `El gate no detect\u00f3: ${expected}\n${invalid.failures.join('\n')}`,
    );
  }

  const literals = propertyLiterals(embedded, 'styles');
  assert.equal(literals.length, 1);
  assert.match(literals[0], /12px/);

  const captured = captureIo();
  assert.equal(main(['--atomic-root', tempRoot, '--json'], captured.io), 1);
  const json = JSON.parse(captured.errors[0]);
  assert.equal(json.valid, false);
  assert.ok(json.failures.length >= 9);

  write(
    path.join(tempRoot, 'src/blueprints/blueprints.manifest.json'),
    `${JSON.stringify({
      schemaVersion: 1,
      defaultStatus: 'production',
      blueprints: [{ path: 'invalid', status: 'legacy-demo' }],
    }, null, 2)}\n`,
  );
  const classified = checkAtomicBlueprints({ atomicRoot: tempRoot });
  assert.deepEqual(classified.failures, []);
  assert.deepEqual(classified.skippedRoots, ['invalid']);
  assert.equal(classified.manifest, true);

  const unlistedPath = path.join(tempRoot, 'src/blueprints/unlisted/unlisted.html');
  write(unlistedPath, '<button>Debe seguir siendo production por defecto</button>\n');
  const unlisted = checkAtomicBlueprints({ atomicRoot: tempRoot });
  assert.ok(unlisted.failures.some((failure) => failure.includes('primitiva visual nativa')));
  fs.rmSync(path.dirname(unlistedPath), { recursive: true, force: true });

  const generatorPath = path.join(tempRoot, 'tools/create-project.js');
  const safeGenerator = fs.readFileSync(generatorPath, 'utf8');
  write(generatorPath, `${safeGenerator}const copiedDemo = 'invalid';\n`);
  const referencedLegacy = checkAtomicBlueprints({ atomicRoot: tempRoot });
  assert.ok(referencedLegacy.failures.some((failure) => failure.includes('referencia un blueprint legacy-demo')));
  write(generatorPath, `${safeGenerator}const blueprintsDir = 'src/blueprints';\n`);
  const referencedRoot = checkAtomicBlueprints({ atomicRoot: tempRoot });
  assert.ok(referencedRoot.failures.some((failure) => failure.includes('blueprints-root')));
  write(generatorPath, safeGenerator);

  fs.rmSync(path.dirname(invalidPath), { recursive: true, force: true });
  fs.rmSync(path.join(tempRoot, 'src/blueprints/blueprints.manifest.json'));
  const finalResult = checkAtomicBlueprints({ atomicRoot: tempRoot });
  assert.deepEqual(finalResult.failures, []);

  console.log('Atomic blueprint gate: embedded templates/styles and policy tests passed.');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
