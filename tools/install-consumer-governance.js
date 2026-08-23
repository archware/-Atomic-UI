#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  CONTENT_CANONICALIZATION,
  canonicalFileObjectId,
  canonicalFileSha256,
  expectedObjectIdLength,
  repositoryIdentity,
} = require('../governance/consumer/git-clean-eol.cjs');
const { confinedPath, relativePath } = require('../governance/consumer/safe-paths.cjs');
const { verifySourceManifest } = require('../governance/consumer/source-manifest.cjs');

const atomicRoot = fs.realpathSync.native(
  path.resolve(process.env.ATOMIC_UI_ROOT || path.resolve(__dirname, '..')),
);
const layers = ['atoms', 'molecules', 'organisms', 'surfaces', 'templates'];
const requiredGovernedServices = [
  'theme.service.ts',
  'app-version.service.ts',
  'modal.service.ts',
  'popup.service.ts',
  'toast.service.ts',
];
const atomicServicesRoot = 'src/app/shared/ui/services';
const governanceCopies = [
  ['governance/consumer/ATOMIC_GOVERNANCE.md', 'docs/ATOMIC_GOVERNANCE.md'],
  ['governance/consumer/check-atomic-provenance.mjs', 'scripts/check-atomic-provenance.mjs'],
  ['governance/consumer/git-clean-eol.cjs', 'scripts/git-clean-eol.cjs'],
  ['governance/consumer/safe-paths.cjs', 'scripts/safe-paths.cjs'],
  ['governance/consumer/read-atomic-contract.cjs', 'scripts/read-atomic-contract.cjs'],
  ['governance/consumer/source-manifest.cjs', 'scripts/source-manifest.cjs'],
  ['governance/consumer/atomic-governance.yml', '.github/workflows/atomic-governance.yml'],
];

const normalize = (value) => value.replaceAll('\\', '/');
const CANONICAL_ATTRIBUTES_RULE = '* text=auto eol=crlf';

