#!/usr/bin/env node

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  canonicalSourceBytes,
  validateConfinedDeclarations,
} = require('./check-package-distribution.js');
const { CONTENT_CANONICALIZATION } = require('../governance/consumer/git-clean-eol.cjs');
const {
  expectedSourceManifest,
  stableJson,
  verifySourceManifest,
} = require('../governance/consumer/source-manifest.cjs');

const sha256 = (content) => createHash('sha256').update(content).digest('hex');

function git(repositoryRoot, args, options = {}) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    input: options.input,
  });
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message || result.stderr || result.stdout);
  }
  return result.stdout.trim();
}

function fingerprint(repositoryRoot, local) {
  const content = canonicalSourceBytes(repositoryRoot, local);
  return { bytes: content.byteLength, sha256: sha256(content) };
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, stableJson(value), 'utf8');
}

function sourceContract(sourceRoot = 'src/ui') {
  return {
    schemaVersion: 1,
    targetPackage: '@hra/atomic-ui',
    status: 'library-buildable',
    sourceInventory: {
      algorithm: 'sha256',
      contentCanonicalization: CONTENT_CANONICALIZATION,
      roots: [
        {
          path: sourceRoot,
          extensions: ['.ts', '.json'],
          excludeSuffixes: ['.spec.ts'],
        },
      ],
    },
  };
}

function initializeManifestFixture(objectFormat = 'sha1') {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), `atomic-manifest-${objectFormat}-`));
  git(fixture, [
    'init',
    '--quiet',
    ...(objectFormat === 'sha256' ? ['--object-format=sha256'] : []),
  ]);
  git(fixture, ['config', 'user.name', 'Atomic Test']);
  git(fixture, ['config', 'user.email', 'atomic-test@example.invalid']);
  git(fixture, ['config', 'core.symlinks', 'false']);
  fs.writeFileSync(path.join(fixture, '.gitattributes'), '* text=auto eol=crlf\n', 'utf8');
  fs.mkdirSync(path.join(fixture, 'src', 'ui'), { recursive: true });
  fs.writeFileSync(path.join(fixture, 'src', 'ui', 'button.ts'), 'export const value = 1;\r\n', 'utf8');
  writeJson(path.join(fixture, 'package.json'), { name: 'fixture', version: '1.0.0' });
  writeJson(
    path.join(fixture, 'distribution', 'package-contract.json'),
    sourceContract(),
  );
  git(fixture, ['add', '--all']);
  git(fixture, ['commit', '--quiet', '-m', 'fixture']);
  return fixture;
}

function declarationContract() {
  return {
    library: {
      projectRoot: 'projects/atomic-ui',
      entryFile: 'src/app/shared/ui/index.ts',
      output: 'dist/atomic-ui',
      tokensOutput: 'dist/atomic-ui/tokens/tokens.css',
    },
    sourceInventory: { roots: [{ path: 'src/app/shared/ui' }] },
    dryRunArtifact: { allowedFiles: ['package.json'] },
  };
}

