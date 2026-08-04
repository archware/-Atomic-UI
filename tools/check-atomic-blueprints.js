#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ATOMIC_ROOT = path.resolve(__dirname, '..');
const SOURCE_EXTENSIONS = new Set(['.html', '.css', '.scss', '.ts']);
const NATIVE_TAGS = /<(?:button|dialog|input|select|table|textarea)\b/i;
const NATIVE_SELECTORS =
  /(?<![-\w])(?:button|dialog|input|select|table|textarea)(?=\s*(?:\[|:|\.|#|\{|,|>|\+|~))/im;
const INLINE_STYLE = /\sstyle\s*=/i;
const PIXEL_VALUE = /(?:^|[^\w.-])-?(?:\d+\.?\d*|\.\d+)px\b/i;
const FUNCTION_COLOR = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/i;
const HEX_COLOR = /(?<!&)#[0-9a-f]{3,8}\b/i;
const NAMED_COLOR = /\b(?:black|white|red|green|blue|yellow|orange|purple|pink|gray|grey|brown|cyan|magenta|lime|navy|teal|olive|maroon|silver|gold)\b/i;
const EXPLICIT_ANY = /\bany\b/;
const TIMER_CALL = /\b(?:setTimeout|setInterval)\s*\(/;
const MOCK_IDENTIFIER = /\b(?:FAKE(?:_[A-Z0-9]+)+|MOCK(?:_[A-Z0-9]+)*|mock(?:Data|Response|Result|User|Token|Api|Db)\w*)\b/i;
const MOCK_LITERAL = /\b(?:mock-jwt-token|api\.example\.com|demo@example\.com)\b/i;
const RXJS_DELAY_MOCK = /\bof\s*\([\s\S]*?\)\s*\.pipe\s*\(\s*delay\s*\(\s*\d+/m;
const REQUIRED_ARTIFACTS = Object.freeze([
  'governance/consumer/ATOMIC_GOVERNANCE.md',
  'governance/consumer/AGENTS.template.md',
  'governance/consumer/atomic-provenance.template.json',
  'governance/consumer/check-atomic-provenance.mjs',
  'governance/consumer/atomic-governance.yml',
  'tools/install-consumer-governance.js',
]);
const BLUEPRINT_MANIFEST = 'blueprints.manifest.json';
const BLUEPRINT_STATUSES = new Set(['production', 'legacy-demo']);

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function filesBelow(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const current = path.join(root, entry.name);
      if (entry.isDirectory()) return filesBelow(current);
      return entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [current] : [];
    });
}

function loadBlueprintManifest(blueprintsRoot, failures) {
  const manifestPath = path.join(blueprintsRoot, BLUEPRINT_MANIFEST);
  if (!fs.existsSync(manifestPath)) return { legacyRoots: new Set(), manifest: null };

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    addFailure(failures, `${BLUEPRINT_MANIFEST} no es JSON v\u00e1lido: ${error.message}`);
    return { legacyRoots: new Set(), manifest: null };
  }
  if (!manifest || Array.isArray(manifest) || typeof manifest !== 'object') {
    addFailure(failures, `${BLUEPRINT_MANIFEST} debe contener un objeto.`);
    return { legacyRoots: new Set(), manifest: null };
  }
  if (manifest.schemaVersion !== 1) addFailure(failures, `${BLUEPRINT_MANIFEST}: schemaVersion debe ser 1.`);
  if (manifest.defaultStatus !== 'production') {
    addFailure(failures, `${BLUEPRINT_MANIFEST}: defaultStatus debe ser production.`);
  }
  if (!Array.isArray(manifest.blueprints)) {
    addFailure(failures, `${BLUEPRINT_MANIFEST}: blueprints debe ser un arreglo.`);
    return { legacyRoots: new Set(), manifest };
  }

  const seen = new Set();
  const legacyRoots = new Set();
  for (const [index, entry] of manifest.blueprints.entries()) {
    if (!entry || Array.isArray(entry) || typeof entry !== 'object') {
      addFailure(failures, `${BLUEPRINT_MANIFEST}: blueprints[${index}] debe ser un objeto.`);
      continue;
    }
    const root = normalizePath(String(entry.path || '')).trim();
    if (!/^[a-z0-9][a-z0-9-]*$/.test(root)) {
      addFailure(failures, `${BLUEPRINT_MANIFEST}: path inv\u00e1lido en blueprints[${index}].`);
      continue;
    }
    if (seen.has(root)) addFailure(failures, `${BLUEPRINT_MANIFEST}: path duplicado ${root}.`);
    seen.add(root);
    if (!BLUEPRINT_STATUSES.has(entry.status)) {
      addFailure(failures, `${BLUEPRINT_MANIFEST}: status inv\u00e1lido para ${root}.`);
      continue;
    }
    if (!fs.existsSync(path.join(blueprintsRoot, root))) {
      addFailure(failures, `${BLUEPRINT_MANIFEST}: no existe el root declarado ${root}.`);
      continue;
    }
    if (entry.status === 'legacy-demo') legacyRoots.add(root);
  }
  return { legacyRoots, manifest };
}

function blueprintRoot(file, blueprintsRoot) {
  return normalizePath(path.relative(blueprintsRoot, file)).split('/')[0];
}

function generatorLegacyReferences(source, legacyRoots) {
  const referenced = new Set();
  const literals = allStringLiterals(source).map((literal) => normalizePath(literal));
  for (const root of legacyRoots) {
    if (literals.some((literal) => literal.split('/').includes(root))) referenced.add(root);
  }
  const codeOnly = maskSource(source, true);
  if (
    /\bblueprints?(?:(?:_|-)?(?:dir|root))\b/i.test(codeOnly)
    || literals.some((literal) => /(?:^|\/)blueprints\/?$/i.test(literal.trim()))
  ) {
    referenced.add('blueprints-root');
  }
  return [...referenced].sort();
}

function maskSource(source, maskStrings) {
  const output = [...source];
  let state = 'code';
  let quote = '';
  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];
    if (state === 'line-comment') {
      if (current === '\n') state = 'code';
      else output[index] = ' ';
      continue;
    }
    if (state === 'block-comment') {
      if (current === '*' && next === '/') {
        output[index] = ' ';
        output[index + 1] = ' ';
        index += 1;
        state = 'code';
      } else if (current !== '\n') output[index] = ' ';
      continue;
    }
    if (state === 'string') {
      if (current === '\\') {
        if (maskStrings) output[index] = ' ';
        if (index + 1 < source.length) {
          index += 1;
          if (maskStrings && source[index] !== '\n') output[index] = ' ';
        }
        continue;
      }
      if (current === quote) {
        if (maskStrings) output[index] = ' ';
        state = 'code';
      } else if (maskStrings && current !== '\n') output[index] = ' ';
      continue;
    }
    if (current === '/' && next === '/') {
      output[index] = ' ';
      output[index + 1] = ' ';
      index += 1;
      state = 'line-comment';
    } else if (current === '/' && next === '*') {
      output[index] = ' ';
      output[index + 1] = ' ';
      index += 1;
      state = 'block-comment';
    } else if (current === "'" || current === '"' || current === '`') {
      quote = current;
      if (maskStrings) output[index] = ' ';
      state = 'string';
    }
  }
  return output.join('');
}

function readStringLiteral(source, start) {
  const quote = source[start];
  if (!['"', "'", '`'].includes(quote)) return null;
  let value = '';
  for (let index = start + 1; index < source.length; index += 1) {
    const current = source[index];
    if (current === '\\') {
      value += current;
      if (index + 1 < source.length) value += source[++index];
    } else if (current === quote) {
      return { value, end: index + 1 };
    } else value += current;
  }
  return null;
}

function propertyLiterals(source, property) {
  const values = [];
  const pattern = new RegExp(`\\b${property}\\s*:`, 'g');
  let match;
  while ((match = pattern.exec(source)) !== null) {
    let index = pattern.lastIndex;
    while (/\s/.test(source[index] || '')) index += 1;
    if (source[index] === '[') {
      index += 1;
      let depth = 1;
      while (index < source.length && depth > 0) {
        if (['"', "'", '`'].includes(source[index])) {
          const literal = readStringLiteral(source, index);
          if (!literal) break;
          values.push(literal.value);
          index = literal.end;
          continue;
        }
        if (source[index] === '[') depth += 1;
        else if (source[index] === ']') depth -= 1;
        index += 1;
      }
      pattern.lastIndex = index;
    } else {
      const literal = readStringLiteral(source, index);
      if (literal) {
        values.push(literal.value);
        pattern.lastIndex = literal.end;
      }
    }
  }
  return values;
}

function allStringLiterals(source) {
  const values = [];
  const withoutComments = maskSource(source, false);
  for (let index = 0; index < withoutComments.length; index += 1) {
    if (!['"', "'", '`'].includes(withoutComments[index])) continue;
    const literal = readStringLiteral(withoutComments, index);
    if (!literal) continue;
    values.push(literal.value);
    index = literal.end - 1;
  }
  return values;
}

function hasFixedColor(source) {
  return HEX_COLOR.test(source) || FUNCTION_COLOR.test(source) || NAMED_COLOR.test(source);
}

function addFailure(failures, message) {
  failures.add(message);
}

function inspectVisualFragment(fragment, type, local, failures, label = '') {
  const source = maskSource(fragment, false);
  const suffix = label ? ` (${label})` : '';
  if (type === 'html' && NATIVE_TAGS.test(source)) {
    addFailure(failures, `Blueprint con primitiva visual nativa${suffix}: ${local}`);
  }
  if (type === 'html' && INLINE_STYLE.test(source)) {
    addFailure(failures, `Blueprint con estilo inline${suffix}: ${local}`);
  }
  if (type === 'style' && NATIVE_SELECTORS.test(source)) {
    addFailure(failures, `Blueprint con selector visual nativo${suffix}: ${local}`);
  }
  if (PIXEL_VALUE.test(source)) addFailure(failures, `Blueprint con px hardcodeado${suffix}: ${local}`);
  if (hasFixedColor(source)) addFailure(failures, `Blueprint con color fijo${suffix}: ${local}`);
}

function inspectTypeScript(source, local, failures) {
  const withoutComments = maskSource(source, false);
  const codeOnly = maskSource(source, true);
  if (
    withoutComments.includes('@Component')
    && !/changeDetection\s*:\s*ChangeDetectionStrategy\.OnPush\b/.test(withoutComments)
  ) {
    addFailure(failures, `Blueprint Angular sin ChangeDetectionStrategy.OnPush: ${local}`);
  }
  if (EXPLICIT_ANY.test(codeOnly)) addFailure(failures, `Blueprint con tipo any expl\u00edcito: ${local}`);
  if (TIMER_CALL.test(codeOnly)) addFailure(failures, `Blueprint con timer imperativo: ${local}`);
  if (
    MOCK_IDENTIFIER.test(codeOnly)
    || MOCK_LITERAL.test(withoutComments)
    || RXJS_DELAY_MOCK.test(codeOnly)
  ) {
    addFailure(failures, `Blueprint con mock productivo: ${local}`);
  }

  for (const template of propertyLiterals(withoutComments, 'template')) {
    inspectVisualFragment(template, 'html', local, failures, 'template embebido');
  }
  for (const style of propertyLiterals(withoutComments, 'styles')) {
    inspectVisualFragment(style, 'style', local, failures, 'styles embebidos');
  }
  for (const literal of allStringLiterals(source)) {
    if (PIXEL_VALUE.test(literal)) addFailure(failures, `Blueprint con px hardcodeado (literal TS): ${local}`);
    if (HEX_COLOR.test(literal) || FUNCTION_COLOR.test(literal) || NAMED_COLOR.test(literal)) {
      addFailure(failures, `Blueprint con color fijo (literal TS): ${local}`);
    }
  }
}

function parseArgs(argv) {
  const options = { format: 'text' };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const [flag, inline] = argument.split('=', 2);
    const value = () => {
      if (inline !== undefined) return inline;
      const next = argv[index + 1];
      if (!next || next.startsWith('--')) throw new Error(`Falta valor para ${flag}.`);
      index += 1;
      return next;
    };
    if (flag === '--atomic-root') options.atomicRoot = value();
    else if (flag === '--blueprints-root') options.blueprintsRoot = value();
    else if (flag === '--format') options.format = value();
    else if (flag === '--json') options.format = 'json';
    else if (flag === '--help' || flag === '-h') options.help = true;
    else throw new Error(`Opci\u00f3n desconocida: ${argument}.`);
  }
  if (!['json', 'text'].includes(options.format)) throw new Error('--format debe ser json o text.');
  return options;
}

