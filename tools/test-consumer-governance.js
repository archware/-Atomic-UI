#!/usr/bin/env node

const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  CONTENT_CANONICALIZATION,
  canonicalFileSha256,
} = require('../governance/consumer/git-clean-eol.cjs');
const { expectedSourceManifest } = require('../governance/consumer/source-manifest.cjs');
const { confinedPath, relativePath } = require('../governance/consumer/safe-paths.cjs');

const atomicRoot = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-governance-'));
const consumerRoot = path.join(tempRoot, 'consumer');
const sourceRoot = path.join(tempRoot, 'atomic');

function write(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function writeBytes(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function git(repositoryRoot, args) {
  const result = spawnSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message || result.stderr || result.stdout);
  }
  return result.stdout.trim();
}

function initializeRepository(repositoryRoot) {
  fs.mkdirSync(repositoryRoot, { recursive: true });
  git(repositoryRoot, ['init', '--quiet']);
  git(repositoryRoot, ['config', 'user.name', 'Atomic Governance Test']);
  git(repositoryRoot, ['config', 'user.email', 'atomic-governance@example.invalid']);
}

function commitRepository(repositoryRoot, message) {
  git(repositoryRoot, ['add', '--all']);
  git(repositoryRoot, ['commit', '--quiet', '-m', message]);
  return git(repositoryRoot, ['rev-parse', 'HEAD']);
}

function digest(repositoryRoot, file) {
  return canonicalFileSha256(repositoryRoot, file);
}

const governedServiceFiles = [
  'theme.service.ts',
  'app-version.service.ts',
  'modal.service.ts',
  'popup.service.ts',
  'toast.service.ts',
];

function copy(relativePath) {
  const source = path.join(atomicRoot, relativePath);
  const target = path.join(sourceRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function runGate(expectedSuccess, expectedText, environment = {}) {
  const result = spawnSync(
    process.execPath,
    [path.join(consumerRoot, 'scripts', 'check-atomic-provenance.mjs')],
    {
      cwd: consumerRoot,
      env: { ...process.env, ...environment, ATOMIC_UI_ROOT: sourceRoot },
      encoding: 'utf8',
    },
  );
  const output = `${result.stdout}\n${result.stderr}`;
  if ((result.status === 0) !== expectedSuccess || (expectedText && !output.includes(expectedText))) {
    throw new Error(`Resultado inesperado del gate (${result.status}):\n${output}`);
  }
}

function prepareInstallConsumer(targetRoot, options = {}) {
  initializeRepository(targetRoot);
  if (options.attributes !== false) {
    write(path.join(targetRoot, '.gitattributes'), '* text=auto eol=crlf\n*.bin -text\n');
  }
  const packageContent = options.packageContent ?? JSON.stringify(
    { name: path.basename(targetRoot), scripts: {} },
    null,
    2,
  );
  write(path.join(targetRoot, 'package.json'), packageContent);
  fs.cpSync(
    path.join(sourceRoot, 'src/app/shared/ui/atoms/choice-control'),
    path.join(targetRoot, 'src/app/shared/ui/atoms/choice-control'),
    { recursive: true },
  );
  fs.mkdirSync(path.join(targetRoot, 'src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(targetRoot, 'src/styles/themes/_tokens-components.css'),
  );
  return packageContent;
}

function consumerSnapshot(repositoryRoot) {
  function visit(directory, prefix = '') {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      if (!prefix && entry.name === '.git') return [];
      const absolute = path.join(directory, entry.name);
      const local = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) return [{ path: local, type: 'link' }];
      if (entry.isDirectory()) return visit(absolute, local);
      return [{ path: local, type: 'file', bytes: fs.readFileSync(absolute).toString('base64') }];
    });
  }
  return JSON.stringify(visit(repositoryRoot).sort((left, right) => left.path.localeCompare(right.path)));
}