function declarationExports() {
  return {
    rootBarrel: 'src/app/shared/ui/index.ts',
    visualLayers: ['atoms'],
    uiSupportServices: ['src/app/shared/ui/services/theme.service.ts'],
    excludedApplicationConcerns: [{ source: 'src/app/shared/ui/services/api.service.ts' }],
    plannedPackageExports: {
      '.': { source: 'src/app/shared/ui/index.ts' },
    },
  };
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-manifest-eol-'));

try {
  git(fixtureRoot, ['init', '--quiet']);
  fs.writeFileSync(
    path.join(fixtureRoot, '.gitattributes'),
    '* text=auto eol=crlf\n' +
      '*.bin -text\n' +
      '*.ident text ident\n' +
      '*.filtered text filter=custom\n' +
      '*.utf16 text working-tree-encoding=UTF-16LE\n',
    'utf8',
  );
  const configuredAttributes = path.join(fixtureRoot, 'configured.attributes');
  fs.writeFileSync(configuredAttributes, '*.txt -text\n', 'utf8');
  git(fixtureRoot, ['config', 'core.attributesFile', configuredAttributes]);

  const textPath = path.join(fixtureRoot, 'sample.txt');
  fs.writeFileSync(textPath, 'primera línea\nsegunda línea\n', 'utf8');
  const lf = fingerprint(fixtureRoot, 'sample.txt');

  fs.writeFileSync(textPath, 'primera línea\r\nsegunda línea\r\n', 'utf8');
  const crlf = fingerprint(fixtureRoot, 'sample.txt');
  assert.deepEqual(crlf, lf, 'LF y CRLF deben producir la misma identidad canónica.');

  fs.writeFileSync(textPath, 'primera línea\r\ncontenido distinto\r\n', 'utf8');
  const semanticChange = fingerprint(fixtureRoot, 'sample.txt');
  assert.notEqual(
    semanticChange.sha256,
    lf.sha256,
    'Un cambio semántico debe modificar la identidad canónica.',
  );

  const binaryPath = path.join(fixtureRoot, 'sample.bin');
  const binaryWithCrlf = Buffer.from([0, 65, 13, 10, 66, 255]);
  fs.writeFileSync(binaryPath, binaryWithCrlf);
  assert.deepEqual(
    canonicalSourceBytes(fixtureRoot, 'sample.bin'),
    binaryWithCrlf,
    'Los binarios deben conservar sus bytes exactos.',
  );

  fs.writeFileSync(binaryPath, Buffer.from([0, 65, 10, 66, 255]));
  assert.notEqual(
    fingerprint(fixtureRoot, 'sample.bin').sha256,
    sha256(binaryWithCrlf),
    'Una diferencia binaria CRLF/LF no debe normalizarse.',
  );

  const transformedPath = path.join(fixtureRoot, 'unsupported.ident');
  fs.writeFileSync(
    transformedPath,
    '$Id: contenido-transformado $\r\n',
    'utf8',
  );
  assert.throws(
    () => canonicalSourceBytes(fixtureRoot, 'unsupported.ident'),
    /atributo Git clean no admitido ident=set/,
    'El atributo ident debe rechazarse antes de calcular una identidad.',
  );

  const filteredPath = path.join(fixtureRoot, 'unsupported.filtered');
  fs.writeFileSync(filteredPath, 'contenido\r\n', 'utf8');
  assert.throws(
    () => canonicalSourceBytes(fixtureRoot, 'unsupported.filtered'),
    /atributo Git clean no admitido filter=custom/,
    'Un filtro clean configurado debe rechazarse aunque el driver no esté disponible.',
  );

  const encodedPath = path.join(fixtureRoot, 'unsupported.utf16');
  fs.writeFileSync(encodedPath, Buffer.from('contenido\r\n', 'utf16le'));
  assert.throws(
    () => canonicalSourceBytes(fixtureRoot, 'unsupported.utf16'),
    /atributo Git clean no admitido working-tree-encoding=UTF-16LE/,
    'Una conversión de codificación debe rechazarse de forma cerrada.',
  );

  const infoAttributes = path.resolve(
    fixtureRoot,
    git(fixtureRoot, ['rev-parse', '--git-path', 'info/attributes']),
  );
  fs.mkdirSync(path.dirname(infoAttributes), { recursive: true });
  fs.writeFileSync(infoAttributes, '*.txt -text\n', 'utf8');
  assert.throws(
    () => canonicalSourceBytes(fixtureRoot, 'sample.txt'),
    /atributos no versionados en \.git\/info\/attributes/,
    '.git/info/attributes debe rechazarse como fuente local no versionada.',
  );
  fs.rmSync(infoAttributes);

  console.log(
    'Canonización git-clean-eol-v1 verificada: LF/CRLF equivalentes, cambios semánticos detectados, binarios exactos y atributos ident/filter/encoding rechazados.',
  );
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

const declarationsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-declarations-'));
try {
  const validContract = declarationContract();
  const validExports = declarationExports();
  validateConfinedDeclarations(declarationsRoot, validContract, validExports);

  const traversalContract = structuredClone(validContract);
  traversalContract.sourceInventory.roots[0].path = '../fuera';
  assert.throws(
    () => validateConfinedDeclarations(declarationsRoot, traversalContract, validExports),
    /debe permanecer dentro de su repositorio/,
    'Una raíz de fuentes con traversal debe rechazarse antes de acceder al disco.',
  );

  const absoluteContract = structuredClone(validContract);
  absoluteContract.library.output = path.resolve(declarationsRoot, '..', 'fuera');
  assert.throws(
    () => validateConfinedDeclarations(declarationsRoot, absoluteContract, validExports),
    /debe permanecer dentro de su repositorio/,
    'Una ruta absoluta del contrato debe rechazarse.',
  );

  const driveRelativeContract = structuredClone(validContract);
  driveRelativeContract.library.entryFile = 'C:fuera.ts';
  assert.throws(
    () => validateConfinedDeclarations(declarationsRoot, driveRelativeContract, validExports),
    /debe permanecer dentro de su repositorio/,
    'Una ruta relativa a unidad de Windows debe rechazarse.',
  );

  const traversalExports = structuredClone(validExports);
  traversalExports.rootBarrel = '../../fuera.ts';
  assert.throws(
    () => validateConfinedDeclarations(declarationsRoot, validContract, traversalExports),
    /debe permanecer dentro de su repositorio/,
    'Una exportación con traversal debe rechazarse.',
  );

  const absoluteExports = structuredClone(validExports);
  absoluteExports.uiSupportServices[0] = path.resolve(declarationsRoot, '..', 'fuera.ts');
  assert.throws(
    () => validateConfinedDeclarations(declarationsRoot, validContract, absoluteExports),
    /debe permanecer dentro de su repositorio/,
    'Una exportación absoluta debe rechazarse.',
  );
} finally {
  fs.rmSync(declarationsRoot, { recursive: true, force: true });
}

for (const objectFormat of ['sha1', 'sha256']) {
  const manifestRoot = initializeManifestFixture(objectFormat);
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(manifestRoot, 'package.json'), 'utf8'));
    const contract = sourceContract();
    const expected = expectedSourceManifest(manifestRoot, contract, packageJson);
    assert.equal(expected.fileCount, 1, `${objectFormat} debe inventariar la fuente regular.`);
    assert.match(expected.sourceTreeSha256, /^[0-9a-f]{64}$/);
    writeJson(
      path.join(manifestRoot, 'distribution', 'atomic-source-manifest.json'),
      expected,
    );
    assert.deepEqual(
      verifySourceManifest(manifestRoot).expected,
      expected,
      `${objectFormat} debe verificar el manifiesto mediante el verificador compartido.`,
    );

    const inconsistent = structuredClone(expected);
    inconsistent.files[0].bytes += 1;
    writeJson(
      path.join(manifestRoot, 'distribution', 'atomic-source-manifest.json'),
      inconsistent,
    );
    assert.throws(
      () => verifySourceManifest(manifestRoot),
      /no coincide con el inventario canónico real/,
      'Un manifiesto internamente inconsistente debe rechazarse.',
    );

    const traversal = sourceContract('../fuera');
    assert.throws(
      () => expectedSourceManifest(manifestRoot, traversal, packageJson),
      /debe permanecer dentro de su repositorio/,
      'El verificador compartido debe rechazar una raíz con traversal.',
    );
    const absolute = sourceContract(path.resolve(manifestRoot, '..', 'fuera'));
    assert.throws(
      () => expectedSourceManifest(manifestRoot, absolute, packageJson),
      /debe permanecer dentro de su repositorio/,
      'El verificador compartido debe rechazar una raíz absoluta.',
    );
  } finally {
    fs.rmSync(manifestRoot, { recursive: true, force: true });
  }
}

