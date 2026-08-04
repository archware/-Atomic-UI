#!/usr/bin/env node

const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const atomicRoot = path.resolve(__dirname, '..');
const kitRoot = path.join(atomicRoot, 'governance', 'consumer');
const layers = ['atoms', 'molecules', 'organisms', 'surfaces', 'templates'];

const normalize = (value) => value.replaceAll('\\', '/');

function option(name, fallback) {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((argument) => argument.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

function copy(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function filesBelow(root, base = root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(root, entry.name);
    return entry.isDirectory() ? filesBelow(current, base) : [normalize(path.relative(base, current))];
  }).sort((left, right) => left.localeCompare(right, 'en'));
}

function digest(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function auditComponents(consumerRoot, uiRoot) {
  const absoluteUiRoot = path.join(consumerRoot, uiRoot);
  const components = [];
  for (const layer of layers) {
    const localLayer = path.join(absoluteUiRoot, layer);
    if (!fs.existsSync(localLayer)) continue;
    for (const entry of fs.readdirSync(localLayer, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const local = normalize(path.join(uiRoot, layer, entry.name));
      const atomic = normalize(path.join('src/app/shared/ui', layer, entry.name));
      const localRoot = path.join(consumerRoot, local);
      const sourceRoot = path.join(atomicRoot, atomic);
      if (!fs.existsSync(sourceRoot)) {
        throw new Error(`No existe fuente Atomic para ${local}: ${atomic}`);
      }

      const localFiles = filesBelow(localRoot);
      const sourceFiles = filesBelow(sourceRoot);
      const candidates = [...new Set([...localFiles, ...sourceFiles])].sort((left, right) =>
        left.localeCompare(right, 'en'),
      );
      const differences = [];
      for (const file of candidates) {
        const localFile = path.join(localRoot, file);
        const sourceFile = path.join(sourceRoot, file);
        if (!fs.existsSync(localFile)) {
          differences.push({ file, kind: 'missing-in-consumer' });
        } else if (!fs.existsSync(sourceFile)) {
          differences.push({ file, kind: 'consumer-only' });
        } else if (digest(localFile) !== digest(sourceFile)) {
          differences.push({ file, kind: 'content-divergence' });
        }
      }
      components.push({
        local,
        atomic,
        classification: differences.length === 0 ? 'exact' : 'adaptation-required',
        files: sourceFiles,
        differences,
        snapshot: candidates.map((file) => ({
          file,
          localSha256: fs.existsSync(path.join(localRoot, file))
            ? digest(path.join(localRoot, file))
            : null,
          atomicSha256: fs.existsSync(path.join(sourceRoot, file))
            ? digest(path.join(sourceRoot, file))
            : null,
        })),
      });
    }
  }
  return components;
}

function atomicRef() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: atomicRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'main';
  }
}

function atomicIdentity() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(atomicRoot, 'package.json'), 'utf8'));
  const sourceManifestPath = path.join(
    atomicRoot,
    'distribution',
    'atomic-source-manifest.json',
  );
  if (!fs.existsSync(sourceManifestPath)) {
    throw new Error(
      'No existe distribution/atomic-source-manifest.json. Ejecute npm run package:manifest.',
    );
  }
  const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
  if (!packageJson.version?.trim() || !sourceManifest.sourceTreeSha256?.trim()) {
    throw new Error('La identidad versionada de Atomic est\u00e1 incompleta.');
  }
  if (sourceManifest.packageVersion !== packageJson.version) {
    throw new Error(
      'La versi\u00f3n del manifiesto de fuentes no coincide con package.json. ' +
        'Ejecute npm run package:manifest.',
    );
  }
  return {
    atomicVersion: packageJson.version,
    atomicSourceTreeSha256: sourceManifest.sourceTreeSha256,
  };
}

function appendAgentPolicy(consumerRoot) {
  const agentsPath = path.join(consumerRoot, 'AGENTS.md');
  const template = fs.readFileSync(path.join(kitRoot, 'AGENTS.template.md'), 'utf8');
  if (!fs.existsSync(agentsPath)) {
    fs.writeFileSync(agentsPath, template, 'utf8');
    return;
  }

  const current = fs.readFileSync(agentsPath, 'utf8');
  if (!current.includes('ATOMIC_GOVERNANCE_REQUIRED')) {
    fs.appendFileSync(agentsPath, `\n\n${template}`, 'utf8');
  }
}

