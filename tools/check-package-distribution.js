#!/usr/bin/env node

const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const distributionRoot = path.join(root, 'distribution');
const contractPath = path.join(distributionRoot, 'package-contract.json');
const exportsPath = path.join(distributionRoot, 'public-exports.json');
const manifestPath = path.join(distributionRoot, 'atomic-source-manifest.json');
const normalize = (value) => value.replaceAll('\\', '/');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const gitBlobOid = (content) =>
  createHash('sha1')
    .update(`blob ${content.byteLength}\0`)
    .update(content)
    .digest('hex');

function fail(message) {
  throw new Error(message);
}

function filesBelow(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(current) : [current];
  });
}

function normalizeCrlfToLf(content) {
  if (!content.includes(13)) return content;

  const normalized = Buffer.allocUnsafe(content.byteLength);
  let readOffset = 0;
  let writeOffset = 0;
  while (readOffset < content.byteLength) {
    if (
      content[readOffset] === 13 &&
      readOffset + 1 < content.byteLength &&
      content[readOffset + 1] === 10
    ) {
      normalized[writeOffset] = 10;
      writeOffset += 1;
      readOffset += 2;
      continue;
    }
    normalized[writeOffset] = content[readOffset];
    writeOffset += 1;
    readOffset += 1;
  }
  return normalized.subarray(0, writeOffset);
}

/**
 * Devuelve los bytes canónicos de una fuente sin depender del EOL materializado
 * por el checkout. Git decide si `text=auto` trata el archivo como texto. Los
 * binarios conservan sus bytes exactos y un filtro clean distinto de la
 * normalización CRLF -> LF se rechaza para no ocultar cambios semánticos.
 */
function canonicalSourceBytes(repositoryRoot, local) {
  const absolute = path.join(repositoryRoot, local);
  const physical = fs.readFileSync(absolute);
  const rawOid = gitBlobOid(physical);
  const gitResult = spawnSync(
    'git',
    ['hash-object', `--path=${normalize(local)}`, '--', absolute],
    { cwd: repositoryRoot, encoding: 'utf8' },
  );
  if (gitResult.error || gitResult.status !== 0) {
    fail(
      `No se pudo obtener la representación clean de Git para ${local}: ${
        gitResult.error?.message || gitResult.stderr || gitResult.stdout
      }`,
    );
  }

  const cleanOid = gitResult.stdout.trim();
  if (cleanOid === rawOid) return physical;

  const canonical = normalizeCrlfToLf(physical);
  if (gitBlobOid(canonical) !== cleanOid) {
    fail(
      `${local} usa una transformación clean de Git no admitida por git-clean-eol-v1. ` +
        'El manifiesto solo canoniza EOL de texto y nunca acepta filtros que alteren contenido.',
    );
  }
  return canonical;
}

function distributionFiles(contract) {
  const files = [];
  for (const sourceRoot of contract.sourceInventory.roots) {
    const absoluteRoot = path.join(root, sourceRoot.path);
    if (!fs.existsSync(absoluteRoot)) fail(`No existe la raíz inventariada: ${sourceRoot.path}`);
    for (const file of filesBelow(absoluteRoot)) {
      const local = normalize(path.relative(root, file));
      if (!sourceRoot.extensions.some((extension) => local.endsWith(extension))) continue;
      if (sourceRoot.excludeSuffixes.some((suffix) => local.endsWith(suffix))) continue;
      files.push(local);
    }
  }
  return [...new Set(files)].sort((left, right) => left.localeCompare(right, 'en'));
}

