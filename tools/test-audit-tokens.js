#!/usr/bin/env node

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const atomicRoot = path.resolve(__dirname, '..');
const script = path.join(atomicRoot, 'scripts', 'audit-tokens.ps1');
const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function run(root) {
  const result = spawnSync(
    powershell,
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      script,
      '-RootDir',
      root,
      '-ComponentGlob',
      'src/components',
      '-Json',
    ],
    { encoding: 'utf8' },
  );
  if (result.error) throw result.error;
  const output = result.stdout.trim();
  assert.ok(output, `El auditor no produjo JSON. stderr=${result.stderr}`);
  return { result, json: JSON.parse(output) };
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-token-audit-'));
try {
  write(
    path.join(tempRoot, 'src/styles/themes/_tokens.css'),
    ':root {\n  --space-2: 0.5rem;\n  --text-color: currentColor;\n}\n',
  );
  write(
    path.join(tempRoot, 'src/components/example/example.css'),
    [
      '.example {',
      '  --local-gap: 0.25rem;',
      '  gap: var(--local-gap);',
      '  color: var(--text-color);',
      '  inline-size: var(--runtime-size);',
      '  border-color: var(--optional-border, currentColor);',
      '}',
      '',
    ].join('\n'),
  );
  write(
    path.join(tempRoot, 'src/components/example/example.ts'),
    "const style = 'padding: var(--missing-token)';\n",
  );
  write(
    path.join(tempRoot, 'src/components/example/example.html'),
    '<div class="example" [style.--runtime-size.px]="width">{{ value }}</div>\n',
  );
  write(
    path.join(tempRoot, 'src/components/example/example.scss'),
    '.nested { margin: var( --space-2 ); }\n',
  );

  const missing = run(tempRoot);
  assert.equal(missing.result.status, 1, missing.result.stderr);
  assert.equal(missing.json.valid, false);
  assert.equal(missing.json.scannedFiles, 4);
  assert.deepEqual(missing.json.missing.map((entry) => entry.token), ['--missing-token']);
  assert.match(missing.json.missing[0].locations[0], /example\.ts:1$/);
  assert.equal(missing.json.fallbackProtected, 1);
  assert.ok(missing.json.sourceDefined >= 2);

  write(
    path.join(tempRoot, 'src/styles/themes/_tokens.css'),
    ':root {\n  --space-2: 0.5rem;\n  --text-color: currentColor;\n  --missing-token: 1rem;\n}\n',
  );
  const valid = run(tempRoot);
  assert.equal(valid.result.status, 0, valid.result.stderr);
  assert.equal(valid.json.valid, true);
  assert.equal(valid.json.consumed, 6);
  assert.deepEqual(valid.json.missing, []);

  console.log('Atomic token audit: CSS/SCSS/TS/HTML and missing-token tests passed.');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
