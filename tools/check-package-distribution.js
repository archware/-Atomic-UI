#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {
  canonicalFileBytes: canonicalSourceBytes,
  normalizeCrlfToLf,
} = require('../governance/consumer/git-clean-eol.cjs');
const { confinedPath } = require('../governance/consumer/safe-paths.cjs');
const {
  expectedSourceManifest,
  loadSourceInputs,
  readConfinedFile,
  readConfinedJson,
  stableJson,
  verifySourceManifest,
} = require('../governance/consumer/source-manifest.cjs');

const root = path.resolve(__dirname, '..');
const manifestPath = confinedPath(
  root,
  'distribution/atomic-source-manifest.json',
  'manifiesto',
).absolute;
const normalize = (value) => value.replaceAll('\\', '/');

function fail(message) {
  throw new Error(message);
}

function repositoryPath(relativeValue, label, options = {}, repositoryRoot = root) {
  return confinedPath(repositoryRoot, relativeValue, label, options).absolute;
}

function resolvedRepositoryPath(absoluteValue, label, repositoryRoot = root) {
  return repositoryPath(
    normalize(path.relative(repositoryRoot, absoluteValue)),
    label,
    {},
    repositoryRoot,
  );
}

function filesBelow(directory, confinementRoot = root) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      fail(`La raíz inventariada no admite enlaces simbólicos: ${normalize(path.relative(root, current))}.`);
    }
    confinedPath(
      confinementRoot,
      normalize(path.relative(confinementRoot, current)),
      'archivo inventariado',
    );
    return entry.isDirectory() ? filesBelow(current, confinementRoot) : [current];
  });
}

function stableJsonForWorkingTree(relativeFile, value) {
  const absolute = repositoryPath(relativeFile, 'destino del manifiesto');
  const current = fs.existsSync(absolute)
    ? readConfinedFile(root, relativeFile, 'manifiesto de fuentes Atomic')
    : Buffer.alloc(0);
  const lineEnding = current.includes(Buffer.from('\r\n')) ? '\r\n' : '\n';
  return stableJson(value).replaceAll('\n', lineEnding);
}

function validateConfinedDeclarations(repositoryRoot, contract, publicExports) {
  const declaration = (value, label) => {
    if (typeof value !== 'string') fail(`${label} debe ser una ruta relativa.`);
    if (normalize(value).includes(':')) {
      fail(`${label} debe permanecer dentro de su repositorio: ${value}.`);
    }
    return confinedPath(repositoryRoot, value, label).relative;
  };

  const library = contract.library || {};
  for (const [field, value] of Object.entries({
    projectRoot: library.projectRoot,
    entryFile: library.entryFile,
    output: library.output,
    tokensOutput: library.tokensOutput,
  })) {
    declaration(value, `library.${field}`);
  }

  if (!Array.isArray(contract.sourceInventory?.roots)) {
    fail('sourceInventory.roots debe ser una lista de rutas confinadas.');
  }
  contract.sourceInventory.roots.forEach((sourceRoot, index) => {
    declaration(sourceRoot?.path, `sourceInventory.roots[${index}].path`);
  });

  if (!Array.isArray(contract.dryRunArtifact?.allowedFiles)) {
    fail('dryRunArtifact.allowedFiles debe ser una lista de rutas confinadas.');
  }
  contract.dryRunArtifact.allowedFiles.forEach((allowed, index) => {
    declaration(allowed, `dryRunArtifact.allowedFiles[${index}]`);
  });

  declaration(publicExports.rootBarrel, 'publicExports.rootBarrel');
  for (const [index, layer] of (publicExports.visualLayers || []).entries()) {
    const relative = declaration(layer, `publicExports.visualLayers[${index}]`);
    if (relative.includes('/') || relative.includes(':')) {
      fail(`publicExports.visualLayers[${index}] debe ser un nombre de capa, no una ruta.`);
    }
  }
  (publicExports.uiSupportServices || []).forEach((service, index) => {
    declaration(service, `publicExports.uiSupportServices[${index}]`);
  });
  (publicExports.excludedApplicationConcerns || []).forEach((excluded, index) => {
    declaration(excluded?.source, `publicExports.excludedApplicationConcerns[${index}].source`);
  });
  for (const [subpath, exported] of Object.entries(publicExports.plannedPackageExports || {})) {
    if (exported?.source) {
      declaration(exported.source, `publicExports.plannedPackageExports[${subpath}].source`);
    }
  }
}

