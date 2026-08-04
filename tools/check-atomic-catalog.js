#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const {
  CatalogError,
  loadCatalog,
  normalizePath,
  normalizeSearch,
  parseArgs,
  queryCatalog,
  stringsBelow,
  uniqueStrings,
} = require('./query-atomic-catalog.js');

const ALLOWED_LAYERS = new Set(['atom', 'molecule', 'organism']);
const ALLOWED_UX_PRIORITIES = new Set(['must', 'should', 'may']);
const ALLOWED_UX_ENFORCERS = new Set(['catalog', 'recipe', 'generator', 'gate', 'unit', 'a11y', 'visual', 'review']);
const UI_LAYER_DIRECTORIES = Object.freeze(['atoms', 'molecules', 'organisms', 'surfaces', 'templates']);
const MINIMUM_COMPONENT_IDS = Object.freeze([
  'button',
  'input',
  'form-select',
  'choice-control',
  'table-action',
  'action-group',
  'data-state',
  'card',
  'alert',
  'data-table',
  'crud-dialog',
  'form-dialog',
  'form-dialog-actions',
  'datepicker',
  'toast',
]);

function checkArgs(argv) {
  const forwarded = [];
  const flags = {
    requireComplete: false,
    strictReferences: false,
    requireMinimum: true,
  };
  for (const argument of argv) {
    if (argument === '--require-complete') flags.requireComplete = true;
    else if (argument === '--strict-references') flags.strictReferences = true;
    else if (argument === '--no-minimum') flags.requireMinimum = false;
    else forwarded.push(argument);
  }
  return { ...parseArgs(forwarded), ...flags };
}

function addFailure(failures, item, message) {
  failures.push(`${item.relativePath}: ${message}`);
}

function requireString(failures, item, field) {
  const value = item.document[field];
  if (typeof value !== 'string' || !value.trim()) {
    addFailure(failures, item, `${field} debe ser un texto no vac\u00edo.`);
    return false;
  }
  return true;
}

function requireArray(failures, item, field) {
  if (!Array.isArray(item.document[field])) {
    addFailure(failures, item, `${field} debe ser un arreglo.`);
    return false;
  }
  return true;
}

function validateVariants(failures, item) {
  if (!requireArray(failures, item, 'variants')) return;
  const names = new Set();
  for (const [index, variant] of item.document.variants.entries()) {
    if (!variant || Array.isArray(variant) || typeof variant !== 'object') {
      addFailure(failures, item, `variants[${index}] debe ser un objeto.`);
      continue;
    }
    if (typeof variant.name !== 'string' || !variant.name.trim()) {
      addFailure(failures, item, `variants[${index}].name es obligatorio.`);
    } else {
      const normalized = normalizeSearch(variant.name);
      if (names.has(normalized)) addFailure(failures, item, `variante duplicada: ${variant.name}.`);
      names.add(normalized);
    }
    if (!Array.isArray(variant.values)) {
      addFailure(failures, item, `variants[${index}].values debe ser un arreglo.`);
      continue;
    }
    const values = new Set();
    for (const [valueIndex, value] of variant.values.entries()) {
      if (!value || Array.isArray(value) || typeof value !== 'object') {
        addFailure(failures, item, `variants[${index}].values[${valueIndex}] debe ser un objeto.`);
        continue;
      }
      const hasValue = Object.prototype.hasOwnProperty.call(value, 'value');
      const valueType = typeof value.value;
      const validValue = hasValue
        && (value.value === null || ['string', 'number', 'boolean'].includes(valueType))
        && !(valueType === 'string' && !value.value.trim());
      if (!validValue) {
        addFailure(failures, item, `variants[${index}].values[${valueIndex}].value es obligatorio.`);
      } else {
        const normalized = `${valueType}:${JSON.stringify(value.value)}`;
        if (values.has(normalized)) addFailure(failures, item, `valor de variante duplicado: ${value.value}.`);
        values.add(normalized);
      }
      if (typeof value.meaning !== 'string' || !value.meaning.trim()) {
        addFailure(failures, item, `variants[${index}].values[${valueIndex}].meaning es obligatorio.`);
      }
    }
  }
}

