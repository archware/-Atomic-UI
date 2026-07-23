import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const POLICY_VERSION = '1.0.0';
const REQUIRED_MARKER = 'ATOMIC_GOVERNANCE_REQUIRED';
const NATIVE_VISUAL_TAGS = /<(?:button|dialog|input|select|table|textarea)\b/i;
const NATIVE_VISUAL_SELECTORS =
  /(?<![-\w])(?:button|dialog|input|select|table|textarea)(?=\s*(?:\[|:|\.|#|\{|,|>|\+|~))/im;
const FIXED_COLOR = /(?<!&)#[0-9a-f]{3,8}\b/i;
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
const atomicRoot = resolve(
  process.env.ATOMIC_UI_ROOT || join(consumerRoot, manifest.atomicRepository || ''),
);

if (manifest.schemaVersion !== 1) failures.push('schemaVersion debe ser 1.');
if (manifest.policyVersion !== POLICY_VERSION) {
  failures.push(`policyVersion debe ser ${POLICY_VERSION}.`);
}
if (!manifest.changeId?.trim()) failures.push('changeId es obligatorio.');
if (!manifest.atomicRemote?.trim()) failures.push('atomicRemote es obligatorio para CI.');
if (!manifest.atomicRef?.trim()) failures.push('atomicRef es obligatorio para CI reproducible.');
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

const agentsPath = join(consumerRoot, 'AGENTS.md');
if (
  !requireFile(agentsPath, 'AGENTS.md es obligatorio en todo consumidor.') ||
  !readFileSync(agentsPath, 'utf8').includes(REQUIRED_MARKER)
) {
  failures.push(`AGENTS.md debe contener el marcador ${REQUIRED_MARKER}.`);
}

const packagePath = join(consumerRoot, 'package.json');
if (requireFile(packagePath, 'package.json es obligatorio.')) {
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  if (packageJson.scripts?.['check:atomic'] !== 'node scripts/check-atomic-provenance.mjs') {
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

  for (const file of filesBelow(absoluteUiRoot, ['.html', '.scss', '.css'])) {
    const local = normalize(relative(consumerRoot, file));
    if (local.includes('/styles/tokens/')) continue;
    if (FIXED_COLOR.test(readFileSync(file, 'utf8'))) {
      failures.push(`Color fijo fuera de tokens: ${local}`);
    }
  }
}

for (const featureRoot of manifest.featureRoots || []) {
  const absoluteFeatureRoot = join(consumerRoot, featureRoot);
  if (!existsSync(absoluteFeatureRoot)) continue;
  for (const file of filesBelow(absoluteFeatureRoot, ['.html', '.scss', '.css'])) {
    const source = readFileSync(file, 'utf8');
    const local = normalize(relative(consumerRoot, file));
    if (file.endsWith('.html') && NATIVE_VISUAL_TAGS.test(source)) {
      failures.push(`Primitiva visual nativa fuera del ADN: ${local}`);
    }
    if (!file.endsWith('.html') && NATIVE_VISUAL_SELECTORS.test(source)) {
      failures.push(`Selector visual nativo desde feature: ${local}`);
    }
    if (file.endsWith('.html') && /\sstyle\s*=/i.test(source)) {
      failures.push(`Estilo inline prohibido: ${local}`);
    }
    if (FIXED_COLOR.test(source)) failures.push(`Color fijo fuera de tokens: ${local}`);
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
    'con procedencia y cero primitivas o hardcodes visuales fuera del ADN.',
);