function option(name, fallback) {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((argument) => argument.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

function attributePlan(consumerRoot) {
  const relative = '.gitattributes';
  const absolute = confinedPath(consumerRoot, relative, relative).absolute;
  const exists = fs.existsSync(absolute);
  const original = exists ? fs.readFileSync(absolute) : null;
  const current = original?.toString('utf8') || '';
  const firstRule = current
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#'));
  const content = firstRule === CANONICAL_ATTRIBUTES_RULE
    ? current
    : `${CANONICAL_ATTRIBUTES_RULE}\n${current}`;
  return { absolute, content: Buffer.from(content || `${CANONICAL_ATTRIBUTES_RULE}\n`), original };
}

function withPlannedAttributeSource(callback) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-planned-attributes-'));
  const plannedAttributesFile = path.join(temporaryRoot, 'attributes');
  fs.writeFileSync(plannedAttributesFile, `${CANONICAL_ATTRIBUTES_RULE}\n`, 'utf8');
  try {
    return callback(plannedAttributesFile);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function applyFileTransaction(consumerRoot, plannedFiles) {
  const transactionId = randomUUID();
  const plans = [...plannedFiles.entries()].map(([relative, content], index) => {
    const absolute = confinedPath(consumerRoot, relative, `destino ${relative}`).absolute;
    const stat = fs.existsSync(absolute) ? fs.lstatSync(absolute) : null;
    if (stat && (!stat.isFile() || stat.isSymbolicLink())) {
      throw new Error(`El destino debe ser un archivo regular: ${relative}.`);
    }
    const directory = path.dirname(absolute);
    const base = path.basename(absolute);
    const staged = path.join(directory, `.${base}.atomic-${transactionId}-${index}.tmp`);
    const backup = path.join(directory, `.${base}.atomic-${transactionId}-${index}.bak`);
    confinedPath(
      consumerRoot,
      normalize(path.relative(consumerRoot, staged)),
      `temporal ${relative}`,
    );
    confinedPath(
      consumerRoot,
      normalize(path.relative(consumerRoot, backup)),
      `respaldo ${relative}`,
    );
    return {
      absolute,
      backup,
      content: Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8'),
      existed: Boolean(stat),
      relative,
      staged,
    };
  });
  const createdDirectories = [];
  const applied = [];
  try {
    for (const plan of plans) {
      let directory = path.dirname(plan.absolute);
      const pendingDirectories = [];
      while (!fs.existsSync(directory)) {
        pendingDirectories.push(directory);
        directory = path.dirname(directory);
      }
      fs.mkdirSync(path.dirname(plan.absolute), { recursive: true });
      createdDirectories.push(...pendingDirectories);
      if (process.env.ATOMIC_GOVERNANCE_TEST_FAIL_WRITE_AT === plan.relative) {
        const partialLength = Math.max(1, Math.floor(plan.content.byteLength / 2));
        fs.writeFileSync(plan.staged, plan.content.subarray(0, partialLength));
        throw new Error(`Fallo de escritura inyectado para ${plan.relative}.`);
      }
      fs.writeFileSync(plan.staged, plan.content);
    }
    for (const plan of plans) {
      const state = { backupMoved: false, destinationInstalled: false, plan };
      applied.push(state);
      if (plan.existed) {
        fs.renameSync(plan.absolute, plan.backup);
        state.backupMoved = true;
      }
      fs.renameSync(plan.staged, plan.absolute);
      state.destinationInstalled = true;
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const state of applied.reverse()) {
      try {
        if (state.destinationInstalled) fs.rmSync(state.plan.absolute, { force: true });
        if (state.backupMoved) fs.renameSync(state.plan.backup, state.plan.absolute);
      } catch (rollbackError) {
        rollbackErrors.push(`${state.plan.relative}: ${rollbackError.message}`);
      }
    }
    for (const plan of plans) {
      try {
        fs.rmSync(plan.staged, { force: true });
        if (fs.existsSync(plan.backup) && !fs.existsSync(plan.absolute)) {
          fs.renameSync(plan.backup, plan.absolute);
        }
        if (fs.existsSync(plan.backup)) {
          rollbackErrors.push(`Respaldo pendiente para ${plan.relative}: ${plan.backup}`);
        }
      } catch (rollbackError) {
        rollbackErrors.push(`${plan.relative}: ${rollbackError.message}`);
      }
    }
    for (const directory of [...new Set(createdDirectories)].sort((left, right) => right.length - left.length)) {
      try {
        fs.rmdirSync(directory);
      } catch {
        // Se conserva un directorio si no está vacío o si otro proceso lo usa.
      }
    }
    if (rollbackErrors.length > 0) {
      throw new Error(`${error.message} Rollback incompleto: ${rollbackErrors.join('; ')}`);
    }
    throw error;
  }
  for (const plan of plans) {
    try {
      fs.rmSync(plan.backup, { force: true });
      fs.rmSync(plan.staged, { force: true });
    } catch {
      // La transacción ya está confirmada; un respaldo huérfano no sustituye datos vigentes.
    }
  }
}

function filesBelow(root, base = root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(root, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`La superficie gobernada no admite enlaces simbólicos: ${current}.`);
    }
    return entry.isDirectory() ? filesBelow(current, base) : [normalize(path.relative(base, current))];
  }).sort((left, right) => left.localeCompare(right, 'en'));
}

