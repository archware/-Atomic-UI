import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const POLICY_VERSION = '1.2.0';
const REQUIRED_MARKER = 'ATOMIC_GOVERNANCE_REQUIRED';
const NATIVE_VISUAL_TAGS = /<(?:button|dialog|input|select|table|textarea)\b/i;
const NATIVE_VISUAL_SELECTORS =
  /(?<![-\w])(?:button|dialog|input|select|table|textarea)(?=\s*(?:\[|:|\.|#|\{|,|>|\+|~))/im;
const FIXED_COLOR = /(?<!&)#[0-9a-f]{3,8}\b/i;
const INVALID_NUMERIC_TOKEN = /\d+(?:\.\d+)?var\s*\(/i;
const INVALID_NEGATED_TOKEN = /(?<![\w-])-var\s*\(/i;
const INLINE_STYLE_IN_MARKUP = /<[a-z][^<>]*\sstyle\s*=/is;
const REQUIRED_GOVERNED_SERVICES = [
  'theme.service.ts',
  'app-version.service.ts',
  'modal.service.ts',
  'popup.service.ts',
  'toast.service.ts',
];
const ATOMIC_SERVICES_ROOT = 'src/app/shared/ui/services';
const REQUIRED_GOVERNANCE_ARTIFACTS = [
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
];

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const option = (name) => {
  const prefix = `${name}=`;
  return process.argv.slice(2).find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
};
const consumerRoot = resolve(option('--consumer-root') || join(scriptDirectory, '..'));
const manifestPath = resolve(
  consumerRoot,
  option('--manifest') || 'docs/atomic-provenance.json',
);
const failures = [];
const normalize = (path) => path.replaceAll('\\', '/');
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

function filesBelow(root, extensions) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return filesBelow(path, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [path] : [];
  });
}

function requireFile(path, message) {
  if (!existsSync(path)) {
    failures.push(message);
    return false;
  }
  return true;
}

if (!requireFile(manifestPath, `No existe el manifiesto obligatorio: ${manifestPath}`)) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const configuredAtomicRoot =
  process.env.ATOMIC_UI_ROOT || manifest.atomicRepository || '';
const atomicRoot = isAbsolute(configuredAtomicRoot)
  ? resolve(configuredAtomicRoot)
  : resolve(consumerRoot, configuredAtomicRoot);

if (manifest.schemaVersion !== 1) failures.push('schemaVersion debe ser 1.');
if (manifest.policyVersion !== POLICY_VERSION) {
  failures.push(`policyVersion debe ser ${POLICY_VERSION}.`);
}
if (!manifest.changeId?.trim()) failures.push('changeId es obligatorio.');
if (!manifest.atomicRemote?.trim()) failures.push('atomicRemote es obligatorio para CI.');
if (!manifest.atomicRef?.trim()) failures.push('atomicRef es obligatorio para CI reproducible.');
if (!manifest.atomicVersion?.trim()) {
  failures.push('atomicVersion es obligatorio para fijar la versi\u00f3n consumida.');
}
if (!/^[0-9a-f]{64}$/i.test(manifest.atomicSourceTreeSha256 || '')) {
  failures.push('atomicSourceTreeSha256 debe ser una huella SHA-256 v\u00e1lida.');
}
if (!Array.isArray(manifest.uiRoots) || manifest.uiRoots.length === 0) {
  failures.push('uiRoots debe declarar al menos una raíz UI consumidora.');
}
if (!Array.isArray(manifest.featureRoots) || manifest.featureRoots.length === 0) {
  failures.push('featureRoots debe declarar al menos una raíz de features o páginas.');
}
if (!Array.isArray(manifest.layers) || manifest.layers.length === 0) {
  failures.push('layers debe declarar las capas Atomic inventariadas.');
}
if (!Array.isArray(manifest.components)) failures.push('components debe ser un arreglo.');
if (!existsSync(atomicRoot)) failures.push(`No existe el repositorio fuente Atomic: ${atomicRoot}`);

if (existsSync(atomicRoot)) {
  const atomicPackagePath = join(atomicRoot, 'package.json');
  const atomicSourceManifestPath = join(
    atomicRoot,
    'distribution',
    'atomic-source-manifest.json',
  );
  if (
    requireFile(atomicPackagePath, 'package.json de Atomic es obligatorio.') &&
    requireFile(
      atomicSourceManifestPath,
      'distribution/atomic-source-manifest.json de Atomic es obligatorio.',
    )
  ) {
    const atomicPackage = JSON.parse(readFileSync(atomicPackagePath, 'utf8'));
    const atomicSourceManifest = JSON.parse(readFileSync(atomicSourceManifestPath, 'utf8'));
    if (manifest.atomicVersion !== atomicPackage.version) {
      failures.push(
        `Versi\u00f3n Atomic divergente: se declar\u00f3 ${manifest.atomicVersion || '(vac\u00eda)'} ` +
          `y la fuente disponible es ${atomicPackage.version || '(vac\u00eda)'}.`,
      );
    }
    if (atomicSourceManifest.packageVersion !== atomicPackage.version) {
      failures.push('El manifiesto de fuentes Atomic no coincide con la versi\u00f3n del paquete.');
    }
    if (manifest.atomicSourceTreeSha256 !== atomicSourceManifest.sourceTreeSha256) {
      failures.push('La huella de fuentes Atomic no coincide con la referencia disponible.');
    }
  }
}

const agentsPath = join(consumerRoot, 'AGENTS.md');
if (
  !requireFile(agentsPath, 'AGENTS.md es obligatorio en todo consumidor.') ||
  !readFileSync(agentsPath, 'utf8').includes(REQUIRED_MARKER)
) {
  failures.push(`AGENTS.md debe contener el marcador ${REQUIRED_MARKER}.`);
}

const packageRoot = normalize(manifest.packageRoot || '.');
const packagePath = join(consumerRoot, packageRoot, 'package.json');
if (requireFile(packagePath, 'package.json es obligatorio.')) {
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const packageDirectory = dirname(packagePath);
  const gateRelative = normalize(
    relative(packageDirectory, join(consumerRoot, 'scripts', 'check-atomic-provenance.mjs')),
  );
  const consumerRelative = normalize(relative(packageDirectory, consumerRoot)) || '.';
  const expectedCommand =
    packageRoot === '.'
      ? 'node scripts/check-atomic-provenance.mjs'
      : `node ${gateRelative} --consumer-root=${consumerRelative}`;
  if (packageJson.scripts?.['check:atomic'] !== expectedCommand) {
    failures.push('package.json debe declarar check:atomic con el gate canónico.');
  }
}

for (const requiredArtifact of REQUIRED_GOVERNANCE_ARTIFACTS) {
  const declaredArtifact = (manifest.governanceArtifacts || []).find(
    (artifact) =>
      artifact.local === requiredArtifact.local && artifact.atomic === requiredArtifact.atomic,
  );
  if (!declaredArtifact) {
    failures.push(`Artefacto de gobierno no declarado: ${requiredArtifact.local}`);
  }
}

for (const artifact of REQUIRED_GOVERNANCE_ARTIFACTS) {
  const localPath = join(consumerRoot, artifact.local);
  const atomicPath = join(atomicRoot, artifact.atomic);
  if (!requireFile(localPath, `Artefacto de gobierno ausente: ${artifact.local}`)) continue;
  if (!requireFile(atomicPath, `Fuente de gobierno Atomic ausente: ${artifact.atomic}`)) continue;
  if (digest(localPath) !== digest(atomicPath)) {
    failures.push(`Artefacto de gobierno modificado fuera de Atomic: ${artifact.local}`);
  }
}

const governedServices = Array.isArray(manifest.governedServices) ? manifest.governedServices : [];
if (!Array.isArray(manifest.governedServices)) {
  failures.push('governedServices debe declarar los servicios de presentación gobernados.');
}
const primaryUiRoot =
  Array.isArray(manifest.uiRoots) && manifest.uiRoots.length > 0 ? manifest.uiRoots[0] : null;
const declaredServices = new Map();
for (const service of governedServices) {
  const file = (service.file || '').trim();
  if (!file) {
    failures.push('Todo servicio gobernado debe declarar file.');
    continue;
  }
  if (declaredServices.has(file)) {
    failures.push(`Servicio gobernado duplicado en manifiesto: ${file}`);
    continue;
  }
  declaredServices.set(file, service);
}
for (const requiredService of REQUIRED_GOVERNED_SERVICES) {
  if (!declaredServices.has(requiredService)) {
    failures.push(`Servicio gobernado no declarado: ${requiredService}`);
  }
}
if (primaryUiRoot) {
  for (const [file, service] of declaredServices) {
    const localRelative = `${normalize(primaryUiRoot)}/services/${file}`;
    const localPath = join(consumerRoot, primaryUiRoot, 'services', file);
    const atomicPath = join(atomicRoot, ATOMIC_SERVICES_ROOT, file);
    if (!['exact', 'adapted'].includes(service.mode)) {
      failures.push(`Modo inválido para servicio ${file}: use exact o adapted.`);
      continue;
    }
    const localExists = requireFile(localPath, `Servicio gobernado ausente en el consumidor: ${localRelative}`);
    const atomicExists = requireFile(atomicPath, `Fuente Atomic del servicio ausente: ${ATOMIC_SERVICES_ROOT}/${file}`);
    if (!localExists || !atomicExists) continue;
    if (service.mode === 'exact') {
      if (digest(localPath) !== digest(atomicPath)) {
        failures.push(`Propagación exacta divergente en servicio: ${localRelative}`);
      }
      continue;
    }
    if (!service.localSha256?.trim() || !service.atomicSha256?.trim()) {
      failures.push(`Servicio adaptado sin snapshot verificable: ${file}`);
      continue;
    }
    if (digest(localPath) !== service.localSha256) {
      failures.push(`Adaptación de servicio modificada sin nueva decisión: ${localRelative}`);
    }
    if (digest(atomicPath) !== service.atomicSha256) {
      failures.push(`Fuente Atomic del servicio cambió respecto al snapshot: ${ATOMIC_SERVICES_ROOT}/${file}`);
    }
  }
}

const components = Array.isArray(manifest.components) ? manifest.components : [];
const declared = new Set();
for (const component of components) {
  const local = normalize(component.local || '');
  if (!local) {
    failures.push('Todo componente debe declarar local.');
    continue;
  }
  if (declared.has(local)) failures.push(`Componente duplicado en manifiesto: ${local}`);
  declared.add(local);

  if (!['exact', 'adapted'].includes(component.mode)) {
    failures.push(`Modo inválido para ${local}: use exact o adapted.`);
  }
  if (component.mode === 'adapted') {
    if (!component.justification?.trim()) {
      failures.push(`Adaptación sin justificación: ${local}`);
    }
    if (!component.decisionRecord?.trim()) {
      failures.push(`Adaptación sin decisionRecord: ${local}`);
    } else if (!existsSync(join(consumerRoot, component.decisionRecord))) {
      failures.push(`No existe decisionRecord para ${local}: ${component.decisionRecord}`);
    }
    if (!Array.isArray(component.adaptationSnapshot) || component.adaptationSnapshot.length === 0) {
      failures.push(`Adaptación sin snapshot verificable: ${local}`);
    } else {
      for (const snapshot of component.adaptationSnapshot) {
        const localFile = join(consumerRoot, local, snapshot.file || '');
        const atomicFile = join(atomicRoot, component.atomic || '', snapshot.file || '');
        const actualLocal = existsSync(localFile) ? digest(localFile) : null;
        const actualAtomic = existsSync(atomicFile) ? digest(atomicFile) : null;
        if (actualLocal !== (snapshot.localSha256 ?? null)) {
          failures.push(`Adaptación modificada sin nueva decisión: ${local}/${snapshot.file}`);
        }
        if (actualAtomic !== (snapshot.atomicSha256 ?? null)) {
          failures.push(`Fuente Atomic cambió respecto al snapshot: ${component.atomic}/${snapshot.file}`);
        }
      }
    }
  }

  const localRoot = join(consumerRoot, local);
  const sourceRoot = join(atomicRoot, component.atomic || '');
  if (!requireFile(localRoot, `No existe el componente consumidor: ${local}`)) continue;
  if (!requireFile(sourceRoot, `No existe la fuente Atomic: ${component.atomic}`)) continue;

  if (component.mode === 'exact') {
    if (!Array.isArray(component.files) || component.files.length === 0) {
      failures.push(`La copia exacta debe declarar files: ${local}`);
      continue;
    }
    for (const file of component.files) {
      const localFile = join(localRoot, file);
      const sourceFile = join(sourceRoot, file);
      if (!existsSync(localFile) || !existsSync(sourceFile)) {
        failures.push(`Archivo exacto ausente: ${local}/${file}`);
      } else if (digest(localFile) !== digest(sourceFile)) {
        failures.push(`Propagación exacta divergente: ${local}/${file}`);
      }
    }
  }
}

const governedComponentRoots = components
  .filter((component) => component.local)
  .map((component) => resolve(consumerRoot, component.local));
const belongsToGovernedComponent = (file) => {
  const absolute = resolve(file);
  return governedComponentRoots.some(
    (root) => absolute === root || absolute.startsWith(`${root}${sep}`),
  );
};

for (const uiRoot of manifest.uiRoots || []) {
  const absoluteUiRoot = join(consumerRoot, uiRoot);
  if (!requireFile(absoluteUiRoot, `Raíz UI consumidora ausente: ${uiRoot}`)) continue;
  for (const layer of manifest.layers || []) {
    const layerRoot = join(absoluteUiRoot, layer);
    if (!existsSync(layerRoot)) continue;
    for (const entry of readdirSync(layerRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const local = normalize(relative(consumerRoot, join(layerRoot, entry.name)));
      if (!declared.has(local)) failures.push(`Componente sin procedencia Atomic: ${local}`);
    }
  }

  for (const file of filesBelow(absoluteUiRoot, ['.html', '.scss', '.css', '.ts'])) {
    const local = normalize(relative(consumerRoot, file));
    if (local.includes('/styles/tokens/')) continue;
    const source = readFileSync(file, 'utf8');
    const executableSource = source.replace(/\/\*[\s\S]*?\*\//g, '');
    if (!belongsToGovernedComponent(file) && FIXED_COLOR.test(executableSource)) {
      failures.push(`Color fijo fuera de tokens: ${local}`);
    }
    if (INVALID_NUMERIC_TOKEN.test(executableSource)) {
      failures.push(`Valor CSS dañado por sustitución mecánica: ${local}`);
    }
    if (INVALID_NEGATED_TOKEN.test(executableSource)) {
      failures.push(`Negación inválida de token (use calc(-1 * var(...))): ${local}`);
    }
  }
}

for (const featureRoot of manifest.featureRoots || []) {
  const absoluteFeatureRoot = join(consumerRoot, featureRoot);
  if (!existsSync(absoluteFeatureRoot)) continue;
  for (const file of filesBelow(absoluteFeatureRoot, ['.html', '.scss', '.css', '.ts'])) {
    const source = readFileSync(file, 'utf8');
    const executableSource = source.replace(/\/\*[\s\S]*?\*\//g, '');
    const local = normalize(relative(consumerRoot, file));
    if (local.endsWith('.spec.ts')) continue;
    const isHtml = file.endsWith('.html');
    const isTs = file.endsWith('.ts');
    if ((isHtml || isTs) && NATIVE_VISUAL_TAGS.test(source)) {
      failures.push(`Primitiva visual nativa fuera del ADN: ${local}`);
    }
    if (!isHtml && !isTs && NATIVE_VISUAL_SELECTORS.test(source)) {
      failures.push(`Selector visual nativo desde feature: ${local}`);
    }
    if (isHtml && /\sstyle\s*=/i.test(source)) {
      failures.push(`Estilo inline prohibido: ${local}`);
    }
    if (isTs && INLINE_STYLE_IN_MARKUP.test(source)) {
      failures.push(`Estilo inline prohibido en plantilla TS: ${local}`);
    }
    if (FIXED_COLOR.test(executableSource)) failures.push(`Color fijo fuera de tokens: ${local}`);
    if (INVALID_NUMERIC_TOKEN.test(executableSource)) {
      failures.push(`Valor CSS dañado por sustitución mecánica: ${local}`);
    }
    if (INVALID_NEGATED_TOKEN.test(executableSource)) {
      failures.push(`Negación inválida de token (use calc(-1 * var(...))): ${local}`);
    }
  }
}

const tokens = manifest.tokens;
if (tokens) {
  const atomicTokensPath = join(atomicRoot, tokens.atomic || '');
  const consumerTokensPath = join(consumerRoot, tokens.consumer || '');
  if (
    requireFile(atomicTokensPath, `Archivo de tokens Atomic ausente: ${tokens.atomic}`) &&
    requireFile(consumerTokensPath, `Archivo de tokens consumidor ausente: ${tokens.consumer}`)
  ) {
    const atomicTokens = readFileSync(atomicTokensPath, 'utf8');
    const consumerTokens = readFileSync(consumerTokensPath, 'utf8');
    for (const token of tokens.required || []) {
      if (!atomicTokens.includes(token)) failures.push(`Token ausente en Atomic: ${token}`);
      if (!consumerTokens.includes(token)) failures.push(`Token no propagado: ${token}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(
  `Ley Atomic verificada: política ${POLICY_VERSION}, ${components.length} componentes ` +
    `y ${governedServices.length} servicios con procedencia y cero violaciones detectadas por el gate.`,
);