function expectedManifest(contract, packageJson) {
  const files = distributionFiles(contract).map((local) => {
    const content = canonicalSourceBytes(root, local);
    return { path: local, bytes: content.byteLength, sha256: sha256(content) };
  });
  const sourceTreeSha256 = sha256(
    files.map((file) => `${file.path}\0${file.bytes}\0${file.sha256}\n`).join(''),
  );
  return {
    schemaVersion: 1,
    packageName: contract.targetPackage,
    packageVersion: packageJson.version,
    distributionStatus: contract.status,
    algorithm: contract.sourceInventory.algorithm,
    contentCanonicalization: contract.sourceInventory.contentCanonicalization,
    sourceTreeSha256,
    fileCount: files.length,
    files,
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function stableJsonForWorkingTree(file, value) {
  const current = fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0);
  const lineEnding = current.includes(Buffer.from('\r\n')) ? '\r\n' : '\n';
  return stableJson(value).replaceAll('\n', lineEnding);
}

function validateContract(contract, publicExports, packageJson) {
  if (contract.schemaVersion !== 1) fail('package-contract.json debe usar schemaVersion 1.');
  if (contract.targetPackage !== '@hra/atomic-ui') fail('El paquete objetivo debe ser @hra/atomic-ui.');
  if (contract.versionSource !== 'package.json') fail('La versión debe provenir de package.json.');
  if (contract.status !== 'library-buildable' || contract.runtimeInstallable !== false) {
    fail('El contrato debe declarar library-buildable y no instalable hasta publicar en un registro.');
  }
  if (!packageJson.private) fail('La aplicación raíz debe permanecer privada.');

  const expectedCanonicalization = {
    scheme: 'git-clean-eol-v1',
    textLineEnding: 'lf',
    binary: 'identity',
    unsupportedCleanTransform: 'reject',
  };
  if (
    stableJson(contract.sourceInventory?.contentCanonicalization) !==
    stableJson(expectedCanonicalization)
  ) {
    fail(
      'sourceInventory.contentCanonicalization debe declarar git-clean-eol-v1, LF para texto, identidad para binarios y rechazo de otros filtros clean.',
    );
  }

  const resolvedCodes = new Set((contract.resolvedBlockers || []).map((blocker) => blocker.code));
  const legacyCodes = [
    'ANGULAR_PROJECT_IS_APPLICATION',
    'NG_PACKAGR_NOT_DECLARED',
    'PUBLIC_API_CONTAINS_APPLICATION_CONCERNS',
  ];
  for (const code of legacyCodes) {
    if (!resolvedCodes.has(code)) fail(`Falta la resolución documentada del bloqueo ${code}.`);
  }
  const blockerCodes = new Set(contract.requiredBlockers.map((blocker) => blocker.code));
  for (const code of legacyCodes) {
    if (blockerCodes.has(code)) fail(`El bloqueo ${code} está resuelto y no debe seguir listado como vigente.`);
  }
  for (const code of ['PACKAGE_NOT_PUBLISHED_TO_REGISTRY', 'RELEASE_PROVENANCE_UNSIGNED']) {
    if (!blockerCodes.has(code)) fail(`Falta el bloqueo vigente ${code}.`);
  }

  const angular = readJson(path.join(root, 'angular.json'));
  const projects = Object.values(angular.projects || {});
  if (!projects.some((project) => project.projectType === 'application')) {
    fail('La aplicación de demostración debe seguir declarada en angular.json.');
  }
  const library = contract.library || {};
  const libraryProject = (angular.projects || {})[library.workspaceProject];
  if (!libraryProject || libraryProject.projectType !== 'library') {
    fail(`angular.json no declara el proyecto library ${library.workspaceProject}.`);
  }
  if (libraryProject.architect?.build?.builder !== '@angular/build:ng-packagr') {
    fail('El proyecto library debe compilar con el builder @angular/build:ng-packagr.');
  }

  const ngPackagrDeclared = Boolean(
    packageJson.dependencies?.['ng-packagr'] || packageJson.devDependencies?.['ng-packagr'],
  );
  if (!ngPackagrDeclared) {
    fail('ng-packagr debe estar declarado en package.json para sostener el estado library-buildable.');
  }

  const ngPackagePath = path.join(root, library.projectRoot || '', 'ng-package.json');
  if (!fs.existsSync(ngPackagePath)) fail(`No existe ${library.projectRoot}/ng-package.json.`);
  const ngPackage = readJson(ngPackagePath);
  const declaredEntry = path
    .resolve(path.dirname(ngPackagePath), ngPackage.lib?.entryFile || '')
    .replaceAll('\\', '/');
  const contractEntry = path.resolve(root, library.entryFile || '').replaceAll('\\', '/');
  if (declaredEntry !== contractEntry) {
    fail('El entryFile de ng-package.json no coincide con el declarado en el contrato.');
  }
  if (!fs.existsSync(contractEntry)) fail(`No existe el entryFile de la biblioteca: ${library.entryFile}`);

  const libPackagePath = path.join(root, library.projectRoot || '', 'package.json');
  if (!fs.existsSync(libPackagePath)) fail(`No existe ${library.projectRoot}/package.json.`);
  const libPackage = readJson(libPackagePath);
  if (libPackage.name !== contract.targetPackage) {
    fail('El package.json de la biblioteca no declara el paquete objetivo.');
  }
  if (libPackage.version !== packageJson.version) {
    fail(
      `La versión de la biblioteca (${libPackage.version}) no coincide con package.json raíz (${packageJson.version}).`,
    );
  }
  if (libPackage.sideEffects !== false) fail('La biblioteca debe declarar "sideEffects": false.');
  if (!libPackage.peerDependencies?.['@angular/core']) {
    fail('La biblioteca debe declarar @angular/core como peerDependency.');
  }
  for (const dependency of Object.keys(libPackage.dependencies || {})) {
    if (dependency !== 'tslib') {
      fail(`La biblioteca solo admite tslib como dependencia runtime; se encontró ${dependency}.`);
    }
  }

  if (publicExports.schemaVersion !== 1 || publicExports.targetPackage !== contract.targetPackage) {
    fail('public-exports.json no coincide con el contrato del paquete.');
  }
  const barrelPath = path.join(root, publicExports.rootBarrel);
  if (!fs.existsSync(barrelPath)) fail(`No existe el barrel declarado: ${publicExports.rootBarrel}`);
  const barrel = fs.readFileSync(barrelPath, 'utf8');
  for (const layer of publicExports.visualLayers) {
    const layerPath = path.join(root, 'src', 'app', 'shared', 'ui', layer);
    if (!fs.existsSync(layerPath)) fail(`No existe la capa visual declarada: ${layer}`);
  }
  for (const service of publicExports.uiSupportServices) {
    if (!fs.existsSync(path.join(root, service))) fail(`No existe el servicio UI declarado: ${service}`);
  }
  for (const excluded of publicExports.excludedApplicationConcerns) {
    if (!fs.existsSync(path.join(root, excluded.source))) {
      fail(`No existe la responsabilidad excluida: ${excluded.source}`);
    }
    if (new RegExp(`\\b${excluded.symbol}\\b`).test(barrel)) {
      fail(
        `${excluded.symbol} es una preocupación de aplicación y no puede aparecer en el barrel visual (API pública de la biblioteca).`,
      );
    }
  }
  for (const exported of Object.values(publicExports.plannedPackageExports)) {
    if (
      exported.source &&
      exported.source !== 'distribution/atomic-source-manifest.json' &&
      !fs.existsSync(path.join(root, exported.source))
    ) {
      fail(`No existe la fuente del subpath planificado: ${exported.source}`);
    }
  }
}

function validateManifest(expected) {
  if (!fs.existsSync(manifestPath)) {
    fail('Falta atomic-source-manifest.json. Ejecute npm run package:manifest.');
  }
  const actual = normalizeCrlfToLf(fs.readFileSync(manifestPath)).toString('utf8');
  const wanted = stableJson(expected);
  if (actual !== wanted) {
    fail(
      'El manifiesto SHA-256 no coincide con las fuentes. Revise el cambio y ejecute npm run package:manifest si es intencional.',
    );
  }
}

function npmPackDryRun(contract, expectedManifest, packageJson) {
  const distRoot = path.resolve(root, 'dist');
  const staging = path.resolve(distRoot, 'atomic-package-dry-run');
  if (!staging.startsWith(`${distRoot}${path.sep}`)) fail('La ruta temporal salió de dist.');
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging, { recursive: true });

  const copied = {
    'PACKAGE_STATUS.md': path.join(distributionRoot, 'PACKAGE_STATUS.md'),
    'atomic-source-manifest.json': manifestPath,
    'package-contract.json': contractPath,
    'public-exports.json': exportsPath,
  };
  for (const [name, source] of Object.entries(copied)) {
    fs.copyFileSync(source, path.join(staging, name));
  }

  const stagingPackage = {
    name: contract.targetPackage,
    version: packageJson.version,
    private: true,
    type: 'module',
    description: 'Contrato y procedencia de la biblioteca Atomic UI; artefacto no ejecutable.',
    files: Object.keys(copied),
    exports: {
      './contract': './package-contract.json',
      './provenance': './atomic-source-manifest.json',
    },
    hraDistribution: {
      status: contract.status,
      runtimeInstallable: false,
      sourceTreeSha256: expectedManifest.sourceTreeSha256,
    },
  };
  fs.writeFileSync(path.join(staging, 'package.json'), stableJson(stagingPackage), 'utf8');

  const npmCli = process.env.npm_execpath;
  const command = npmCli ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const commandArgs = npmCli
    ? [npmCli, 'pack', '--dry-run', '--json', '--ignore-scripts', '--cache', path.join(distRoot, 'npm-cache')]
    : ['pack', '--dry-run', '--json', '--ignore-scripts', '--cache', path.join(distRoot, 'npm-cache')];
  const result = spawnSync(command, commandArgs, {
    cwd: staging,
    encoding: 'utf8',
    env: { ...process.env, npm_config_offline: 'true', npm_config_audit: 'false' },
  });
  if (result.status !== 0) {
    fail(`npm pack --dry-run falló sin red:\n${result.stderr || result.stdout}`);
  }
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    fail(`npm pack --dry-run no devolvió JSON válido:\n${result.stdout}`);
  }
  const packed = report[0];
  const actualFiles = (packed.files || []).map((file) => file.path).sort();
  const expectedFiles = [...contract.dryRunArtifact.allowedFiles].sort();
  if (stableJson(actualFiles) !== stableJson(expectedFiles)) {
    fail(`El dry-run incluyó archivos no autorizados:\n${stableJson(actualFiles)}`);
  }
  if (packed.name !== contract.targetPackage || packed.version !== packageJson.version) {
    fail('El nombre o la versión del dry-run no coincide con el contrato.');
  }
  const tarballs = filesBelow(staging).filter((file) => file.endsWith('.tgz'));
  if (tarballs.length > 0) fail('El dry-run creó inesperadamente un archivo .tgz.');
  return { fileCount: actualFiles.length, unpackedSize: packed.unpackedSize };
}