const digest = (repositoryRoot, file, options = {}) =>
  canonicalFileSha256(repositoryRoot, file, options);

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: atomicRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function pathspecBatches(pathspecs, maximumArgumentBytes = 8192) {
  const batches = [];
  let current = [];
  let currentBytes = 0;
  for (const pathspec of pathspecs) {
    const pathspecBytes = Buffer.byteLength(pathspec, 'utf8') + 3;
    if (current.length > 0 && currentBytes + pathspecBytes > maximumArgumentBytes) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(pathspec);
    currentBytes += pathspecBytes;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

function gitForPathspecs(prefix, pathspecs) {
  return pathspecBatches(pathspecs).map((batch) =>
    git(['--literal-pathspecs', ...prefix, '--', ...batch]),
  );
}

function assertCanonicalAtomicRemote() {
  const remote = git(['remote', 'get-url', 'origin']);
  const accepted = new Set([
    'https://github.com/archware/-Atomic-UI.git',
    'https://github.com/archware/-Atomic-UI',
    'git@github.com:archware/-Atomic-UI.git',
    'ssh://git@github.com/archware/-Atomic-UI.git',
  ]);
  if (!accepted.has(remote)) {
    throw new Error('El remoto origin de Atomic debe ser exactamente archware/-Atomic-UI en GitHub.');
  }
}

function assertAtomicSourceClean(pathspecs, reference) {
  const protectedFiles = [...new Set(pathspecs.map((local) =>
    relativePath(atomicRoot, local, 'ruta propagable Atomic'),
  ))].sort();
  const treeEntries = new Map();
  for (const output of gitForPathspecs(
    ['ls-tree', '-r', '-z', '--full-tree', reference],
    protectedFiles,
  )) {
    for (const entry of output.split('\0').filter(Boolean)) {
      const match = /^(\d{6})\s+blob\s+([0-9a-f]+)\t(.+)$/.exec(entry);
      if (match) {
        treeEntries.set(normalize(match[3]), { mode: match[1], oid: match[2] });
      }
    }
  }
  for (const local of protectedFiles) {
    const treeEntry = treeEntries.get(local);
    if (!treeEntry || !['100644', '100755'].includes(treeEntry.mode)) {
      throw new Error(
        `La ruta propagable Atomic debe existir en ${reference} como archivo regular: ${local}.`,
      );
    }
    const absolute = confinedPath(atomicRoot, local, `ruta propagable ${local}`).absolute;
    const stat = fs.lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(`La ruta propagable Atomic no puede ser un enlace: ${local}.`);
    }
    const physicalOid = canonicalFileObjectId(atomicRoot, absolute);
    if (physicalOid !== treeEntry.oid) {
      throw new Error(
        `Los bytes físicos Atomic no coinciden con ${reference} para ${local}: ` +
          `${physicalOid} != ${treeEntry.oid}.`,
      );
    }
  }
  const dirty = gitForPathspecs(
    ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignored=matching'],
    protectedFiles,
  ).join('');
  if (dirty) {
    throw new Error(
      `La fuente Atomic contiene cambios sin confirmar en rutas propagables: ${dirty
        .split('\0')
        .filter(Boolean)
        .join(', ')}`,
    );
  }
}

function protectedAtomicSources(sourceManifest, auditedComponents, auditedServices) {
  const protectedFiles = new Set([
    '.gitattributes',
    'package.json',
    'distribution/package-contract.json',
    'distribution/atomic-source-manifest.json',
    'governance/consumer/AGENTS.template.md',
    '.node-version',
    '.nvmrc',
  ]);
  for (const [source] of governanceCopies) protectedFiles.add(source);
  for (const file of sourceManifest.files || []) protectedFiles.add(file.path);
  for (const component of auditedComponents) {
    for (const file of component.files) protectedFiles.add(`${component.atomic}/${file}`);
  }
  for (const service of auditedServices) {
    protectedFiles.add(`${atomicServicesRoot}/${service.file}`);
  }
  return [...protectedFiles];
}

function auditComponents(consumerRoot, uiRoot, consumerDigestOptions = {}) {
  const absoluteUiRoot = confinedPath(consumerRoot, uiRoot, 'raíz UI consumidora').absolute;
  const components = [];
  for (const layer of layers) {
    const localLayer = confinedPath(consumerRoot, `${uiRoot}/${layer}`, `capa ${layer}`).absolute;
    if (!fs.existsSync(localLayer)) continue;
    for (const entry of fs.readdirSync(localLayer, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) {
        throw new Error(`La capa gobernada no admite enlaces simbólicos: ${entry.name}.`);
      }
      if (!entry.isDirectory()) continue;
      const local = normalize(path.join(uiRoot, layer, entry.name));
      const atomic = normalize(path.join('src/app/shared/ui', layer, entry.name));
      const localRoot = confinedPath(consumerRoot, local, `componente consumidor ${local}`).absolute;
      const sourceRoot = confinedPath(atomicRoot, atomic, `componente Atomic ${atomic}`).absolute;
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
        } else if (
          digest(consumerRoot, localFile, consumerDigestOptions) !== digest(atomicRoot, sourceFile)
        ) {
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
            ? digest(consumerRoot, path.join(localRoot, file), consumerDigestOptions)
            : null,
          atomicSha256: fs.existsSync(path.join(sourceRoot, file))
            ? digest(atomicRoot, path.join(sourceRoot, file))
            : null,
        })),
      });
    }
  }
  return components;
}