const fsSymlinkRoot = initializeManifestFixture();
try {
  const outside = path.join(fsSymlinkRoot, 'outside');
  const linked = path.join(fsSymlinkRoot, 'src', 'ui', 'linked');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'escaped.ts'), 'export const escaped = true;\n', 'utf8');
  fs.symlinkSync(outside, linked, process.platform === 'win32' ? 'junction' : 'dir');
  const packageJson = JSON.parse(fs.readFileSync(path.join(fsSymlinkRoot, 'package.json'), 'utf8'));
  assert.throws(
    () => expectedSourceManifest(fsSymlinkRoot, sourceContract(), packageJson),
    /no admite enlaces simbólicos|atraviesa un enlace simbólico/,
    'El walker debe rechazar enlaces simbólicos físicos.',
  );
} finally {
  fs.rmSync(fsSymlinkRoot, { recursive: true, force: true });
}

const gitSymlinkRoot = initializeManifestFixture();
try {
  const local = 'src/ui/materialized-link.ts';
  const absolute = path.join(gitSymlinkRoot, ...local.split('/'));
  fs.writeFileSync(absolute, 'target.ts', 'utf8');
  const oid = git(gitSymlinkRoot, ['hash-object', '-w', '--', local]);
  git(gitSymlinkRoot, ['update-index', '--add', '--cacheinfo', `120000,${oid},${local}`]);
  assert.equal(
    fs.lstatSync(absolute).isSymbolicLink(),
    false,
    'La fixture debe representar el modo 120000 como archivo físico regular.',
  );
  const packageJson = JSON.parse(fs.readFileSync(path.join(gitSymlinkRoot, 'package.json'), 'utf8'));
  assert.throws(
    () => expectedSourceManifest(gitSymlinkRoot, sourceContract(), packageJson),
    /modo 120000/,
    'El walker debe rechazar modo 120000 en el índice aunque core.symlinks=false lo materialice regular.',
  );

  git(gitSymlinkRoot, ['commit', '--quiet', '-m', 'git symlink fixture']);
  git(gitSymlinkRoot, ['update-index', '--cacheinfo', `100644,${oid},${local}`]);
  assert.throws(
    () => expectedSourceManifest(gitSymlinkRoot, sourceContract(), packageJson),
    /modo 120000/,
    'El walker debe rechazar modo 120000 en HEAD aunque el índice ya lo presente como archivo regular.',
  );
} finally {
  fs.rmSync(gitSymlinkRoot, { recursive: true, force: true });
}

