#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const atomicRoot = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-governance-smoke-'));
const projectName = 'governed-smoke';
const projectRoot = path.join(tempRoot, projectName);
const sourceRoot = path.join(tempRoot, 'atomic-source');

function copy(relativePath) {
  const source = path.join(atomicRoot, relativePath);
  const target = path.join(sourceRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

function git(repositoryRoot, args) {
  execFileSync('git', args, { cwd: repositoryRoot, stdio: 'pipe' });
}

try {
  fs.mkdirSync(sourceRoot, { recursive: true });
  for (const relativePath of [
    '.gitattributes',
    '.node-version',
    '.nvmrc',
    'package.json',
    'distribution/package-contract.json',
    'distribution/atomic-source-manifest.json',
    'governance/consumer',
    'src/app/shared/ui',
    'src/styles',
  ]) {
    copy(relativePath);
  }
  const sourceManifest = JSON.parse(
    fs.readFileSync(path.join(sourceRoot, 'distribution/atomic-source-manifest.json'), 'utf8'),
  );
  for (const file of sourceManifest.files || []) {
    if (!fs.existsSync(path.join(sourceRoot, file.path))) copy(file.path);
  }
  git(sourceRoot, ['init', '--quiet']);
  git(sourceRoot, ['config', 'user.name', 'Atomic Generator Test']);
  git(sourceRoot, ['config', 'user.email', 'atomic-generator@example.invalid']);
  git(sourceRoot, ['remote', 'add', 'origin', 'https://github.com/archware/-Atomic-UI.git']);
  git(sourceRoot, ['add', '--all']);
  git(sourceRoot, ['commit', '--quiet', '-m', 'test: immutable Atomic fixture']);
  const sourceRef = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: sourceRoot,
    encoding: 'utf8',
  }).trim();

  execFileSync(
    process.execPath,
    [
      path.join(atomicRoot, 'tools', 'create-project.js'),
      projectName,
      '--template=shell',
      `--output=${tempRoot}`,
      '--skip-install',
    ],
    {
      cwd: atomicRoot,
      stdio: 'inherit',
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    },
  );
  git(projectRoot, ['config', 'user.name', 'Atomic Generator Test']);
  git(projectRoot, ['config', 'user.email', 'atomic-generator@example.invalid']);
  git(projectRoot, ['add', '--all']);
  git(projectRoot, ['commit', '--quiet', '-m', 'test: generated consumer baseline']);
  execFileSync(process.execPath, [path.join(projectRoot, 'scripts', 'check-atomic-provenance.mjs')], {
    cwd: projectRoot,
    env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    stdio: 'inherit',
  });

  const manifest = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'docs', 'atomic-provenance.json'), 'utf8'),
  );
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const appConfig = fs.readFileSync(path.join(projectRoot, 'src/app/app.config.ts'), 'utf8');
  const routes = fs.readFileSync(path.join(projectRoot, 'src/app/app.routes.ts'), 'utf8');
  if (
    manifest.policyVersion !== '1.2.2' ||
    manifest.atomicRef !== sourceRef ||
    manifest.contentCanonicalization?.scheme !== 'git-clean-eol-v1' ||
    manifest.shellRoot !== 'src/app' ||
    manifest.components.length === 0 ||
    !fs.existsSync(path.join(projectRoot, '.git')) ||
    !fs.existsSync(path.join(projectRoot, '.gitattributes')) ||
    !fs.existsSync(path.join(projectRoot, 'scripts/git-clean-eol.cjs')) ||
    packageJson.scripts?.['check:atomic'] !== 'node scripts/check-atomic-provenance.mjs'
  ) {
    throw new Error('El proyecto generado no contiene el contrato Atomic completo.');
  }
  const requiredGovernedServices = [
    'theme.service.ts',
    'app-version.service.ts',
    'modal.service.ts',
    'popup.service.ts',
    'toast.service.ts',
  ];
  const governedServices = manifest.governedServices || [];
  if (
    requiredGovernedServices.some(
      (file) =>
        !governedServices.some((service) => service.file === file && service.mode === 'exact') ||
        !fs.existsSync(path.join(projectRoot, 'src/app/shared/ui/services', file)),
    )
  ) {
    throw new Error('El proyecto generado no declara los servicios de presentación gobernados.');
  }
  if (
    !appConfig.includes('provideZonelessChangeDetection()') ||
    appConfig.includes('provideZoneChangeDetection') ||
    routes.includes('./pages/') ||
    fs.existsSync(path.join(projectRoot, 'src/app/pages'))
  ) {
    throw new Error('El shell generado no es zoneless o incluyó blueprints demo.');
  }

  console.log(
    `Generador validado: aplicación gobernada con ${manifest.components.length} componentes.`,
  );
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