function auditServices(consumerRoot, uiRoot, consumerDigestOptions = {}) {
  const services = [];
  for (const file of requiredGovernedServices) {
    const localFile = confinedPath(
      consumerRoot,
      `${uiRoot}/services/${file}`,
      `servicio consumidor ${file}`,
    ).absolute;
    const atomicFile = confinedPath(
      atomicRoot,
      `${atomicServicesRoot}/${file}`,
      `servicio Atomic ${file}`,
    ).absolute;
    if (!fs.existsSync(atomicFile)) {
      throw new Error(`No existe fuente Atomic para el servicio gobernado: ${atomicServicesRoot}/${file}`);
    }
    if (!fs.existsSync(localFile)) {
      services.push({ file, classification: 'missing-in-consumer' });
    } else if (
      digest(consumerRoot, localFile, consumerDigestOptions) !== digest(atomicRoot, atomicFile)
    ) {
      services.push({
        file,
        classification: 'adaptation-required',
        localSha256: digest(consumerRoot, localFile, consumerDigestOptions),
        atomicSha256: digest(atomicRoot, atomicFile),
      });
    } else {
      services.push({ file, classification: 'exact' });
    }
  }
  return services;
}

function atomicRef() {
  try {
    const { objectFormat } = repositoryIdentity(atomicRoot);
    const reference = git(['rev-parse', 'HEAD']);
    if (!new RegExp(`^[0-9a-f]{${expectedObjectIdLength(objectFormat)}}$`, 'i').test(reference)) {
      throw new Error(`Atomic no devolvió un OID completo para el formato ${objectFormat}.`);
    }
    return reference;
  } catch (error) {
    throw new Error(`No se pudo fijar el commit inmutable de Atomic: ${error.message}`);
  }
}

function atomicIdentity(verification) {
  const { expected: sourceManifest, packageJson } = verification;
  if (!packageJson.version?.trim() || !sourceManifest.sourceTreeSha256?.trim()) {
    throw new Error('La identidad versionada de Atomic est\u00e1 incompleta.');
  }
  return {
    atomicVersion: packageJson.version,
    atomicSourceTreeSha256: sourceManifest.sourceTreeSha256,
  };
}

function agentPolicyContent(consumerRoot) {
  const agentsPath = confinedPath(consumerRoot, 'AGENTS.md', 'AGENTS.md').absolute;
  const templatePath = confinedPath(
    atomicRoot,
    'governance/consumer/AGENTS.template.md',
    'plantilla AGENTS.md',
  ).absolute;
  const template = fs.readFileSync(templatePath, 'utf8');
  if (!fs.existsSync(agentsPath)) {
    return template;
  }

  const current = fs.readFileSync(agentsPath, 'utf8');
  return current.includes('ATOMIC_GOVERNANCE_REQUIRED') ? current : `${current}\n\n${template}`;
}