function validateContract(contract, publicExports, packageJson, repositoryRoot = root) {
  validateConfinedDeclarations(repositoryRoot, contract, publicExports);
  const repoPath = (relativeValue, label, options = {}) =>
    repositoryPath(relativeValue, label, options, repositoryRoot);
  const repoJson = (relativeValue, label) =>
    readConfinedJson(repositoryRoot, relativeValue, label);
  const resolvedPath = (absoluteValue, label) =>
    resolvedRepositoryPath(absoluteValue, label, repositoryRoot);

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

  const angular = repoJson('angular.json', 'angular.json');
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

  const projectRoot = confinedPath(
    repositoryRoot,
    library.projectRoot || '',
    'library.projectRoot',
  ).relative;
  const ngPackagePath = repoPath(`${projectRoot}/ng-package.json`, 'ng-package.json');
  if (!fs.existsSync(ngPackagePath)) fail(`No existe ${library.projectRoot}/ng-package.json.`);
  const ngPackage = repoJson(`${projectRoot}/ng-package.json`, 'ng-package.json');
  const declaredEntry = resolvedPath(
    path.resolve(path.dirname(ngPackagePath), ngPackage.lib?.entryFile || ''),
    'lib.entryFile de ng-package.json',
  );
  const contractEntry = repoPath(library.entryFile || '', 'library.entryFile');
  if (declaredEntry !== contractEntry) {
    fail('El entryFile de ng-package.json no coincide con el declarado en el contrato.');
  }
  if (!fs.existsSync(contractEntry)) fail(`No existe el entryFile de la biblioteca: ${library.entryFile}`);

  const libPackagePath = repoPath(`${projectRoot}/package.json`, 'package.json library');
  if (!fs.existsSync(libPackagePath)) fail(`No existe ${library.projectRoot}/package.json.`);
  const libPackage = repoJson(`${projectRoot}/package.json`, 'package.json library');
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
  const barrelPath = repoPath(publicExports.rootBarrel || '', 'rootBarrel');
  if (!fs.existsSync(barrelPath)) fail(`No existe el barrel declarado: ${publicExports.rootBarrel}`);
  const barrel = readConfinedFile(
    repositoryRoot,
    publicExports.rootBarrel,
    'barrel público',
  ).toString('utf8');
  for (const layer of publicExports.visualLayers) {
    const layerPath = repoPath(`src/app/shared/ui/${layer}`, `capa visual ${layer}`);
    if (!fs.existsSync(layerPath) || !fs.lstatSync(layerPath).isDirectory()) {
      fail(`No existe la capa visual declarada como directorio regular: ${layer}`);
    }
  }
  for (const service of publicExports.uiSupportServices) {
    if (!fs.existsSync(repoPath(service, `servicio UI ${service}`))) {
      fail(`No existe el servicio UI declarado: ${service}`);
    }
    readConfinedFile(repositoryRoot, service, `servicio UI ${service}`);
  }
  for (const excluded of publicExports.excludedApplicationConcerns) {
    if (!fs.existsSync(repoPath(excluded.source || '', `fuente excluida ${excluded.symbol}`))) {
      fail(`No existe la responsabilidad excluida: ${excluded.source}`);
    }
    readConfinedFile(
      repositoryRoot,
      excluded.source,
      `fuente excluida ${excluded.symbol}`,
    );
    if (typeof excluded.symbol !== 'string' || !/^[A-Za-z_$][\w$]*$/.test(excluded.symbol)) {
      fail(`El símbolo excluido debe ser un identificador válido: ${excluded.symbol}.`);
    }
    if (new RegExp(`\\b${excluded.symbol}\\b`).test(barrel)) {
      fail(
        `${excluded.symbol} es una preocupación de aplicación y no puede aparecer en el barrel visual (API pública de la biblioteca).`,
      );
    }
  }
  for (const exported of Object.values(publicExports.plannedPackageExports)) {
    if (exported.source) {
      if (!fs.existsSync(repoPath(exported.source, 'fuente de exportación'))) {
        fail(`No existe la fuente del subpath planificado: ${exported.source}`);
      }
      readConfinedFile(repositoryRoot, exported.source, 'fuente de exportación');
    }
  }
}