function checkAtomicBlueprints(options = {}) {
  const atomicRoot = path.resolve(options.atomicRoot || DEFAULT_ATOMIC_ROOT);
  const blueprintsRoot = path.resolve(options.blueprintsRoot || path.join(atomicRoot, 'src', 'blueprints'));
  const failures = new Set();
  if (!fs.existsSync(blueprintsRoot)) {
    addFailure(failures, `No existe la ra\u00edz de blueprints: ${blueprintsRoot}`);
  }

  const { legacyRoots, manifest } = loadBlueprintManifest(blueprintsRoot, failures);
  let scannedFiles = 0;

  for (const file of filesBelow(blueprintsRoot)) {
    if (legacyRoots.has(blueprintRoot(file, blueprintsRoot))) continue;
    scannedFiles += 1;
    const source = fs.readFileSync(file, 'utf8');
    const local = normalizePath(path.relative(atomicRoot, file));
    const extension = path.extname(file);
    if (extension === '.html') inspectVisualFragment(source, 'html', local, failures);
    else if (extension === '.css' || extension === '.scss') {
      inspectVisualFragment(source, 'style', local, failures);
    } else if (extension === '.ts') inspectTypeScript(source, local, failures);
  }

  const generatorPath = path.join(atomicRoot, 'tools', 'create-project.js');
  if (!fs.existsSync(generatorPath)) {
    addFailure(failures, 'Falta tools/create-project.js.');
  } else {
    const generator = fs.readFileSync(generatorPath, 'utf8');
    if (!generator.includes('GOVERNANCE_INSTALLER') || !generator.includes('install-consumer-governance')) {
      addFailure(failures, 'El generador de aplicaciones no instala el gobierno Atomic obligatorio.');
    }
    for (const reference of generatorLegacyReferences(generator, legacyRoots)) {
      addFailure(failures, `El generador referencia un blueprint legacy-demo: ${reference}.`);
    }
  }

  for (const required of REQUIRED_ARTIFACTS) {
    if (!fs.existsSync(path.join(atomicRoot, required))) {
      addFailure(failures, `Artefacto normativo ausente: ${required}`);
    }
  }

  return {
    atomicRoot,
    blueprintsRoot,
    failures: [...failures].sort(),
    manifest: Boolean(manifest),
    scannedFiles,
    skippedRoots: [...legacyRoots].sort(),
  };
}