function validateContractArray(failures, item, field) {
  if (!requireArray(failures, item, field)) return;
  for (const [index, contract] of item.document[field].entries()) {
    if (!contract || Array.isArray(contract) || typeof contract !== 'object') {
      addFailure(failures, item, `${field}[${index}] debe ser un objeto.`);
      continue;
    }
    if (typeof contract.name !== 'string' || !contract.name.trim()) {
      addFailure(failures, item, `${field}[${index}].name es obligatorio.`);
    }
    if (typeof contract.type !== 'string' || !contract.type.trim()) {
      addFailure(failures, item, `${field}[${index}].type es obligatorio.`);
    }
    if (typeof contract.meaning !== 'string' || !contract.meaning.trim()) {
      addFailure(failures, item, `${field}[${index}].meaning es obligatorio.`);
    }
  }
}

function validatePath(failures, item, atomicRoot, field, candidate) {
  if (candidate === null || candidate === undefined || candidate === '') return;
  if (typeof candidate !== 'string') {
    addFailure(failures, item, `${field} debe ser una ruta o null.`);
    return;
  }
  const resolved = path.resolve(atomicRoot, candidate);
  const relative = path.relative(atomicRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    addFailure(failures, item, `${field} sale de la ra\u00edz Atomic: ${candidate}.`);
  } else if (!fs.existsSync(resolved)) {
    addFailure(failures, item, `${field} no existe: ${candidate}.`);
  }
}

function validateComponent(failures, item, atomicRoot) {
  requireString(failures, item, 'layer');
  if (typeof item.document.layer === 'string' && !ALLOWED_LAYERS.has(item.document.layer)) {
    addFailure(failures, item, `layer inv\u00e1lido: ${item.document.layer}.`);
  }
  for (const field of ['selector', 'export', 'source', 'purpose']) requireString(failures, item, field);
  for (const field of ['states', 'a11y', 'responsive', 'tokens', 'canonicalFor']) {
    requireArray(failures, item, field);
  }
  validateVariants(failures, item);
  validateContractArray(failures, item, 'inputs');
  validateContractArray(failures, item, 'outputs');
  validatePath(failures, item, atomicRoot, 'source', item.document.source);
  validatePath(failures, item, atomicRoot, 'story.path', item.document.story?.path);
  validatePath(failures, item, atomicRoot, 'test.path', item.document.test?.path);
  if (!item.document.stability || typeof item.document.stability !== 'object') {
    addFailure(failures, item, 'stability debe ser un objeto.');
  } else if (typeof item.document.stability.status !== 'string' || !item.document.stability.status.trim()) {
    addFailure(failures, item, 'stability.status es obligatorio.');
  }
}

