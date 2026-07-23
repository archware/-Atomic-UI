#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const atomicRoot = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-governance-smoke-'));
const projectName = 'governed-smoke';
const projectRoot = path.join(tempRoot, projectName);

try {
  execFileSync(
    process.execPath,
    [
      path.join(atomicRoot, 'tools', 'create-project.js'),
      projectName,
      '--template=login+dashboard',
      `--output=${tempRoot}`,
      '--skip-install',
    ],
    { cwd: atomicRoot, stdio: 'inherit' },
  );
  execFileSync(process.execPath, [path.join(projectRoot, 'scripts', 'check-atomic-provenance.mjs')], {
    cwd: projectRoot,
    env: { ...process.env, ATOMIC_UI_ROOT: atomicRoot },
    stdio: 'inherit',
  });

  const manifest = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'docs', 'atomic-provenance.json'), 'utf8'),
  );
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  if (
    manifest.policyVersion !== '1.0.0' ||
    manifest.components.length === 0 ||
    packageJson.scripts?.['check:atomic'] !== 'node scripts/check-atomic-provenance.mjs'
  ) {
    throw new Error('El proyecto generado no contiene el contrato Atomic completo.');
  }

  console.log(
    `Generador validado: aplicación gobernada con ${manifest.components.length} componentes.`,
  );
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