function main() {
  const consumerArg = process.argv.slice(2).find((argument) => !argument.startsWith('--'));
  if (!consumerArg) {
    console.error('Uso: npm run governance:install -- <ruta-consumidor> [--ui-root=src/app/shared/ui]');
    process.exit(1);
  }

  let consumerRoot;
  let packageRoot;
  let uiRoot;
  try {
    consumerRoot = fs.realpathSync.native(path.resolve(consumerArg));
    const consumerRepository = repositoryIdentity(consumerRoot);
    if (consumerRepository.topLevel !== consumerRoot) {
      throw new Error('La ruta consumidora debe ser exactamente la raíz de su repositorio Git.');
    }
    packageRoot = relativePath(
      consumerRoot,
      option('package-root', '.'),
      'package-root',
      { allowDot: true },
    );
    uiRoot = relativePath(
      consumerRoot,
      option('ui-root', 'src/app/shared/ui'),
      'ui-root',
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  const shellRoot =
    (uiRoot.endsWith('/shared/ui')
      ? uiRoot.slice(0, -'/shared/ui'.length)
      : normalize(path.dirname(uiRoot))) || '.';
  let packagePath;
  let absoluteUiRoot;
  let manifestPath;
  try {
    packagePath = confinedPath(
      consumerRoot,
      `${packageRoot === '.' ? '' : `${packageRoot}/`}package.json`,
      'package.json consumidor',
    ).absolute;
    absoluteUiRoot = confinedPath(consumerRoot, uiRoot, 'raíz UI consumidora').absolute;
    manifestPath = confinedPath(
      consumerRoot,
      'docs/atomic-provenance.json',
      'manifiesto consumidor',
    ).absolute;
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  const auditOnly = process.argv.includes('--audit-only');
  const adaptationDecisionOption = option('adaptation-decision', '');
  let adaptationDecision = '';
  try {
    if (adaptationDecisionOption) {
      adaptationDecision = relativePath(
        consumerRoot,
        adaptationDecisionOption,
        'adaptation-decision',
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  const changeId = option('change-id', 'ATOMIC-BOOTSTRAP');
  let identity;
  let reference;
  let sourceVerification;

  try {
    if (repositoryIdentity(atomicRoot).topLevel !== atomicRoot) {
      throw new Error('ATOMIC_UI_ROOT debe ser exactamente la raíz del repositorio Git Atomic.');
    }
    assertCanonicalAtomicRemote();
    sourceVerification = verifySourceManifest(atomicRoot);
    identity = atomicIdentity(sourceVerification);
    reference = atomicRef();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (!fs.existsSync(packagePath) || !fs.existsSync(absoluteUiRoot)) {
    console.error('El consumidor debe contener package.json y la raíz UI indicada.');
    process.exit(1);
  }

  let packageJson;
  let existingManifest = null;
  let attributes;
  try {
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    attributes = attributePlan(consumerRoot);
    if (fs.existsSync(manifestPath)) {
      const manifestStat = fs.lstatSync(manifestPath);
      if (!manifestStat.isFile() || manifestStat.isSymbolicLink()) {
        throw new Error('El manifiesto consumidor debe ser un archivo regular.');
      }
      existingManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (
        existingManifest.components !== undefined &&
        !Array.isArray(existingManifest.components)
      ) {
        throw new Error('components debe ser un arreglo en el manifiesto consumidor.');
      }
      if (
        existingManifest.tokens !== undefined &&
        (existingManifest.tokens === null ||
          typeof existingManifest.tokens !== 'object' ||
          Array.isArray(existingManifest.tokens))
      ) {
        throw new Error('tokens debe ser un objeto en el manifiesto consumidor.');
      }
      const requiredTokens = existingManifest.tokens?.required;
      if (
        requiredTokens !== undefined &&
        (!Array.isArray(requiredTokens) ||
          requiredTokens.some(
            (token) => typeof token !== 'string' || !/^--[a-z0-9-]+$/.test(token),
          ))
      ) {
        throw new Error(
          'tokens.required debe ser un arreglo de nombres de propiedades personalizadas CSS.',
        );
      }
    }
  } catch (error) {
    console.error(`No se pudo prevalidar el consumidor: ${error.message}`);
    process.exit(1);
  }

  let auditedComponents;
  let auditedServices;
  try {
    [auditedComponents, auditedServices] = withPlannedAttributeSource((plannedAttributesFile) => {
      const consumerDigestOptions = { plannedAttributesFile };
      const components = auditComponents(consumerRoot, uiRoot, consumerDigestOptions);
      const services = auditServices(consumerRoot, uiRoot, consumerDigestOptions);
      assertAtomicSourceClean(
        protectedAtomicSources(sourceVerification.expected, components, services),
        reference,
      );
      return [components, services];
    });
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
  const serviceAdaptations = auditedServices.filter(
    (service) => service.classification === 'adaptation-required',
  );
  const pendingAdaptations = adaptations.length + serviceAdaptations.length;
  const auditReport = {
    schemaVersion: 1,
    policyVersion: '1.2.2',
    status: pendingAdaptations === 0 ? 'exact' : 'adaptation-records-required',
    atomicRef: reference,
    ...identity,
    consumerRoot: normalize(consumerRoot),
    packageRoot,
    uiRoot,
    shellRoot,
    exactCount: exactComponents.length,
    adaptationRequiredCount: adaptations.length,
    serviceAdaptationRequiredCount: serviceAdaptations.length,
    components: auditedComponents.map((component) => ({
      local: component.local,
      atomic: component.atomic,
      classification: component.classification,
      differences: component.differences,
    })),
    governedServices: auditedServices.map((service) => ({
      file: service.file,
      classification: service.classification,
    })),
  };
  if (auditOnly) {
    console.log(JSON.stringify(auditReport, null, 2));
    return;
  }
  if (pendingAdaptations > 0 && adaptationDecision) {
    let decisionPath;
    try {
      decisionPath = confinedPath(
        consumerRoot,
        adaptationDecision,
        'adaptation-decision',
      ).absolute;
    } catch (error) {
      console.error(error.message);
      process.exit(2);
    }
    if (!fs.existsSync(decisionPath) || !fs.lstatSync(decisionPath).isFile()) {
      console.error('El registro de decisión Atomic debe existir dentro del consumidor.');
      process.exit(2);
    }
  }
  if (pendingAdaptations > 0 && !adaptationDecision) {
    console.error(JSON.stringify(auditReport, null, 2));
    console.error(
      'Instalación detenida antes de modificar el consumidor. Cada divergencia requiere una justificación y un decisionRecord concretos; el instalador no los genera automáticamente.',
    );
    process.exit(2);
  }

  const plannedFiles = new Map([['.gitattributes', attributes.content]]);
  for (const [source, destination] of governanceCopies) {
    const sourcePath = confinedPath(atomicRoot, source, `fuente ${source}`).absolute;
    plannedFiles.set(destination, fs.readFileSync(sourcePath));
  }
  for (const versionFile of ['.node-version', '.nvmrc']) {
    const destination = confinedPath(consumerRoot, versionFile, versionFile).absolute;
    if (!fs.existsSync(destination)) {
      plannedFiles.set(
        versionFile,
        fs.readFileSync(confinedPath(atomicRoot, versionFile, versionFile).absolute),
      );
    }
  }
  for (const service of auditedServices) {
    if (service.classification !== 'missing-in-consumer') continue;
    plannedFiles.set(
      `${uiRoot}/services/${service.file}`,
      fs.readFileSync(
        confinedPath(
          atomicRoot,
          `${atomicServicesRoot}/${service.file}`,
          `servicio Atomic ${service.file}`,
        ).absolute,
      ),
    );
    service.classification = 'exact';
  }
  plannedFiles.set('AGENTS.md', agentPolicyContent(consumerRoot));

  const existingComponentsByLocal = new Map(
    (existingManifest?.components || [])
      .filter((component) => component && typeof component.local === 'string')
      .map((component) => [component.local, component]),
  );
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
    const existingComponent = existingComponentsByLocal.get(component.local);
    let preservedAdaptation = false;
    if (
      existingComponent?.mode === 'adapted' &&
      existingComponent.atomic === component.atomic &&
      typeof existingComponent.justification === 'string' &&
      existingComponent.justification.trim() &&
      typeof existingComponent.decisionRecord === 'string' &&
      existingComponent.decisionRecord.trim() &&
      JSON.stringify(existingComponent.adaptationSnapshot) === JSON.stringify(component.snapshot)
    ) {
      try {
        const existingDecisionPath = confinedPath(
          consumerRoot,
          existingComponent.decisionRecord,
          `decisionRecord de ${component.local}`,
        ).absolute;
        const decisionStat = fs.existsSync(existingDecisionPath)
          ? fs.lstatSync(existingDecisionPath)
          : null;
        preservedAdaptation = Boolean(
          decisionStat && decisionStat.isFile() && !decisionStat.isSymbolicLink(),
        );
      } catch {
        preservedAdaptation = false;
      }
    }
    return {
      local: component.local,
      atomic: component.atomic,
      mode: 'adapted',
      justification: preservedAdaptation
        ? existingComponent.justification
        : `Línea base auditada: ${component.differences.length} diferencia(s) ` +
          `de tipo ${kinds.join(', ')}. La adaptación se conserva hasta su migración funcional.`,
      decisionRecord: preservedAdaptation
        ? existingComponent.decisionRecord
        : adaptationDecision,
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

  const governedServices = auditedServices.map((service) =>
    service.classification === 'exact'
      ? { file: service.file, mode: 'exact' }
      : {
          file: service.file,
          mode: 'adapted',
          localSha256: service.localSha256,
          atomicSha256: service.atomicSha256,
        },
  );

  const manifest = {
    schemaVersion: 1,
    policyVersion: '1.2.2',
    changeId,
    atomicRepository: normalize(path.relative(consumerRoot, atomicRoot)),
    atomicRemote: 'archware/-Atomic-UI',
    atomicRef: reference,
    ...identity,
    contentCanonicalization: CONTENT_CANONICALIZATION,
    packageRoot,
    uiRoots: [uiRoot],
    shellRoot,
    featureRoots: [
      `${packagePrefix}src/app/features`,
      `${packagePrefix}src/app/pages`,
      `${packagePrefix}src/app/dashboard`,
    ],
    layers,
    components,
    governedServices,
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
      consumer: `${packagePrefix}src/styles/themes/_tokens-components.css`,
      required: [...(existingManifest?.tokens?.required || [])],
    },
  };
  plannedFiles.set(
    normalize(path.relative(consumerRoot, manifestPath)),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  packageJson.scripts ||= {};
  packageJson.scripts['check:atomic'] = checkAtomicCommand;
  if (!packageJson.scripts.check) {
    packageJson.scripts.check = 'npm run check:atomic && npm test -- --watch=false && npm run build';
  } else if (!packageJson.scripts.check.includes('check:atomic')) {
    packageJson.scripts.check = `npm run check:atomic && ${packageJson.scripts.check}`;
  }
  plannedFiles.set(
    normalize(path.relative(consumerRoot, packagePath)),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  try {
    applyFileTransaction(consumerRoot, plannedFiles);
  } catch (error) {
    console.error(`Instalación revertida sin cambios parciales: ${error.message}`);
    process.exit(1);
  }

  console.log(
    `Gobierno Atomic instalado: ${exactComponents.length} componentes exactos, ` +
      `${adaptations.length} adaptados y ${governedServices.length} servicios gobernados; ` +
      'política, gate y CI obligatorios.',
  );
}

main();
