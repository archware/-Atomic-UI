#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ATOMIC_ROOT = path.resolve(__dirname, '..');
const CATALOG_SECTIONS = Object.freeze([
  { directory: 'components', kind: 'component' },
  { directory: 'recipes', kind: 'recipe' },
  { directory: 'ux-rules', kind: 'ux-rule' },
]);

class CatalogError extends Error {
  constructor(message, failures = []) {
    super(message);
    this.name = 'CatalogError';
    this.failures = failures;
  }
}

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim()))];
}

function stringsBelow(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringsBelow);
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(stringsBelow);
}

function scalarString(value) {
  if (value === null) return 'null';
  if (['string', 'number', 'boolean'].includes(typeof value)) return String(value);
  return undefined;
}

function namedValues(value) {
  return asArray(value).flatMap((entry) => {
    const direct = scalarString(entry);
    if (direct !== undefined) return [direct];
    if (!entry || typeof entry !== 'object') return [];
    return uniqueStrings([
      entry.id,
      entry.name,
      scalarString(entry.value),
      ...asArray(entry.values).flatMap((item) =>
        scalarString(item) !== undefined
          ? [scalarString(item)]
          : [item?.id, item?.name, scalarString(item?.value)],
      ),
    ]);
  });
}

function readJsonFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const current = path.join(root, entry.name);
      if (entry.isDirectory()) return readJsonFiles(current);
      return entry.isFile() && entry.name.endsWith('.json') ? [current] : [];
    });
}

function loadCatalog(options = {}) {
  const atomicRoot = path.resolve(options.atomicRoot || DEFAULT_ATOMIC_ROOT);
  const catalogRoot = path.resolve(options.catalogRoot || path.join(atomicRoot, 'catalog'));
  const failures = [];
  const items = [];

  for (const section of CATALOG_SECTIONS) {
    const sectionRoot = path.join(catalogRoot, section.directory);
    for (const file of readJsonFiles(sectionRoot)) {
      let document;
      try {
        document = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (error) {
        failures.push(`${normalizePath(path.relative(atomicRoot, file))}: JSON inv\u00e1lido (${error.message}).`);
        continue;
      }
      if (!document || Array.isArray(document) || typeof document !== 'object') {
        failures.push(`${normalizePath(path.relative(atomicRoot, file))}: el documento debe ser un objeto JSON.`);
        continue;
      }
      items.push({
        kind: section.kind,
        directory: section.directory,
        file,
        relativePath: normalizePath(path.relative(atomicRoot, file)),
        document,
      });
    }
  }

  if (failures.length > 0) {
    throw new CatalogError('No se pudo cargar el cat\u00e1logo Atomic.', failures);
  }
  if (items.length === 0 && options.requireEntries !== false) {
    throw new CatalogError(`El cat\u00e1logo no contiene documentos JSON en ${catalogRoot}.`);
  }

  items.sort((left, right) => {
    const sectionOrder = CATALOG_SECTIONS.findIndex((section) => section.kind === left.kind)
      - CATALOG_SECTIONS.findIndex((section) => section.kind === right.kind);
    if (sectionOrder !== 0) return sectionOrder;
    return String(left.document.id || left.relativePath).localeCompare(String(right.document.id || right.relativePath));
  });

  return { atomicRoot, catalogRoot, items };
}

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function parseList(value) {
  return uniqueStrings(
    asArray(value).flatMap((entry) => String(entry).split(',')).map((entry) => entry.trim()),
  );
}

function parseArgs(argv) {
  const options = {
    intents: [],
    components: [],
    variants: [],
    kinds: [],
    format: 'text',
    details: false,
    pretty: false,
    limit: 50,
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const [flag, inlineValue] = argument.split('=', 2);
    const takeValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      const next = argv[index + 1];
      if (!next || next.startsWith('--')) throw new CatalogError(`Falta valor para ${flag}.`);
      index += 1;
      return next;
    };

    if (flag === '--intent') options.intents.push(...parseList(takeValue()));
    else if (flag === '--component') options.components.push(...parseList(takeValue()));
    else if (flag === '--variant') options.variants.push(...parseList(takeValue()));
    else if (flag === '--kind') options.kinds.push(...parseList(takeValue()));
    else if (flag === '--catalog-root') options.catalogRoot = takeValue();
    else if (flag === '--atomic-root') options.atomicRoot = takeValue();
    else if (flag === '--limit') {
      const limit = Number.parseInt(takeValue(), 10);
      if (!Number.isInteger(limit) || limit < 1) throw new CatalogError('--limit debe ser un entero positivo.');
      options.limit = limit;
    } else if (flag === '--format') options.format = takeValue();
    else if (flag === '--json') options.format = 'json';
    else if (flag === '--text') options.format = 'text';
    else if (flag === '--details') options.details = true;
    else if (flag === '--pretty') options.pretty = true;
    else if (flag === '--help' || flag === '-h') options.help = true;
    else if (argument.startsWith('--')) throw new CatalogError(`Opci\u00f3n desconocida: ${argument}.`);
    else positional.push(argument);
  }

  if (positional.length > 0 && options.intents.length === 0) options.intents.push(...parseList(positional));
  for (const key of ['intents', 'components', 'variants', 'kinds']) options[key] = uniqueStrings(options[key]);
  if (!['json', 'text'].includes(options.format)) throw new CatalogError('--format debe ser json o text.');
  return options;
}