function formatResult(result, format) {
  if (format === 'json') {
    return JSON.stringify({
      schemaVersion: 1,
      valid: result.failures.length === 0,
      manifest: result.manifest,
      scannedFiles: result.scannedFiles,
      skippedRoots: result.skippedRoots,
      failures: result.failures,
    });
  }
  if (result.failures.length > 0) return result.failures.map((failure) => `- ${failure}`).join('\n');
  return 'Blueprints y generador cumplen la ley Atomic-first.';
}

function helpText() {
  return [
    'Uso: node tools/check-atomic-blueprints.js [opciones]',
    '  --atomic-root <ruta>      Ra\u00edz Atomic alternativa para pruebas.',
    '  --blueprints-root <ruta>  Ra\u00edz de blueprints alternativa.',
    '  --format text|json        Salida compacta.',
  ].join('\n');
}

function main(argv = process.argv.slice(2), io = console) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      io.log(helpText());
      return 0;
    }
    const result = checkAtomicBlueprints(options);
    const output = formatResult(result, options.format);
    if (result.failures.length > 0) io.error(output);
    else io.log(output);
    return result.failures.length === 0 ? 0 : 1;
  } catch (error) {
    io.error(error.message);
    return 1;
  }
}

if (require.main === module) process.exitCode = main();

module.exports = {
  BLUEPRINT_MANIFEST,
  checkAtomicBlueprints,
  generatorLegacyReferences,
  filesBelow,
  formatResult,
  inspectTypeScript,
  inspectVisualFragment,
  loadBlueprintManifest,
  main,
  maskSource,
  parseArgs,
  propertyLiterals,
};
