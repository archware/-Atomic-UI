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

/**
 * Huella del CONTENIDO, no de los bytes en disco.
 *
 * Hasheando el buffer crudo, el manifiesto medía el fin de línea del sistema de
 * archivos: una regeneración en una estación con CRLF cambiaba 57 de 151
 * entradas, de las que solo 8 correspondían a archivos realmente modificados.
 * En 31 el delta de bytes era exactamente el número de líneas, la firma
 * inequívoca de CRLF↔LF. Un control cuyo ruido supera a su señal no es un
 * control débil: es uno que la gente aprende a ignorar, y entonces es peor que
 * ninguno. Se normaliza a LF antes de hashear para que el manifiesto vuelva a
 * medir integridad y no el sistema operativo de quien lo regeneró.
 */
function contentBytes(absolutePath) {
  const raw = fs.readFileSync(absolutePath);
  return raw.includes(0x00)
    ? raw // binario: se hashea tal cual, normalizar lo corrompería
    : Buffer.from(raw.toString('utf8').replaceAll('\r\n', '\n'), 'utf8');
}

function expectedManifest(contract, packageJson) {
  const files = distributionFiles(contract).map((local) => {
    const content = contentBytes(path.join(root, local));
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
    sourceTreeSha256,
    fileCount: files.length,
    files,
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function validateContract(contract, publicExports, packageJson) {
  if (contract.schemaVersion !== 1) fail('package-contract.json debe usar schemaVersion 1.');
  if (contract.targetPackage !== '@hra/atomic-ui') fail('El paquete objetivo debe ser @hra/atomic-ui.');
  if (contract.versionSource !== 'package.json') fail('La versión debe provenir de package.json.');
  if (contract.status !== 'blocked-scaffold' || contract.runtimeInstallable !== false) {
    fail('El scaffold debe permanecer bloqueado y no instalable hasta compilar una biblioteca real.');
  }
  if (!packageJson.private) fail('La aplicación raíz debe permanecer privada durante la transición.');

  const blockerCodes = new Set(contract.requiredBlockers.map((blocker) => blocker.code));
  const requiredCodes = [
    'ANGULAR_PROJECT_IS_APPLICATION',
    'NG_PACKAGR_NOT_DECLARED',
    'PUBLIC_API_CONTAINS_APPLICATION_CONCERNS',
  ];
  for (const code of requiredCodes) {
    if (!blockerCodes.has(code)) fail(`Falta el bloqueo verificable ${code}.`);
  }

  const angular = readJson(path.join(root, 'angular.json'));
  const projects = Object.values(angular.projects || {});
  if (!projects.some((project) => project.projectType === 'application')) {
    fail('El bloqueo ANGULAR_PROJECT_IS_APPLICATION ya no refleja el estado real.');
  }

  const ngPackagrDeclared = Boolean(
    packageJson.dependencies?.['ng-packagr'] || packageJson.devDependencies?.['ng-packagr'],
  );
  if (ngPackagrDeclared || fs.existsSync(path.join(root, 'node_modules', 'ng-packagr'))) {
    fail('ng-packagr ya está disponible; el contrato bloqueado debe migrarse a una biblioteca real.');
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
    if (!barrel.includes(excluded.symbol)) {
      fail(
        `${excluded.symbol} ya no aparece en el barrel; debe actualizarse el estado del contrato y no conservar un bloqueo obsoleto.`,
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
  const actual = fs.readFileSync(manifestPath, 'utf8');
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
    description: 'Contrato transicional no ejecutable para la futura biblioteca Atomic UI.',
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
    fs.writeFileSync(manifestPath, stableJson(expected), 'utf8');
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
    `Contrato transicional verificado: ${expected.fileCount} fuentes con SHA-256 y dry-run privado de ${dryRun.fileCount} archivos (${dryRun.unpackedSize} bytes).`,
  );
  console.log('La biblioteca Angular compilada continúa bloqueada; este resultado no autoriza publicación.');
}

try {
  main();
} catch (error) {
  console.error(`Gate de distribución rechazado: ${error.message}`);
  process.exit(1);
}