function main() {
  const consumerArg = process.argv.slice(2).find((argument) => !argument.startsWith('--'));
  if (!consumerArg) {
    console.error('Uso: npm run governance:install -- <ruta-consumidor> [--ui-root=src/app/shared/ui]');
    process.exit(1);
  }

  const consumerRoot = path.resolve(consumerArg);
  const packageRoot = normalize(option('package-root', '.'));
  const uiRoot = normalize(option('ui-root', 'src/app/shared/ui'));
  const packagePath = path.join(consumerRoot, packageRoot, 'package.json');
  const absoluteUiRoot = path.join(consumerRoot, uiRoot);
  const auditOnly = process.argv.includes('--audit-only');
  const adaptationDecision = normalize(option('adaptation-decision', ''));
  const changeId = option('change-id', 'ATOMIC-BOOTSTRAP');
  let identity;

  try {
    identity = atomicIdentity();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (!fs.existsSync(packagePath) || !fs.existsSync(absoluteUiRoot)) {
    console.error('El consumidor debe contener package.json y la raíz UI indicada.');
    process.exit(1);
  }

  let auditedComponents;
  try {
    auditedComponents = auditComponents(consumerRoot, uiRoot);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  const exactComponents = auditedComponents.filter(
    (component) => component.classification === 'exact',
  );
  const adaptations = auditedComponents.filter(
    (component) => component.classification === 'adaptation-required',
  );
  const auditReport = {
    schemaVersion: 1,
    status: adaptations.length === 0 ? 'exact' : 'adaptation-records-required',
    atomicRef: atomicRef(),
    ...identity,
    consumerRoot: normalize(consumerRoot),
    packageRoot,
    uiRoot,
    exactCount: exactComponents.length,
    adaptationRequiredCount: adaptations.length,
    components: auditedComponents.map((component) => ({
      local: component.local,
      atomic: component.atomic,
      classification: component.classification,
      differences: component.differences,
    })),
  };
  if (auditOnly) {
    console.log(JSON.stringify(auditReport, null, 2));
    return;
  }
  if (adaptations.length > 0 && adaptationDecision) {
    const decisionPath = path.resolve(consumerRoot, adaptationDecision);
    const decisionInsideConsumer =
      decisionPath === consumerRoot || decisionPath.startsWith(`${consumerRoot}${path.sep}`);
    if (!decisionInsideConsumer || !fs.existsSync(decisionPath)) {
      console.error('El registro de decisión Atomic debe existir dentro del consumidor.');
      process.exit(2);
    }
  }
  if (adaptations.length > 0 && !adaptationDecision) {
    console.error(JSON.stringify(auditReport, null, 2));
    console.error(
      'Instalación detenida antes de modificar el consumidor. Cada divergencia requiere una justificación y un decisionRecord concretos; el instalador no los genera automáticamente.',
    );
    process.exit(2);
  }

  copy(
    path.join(kitRoot, 'ATOMIC_GOVERNANCE.md'),
    path.join(consumerRoot, 'docs', 'ATOMIC_GOVERNANCE.md'),
  );
  copy(
    path.join(kitRoot, 'check-atomic-provenance.mjs'),
    path.join(consumerRoot, 'scripts', 'check-atomic-provenance.mjs'),
  );
  copy(
    path.join(kitRoot, 'atomic-governance.yml'),
    path.join(consumerRoot, '.github', 'workflows', 'atomic-governance.yml'),
  );
  for (const versionFile of ['.node-version', '.nvmrc']) {
    if (!fs.existsSync(path.join(consumerRoot, versionFile))) {
      copy(path.join(atomicRoot, versionFile), path.join(consumerRoot, versionFile));
    }
  }
  appendAgentPolicy(consumerRoot);

  const components = auditedComponents.map((component) => {
    if (component.classification === 'exact') {
      return {
        local: component.local,
        atomic: component.atomic,
        mode: 'exact',
        files: component.files,
      };
    }
    const kinds = [...new Set(component.differences.map((difference) => difference.kind))].sort();
    return {
      local: component.local,
      atomic: component.atomic,
      mode: 'adapted',
      justification:
        `Línea base auditada: ${component.differences.length} diferencia(s) ` +
        `de tipo ${kinds.join(', ')}. La adaptación se conserva hasta su migración funcional.`,
      decisionRecord: adaptationDecision,
      adaptationSnapshot: component.snapshot,
    };
  });

  const packageDirectory = path.dirname(packagePath);
  const gateRelative = normalize(
    path.relative(packageDirectory, path.join(consumerRoot, 'scripts', 'check-atomic-provenance.mjs')),
  );
  const consumerRelative = normalize(path.relative(packageDirectory, consumerRoot)) || '.';
  const checkAtomicCommand =
    packageRoot === '.'
      ? 'node scripts/check-atomic-provenance.mjs'
      : `node ${gateRelative} --consumer-root=${consumerRelative}`;
  const packagePrefix = packageRoot === '.' ? '' : `${packageRoot}/`;

  const manifest = {
    schemaVersion: 1,
    policyVersion: '1.0.0',
    changeId,
    atomicRepository: normalize(path.relative(consumerRoot, atomicRoot)),
    atomicRemote: 'archware/-Atomic-UI',
    atomicRef: atomicRef(),
    ...identity,
    packageRoot,
    uiRoots: [uiRoot],
    featureRoots: [
      `${packagePrefix}src/app/features`,
      `${packagePrefix}src/app/pages`,
      `${packagePrefix}src/app/dashboard`,
    ],
    layers,
    components,
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
      consumer: `${packagePrefix}src/styles/themes/_tokens-components.css`,
      required: [],
    },
  };
  const manifestPath = path.join(consumerRoot, 'docs', 'atomic-provenance.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.scripts ||= {};
  packageJson.scripts['check:atomic'] = checkAtomicCommand;
  if (!packageJson.scripts.check) {
    packageJson.scripts.check = 'npm run check:atomic && npm test -- --watch=false && npm run build';
  } else if (!packageJson.scripts.check.includes('check:atomic')) {
    packageJson.scripts.check = `npm run check:atomic && ${packageJson.scripts.check}`;
  }
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

  console.log(
    `Gobierno Atomic instalado: ${exactComponents.length} componentes exactos y ` +
      `${adaptations.length} adaptados, política, gate y CI obligatorios.`,
  );
}

main();