const unversionedAttributesRoot = initializeManifestFixture();
try {
  fs.writeFileSync(
    path.join(unversionedAttributesRoot, 'src', 'ui', '.gitattributes'),
    '*.ts -text\n',
    'utf8',
  );
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(unversionedAttributesRoot, 'package.json'), 'utf8'),
  );
  assert.throws(
    () => expectedSourceManifest(unversionedAttributesRoot, sourceContract(), packageJson),
    /debe estar versionado/,
    'Un .gitattributes aplicable y no versionado debe rechazarse.',
  );
} finally {
  fs.rmSync(unversionedAttributesRoot, { recursive: true, force: true });
}

const unexpectedFilterRoot = initializeManifestFixture();
try {
  fs.writeFileSync(
    path.join(unexpectedFilterRoot, 'src', 'ui', '.gitattributes'),
    '*.ts filter=custom\n',
    'utf8',
  );
  git(unexpectedFilterRoot, ['add', '--all']);
  git(unexpectedFilterRoot, ['commit', '--quiet', '-m', 'unexpected clean filter']);
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(unexpectedFilterRoot, 'package.json'), 'utf8'),
  );
  assert.throws(
    () => expectedSourceManifest(unexpectedFilterRoot, sourceContract(), packageJson),
    /atributo Git clean no admitido filter=custom/,
    'Un filtro clean versionado e inesperado debe rechazarse en el verificador compartido.',
  );
} finally {
  fs.rmSync(unexpectedFilterRoot, { recursive: true, force: true });
}

console.log(
  'Distribución endurecida: confinamiento de contrato/exportaciones, manifiesto compartido SHA-1/SHA-256, symlinks físicos/Git, overrides de atributos y divergencias rechazados.',
);