function intentTerms(item) {
  const document = item.document;
  return uniqueStrings([
    document.id,
    document.name,
    document.title,
    document.summary,
    document.purpose,
    document.description,
    document.whenToUse,
    ...stringsBelow(document.intent),
    ...stringsBelow(document.intents),
    ...stringsBelow(document.canonicalFor),
    ...stringsBelow(document.tags),
    ...stringsBelow(document.useCases),
    ...stringsBelow(document.appliesTo?.intents),
    ...stringsBelow(document.requiredOperations),
    ...stringsBelow(document.optionalOperations),
  ]);
}

function componentTerms(item) {
  const document = item.document;
  return uniqueStrings([
    ...(item.kind === 'component'
      ? [document.id, document.name, document.selector, document.export, document.source]
      : []),
    ...stringsBelow(document.component),
    ...stringsBelow(document.components),
    ...stringsBelow(document.componentStack),
    ...stringsBelow(document.requires?.components),
    ...stringsBelow(document.appliesTo?.components),
  ]);
}

function variantTerms(item) {
  const document = item.document;
  return uniqueStrings([
    ...namedValues(document.variant),
    ...namedValues(document.variants),
    ...namedValues(document.modes),
    ...stringsBelow(document.supportedVariants),
    ...stringsBelow(document.defaults),
  ]);
}

function termsMatch(terms, filters) {
  if (filters.length === 0) return true;
  const normalizedTerms = terms.map(normalizeSearch);
  return filters.some((filter) => {
    const expected = normalizeSearch(filter);
    return normalizedTerms.some((term) => term === expected || term.includes(expected));
  });
}

function queryCatalog(catalog, filters = {}) {
  const intents = parseList(filters.intents || filters.intent);
  const components = parseList(filters.components || filters.component);
  const variants = parseList(filters.variants || filters.variant);
  const kinds = parseList(filters.kinds || filters.kind).map(normalizeSearch);
  const limit = Number.isInteger(filters.limit) && filters.limit > 0 ? filters.limit : Number.POSITIVE_INFINITY;

  const matched = catalog.items.filter((item) => {
    if (kinds.length > 0 && !kinds.includes(normalizeSearch(item.kind)) && !kinds.includes(normalizeSearch(item.directory))) {
      return false;
    }
    return (
      termsMatch(intentTerms(item), intents)
      && termsMatch(componentTerms(item), components)
      && termsMatch(variantTerms(item), variants)
    );
  });

  return {
    items: matched.slice(0, limit),
    total: matched.length,
    truncated: matched.length > limit,
    filters: { intents, components, variants, kinds },
  };
}