function validateRecipe(failures, item) {
  if (item.document.kind !== 'ui-recipe') addFailure(failures, item, 'kind debe ser ui-recipe.');
  for (const field of ['variant', 'intent', 'summary', 'whenToUse']) requireString(failures, item, field);
  if (
    typeof item.document.variant === 'string'
    && item.document.id !== `atomic.recipe.${item.document.variant}.v1`
  ) {
    addFailure(failures, item, 'id debe seguir atomic.recipe.<variant>.v1.');
  }
  if (
    !item.document.componentStack
    || Array.isArray(item.document.componentStack)
    || typeof item.document.componentStack !== 'object'
    || Object.keys(item.document.componentStack).length === 0
  ) {
    addFailure(failures, item, 'componentStack debe ser un objeto no vac\u00edo.');
  }
  for (const field of [
    'requiredOperations',
    'optionalOperations',
    'extensionSlots',
    'outputLayers',
    'qualityGates',
  ]) {
    requireArray(failures, item, field);
  }
  if (item.document.operationContracts !== undefined) {
    const contracts = item.document.operationContracts;
    if (!contracts || Array.isArray(contracts) || typeof contracts !== 'object') {
      addFailure(failures, item, 'operationContracts debe ser un objeto.');
    } else {
      for (const [operation, contract] of Object.entries(contracts)) {
        if (!Array.isArray(item.document.optionalOperations) || !item.document.optionalOperations.includes(operation)) {
          addFailure(failures, item, `operationContracts.${operation} no pertenece a optionalOperations.`);
        }
        if (!contract || Array.isArray(contract) || typeof contract !== 'object') {
          addFailure(failures, item, `operationContracts.${operation} debe ser un objeto.`);
          continue;
        }
        if (!Array.isArray(contract.requires) || contract.requires.length === 0) {
          addFailure(failures, item, `operationContracts.${operation}.requires debe ser un arreglo no vacío.`);
        }
        if (typeof contract.authorization !== 'string' || !contract.authorization.trim()) {
          addFailure(failures, item, `operationContracts.${operation}.authorization es obligatorio.`);
        }
      }
    }
  }
  if (
    !item.document.supportedVariants
    || Array.isArray(item.document.supportedVariants)
    || typeof item.document.supportedVariants !== 'object'
    || Object.keys(item.document.supportedVariants).length === 0
  ) {
    addFailure(failures, item, 'supportedVariants debe ser un objeto no vac\u00edo.');
  }
  if (!item.document.defaults || Array.isArray(item.document.defaults) || typeof item.document.defaults !== 'object') {
    addFailure(failures, item, 'defaults debe ser un objeto.');
  } else if (
    item.document.supportedVariants
    && !Array.isArray(item.document.supportedVariants)
    && typeof item.document.supportedVariants === 'object'
  ) {
    for (const [name, values] of Object.entries(item.document.supportedVariants)) {
      if (!Array.isArray(values) || values.length === 0) {
        addFailure(failures, item, `supportedVariants.${name} debe ser un arreglo no vac\u00edo.`);
        continue;
      }
      if (!Object.prototype.hasOwnProperty.call(item.document.defaults, name)) {
        addFailure(failures, item, `defaults.${name} es obligatorio.`);
      } else if (!values.some((value) => Object.is(value, item.document.defaults[name]))) {
        addFailure(failures, item, `defaults.${name} no pertenece a supportedVariants.${name}.`);
      }
    }
    for (const name of Object.keys(item.document.defaults)) {
      if (!Object.prototype.hasOwnProperty.call(item.document.supportedVariants, name)) {
        addFailure(failures, item, `defaults.${name} no tiene una variante soportada.`);
      }
    }
  }
}

function validateUxRule(failures, item) {
  for (const field of ['title', 'intent', 'priority']) requireString(failures, item, field);
  if (typeof item.document.id === 'string' && !/^ux-[a-z0-9-]+$/.test(item.document.id)) {
    addFailure(failures, item, 'id de regla UX debe seguir ux-<nombre>.');
  }
  if (typeof item.document.priority === 'string' && !ALLOWED_UX_PRIORITIES.has(item.document.priority)) {
    addFailure(failures, item, `priority inv\u00e9lida: ${item.document.priority}.`);
  }
  const appliesTo = item.document.appliesTo;
  if (!appliesTo || Array.isArray(appliesTo) || typeof appliesTo !== 'object') {
    addFailure(failures, item, 'appliesTo debe ser un objeto.');
  } else {
    if (!Array.isArray(appliesTo.intents) || appliesTo.intents.length === 0) {
      addFailure(failures, item, 'appliesTo.intents debe ser un arreglo no vac\u00edo.');
    }
    if (appliesTo.components !== undefined && !Array.isArray(appliesTo.components)) {
      addFailure(failures, item, 'appliesTo.components debe ser un arreglo.');
    }
  }
  if (requireArray(failures, item, 'requirements')) {
    if (item.document.requirements.length === 0) addFailure(failures, item, 'requirements no puede estar vac\u00edo.');
    const requirementIds = new Set();
    for (const [index, requirement] of item.document.requirements.entries()) {
      if (!requirement || Array.isArray(requirement) || typeof requirement !== 'object') {
        addFailure(failures, item, `requirements[${index}] debe ser un objeto.`);
        continue;
      }
      if (typeof requirement.id !== 'string' || !/^[a-z0-9-]+$/.test(requirement.id)) {
        addFailure(failures, item, `requirements[${index}].id es inv\u00e1lido.`);
      } else if (requirementIds.has(requirement.id)) {
        addFailure(failures, item, `requirement duplicado: ${requirement.id}.`);
      } else requirementIds.add(requirement.id);
      if (typeof requirement.statement !== 'string' || !requirement.statement.trim()) {
        addFailure(failures, item, `requirements[${index}].statement es obligatorio.`);
      }
      if (!Array.isArray(requirement.enforcedBy) || requirement.enforcedBy.length === 0) {
        addFailure(failures, item, `requirements[${index}].enforcedBy debe ser un arreglo no vac\u00edo.`);
      } else {
        for (const enforcer of requirement.enforcedBy) {
          if (!ALLOWED_UX_ENFORCERS.has(enforcer)) {
            addFailure(failures, item, `enforcedBy inv\u00e1lido en requirements[${index}]: ${enforcer}.`);
          }
        }
      }
    }
  }
  if (!Array.isArray(item.document.acceptance) || item.document.acceptance.length === 0) {
    addFailure(failures, item, 'acceptance debe ser un arreglo no vac\u00edo.');
  }
}

