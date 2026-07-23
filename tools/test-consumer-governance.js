#!/usr/bin/env node

const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const atomicRoot = path.resolve(__dirname, '..');
const gateSource = path.join(atomicRoot, 'governance', 'consumer', 'check-atomic-provenance.mjs');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-governance-'));
const consumerRoot = path.join(tempRoot, 'consumer');
const sourceRoot = path.join(tempRoot, 'atomic');

function write(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function copy(relativePath) {
  const source = path.join(atomicRoot, relativePath);
  const target = path.join(sourceRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function runGate(expectedSuccess, expectedText) {
  const result = spawnSync(
    process.execPath,
    [path.join(consumerRoot, 'scripts', 'check-atomic-provenance.mjs')],
    {
      cwd: consumerRoot,
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
      encoding: 'utf8',
    },
  );
  const output = `${result.stdout}\n${result.stderr}`;
  if ((result.status === 0) !== expectedSuccess || (expectedText && !output.includes(expectedText))) {
    throw new Error(`Resultado inesperado del gate (${result.status}):\n${output}`);
  }
}

try {
  for (const artifact of [
    'governance/consumer/ATOMIC_GOVERNANCE.md',
    'governance/consumer/check-atomic-provenance.mjs',
    'governance/consumer/atomic-governance.yml',
  ]) {
    copy(artifact);
  }
  write(path.join(sourceRoot, 'src/app/shared/ui/atoms/example/example.ts'), 'export const example = true;\n');
  write(path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'), ':root { --example: 1; }\n');

  fs.mkdirSync(path.join(consumerRoot, 'scripts'), { recursive: true });
  fs.copyFileSync(gateSource, path.join(consumerRoot, 'scripts', 'check-atomic-provenance.mjs'));
  fs.mkdirSync(path.join(consumerRoot, 'docs'), { recursive: true });
  fs.copyFileSync(
    path.join(atomicRoot, 'governance/consumer/ATOMIC_GOVERNANCE.md'),
    path.join(consumerRoot, 'docs/ATOMIC_GOVERNANCE.md'),
  );
  fs.mkdirSync(path.join(consumerRoot, '.github/workflows'), { recursive: true });
  fs.copyFileSync(
    path.join(atomicRoot, 'governance/consumer/atomic-governance.yml'),
    path.join(consumerRoot, '.github/workflows/atomic-governance.yml'),
  );
  write(path.join(consumerRoot, 'AGENTS.md'), '# Agent\n\nATOMIC_GOVERNANCE_REQUIRED\n');
  write(
    path.join(consumerRoot, 'package.json'),
    JSON.stringify({ scripts: { 'check:atomic': 'node scripts/check-atomic-provenance.mjs' } }),
  );
  write(path.join(consumerRoot, 'src/app/ui/atoms/example/example.ts'), 'export const example = true;\n');
  write(path.join(consumerRoot, 'src/app/features/home/home.html'), '<prest-example />\n');
  write(path.join(consumerRoot, 'src/styles/themes/_tokens-components.css'), ':root { --example: 1; }\n');

  const manifest = {
    schemaVersion: 1,
    policyVersion: '1.0.0',
    changeId: 'GOVERNANCE-TEST',
    atomicRepository: '../atomic',
    atomicRemote: 'archware/-Atomic-UI',
    atomicRef: 'main',
    uiRoots: ['src/app/ui'],
    featureRoots: ['src/app/features'],
    layers: ['atoms', 'molecules', 'organisms', 'surfaces', 'templates'],
    components: [
      {
        local: 'src/app/ui/atoms/example',
        atomic: 'src/app/shared/ui/atoms/example',
        mode: 'exact',
        files: ['example.ts'],
      },
    ],
    governanceArtifacts: [
      {
        local: 'docs/ATOMIC_GOVERNANCE.md',
        atomic: 'governance/consumer/ATOMIC_GOVERNANCE.md',
      },
      {
        local: 'scripts/check-atomic-provenance.mjs',
        atomic: 'governance/consumer/check-atomic-provenance.mjs',
      },
      {
        local: '.github/workflows/atomic-governance.yml',
        atomic: 'governance/consumer/atomic-governance.yml',
      },
    ],
    tokens: {
      atomic: 'src/styles/themes/_tokens-components.css',
      consumer: 'src/styles/themes/_tokens-components.css',
      required: ['--example'],
    },
  };
  const manifestPath = path.join(consumerRoot, 'docs/atomic-provenance.json');
  write(manifestPath, JSON.stringify(manifest, null, 2));

  runGate(true, 'Ley Atomic verificada');

  write(path.join(consumerRoot, 'src/app/features/home/home.html'), '<button>Prohibido</button>\n');
  runGate(false, 'Primitiva visual nativa fuera del ADN');

  write(path.join(consumerRoot, 'src/app/features/home/home.html'), '<prest-example />\n');
  write(path.join(consumerRoot, 'src/app/ui/atoms/unknown/unknown.ts'), 'export const unknown = true;\n');
  runGate(false, 'Componente sin procedencia Atomic');
  fs.rmSync(path.join(consumerRoot, 'src/app/ui/atoms/unknown'), { recursive: true });

  write(path.join(consumerRoot, 'src/app/ui/atoms/example/example.ts'), 'export const example = false;\n');
  runGate(false, 'Propagación exacta divergente');

  write(path.join(consumerRoot, 'src/app/ui/atoms/example/example.ts'), 'export const example = true;\n');
  manifest.components[0].mode = 'adapted';
  delete manifest.components[0].files;
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'Adaptación sin justificación');

  const installedConsumer = path.join(tempRoot, 'installed-consumer');
  write(
    path.join(installedConsumer, 'package.json'),
    JSON.stringify({ name: 'installed-consumer', scripts: {} }, null, 2),
  );
  fs.cpSync(
    path.join(atomicRoot, 'src/app/shared/ui/atoms/choice-control'),
    path.join(installedConsumer, 'src/app/shared/ui/atoms/choice-control'),
    { recursive: true },
  );
  fs.mkdirSync(path.join(installedConsumer, 'src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(atomicRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(installedConsumer, 'src/styles/themes/_tokens-components.css'),
  );
  execFileSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), installedConsumer],
    { stdio: 'pipe' },
  );
  const installedManifest = JSON.parse(
    fs.readFileSync(path.join(installedConsumer, 'docs/atomic-provenance.json'), 'utf8'),
  );
  if (installedManifest.components.length !== 1) {
    throw new Error('El instalador no inventarió el componente Atomic copiado.');
  }
  if (!fs.existsSync(path.join(installedConsumer, '.node-version'))) {
    throw new Error('El instalador no fijó el runtime requerido por CI.');
  }
  const installedGate = spawnSync(
    process.execPath,
    [path.join(installedConsumer, 'scripts/check-atomic-provenance.mjs')],
    { cwd: installedConsumer, encoding: 'utf8' },
  );
  if (installedGate.status !== 0) {
    throw new Error(`El consumidor instalado no supera su gate:\n${installedGate.stderr}`);
  }

  console.log(
    'Contrato Atomic probado: bootstrap válido y cuatro violaciones bloqueadas.',
  );
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