function compactDocument(item, details = false) {
  if (details) {
    return { kind: item.kind, path: item.relativePath, ...item.document };
  }

  const document = item.document;
  const compact = {
    kind: item.kind,
    id: document.id,
    path: item.relativePath,
  };
  for (const key of ['layer', 'selector', 'export', 'source', 'purpose', 'summary', 'variant']) {
    if (document[key] !== undefined) compact[key] = document[key];
  }
  if (document.canonicalFor !== undefined) compact.canonicalFor = uniqueStrings(stringsBelow(document.canonicalFor));
  if (document.variants !== undefined) {
    compact.variants = Object.fromEntries(
      asArray(document.variants).map((variant) => [
        typeof variant === 'string' ? variant : variant?.name,
        typeof variant === 'string'
          ? []
          : uniqueStrings(
               asArray(variant?.values).map((value) =>
                scalarString(value) ?? scalarString(value?.value) ?? value?.name ?? value?.id,
              ),
            ),
      ]),
    );
  }
  if (document.states !== undefined) compact.states = namedValues(document.states);
  for (const key of [
    'componentStack',
    'requiredOperations',
    'optionalOperations',
    'operationContracts',
    'extensionSlots',
    'outputLayers',
    'qualityGates',
    'supportedVariants',
    'defaults',
    'appliesTo',
    'checks',
  ]) {
    if (document[key] !== undefined) compact[key] = document[key];
  }
  if (document.requirements !== undefined) {
    compact.requirements = uniqueStrings(
      asArray(document.requirements).map((requirement) =>
        typeof requirement === 'string' ? requirement : requirement?.id,
      ),
    );
  }
  if (document.story?.path) compact.story = document.story.path;
  if (document.test?.path) compact.test = document.test.path;
  if (document.stability !== undefined) compact.stability = { status: document.stability?.status };
  return compact;
}

function formatJson(result, options = {}) {
  const payload = {
    schemaVersion: 1,
    filters: result.filters,
    count: result.items.length,
    total: result.total,
    truncated: result.truncated,
    items: result.items.map((item) => compactDocument(item, options.details)),
  };
  return JSON.stringify(payload, null, options.pretty ? 2 : 0);
}

function summarizeList(value) {
  const values = uniqueStrings(stringsBelow(value));
  return values.length > 0 ? values.join(',') : '-';
}

function formatText(result) {
  const lines = [
    `atomic-catalog count=${result.items.length} total=${result.total} truncated=${result.truncated}`,
  ];
  for (const item of result.items) {
    const document = item.document;
    const description = document.purpose || document.summary || document.description || '-';
    lines.push(
      `${item.kind}:${document.id || '?'} | ${description}`,
      `  component=${summarizeList(componentTerms(item))} variant=${summarizeList(variantTerms(item))} path=${item.relativePath}`,
    );
  }
  return lines.join('\n');
}

function helpText() {
  return [
    'Uso: node tools/query-atomic-catalog.js [intent] [opciones]',
    '',
    'Filtros (se combinan con AND; valores separados por coma usan OR):',
    '  --intent <valor>       Prop\u00f3sito, canonicalFor, tags u operaci\u00f3n.',
    '  --component <valor>    ID, selector, fuente o referencia en receta.',
    '  --variant <valor>      Variante o valor de variante.',
    '  --kind <valor>         component, recipe o ux-rule.',
    '',
    'Salida:',
    '  --format text|json     Texto compacto (predeterminado) o JSON.',
    '  --details              Conserva todos los campos del documento.',
    '  --pretty               Indenta JSON.',
    '  --limit <n>            M\u00e1ximo de resultados (predeterminado 50).',
    '  --catalog-root <ruta>  Cat\u00e1logo alternativo.',
  ].join('\n');
}

function main(argv = process.argv.slice(2), io = console) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      io.log(helpText());
      return 0;
    }
    const catalog = loadCatalog(options);
    const result = queryCatalog(catalog, options);
    io.log(options.format === 'json' ? formatJson(result, options) : formatText(result));
    return 0;
  } catch (error) {
    const failures = error instanceof CatalogError && error.failures.length > 0
      ? error.failures.map((failure) => `- ${failure}`).join('\n')
      : error.message;
    io.error(failures);
    return 1;
  }
}

if (require.main === module) process.exitCode = main();

module.exports = {
  CATALOG_SECTIONS,
  CatalogError,
  asArray,
  compactDocument,
  componentTerms,
  formatJson,
  formatText,
  intentTerms,
  loadCatalog,
  main,
  namedValues,
  normalizePath,
  normalizeSearch,
  parseArgs,
  parseList,
  queryCatalog,
  scalarString,
  stringsBelow,
  uniqueStrings,
  variantTerms,
};
