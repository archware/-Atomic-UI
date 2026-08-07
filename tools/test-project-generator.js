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
      '--template=shell',
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
  const appConfig = fs.readFileSync(path.join(projectRoot, 'src/app/app.config.ts'), 'utf8');
  const routes = fs.readFileSync(path.join(projectRoot, 'src/app/app.routes.ts'), 'utf8');
  if (
    manifest.policyVersion !== '1.2.1' ||
    manifest.shellRoot !== 'src/app' ||
    manifest.components.length === 0 ||
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