function npmPackDryRun(contract, expectedManifest, packageJson, publicExports) {
  const distRoot = repositoryPath('dist', 'directorio dist');
  const staging = repositoryPath('dist/atomic-package-dry-run', 'directorio dry-run');
  if (!staging.startsWith(`${distRoot}${path.sep}`)) fail('La ruta temporal salió de dist.');
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging, { recursive: true });

  const copied = {
    'PACKAGE_STATUS.md': 'distribution/PACKAGE_STATUS.md',
    'atomic-source-manifest.json': 'distribution/atomic-source-manifest.json',
    'package-contract.json': 'distribution/package-contract.json',
    'public-exports.json': 'distribution/public-exports.json',
  };
  const copiedSnapshots = new Map();
  for (const [name, source] of Object.entries(copied)) {
    const content = readConfinedFile(root, source, `artefacto de distribución ${source}`);
    copiedSnapshots.set(source, content);
    fs.writeFileSync(path.join(staging, name), content);
  }

  const parsedContract = JSON.parse(copiedSnapshots.get('distribution/package-contract.json'));
  const parsedManifest = JSON.parse(
    copiedSnapshots.get('distribution/atomic-source-manifest.json'),
  );
  const parsedExports = JSON.parse(copiedSnapshots.get('distribution/public-exports.json'));
  if (stableJson(parsedContract) !== stableJson(contract)) {
    fail('El contrato de distribución cambió entre su validación y el dry-run.');
  }
  if (stableJson(parsedManifest) !== stableJson(expectedManifest)) {
    fail('El manifiesto de distribución cambió entre su validación y el dry-run.');
  }
  if (stableJson(parsedExports) !== stableJson(publicExports)) {
    fail('Las exportaciones públicas cambiaron entre su validación y el dry-run.');
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

  const bundledNpmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const npmCli = process.env.npm_execpath || (fs.existsSync(bundledNpmCli) ? bundledNpmCli : null);
  const command = npmCli ? process.execPath : 'npm';
  const packArgs = [
    'pack',
    '--dry-run',
    '--json',
    '--ignore-scripts',
    '--cache',
    path.join(distRoot, 'npm-cache'),
  ];
  const commandArgs = npmCli ? [npmCli, ...packArgs] : packArgs;
  const result = spawnSync(command, commandArgs, {
    cwd: staging,
    encoding: 'utf8',
    env: { ...process.env, npm_config_offline: 'true', npm_config_audit: 'false' },
  });
  if (result.status !== 0) {
    fail(
      `npm pack --dry-run falló sin red (status=${result.status}, signal=${result.signal || 'none'}):\n${
        result.error?.message || result.stderr || result.stdout || 'sin salida de diagnóstico'
      }`,
    );
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
  for (const [source, snapshot] of copiedSnapshots) {
    const current = readConfinedFile(root, source, `artefacto de distribución ${source}`);
    if (!current.equals(snapshot)) {
      fail(`El artefacto de distribución cambió durante el dry-run: ${source}.`);
    }
  }
  return { fileCount: actualFiles.length, unpackedSize: packed.unpackedSize };
}

function main() {
  const action = process.argv[2] || 'check';
  if (!['manifest', 'check', 'dry-run'].includes(action)) {
    fail('Uso: node tools/check-package-distribution.js [manifest|check|dry-run]');
  }

  const publicExports = readConfinedJson(
    root,
    'distribution/public-exports.json',
    'exportaciones públicas',
  );

  let contract;
  let expected;
  let packageJson;
  if (action === 'manifest') {
    ({ contract, packageJson } = loadSourceInputs(root));
    validateContract(contract, publicExports, packageJson);
    expected = expectedSourceManifest(root, contract, packageJson);
  } else {
    ({ contract, expected, packageJson } = verifySourceManifest(root));
    validateContract(contract, publicExports, packageJson);
  }

  if (action === 'manifest') {
    const serialized = stableJsonForWorkingTree(
      'distribution/atomic-source-manifest.json',
      expected,
    );
    const target = confinedPath(
      root,
      'distribution/atomic-source-manifest.json',
      'destino del manifiesto',
    ).absolute;
    if (target !== manifestPath) fail('El destino del manifiesto cambió durante su generación.');
    fs.writeFileSync(target, serialized, 'utf8');
    console.log(
      `Manifiesto Atomic actualizado: ${expected.fileCount} archivos, SHA-256 ${expected.sourceTreeSha256}.`,
    );
    return;
  }

  const dryRun = npmPackDryRun(contract, expected, packageJson, publicExports);
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

module.exports = {
  canonicalSourceBytes,
  normalizeCrlfToLf,
  validateConfinedDeclarations,
};