function componentReferences(item) {
  if (item.kind === 'component') return [];
  return uniqueStrings([
    ...stringsBelow(item.document.component),
    ...stringsBelow(item.document.components),
    ...stringsBelow(item.document.componentStack),
    ...stringsBelow(item.document.requires?.components),
    ...stringsBelow(item.document.appliesTo?.components),
  ]);
}

function primaryComponentSources(atomicRoot) {
  const uiRoot = path.join(atomicRoot, 'src', 'app', 'shared', 'ui');
  const sources = [];
  for (const layer of UI_LAYER_DIRECTORIES) {
    const layerRoot = path.join(uiRoot, layer);
    if (!fs.existsSync(layerRoot)) continue;
    for (const entry of fs.readdirSync(layerRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const componentFiles = fs
        .readdirSync(path.join(layerRoot, entry.name), { withFileTypes: true })
        .filter((file) => file.isFile() && file.name.endsWith('.ts') && !/\.(?:spec|stories)\.ts$/.test(file.name))
        .map((file) => path.join(layerRoot, entry.name, file.name))
        .filter((file) => fs.readFileSync(file, 'utf8').includes('@Component'));
      if (componentFiles.length > 0) sources.push(normalizePath(path.relative(atomicRoot, componentFiles[0])));
    }
  }
  return sources;
}

function validateCatalog(catalog, options = {}) {
  const failures = [];
  const warnings = [];
  const selection = options.selection || catalog.items;
  const idsByKind = new Map();
  const componentIds = new Map();
  const selectorOwners = new Map();
  const sourceOwners = new Map();

  for (const item of catalog.items) {
    const document = item.document;
    if (document.schemaVersion !== 1) addFailure(failures, item, 'schemaVersion debe ser 1.');
    if (typeof document.id !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(document.id)) {
      addFailure(failures, item, 'id debe ser estable y usar min\u00fasculas, n\u00fameros, punto, guion o guion bajo.');
    }
    const key = `${item.kind}:${normalizeSearch(document.id)}`;
    if (idsByKind.has(key)) {
      addFailure(failures, item, `id duplicado con ${idsByKind.get(key)}.`);
    } else idsByKind.set(key, item.relativePath);
    if (item.kind === 'component' && document.id) componentIds.set(normalizeSearch(document.id), item);
  }

  for (const item of selection) {
    if (item.kind === 'component') {
      validateComponent(failures, item, catalog.atomicRoot);
      for (const selector of String(item.document.selector || '').split(',').map((value) => value.trim()).filter(Boolean)) {
        const normalized = normalizeSearch(selector);
        if (selectorOwners.has(normalized)) {
          addFailure(failures, item, `selector ${selector} ya pertenece a ${selectorOwners.get(normalized)}.`);
        } else selectorOwners.set(normalized, item.document.id);
      }
      const source = normalizePath(String(item.document.source || ''));
      const sourceExport = `${source}#${normalizeSearch(item.document.export)}`;
      if (source && sourceOwners.has(sourceExport)) {
        addFailure(failures, item, `source y export duplicados con ${sourceOwners.get(sourceExport)}.`);
      } else if (source) sourceOwners.set(sourceExport, item.document.id);
    } else if (item.kind === 'recipe') validateRecipe(failures, item);
    else if (item.kind === 'ux-rule') validateUxRule(failures, item);

    for (const reference of componentReferences(item)) {
      if (!componentIds.has(normalizeSearch(reference))) {
        const message = `${item.relativePath}: referencia de componente no resuelta: ${reference}.`;
        if (options.strictReferences) failures.push(message);
        else warnings.push(message);
      }
    }
  }

  if (options.requireMinimum !== false) {
    for (const id of MINIMUM_COMPONENT_IDS) {
      if (!componentIds.has(normalizeSearch(id))) failures.push(`Componente m\u00ednimo ausente del cat\u00e1logo: ${id}.`);
    }
  }

  if (options.requireComplete) {
    const declared = new Set(
      catalog.items
        .filter((item) => item.kind === 'component')
        .map((item) => normalizePath(String(item.document.source || ''))),
    );
    for (const source of primaryComponentSources(catalog.atomicRoot)) {
      if (!declared.has(source)) failures.push(`Componente fuente sin entrada de cat\u00e1logo: ${source}.`);
    }
  }

  return { failures: uniqueStrings(failures), warnings: uniqueStrings(warnings) };
}

function formatResult(result, selection, options) {
  if (options.format === 'json') {
    return JSON.stringify(
      {
        schemaVersion: 1,
        valid: result.failures.length === 0,
        checked: selection.length,
        failures: result.failures,
        warnings: result.warnings,
      },
      null,
      options.pretty ? 2 : 0,
    );
  }
  if (result.failures.length > 0) return result.failures.map((failure) => `- ${failure}`).join('\n');
  const suffix = result.warnings.length > 0 ? ` warnings=${result.warnings.length}` : '';
  return `Cat\u00e1logo Atomic v1 v\u00e1lido: entries=${selection.length}${suffix}.`;
}

function helpText() {
  return [
    'Uso: node tools/check-atomic-catalog.js [filtros] [opciones]',
    '',
    'Filtros: --intent, --component, --variant y --kind.',
    'Opciones:',
    '  --strict-references  Convierte referencias no resueltas en errores.',
    '  --require-complete   Exige una entrada para cada directorio UI con @Component.',
    '  --no-minimum         Omite temporalmente la allowlist CRUD m\u00ednima.',
    '  --format text|json   Selecciona salida compacta.',
  ].join('\n');
}

function main(argv = process.argv.slice(2), io = console) {
  try {
    const options = checkArgs(argv);
    if (options.help) {
      io.log(helpText());
      return 0;
    }
    const catalog = loadCatalog(options);
    const queried = queryCatalog(catalog, options);
    const hasFilters =
      queried.filters.intents.length
      || queried.filters.components.length
      || queried.filters.variants.length
      || queried.filters.kinds.length;
    if (hasFilters && queried.items.length === 0) throw new CatalogError('Ninguna entrada coincide con los filtros.');
    const selection = hasFilters ? queried.items : catalog.items;
    const result = validateCatalog(catalog, { ...options, selection });
    const output = formatResult(result, selection, options);
    if (result.failures.length > 0) io.error(output);
    else {
      io.log(output);
      if (options.format !== 'json' && result.warnings.length > 0) {
        for (const warning of result.warnings) io.error(`ADVERTENCIA: ${warning}`);
      }
    }
    return result.failures.length === 0 ? 0 : 1;
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
  ALLOWED_LAYERS,
  ALLOWED_UX_ENFORCERS,
  ALLOWED_UX_PRIORITIES,
  UI_LAYER_DIRECTORIES,
  MINIMUM_COMPONENT_IDS,
  checkArgs,
  componentReferences,
  formatResult,
  main,
  primaryComponentSources,
  validateCatalog,
  validateUxRule,
};