try {
  for (const unsafe of [' /tmp/atomic', ' C:\\atomic', '\\\\server\\share', '../outside', ':(exclude)x', 'x*']) {
    assert.throws(
      () => relativePath(tempRoot, unsafe, 'fixture inseguro'),
      /debe permanecer dentro|ruta relativa no vacía/,
      `La ruta insegura debe rechazarse en cualquier plataforma: ${unsafe}`,
    );
  }
  initializeRepository(sourceRoot);
  git(sourceRoot, ['remote', 'add', 'origin', 'https://github.com/archware/-Atomic-UI.git']);
  write(path.join(sourceRoot, '.gitattributes'), '* text=auto eol=crlf\n*.bin -text\n');
  for (const artifact of [
    'governance/consumer/AGENTS.template.md',
    'governance/consumer/ATOMIC_GOVERNANCE.md',
    'governance/consumer/check-atomic-provenance.mjs',
    'governance/consumer/git-clean-eol.cjs',
    'governance/consumer/safe-paths.cjs',
    'governance/consumer/read-atomic-contract.cjs',
    'governance/consumer/source-manifest.cjs',
    'governance/consumer/atomic-governance.yml',
  ]) {
    copy(artifact);
  }
  const packageVersion = JSON.parse(
    fs.readFileSync(path.join(atomicRoot, 'package.json'), 'utf8'),
  ).version;
  write(
    path.join(sourceRoot, 'package.json'),
    `${JSON.stringify({ name: 'atomic-governance-fixture', version: packageVersion }, null, 2)}\n`,
  );
  write(
    path.join(sourceRoot, 'distribution/package-contract.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        targetPackage: 'atomic-governance-fixture',
        status: 'library-buildable',
        sourceInventory: {
          algorithm: 'sha256',
          contentCanonicalization: CONTENT_CANONICALIZATION,
          roots: [
            {
              path: 'src/app/shared/ui',
              extensions: ['.ts', '.html', '.css', '.scss', '.bin'],
              excludeSuffixes: ['.spec.ts'],
            },
            {
              path: 'src/styles/themes',
              extensions: ['.css'],
              excludeSuffixes: [],
            },
          ],
        },
      },
      null,
      2,
    )}\n`,
  );
  write(path.join(sourceRoot, 'src/app/shared/ui/atoms/example/example.ts'), 'export const example = true;\n');
  const binaryCanonical = Buffer.from([0, 65, 13, 10, 66, 255]);
  writeBytes(
    path.join(sourceRoot, 'src/app/shared/ui/atoms/binary/sample.bin'),
    binaryCanonical,
  );
  fs.cpSync(
    path.join(atomicRoot, 'src/app/shared/ui/atoms/choice-control'),
    path.join(sourceRoot, 'src/app/shared/ui/atoms/choice-control'),
    { recursive: true },
  );
  fs.mkdirSync(path.join(sourceRoot, 'src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(atomicRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'),
  );
  for (const versionFile of ['.node-version', '.nvmrc']) copy(versionFile);

  initializeRepository(consumerRoot);
  write(path.join(consumerRoot, '.gitattributes'), '* text=auto eol=crlf\n*.bin -text\n');

  fs.mkdirSync(path.join(consumerRoot, 'scripts'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'governance/consumer/check-atomic-provenance.mjs'),
    path.join(consumerRoot, 'scripts', 'check-atomic-provenance.mjs'),
  );
  fs.copyFileSync(
    path.join(sourceRoot, 'governance/consumer/git-clean-eol.cjs'),
    path.join(consumerRoot, 'scripts', 'git-clean-eol.cjs'),
  );
  fs.copyFileSync(
    path.join(sourceRoot, 'governance/consumer/safe-paths.cjs'),
    path.join(consumerRoot, 'scripts', 'safe-paths.cjs'),
  );
  fs.copyFileSync(
    path.join(sourceRoot, 'governance/consumer/read-atomic-contract.cjs'),
    path.join(consumerRoot, 'scripts', 'read-atomic-contract.cjs'),
  );
  fs.copyFileSync(
    path.join(sourceRoot, 'governance/consumer/source-manifest.cjs'),
    path.join(consumerRoot, 'scripts', 'source-manifest.cjs'),
  );
  fs.mkdirSync(path.join(consumerRoot, 'docs'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'governance/consumer/ATOMIC_GOVERNANCE.md'),
    path.join(consumerRoot, 'docs/ATOMIC_GOVERNANCE.md'),
  );
  fs.mkdirSync(path.join(consumerRoot, '.github/workflows'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'governance/consumer/atomic-governance.yml'),
    path.join(consumerRoot, '.github/workflows/atomic-governance.yml'),
  );
  write(path.join(consumerRoot, 'AGENTS.md'), '# Agent\n\nATOMIC_GOVERNANCE_REQUIRED\n');
  write(
    path.join(consumerRoot, 'package.json'),
    JSON.stringify({ scripts: { 'check:atomic': 'node scripts/check-atomic-provenance.mjs' } }),
  );
  write(
    path.join(consumerRoot, 'src/app/ui/atoms/example/example.ts'),
    'export const example = true;\r\n',
  );
  writeBytes(
    path.join(consumerRoot, 'src/app/ui/atoms/binary/sample.bin'),
    binaryCanonical,
  );
  write(path.join(consumerRoot, 'src/app/features/home/home.html'), '<prest-example />\n');
  fs.mkdirSync(path.join(consumerRoot, 'src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(consumerRoot, 'src/styles/themes/_tokens-components.css'),
  );
  for (const serviceFile of governedServiceFiles) {
    const serviceContent = `export const service = '${serviceFile}';\n`;
    write(path.join(sourceRoot, 'src/app/shared/ui/services', serviceFile), serviceContent);
    write(
      path.join(consumerRoot, 'src/app/ui/services', serviceFile),
      serviceContent.replaceAll('\n', '\r\n'),
    );
  }
  commitRepository(sourceRoot, 'test: inventario fuente previo al manifiesto');
  const sourceContract = JSON.parse(
    fs.readFileSync(path.join(sourceRoot, 'distribution/package-contract.json'), 'utf8'),
  );
  const sourcePackage = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'package.json'), 'utf8'));
  const sourceManifest = expectedSourceManifest(sourceRoot, sourceContract, sourcePackage);
  const sourceTreeSha256 = sourceManifest.sourceTreeSha256;
  write(
    path.join(sourceRoot, 'distribution/atomic-source-manifest.json'),
    `${JSON.stringify(sourceManifest, null, 2)}\n`,
  );
  const atomicRef = commitRepository(sourceRoot, 'test: fixture Atomic 1.2.2');
  const shellComponentPath = path.join(consumerRoot, 'src/app/app.component.ts');
  const shellCanonical = "export const shellTemplate = '<prest-shell />';\n";
  write(shellComponentPath, shellCanonical);

  const manifest = {
    schemaVersion: 1,
    policyVersion: '1.2.2',
    changeId: 'GOVERNANCE-TEST',
    atomicRepository: '../atomic',
    atomicRemote: 'archware/-Atomic-UI',
    atomicRef,
    atomicVersion: packageVersion,
    atomicSourceTreeSha256: sourceTreeSha256,
    contentCanonicalization: CONTENT_CANONICALIZATION,
    packageRoot: '.',
    uiRoots: ['src/app/ui'],
    shellRoot: 'src/app',
    featureRoots: ['src/app/features'],
    layers: ['atoms', 'molecules', 'organisms', 'surfaces', 'templates'],
    components: [
      {
        local: 'src/app/ui/atoms/example',
        atomic: 'src/app/shared/ui/atoms/example',
        mode: 'exact',
        files: ['example.ts'],
      },
      {
        local: 'src/app/ui/atoms/binary',
        atomic: 'src/app/shared/ui/atoms/binary',
        mode: 'exact',
        files: ['sample.bin'],
      },
    ],
    governedServices: governedServiceFiles.map((file) => ({ file, mode: 'exact' })),
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
        local: 'scripts/git-clean-eol.cjs',
        atomic: 'governance/consumer/git-clean-eol.cjs',
      },
      {
        local: 'scripts/safe-paths.cjs',
        atomic: 'governance/consumer/safe-paths.cjs',
      },
      {
        local: 'scripts/read-atomic-contract.cjs',
        atomic: 'governance/consumer/read-atomic-contract.cjs',
      },
      {
        local: 'scripts/source-manifest.cjs',
        atomic: 'governance/consumer/source-manifest.cjs',
      },
      {
        local: '.github/workflows/atomic-governance.yml',
        atomic: 'governance/consumer/atomic-governance.yml',
      },
    ],
    tokens: {
      atomic: 'src/styles/themes/_tokens-components.css',
      consumer: 'src/styles/themes/_tokens-components.css',
      required: [],
    },
  };
  const manifestPath = path.join(consumerRoot, 'docs/atomic-provenance.json');
  write(manifestPath, JSON.stringify(manifest, null, 2));
  commitRepository(consumerRoot, 'test: fixture consumidor 1.2.2');

  runGate(true, 'Ley Atomic verificada');

  const fullAtomicRef = manifest.atomicRef;
  manifest.atomicRef = fullAtomicRef.slice(0, 12);
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'atomicRef debe ser un commit Git completo');
  manifest.atomicRef = '0'.repeat(40);
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'pero atomicRef fija');
  manifest.atomicRef = fullAtomicRef;
  write(manifestPath, JSON.stringify(manifest, null, 2));

  const canonicalRemote = manifest.atomicRemote;
  manifest.atomicRemote = 'attacker/-Atomic-UI';
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'atomicRemote debe ser la fuente canónica');
  manifest.atomicRemote = canonicalRemote;
  write(manifestPath, JSON.stringify(manifest, null, 2));

  for (const unsafePackageRoot of ['../outside', ' C:\\outside', '/tmp/outside', 'frontend\noutput']) {
    manifest.packageRoot = unsafePackageRoot;
    write(manifestPath, JSON.stringify(manifest, null, 2));
    runGate(false, 'packageRoot');
  }
  manifest.packageRoot = '.';
  write(manifestPath, JSON.stringify(manifest, null, 2));

  const sourceExamplePath = path.join(
    sourceRoot,
    'src/app/shared/ui/atoms/example/example.ts',
  );
  write(sourceExamplePath, 'export const example = false;\n');
  runGate(false, 'cambios sin confirmar en rutas gobernadas por atomicRef');
  write(sourceExamplePath, 'export const example = true;\n');
  runGate(true, 'Ley Atomic verificada');

  const atomicSourceManifestPath = path.join(
    sourceRoot,
    'distribution/atomic-source-manifest.json',
  );
  const originalSourceManifestBytes = fs.readFileSync(atomicSourceManifestPath);
  for (const flag of ['assume-unchanged', 'skip-worktree']) {
    write(sourceExamplePath, `export const hiddenByIndex = '${flag}';\n`);
    const hiddenManifest = expectedSourceManifest(sourceRoot, sourceContract, sourcePackage);
    write(atomicSourceManifestPath, `${JSON.stringify(hiddenManifest, null, 2)}\n`);
    git(sourceRoot, [
      'update-index',
      `--${flag}`,
      '--',
      'src/app/shared/ui/atoms/example/example.ts',
      'distribution/atomic-source-manifest.json',
    ]);
    runGate(false, 'Los bytes físicos Atomic no coinciden con atomicRef');

    const hiddenSourceConsumer = path.join(tempRoot, `hidden-source-${flag}`);
    const hiddenSourcePackage = prepareInstallConsumer(hiddenSourceConsumer, {
      attributes: false,
    });
    const hiddenSourceInstall = spawnSync(
      process.execPath,
      [path.join(atomicRoot, 'tools/install-consumer-governance.js'), hiddenSourceConsumer],
      { encoding: 'utf8', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
    );
    if (
      hiddenSourceInstall.status === 0 ||
      !hiddenSourceInstall.stderr.includes('Los bytes físicos Atomic no coinciden') ||
      fs.readFileSync(path.join(hiddenSourceConsumer, 'package.json'), 'utf8') !==
        hiddenSourcePackage ||
      fs.existsSync(path.join(hiddenSourceConsumer, '.gitattributes')) ||
      fs.existsSync(path.join(hiddenSourceConsumer, 'docs'))
    ) {
      throw new Error(`El instalador no rechazó ${flag} con cero mutaciones.`);
    }
    git(sourceRoot, [
      'update-index',
      `--no-${flag}`,
      '--',
      'src/app/shared/ui/atoms/example/example.ts',
      'distribution/atomic-source-manifest.json',
    ]);
    write(sourceExamplePath, 'export const example = true;\n');
    fs.writeFileSync(atomicSourceManifestPath, originalSourceManifestBytes);
    runGate(true, 'Ley Atomic verificada');
  }

  const declaredCanonicalization = manifest.contentCanonicalization;
  delete manifest.contentCanonicalization;
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'contentCanonicalization debe declarar git-clean-eol-v1');
  manifest.contentCanonicalization = declaredCanonicalization;
  write(manifestPath, JSON.stringify(manifest, null, 2));

  manifest.atomicVersion = '0.0.0-invalid';
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'Versi\u00f3n Atomic divergente');
  manifest.atomicVersion = packageVersion;
  manifest.atomicSourceTreeSha256 = '0'.repeat(64);
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'La huella de fuentes Atomic no coincide');
  manifest.atomicSourceTreeSha256 = sourceTreeSha256;
  write(manifestPath, JSON.stringify(manifest, null, 2));

  write(path.join(consumerRoot, 'src/app/features/home/home.html'), '<button>Prohibido</button>\n');
  runGate(false, 'Primitiva visual nativa fuera del ADN');

  write(path.join(consumerRoot, 'src/app/features/home/home.html'), '<prest-example />\n');
  write(path.join(consumerRoot, 'src/app/ui/atoms/unknown/unknown.ts'), 'export const unknown = true;\n');
  runGate(false, 'Componente sin procedencia Atomic');
  fs.rmSync(path.join(consumerRoot, 'src/app/ui/atoms/unknown'), { recursive: true });

  write(path.join(consumerRoot, 'src/app/ui/atoms/example/example.ts'), 'export const example = false;\n');
  runGate(false, 'Propagación exacta divergente');

  write(path.join(consumerRoot, 'src/app/ui/atoms/example/example.ts'), 'export const example = true;\n');

  write(
    path.join(consumerRoot, 'src/app/ui/atoms/example/backdoor.ts'),
    'export const backdoor = true;\n',
  );
  runGate(false, 'El conjunto de archivos exactos cambió');
  fs.rmSync(path.join(consumerRoot, 'src/app/ui/atoms/example/backdoor.ts'));
  runGate(true, 'Ley Atomic verificada');

  const gitLinkBlob = path.join(consumerRoot, '.git', 'atomic-link-target');
  write(gitLinkBlob, 'example.ts');
  const gitLinkOid = git(consumerRoot, ['hash-object', '-w', gitLinkBlob]);
  git(consumerRoot, [
    'update-index',
    '--add',
    '--cacheinfo',
    `120000,${gitLinkOid},src/app/ui/atoms/example/example.ts`,
  ]);
  runGate(false, 'modo 120000');
  git(consumerRoot, ['update-index', '--force-remove', '--', 'src/app/ui/atoms/example/example.ts']);
  git(consumerRoot, ['add', '--', 'src/app/ui/atoms/example/example.ts']);
  runGate(true, 'Ley Atomic verificada');

  writeBytes(
    path.join(consumerRoot, 'src/app/ui/atoms/binary/sample.bin'),
    Buffer.from([0, 65, 10, 66, 255]),
  );
  runGate(false, 'Propagación exacta divergente: src/app/ui/atoms/binary/sample.bin');
  writeBytes(
    path.join(consumerRoot, 'src/app/ui/atoms/binary/sample.bin'),
    binaryCanonical,
  );

  write(
    path.join(consumerRoot, '.gitattributes'),
    '* text=auto eol=crlf\n*.bin -text\nsrc/app/ui/atoms/example/example.ts filter=custom\n',
  );
  runGate(false, 'atributo Git clean no admitido filter=custom');
  write(path.join(consumerRoot, '.gitattributes'), '* text=auto eol=crlf\n*.bin -text\n');
  runGate(true, 'Ley Atomic verificada');

  write(path.join(consumerRoot, '.git/info/attributes'), '*.bin text\n');
  runGate(false, 'atributos no versionados en .git/info/attributes');
  write(path.join(consumerRoot, '.git/info/attributes'), '');
  runGate(true, 'Ley Atomic verificada');

  const globalAttributesHome = path.join(tempRoot, 'global-attributes-home');
  write(path.join(globalAttributesHome, 'git/attributes'), '*.bin text\n');
  runGate(true, 'Ley Atomic verificada', { XDG_CONFIG_HOME: globalAttributesHome });

  const declaredGovernedServices = manifest.governedServices;
  manifest.governedServices = declaredGovernedServices.filter(
    (service) => service.file !== 'theme.service.ts',
  );
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'Servicio gobernado no declarado: theme.service.ts');
  manifest.governedServices = declaredGovernedServices;
  write(manifestPath, JSON.stringify(manifest, null, 2));

  const popupConsumerPath = path.join(consumerRoot, 'src/app/ui/services/popup.service.ts');
  const popupAtomicPath = path.join(sourceRoot, 'src/app/shared/ui/services/popup.service.ts');
  const popupCanonical = "export const service = 'popup.service.ts';\n";
  write(popupConsumerPath, 'export const service = false;\n');
  runGate(false, 'Propagación exacta divergente en servicio: src/app/ui/services/popup.service.ts');

  const popupEntry = manifest.governedServices.find(
    (service) => service.file === 'popup.service.ts',
  );
  popupEntry.mode = 'adapted';
  popupEntry.localSha256 = digest(consumerRoot, popupConsumerPath);
  popupEntry.atomicSha256 = digest(sourceRoot, popupAtomicPath);
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(true, 'Ley Atomic verificada');

  write(popupAtomicPath, "export const service = 'popup.service.ts nueva versión';\n");
  runGate(false, 'Fuente Atomic del servicio cambió respecto al snapshot');

  write(popupAtomicPath, popupCanonical);
  write(popupConsumerPath, popupCanonical);
  popupEntry.mode = 'exact';
  delete popupEntry.localSha256;
  delete popupEntry.atomicSha256;
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(true, 'Ley Atomic verificada');

  write(
    shellComponentPath,
    'export const shellTemplate = \'<div style="background: var(--surface-base)">x</div>\';\n',
  );
  runGate(false, 'Estilo inline prohibido en plantilla TS: src/app/app.component.ts');

  write(
    shellComponentPath,
    "export const shellBackground = 'var(--surface-base, #f8fafc)';\n",
  );
  runGate(false, 'Color fijo fuera de tokens: src/app/app.component.ts');

  write(shellComponentPath, shellCanonical);
  const declaredShellRoot = manifest.shellRoot;
  delete manifest.shellRoot;
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'shellRoot es obligatorio');
  manifest.shellRoot = declaredShellRoot;
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(true, 'Ley Atomic verificada');

  manifest.components[0].mode = 'adapted';
  delete manifest.components[0].files;
  write(manifestPath, JSON.stringify(manifest, null, 2));
  runGate(false, 'Adaptación sin justificación');

  const installedConsumer = path.join(tempRoot, 'installed-consumer');
  initializeRepository(installedConsumer);
  write(path.join(installedConsumer, '.gitattributes'), '* text=auto eol=crlf\n*.bin -text\n');
  write(
    path.join(installedConsumer, 'package.json'),
    JSON.stringify({ name: 'installed-consumer', scripts: {} }, null, 2),
  );
  fs.cpSync(
    path.join(sourceRoot, 'src/app/shared/ui/atoms/choice-control'),
    path.join(installedConsumer, 'src/app/shared/ui/atoms/choice-control'),
    { recursive: true },
  );
  fs.mkdirSync(path.join(installedConsumer, 'src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(installedConsumer, 'src/styles/themes/_tokens-components.css'),
  );
  execFileSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), installedConsumer],
    { stdio: 'pipe', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  const installedManifest = JSON.parse(
    fs.readFileSync(path.join(installedConsumer, 'docs/atomic-provenance.json'), 'utf8'),
  );
  if (installedManifest.components.length !== 1) {
    throw new Error('El instalador no inventarió el componente Atomic copiado.');
  }
  if (
    installedManifest.policyVersion !== '1.2.2' ||
    installedManifest.atomicRef !== atomicRef ||
    JSON.stringify(installedManifest.contentCanonicalization) !==
      JSON.stringify(CONTENT_CANONICALIZATION) ||
    !fs.existsSync(path.join(installedConsumer, 'scripts/git-clean-eol.cjs')) ||
    !fs.existsSync(path.join(installedConsumer, 'scripts/safe-paths.cjs')) ||
    !fs.existsSync(path.join(installedConsumer, 'scripts/read-atomic-contract.cjs')) ||
    !fs.existsSync(path.join(installedConsumer, 'scripts/source-manifest.cjs'))
  ) {
    throw new Error('El instalador no fijó la política 1.2.2 y su canonicalización completa.');
  }
  for (const [local, atomic] of [
    ['docs/ATOMIC_GOVERNANCE.md', 'governance/consumer/ATOMIC_GOVERNANCE.md'],
    ['scripts/check-atomic-provenance.mjs', 'governance/consumer/check-atomic-provenance.mjs'],
    ['scripts/git-clean-eol.cjs', 'governance/consumer/git-clean-eol.cjs'],
    ['scripts/safe-paths.cjs', 'governance/consumer/safe-paths.cjs'],
    ['scripts/read-atomic-contract.cjs', 'governance/consumer/read-atomic-contract.cjs'],
    ['scripts/source-manifest.cjs', 'governance/consumer/source-manifest.cjs'],
    ['.github/workflows/atomic-governance.yml', 'governance/consumer/atomic-governance.yml'],
  ]) {
    if (
      !fs.existsSync(path.join(installedConsumer, local)) ||
      !fs.readFileSync(path.join(installedConsumer, local)).equals(fs.readFileSync(path.join(sourceRoot, atomic)))
    ) {
      throw new Error(`El artefacto instalado no es copia exacta de Atomic: ${local}.`);
    }
  }
  const provenanceTemplate = JSON.parse(
    fs.readFileSync(
      path.join(atomicRoot, 'governance/consumer/atomic-provenance.template.json'),
      'utf8',
    ),
  );
  if (
    !(provenanceTemplate.governanceArtifacts || []).some(
      (artifact) =>
        artifact.local === 'scripts/source-manifest.cjs' &&
        artifact.atomic === 'governance/consumer/source-manifest.cjs',
    )
  ) {
    throw new Error('La plantilla de procedencia no declara el verificador compartido del manifiesto.');
  }
  const validatedContract = JSON.parse(
    execFileSync(
      process.execPath,
      [path.join(installedConsumer, 'scripts/read-atomic-contract.cjs'), installedConsumer],
      { encoding: 'utf8' },
    ),
  );
  if (
    validatedContract.repository !== 'archware/-Atomic-UI' ||
    validatedContract.ref !== atomicRef ||
    validatedContract.packageRoot !== '.'
  ) {
    throw new Error('El lector fail-closed no validó el contrato instalado.');
  }
  if (
    (installedManifest.governedServices || []).length !== governedServiceFiles.length ||
    installedManifest.governedServices.some((service) => service.mode !== 'exact') ||
    governedServiceFiles.some(
      (file) => !fs.existsSync(path.join(installedConsumer, 'src/app/shared/ui/services', file)),
    )
  ) {
    throw new Error('El instalador no dejó los servicios de presentación gobernados en modo exact.');
  }
  if (!fs.existsSync(path.join(installedConsumer, '.node-version'))) {
    throw new Error('El instalador no fijó el runtime requerido por CI.');
  }

  const attributeConsumer = path.join(tempRoot, 'attribute-consumer');
  initializeRepository(attributeConsumer);
  write(
    path.join(attributeConsumer, 'package.json'),
    JSON.stringify({ name: 'attribute-consumer', scripts: {} }, null, 2),
  );
  fs.cpSync(
    path.join(sourceRoot, 'src/app/shared/ui/atoms/choice-control'),
    path.join(attributeConsumer, 'src/app/shared/ui/atoms/choice-control'),
    { recursive: true },
  );
  fs.mkdirSync(path.join(attributeConsumer, 'src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(attributeConsumer, 'src/styles/themes/_tokens-components.css'),
  );
  execFileSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), attributeConsumer],
    { stdio: 'pipe', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  if (
    !fs.readFileSync(path.join(attributeConsumer, '.gitattributes'), 'utf8')
      .startsWith('* text=auto eol=crlf\n')
  ) {
    throw new Error('El instalador no creó la política canónica .gitattributes.');
  }
  commitRepository(attributeConsumer, 'test: política de atributos instalada');
  const attributeGate = spawnSync(
    process.execPath,
    [path.join(attributeConsumer, 'scripts/check-atomic-provenance.mjs')],
    {
      cwd: attributeConsumer,
      encoding: 'utf8',
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    },
  );
  if (attributeGate.status !== 0) {
    throw new Error(`El consumidor sin atributos iniciales no supera el gate:\n${attributeGate.stderr}`);
  }
  const installedWorkflow = fs.readFileSync(
    path.join(installedConsumer, '.github/workflows/atomic-governance.yml'),
    'utf8',
  );
  const workflowOrder = [
    '- name: Checkout consumer',
    '- name: Bootstrap Atomic contract as untrusted data',
    '- name: Checkout Atomic source of truth',
    '- name: Enforce policy with trusted Atomic gate',
    '- name: Setup Node',
    '- name: Install dependencies',
  ].map((marker) => installedWorkflow.indexOf(marker));
  const trustedGateIndex = workflowOrder[3];
  const preTrustWorkflow = installedWorkflow.slice(0, trustedGateIndex);
  const trustedGateCommand =
    'node "$ATOMIC_UI_ROOT/governance/consumer/check-atomic-provenance.mjs" --consumer-root="${{ github.workspace }}/consumer"';
  if (
    !/permissions:\s*\r?\n\s+contents: read/.test(installedWorkflow) ||
    !/env:\s*\r?\n\s+ATOMIC_UI_ROOT: \$\{\{ github\.workspace \}\}\/atomic-source/.test(
      installedWorkflow,
    ) ||
    (installedWorkflow.match(/persist-credentials: false/g) || []).length !== 2 ||
    workflowOrder.some((index) => index < 0) ||
    workflowOrder.some((index, position) => position > 0 && index <= workflowOrder[position - 1]) ||
    installedWorkflow.includes('scripts/read-atomic-contract.cjs') ||
    !preTrustWorkflow.includes("node <<'NODE'") ||
    !preTrustWorkflow.includes("contract.atomicRemote !== 'archware/-Atomic-UI'") ||
    !preTrustWorkflow.includes("/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/") ||
    !preTrustWorkflow.includes('path.posix.isAbsolute(packageRoot)') ||
    !preTrustWorkflow.includes('path.win32.isAbsolute(packageRoot)') ||
    !preTrustWorkflow.includes("segments.some((segment) => segment === '' || segment === '..')") ||
    preTrustWorkflow.includes('working-directory: consumer') ||
    preTrustWorkflow.includes('npm ') ||
    !/repository:\s+archware\/-Atomic-UI/.test(installedWorkflow) ||
    /repository:\s+\$\{\{/.test(installedWorkflow) ||
    !installedWorkflow.includes(trustedGateCommand) ||
    !installedWorkflow.includes('repository ruleset must require this workflow') ||
    !installedWorkflow.includes('cannot prove that it or its atomicRef was not downgraded')
  ) {
    throw new Error(
      'El workflow instalado no conserva el bootstrap fail-closed, el orden de confianza o los permisos mínimos.',
    );
  }
  commitRepository(installedConsumer, 'test: consumidor instalado');
  const installedGate = spawnSync(
    process.execPath,
    [path.join(installedConsumer, 'scripts/check-atomic-provenance.mjs')],
    {
      cwd: installedConsumer,
      encoding: 'utf8',
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    },
  );
  if (installedGate.status !== 0) {
    throw new Error(`El consumidor instalado no supera su gate:\n${installedGate.stderr}`);
  }

  const malformedConsumer = path.join(tempRoot, 'malformed-consumer');
  const malformedPackage = prepareInstallConsumer(malformedConsumer, {
    attributes: false,
    packageContent: '{"name":"malformed",',
  });
  const malformedInstall = spawnSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), malformedConsumer],
    { encoding: 'utf8', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  if (
    malformedInstall.status === 0 ||
    fs.readFileSync(path.join(malformedConsumer, 'package.json'), 'utf8') !== malformedPackage ||
    fs.existsSync(path.join(malformedConsumer, '.gitattributes')) ||
    fs.existsSync(path.join(malformedConsumer, 'docs'))
  ) {
    throw new Error('El preflight no rechazó package.json inválido con cero mutaciones.');
  }

  const partialWriteConsumer = path.join(tempRoot, 'partial-write-consumer');
  prepareInstallConsumer(partialWriteConsumer, { attributes: false });
  write(
    path.join(partialWriteConsumer, 'docs/ATOMIC_GOVERNANCE.md'),
    'política local anterior\n',
  );
  const partialWriteBefore = consumerSnapshot(partialWriteConsumer);
  const partialWriteInstall = spawnSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), partialWriteConsumer],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        ATOMIC_UI_ROOT: sourceRoot,
        ATOMIC_GOVERNANCE_TEST_FAIL_WRITE_AT: 'package.json',
      },
    },
  );
  if (
    partialWriteInstall.status === 0 ||
    !partialWriteInstall.stderr.includes('Fallo de escritura inyectado') ||
    consumerSnapshot(partialWriteConsumer) !== partialWriteBefore
  ) {
    throw new Error('La escritura parcial inyectada no dejó el consumidor exactamente intacto.');
  }

  const junctionConsumer = path.join(tempRoot, 'junction-consumer');
  const junctionPackage = prepareInstallConsumer(junctionConsumer, { attributes: false });
  const externalDestination = path.join(tempRoot, 'external-destination');
  fs.mkdirSync(externalDestination, { recursive: true });
  let junctionCreated = false;
  try {
    fs.symlinkSync(externalDestination, path.join(junctionConsumer, 'scripts'), 'junction');
    junctionCreated = true;
  } catch (error) {
    if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) throw error;
  }
  if (junctionCreated) {
    assert.throws(
      () => confinedPath(junctionConsumer, 'scripts/source-manifest.cjs', 'destino enlazado'),
      /enlace simbólico/,
    );
    const junctionInstall = spawnSync(
      process.execPath,
      [path.join(atomicRoot, 'tools/install-consumer-governance.js'), junctionConsumer],
      { encoding: 'utf8', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
    );
    if (
      junctionInstall.status === 0 ||
      fs.readFileSync(path.join(junctionConsumer, 'package.json'), 'utf8') !== junctionPackage ||
      fs.existsSync(path.join(junctionConsumer, '.gitattributes')) ||
      fs.existsSync(path.join(junctionConsumer, 'docs')) ||
      fs.readdirSync(externalDestination).length > 0
    ) {
      throw new Error('El destino enlazado no se rechazó con cero mutaciones externas/locales.');
    }
  }

  const ignoredSourcePath = path.join(
    sourceRoot,
    'src/app/shared/ui/atoms/choice-control/ignored-untracked.ts',
  );
  write(path.join(sourceRoot, '.git/info/exclude'), 'ignored-untracked.ts\n');
  write(ignoredSourcePath, 'export const ignored = true;\n');
  const ignoredConsumer = path.join(tempRoot, 'ignored-source-consumer');
  const ignoredPackage = prepareInstallConsumer(ignoredConsumer, { attributes: false });
  const ignoredInstall = spawnSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), ignoredConsumer],
    { encoding: 'utf8', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  if (
    ignoredInstall.status === 0 ||
    fs.readFileSync(path.join(ignoredConsumer, 'package.json'), 'utf8') !== ignoredPackage ||
    fs.existsSync(path.join(ignoredConsumer, '.gitattributes')) ||
    fs.existsSync(path.join(ignoredConsumer, 'docs'))
  ) {
    throw new Error('La fuente ignorada/no versionada no se rechazó antes de modificar el consumidor.');
  }
  fs.rmSync(ignoredSourcePath);
  write(path.join(sourceRoot, '.git/info/exclude'), '');

  const alternateRemoteConsumer = path.join(tempRoot, 'alternate-remote-consumer');
  const alternateRemotePackage = prepareInstallConsumer(alternateRemoteConsumer, {
    attributes: false,
  });
  git(sourceRoot, ['remote', 'set-url', 'origin', 'https://github.com/attacker/-Atomic-UI.git']);
  const alternateRemoteInstall = spawnSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), alternateRemoteConsumer],
    { encoding: 'utf8', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  git(sourceRoot, ['remote', 'set-url', 'origin', 'https://github.com/archware/-Atomic-UI.git']);
  if (
    alternateRemoteInstall.status === 0 ||
    !alternateRemoteInstall.stderr.includes('archware/-Atomic-UI') ||
    fs.readFileSync(path.join(alternateRemoteConsumer, 'package.json'), 'utf8') !==
      alternateRemotePackage ||
    fs.existsSync(path.join(alternateRemoteConsumer, '.gitattributes')) ||
    fs.existsSync(path.join(alternateRemoteConsumer, 'docs'))
  ) {
    throw new Error('El instalador no rechazó una fuente Atomic con remoto alterno sin mutar.');
  }

  const subdirectorySourceConsumer = path.join(tempRoot, 'subdirectory-source-consumer');
  const subdirectoryPackage = prepareInstallConsumer(subdirectorySourceConsumer, {
    attributes: false,
  });
  const subdirectoryInstall = spawnSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), subdirectorySourceConsumer],
    { encoding: 'utf8', env: { ...process.env, ATOMIC_UI_ROOT: path.join(sourceRoot, 'src') } },
  );
  if (
    subdirectoryInstall.status === 0 ||
    !subdirectoryInstall.stderr.includes('exactamente la raíz') ||
    fs.readFileSync(path.join(subdirectorySourceConsumer, 'package.json'), 'utf8') !==
      subdirectoryPackage ||
    fs.existsSync(path.join(subdirectorySourceConsumer, '.gitattributes')) ||
    fs.existsSync(path.join(subdirectorySourceConsumer, 'docs'))
  ) {
    throw new Error('ATOMIC_UI_ROOT anidado no se rechazó antes de modificar el consumidor.');
  }

  const divergentConsumer = path.join(tempRoot, 'divergent-consumer');
  initializeRepository(divergentConsumer);
  write(path.join(divergentConsumer, '.gitattributes'), '* text=auto eol=crlf\n*.bin -text\n');
  const divergentPackagePath = path.join(divergentConsumer, 'package.json');
  const divergentPackage = JSON.stringify({ name: 'divergent-consumer', scripts: {} }, null, 2);
  write(divergentPackagePath, divergentPackage);
  fs.cpSync(
    path.join(sourceRoot, 'src/app/shared/ui/atoms/choice-control'),
    path.join(divergentConsumer, 'src/app/shared/ui/atoms/choice-control'),
    { recursive: true },
  );
  write(
    path.join(divergentConsumer, 'src/app/shared/ui/atoms/choice-control/choice-control.ts'),
    'export const consumerAdaptation = true;\n',
  );
  write(
    path.join(divergentConsumer, 'src/app/shared/ui/atoms/choice-control/consumer-only.ts'),
    'export const consumerOnly = true;\n',
  );
  fs.rmSync(
    path.join(divergentConsumer, 'src/app/shared/ui/atoms/choice-control/choice-control.scss'),
  );
  const auditOnly = spawnSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), divergentConsumer, '--audit-only'],
    { encoding: 'utf8', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  if (auditOnly.status !== 0 || !auditOnly.stdout.includes('adaptation-records-required')) {
    throw new Error(`La auditoría transicional no clasificó la divergencia:\n${auditOnly.stderr}`);
  }
  if (fs.existsSync(path.join(divergentConsumer, 'docs'))) {
    throw new Error('La auditoría --audit-only modificó el consumidor divergente.');
  }
  const rejectedInstall = spawnSync(
    process.execPath,
    [path.join(atomicRoot, 'tools/install-consumer-governance.js'), divergentConsumer],
    { encoding: 'utf8', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  if (rejectedInstall.status !== 2 || !rejectedInstall.stderr.includes('decisionRecord')) {
    throw new Error('El instalador no bloqueó la adaptación sin registro de decisión.');
  }
  if (fs.readFileSync(divergentPackagePath, 'utf8') !== divergentPackage) {
    throw new Error('El instalador modificó package.json antes de rechazar la divergencia.');
  }

  write(
    path.join(divergentConsumer, 'docs/decisions/ADR-atomic-baseline.md'),
    '---\ntitle: "Línea base Atomic"\nauthor: "QA"\ndate: "2026-08-03"\n---\n',
  );
  fs.mkdirSync(path.join(divergentConsumer, 'src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(divergentConsumer, 'src/styles/themes/_tokens-components.css'),
  );
  execFileSync(
    process.execPath,
    [
      path.join(atomicRoot, 'tools/install-consumer-governance.js'),
      divergentConsumer,
      '--adaptation-decision=docs/decisions/ADR-atomic-baseline.md',
      '--change-id=ATOMIC-ADAPTATION-TEST',
    ],
    { stdio: 'pipe', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  commitRepository(divergentConsumer, 'test: adaptación instalada');
  const adaptedGate = spawnSync(
    process.execPath,
    [path.join(divergentConsumer, 'scripts/check-atomic-provenance.mjs')],
    {
      cwd: divergentConsumer,
      encoding: 'utf8',
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    },
  );
  if (adaptedGate.status !== 0) {
    throw new Error(`La adaptación aprobada no supera el gate:\n${adaptedGate.stderr}`);
  }
  const lfManifest = JSON.parse(
    fs.readFileSync(path.join(divergentConsumer, 'docs/atomic-provenance.json'), 'utf8'),
  );

  const crlfConsumer = path.join(tempRoot, 'divergent-consumer-crlf');
  initializeRepository(crlfConsumer);
  write(path.join(crlfConsumer, '.gitattributes'), '* text=auto eol=crlf\n*.bin -text\n');
  write(
    path.join(crlfConsumer, 'package.json'),
    JSON.stringify({ name: 'divergent-consumer-crlf', scripts: {} }, null, 2),
  );
  fs.cpSync(
    path.join(sourceRoot, 'src/app/shared/ui/atoms/choice-control'),
    path.join(crlfConsumer, 'src/app/shared/ui/atoms/choice-control'),
    { recursive: true },
  );
  write(
    path.join(crlfConsumer, 'src/app/shared/ui/atoms/choice-control/choice-control.ts'),
    'export const consumerAdaptation = true;\r\n',
  );
  write(
    path.join(crlfConsumer, 'src/app/shared/ui/atoms/choice-control/consumer-only.ts'),
    'export const consumerOnly = true;\r\n',
  );
  fs.rmSync(
    path.join(crlfConsumer, 'src/app/shared/ui/atoms/choice-control/choice-control.scss'),
  );
  write(
    path.join(crlfConsumer, 'docs/decisions/ADR-atomic-baseline.md'),
    '---\r\ntitle: "Línea base Atomic"\r\nauthor: "QA"\r\ndate: "2026-08-12"\r\n---\r\n',
  );
  fs.mkdirSync(path.join(crlfConsumer, 'src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(crlfConsumer, 'src/styles/themes/_tokens-components.css'),
  );
  execFileSync(
    process.execPath,
    [
      path.join(atomicRoot, 'tools/install-consumer-governance.js'),
      crlfConsumer,
      '--adaptation-decision=docs/decisions/ADR-atomic-baseline.md',
      '--change-id=ATOMIC-ADAPTATION-TEST',
    ],
    { stdio: 'pipe', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  commitRepository(crlfConsumer, 'test: adaptación CRLF instalada');
  const crlfGate = spawnSync(
    process.execPath,
    [path.join(crlfConsumer, 'scripts/check-atomic-provenance.mjs')],
    {
      cwd: crlfConsumer,
      encoding: 'utf8',
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    },
  );
  if (crlfGate.status !== 0) {
    throw new Error(`El checkout CRLF no supera el gate:\n${crlfGate.stderr}`);
  }
  const crlfManifest = JSON.parse(
    fs.readFileSync(path.join(crlfConsumer, 'docs/atomic-provenance.json'), 'utf8'),
  );
  const snapshotFor = (provenance) =>
    provenance.components.find((component) =>
      component.local.endsWith('/atoms/choice-control'),
    ).adaptationSnapshot;
  if (JSON.stringify(snapshotFor(lfManifest)) !== JSON.stringify(snapshotFor(crlfManifest))) {
    throw new Error('Los checkouts LF y CRLF produjeron snapshots de adaptación distintos.');
  }
  const nullableSnapshot = snapshotFor(lfManifest);
  if (
    !nullableSnapshot.some((entry) => entry.file === 'consumer-only.ts' && entry.atomicSha256 === null) ||
    !nullableSnapshot.some((entry) => entry.file === 'choice-control.scss' && entry.localSha256 === null)
  ) {
    throw new Error('El snapshot adaptado no preservó casos consumer-only y missing-in-consumer.');
  }

  write(
    path.join(divergentConsumer, 'src/app/shared/ui/atoms/choice-control/untracked-after.ts'),
    'export const untrackedAfter = true;\n',
  );
  const consumerOnlyGate = spawnSync(
    process.execPath,
    [path.join(divergentConsumer, 'scripts/check-atomic-provenance.mjs')],
    {
      cwd: divergentConsumer,
      encoding: 'utf8',
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    },
  );
  if (
    consumerOnlyGate.status === 0 ||
    !consumerOnlyGate.stderr.includes('El conjunto de archivos adaptados cambió')
  ) {
    throw new Error('El gate no detectó un archivo consumer-only no inventariado.');
  }
  fs.rmSync(
    path.join(divergentConsumer, 'src/app/shared/ui/atoms/choice-control/untracked-after.ts'),
  );

  write(
    path.join(divergentConsumer, 'src/app/shared/ui/atoms/choice-control/choice-control.ts'),
    'export const consumerAdaptation = false;\n',
  );
  const changedAdaptation = spawnSync(
    process.execPath,
    [path.join(divergentConsumer, 'scripts/check-atomic-provenance.mjs')],
    {
      cwd: divergentConsumer,
      encoding: 'utf8',
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    },
  );
  if (
    changedAdaptation.status === 0 ||
    !changedAdaptation.stderr.includes('Adaptación modificada sin nueva decisión')
  ) {
    throw new Error('El gate no detectó deriva posterior sobre una adaptación aprobada.');
  }

  const nestedConsumer = path.join(tempRoot, 'nested-consumer');
  initializeRepository(nestedConsumer);
  write(path.join(nestedConsumer, '.gitattributes'), '* text=auto eol=crlf\n*.bin -text\n');
  write(
    path.join(nestedConsumer, 'frontend/package.json'),
    JSON.stringify({ name: 'nested-consumer', scripts: {} }, null, 2),
  );
  fs.cpSync(
    path.join(sourceRoot, 'src/app/shared/ui/atoms/choice-control'),
    path.join(nestedConsumer, 'frontend/src/app/shared/ui/atoms/choice-control'),
    { recursive: true },
  );
  fs.mkdirSync(path.join(nestedConsumer, 'frontend/src/styles/themes'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'src/styles/themes/_tokens-components.css'),
    path.join(nestedConsumer, 'frontend/src/styles/themes/_tokens-components.css'),
  );
  execFileSync(
    process.execPath,
    [
      path.join(atomicRoot, 'tools/install-consumer-governance.js'),
      nestedConsumer,
      '--package-root=frontend',
      '--ui-root=frontend/src/app/shared/ui',
    ],
    { stdio: 'pipe', env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot } },
  );
  commitRepository(nestedConsumer, 'test: consumidor anidado instalado');
  const nestedPackage = JSON.parse(
    fs.readFileSync(path.join(nestedConsumer, 'frontend/package.json'), 'utf8'),
  );
  if (
    nestedPackage.scripts?.['check:atomic'] !==
    'node ../scripts/check-atomic-provenance.mjs --consumer-root=..'
  ) {
    throw new Error('El instalador no configuró el frontend anidado.');
  }
  const nestedGate = spawnSync(
    process.execPath,
    [
      path.join(nestedConsumer, 'scripts/check-atomic-provenance.mjs'),
      '--consumer-root=..',
    ],
    {
      cwd: path.join(nestedConsumer, 'frontend'),
      encoding: 'utf8',
      env: { ...process.env, ATOMIC_UI_ROOT: sourceRoot },
    },
  );
  if (nestedGate.status !== 0) {
    throw new Error(`El consumidor anidado no supera el gate:\n${nestedGate.stderr}`);
  }

  console.log(
    'Contrato Atomic 1.2.2 probado: referencias inmutables, fuente limpia, canonicalización ' +
      'LF/CRLF, binarios, filtros, servicios (exact/adapted), shell y workflow reforzado verificados.',
  );
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