function main() {
  const action = process.argv[2] || 'check';
  const packageJson = readJson(path.join(root, 'package.json'));
  const contract = readJson(contractPath);
  const publicExports = readJson(exportsPath);
  validateContract(contract, publicExports, packageJson);
  const expected = expectedManifest(contract, packageJson);

  if (action === 'manifest') {
    fs.writeFileSync(manifestPath, stableJsonForWorkingTree(manifestPath, expected), 'utf8');
    console.log(
      `Manifiesto Atomic actualizado: ${expected.fileCount} archivos, SHA-256 ${expected.sourceTreeSha256}.`,
    );
    return;
  }

  validateManifest(expected);
  if (!['check', 'dry-run'].includes(action)) {
    fail('Uso: node tools/check-package-distribution.js [manifest|check|dry-run]');
  }
  const dryRun = npmPackDryRun(contract, expected, packageJson);
  console.log(
    `Contrato ${contract.status} verificado: ${expected.fileCount} fuentes con SHA-256 y dry-run privado de ${dryRun.fileCount} archivos (${dryRun.unpackedSize} bytes).`,
  );
  console.log(
    'La biblioteca compila con "npx ng build atomic-ui" (tokens: "npm run lib:build"); la publicación en registro continúa bloqueada y este resultado no la autoriza.',
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Gate de distribución rechazado: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { canonicalSourceBytes, normalizeCrlfToLf };
