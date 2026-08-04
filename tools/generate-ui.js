#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ATOMIC_ROOT = path.resolve(__dirname, '..');
const RECIPES_ROOT = path.join(ATOMIC_ROOT, 'catalog', 'recipes');
const COMPONENTS_ROOT = path.join(ATOMIC_ROOT, 'catalog', 'components');
const OPERATION_ORDER = [
  'list',
  'read',
  'create',
  'update',
  'delete',
  'activate',
  'deactivate',
];
const OPERATION_SET = new Set(OPERATION_ORDER);
const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const REQUEST_KINDS = new Set(['query', 'draft', 'id', 'id-draft']);
const RESPONSE_KINDS = new Set(['page', 'entity', 'void']);
const FIELD_TYPES = new Set(['string', 'number', 'boolean']);
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const STABLE_ID = /^[a-z][a-z0-9.-]{2,100}$/;
const KEBAB = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SELECTOR = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/;
const PASCAL = /^[A-Z][A-Za-z0-9]*$/;

class RequirementError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequirementError';
  }
}

function usage() {
  return [
    'Atomic UI declarative generator',
    '',
    'Usage:',
    '  node tools/generate-ui.js --spec <requirement.json> --output <consumer-root>',
    '  node tools/generate-ui.js --spec <requirement.json> --output <consumer-root> --dry-run',
    '',
    'The output root is required. Existing generated targets are never overwritten.',
  ].join('\n');
}

function parseArguments(argv) {
  const parsed = { dryRun: false, help: false, spec: null, output: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dry-run') {
      parsed.dryRun = true;
    } else if (argument === '--help' || argument === '-h') {
      parsed.help = true;
    } else if (argument === '--spec' || argument === '--output') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new RequirementError(`${argument} requiere un valor.`);
      }
      parsed[argument.slice(2)] = value;
      index += 1;
    } else if (argument.startsWith('--spec=')) {
      parsed.spec = argument.slice('--spec='.length);
    } else if (argument.startsWith('--output=')) {
      parsed.output = argument.slice('--output='.length);
    } else {
      throw new RequirementError(`Argumento desconocido: ${argument}`);
    }
  }
  return parsed;
}

function readJson(file, label) {
  let source;
  try {
    source = fs.readFileSync(file, 'utf8');
  } catch (error) {
    throw new RequirementError(`No se pudo leer ${label}: ${file}. ${error.message}`);
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new RequirementError(`${label} no contiene JSON válido: ${file}. ${error.message}`);
  }
}

function fail(condition, message) {
  if (!condition) {
    throw new RequirementError(message);
  }
}

function object(value, location) {
  fail(value !== null && typeof value === 'object' && !Array.isArray(value), `${location} debe ser un objeto.`);
  return value;
}

function rejectUnknown(value, allowed, location) {
  for (const key of Object.keys(value)) {
    fail(allowed.includes(key), `${location}.${key} no está permitido por schemaVersion 1.`);
  }
}

function nonEmptyString(value, location) {
  fail(typeof value === 'string' && value.trim().length > 0, `${location} debe ser texto no vacío.`);
  return value;
}

function uniqueStrings(value, location, allowEmpty = false) {
  fail(
    Array.isArray(value) && (allowEmpty || value.length > 0),
    `${location} debe ser un arreglo${allowEmpty ? '' : ' no vacío'}.`,
  );
  const seen = new Set();
  for (const [index, item] of value.entries()) {
    nonEmptyString(item, `${location}[${index}]`);
    fail(!seen.has(item), `${location} contiene el valor duplicado ${item}.`);
    seen.add(item);
  }
  return value;
}

function loadRecipe(recipeName) {
  fail(KEBAB.test(recipeName), `recipe no es un identificador seguro: ${recipeName}.`);
  const recipePath = path.join(RECIPES_ROOT, `${recipeName}.json`);
  const recipe = object(readJson(recipePath, 'la receta'), 'recipe');
  rejectUnknown(
    recipe,
    [
      'schemaVersion',
      'id',
      'kind',
      'variant',
      'intent',
      'summary',
      'whenToUse',
      'componentStack',
      'requiredOperations',
      'optionalOperations',
      'operationContracts',
      'supportedVariants',
      'defaults',
      'extensionSlots',
      'outputLayers',
      'qualityGates',
    ],
    'recipe',
  );
  fail(recipe.schemaVersion === 1, 'La receta debe declarar schemaVersion: 1.');
  fail(typeof recipe.id === 'string' && STABLE_ID.test(recipe.id), 'La receta debe declarar un id estable.');
  fail(recipe.kind === 'ui-recipe', 'La receta debe declarar kind: ui-recipe.');
  fail(recipe.variant === recipeName, `La variante de la receta debe ser ${recipeName}.`);
  const required = uniqueStrings(recipe.requiredOperations, 'recipe.requiredOperations');
  const optional = uniqueStrings(recipe.optionalOperations, 'recipe.optionalOperations', true);
  for (const operation of [...required, ...optional]) {
    fail(OPERATION_SET.has(operation), `Operación desconocida en receta: ${operation}.`);
  }
  fail(
    required.every((operation) => !optional.includes(operation)),
    'Una operación no puede ser obligatoria y opcional a la vez.',
  );
  const componentStack = object(recipe.componentStack, 'recipe.componentStack');
  const knownComponentIds = loadComponentIds();
  fail(Object.keys(componentStack).length > 0, 'recipe.componentStack no puede estar vacio.');
  for (const [slot, componentIds] of Object.entries(componentStack)) {
    fail(KEBAB.test(slot), `Slot de componentStack no valido: ${slot}.`);
    uniqueStrings(componentIds, `recipe.componentStack.${slot}`);
    for (const componentId of componentIds) {
      fail(
        knownComponentIds.has(componentId),
        `La receta ${recipe.id} referencia el componente no catalogado ${componentId}.`,
      );
    }
  }
  object(recipe.supportedVariants, 'recipe.supportedVariants');
  object(recipe.defaults, 'recipe.defaults');
  if (recipe.operationContracts !== undefined) {
    object(recipe.operationContracts, 'recipe.operationContracts');
  }
  return recipe;
}

function loadComponentIds() {
  let entries;
  try {
    entries = fs.readdirSync(COMPONENTS_ROOT, { withFileTypes: true });
  } catch (error) {
    throw new RequirementError(`No se pudo leer el catalogo de componentes: ${error.message}`);
  }
  const ids = new Set();
  for (const entry of entries.filter((candidate) => candidate.isFile() && candidate.name.endsWith('.json'))) {
    const descriptor = object(
      readJson(path.join(COMPONENTS_ROOT, entry.name), `el descriptor ${entry.name}`),
      `catalog.components.${entry.name}`,
    );
    fail(descriptor.schemaVersion === 1, `${entry.name} debe declarar schemaVersion: 1.`);
    fail(typeof descriptor.id === 'string' && KEBAB.test(descriptor.id), `${entry.name} no declara un id valido.`);
    fail(!ids.has(descriptor.id), `Id de componente duplicado: ${descriptor.id}.`);
    ids.add(descriptor.id);
  }
  return ids;
}

function validateRequirement(spec, recipe) {
  object(spec, 'spec');
  rejectUnknown(
    spec,
    ['$schema', 'schemaVersion', 'id', 'recipe', 'feature', 'model', 'table', 'editor', 'detail', 'variants', 'actions', 'contract'],
    'spec',
  );
  fail(spec.schemaVersion === 1, 'spec.schemaVersion debe ser 1.');
  fail(typeof spec.id === 'string' && STABLE_ID.test(spec.id), 'spec.id debe ser estable y usar minúsculas, puntos o guiones.');
  fail(spec.recipe === recipe.variant, `spec.recipe debe coincidir con ${recipe.variant}.`);
  if (spec.$schema !== undefined) {
    nonEmptyString(spec.$schema, 'spec.$schema');
  }

  validateFeature(spec.feature, recipe.variant);
  const fields = validateModel(spec.model);
  validateTable(spec.table, fields);
  validateEditorAndDetail(spec, fields);
  validateVariants(spec.variants || {}, recipe);
  const actions = validateActions(spec.actions, recipe);
  validateContract(spec.contract, recipe, actions);

  return {
    ...spec,
    actions,
    variants: { ...recipe.defaults, ...(spec.variants || {}) },
  };
}

function validateFeature(featureValue, recipeVariant) {
  const feature = object(featureValue, 'spec.feature');
  rejectUnknown(feature, ['key', 'className', 'selector', 'title', 'singular', 'plural', 'routePath'], 'spec.feature');
  fail(typeof feature.key === 'string' && KEBAB.test(feature.key), 'spec.feature.key debe usar kebab-case.');
  fail(typeof feature.className === 'string' && PASCAL.test(feature.className), 'spec.feature.className debe usar PascalCase.');
  fail(typeof feature.selector === 'string' && SELECTOR.test(feature.selector), 'spec.feature.selector debe ser un custom element válido.');
  nonEmptyString(feature.title, 'spec.feature.title');
  nonEmptyString(feature.singular, 'spec.feature.singular');
  nonEmptyString(feature.plural, 'spec.feature.plural');
  fail(feature.title.length <= 120, 'spec.feature.title no puede superar 120 caracteres.');
  fail(feature.singular.length <= 80, 'spec.feature.singular no puede superar 80 caracteres.');
  fail(feature.plural.length <= 80, 'spec.feature.plural no puede superar 80 caracteres.');
  if (recipeVariant === 'route-form') {
    fail(typeof feature.routePath === 'string' && /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(feature.routePath), 'route-form exige spec.feature.routePath.');
  } else if (feature.routePath !== undefined) {
    fail(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(feature.routePath), 'spec.feature.routePath no es válido.');
  }
}

function validateModel(modelValue) {
  const model = object(modelValue, 'spec.model');
  rejectUnknown(model, ['name', 'id', 'fields'], 'spec.model');
  fail(typeof model.name === 'string' && PASCAL.test(model.name), 'spec.model.name debe usar PascalCase.');
  const id = object(model.id, 'spec.model.id');
  rejectUnknown(id, ['name', 'type'], 'spec.model.id');
  fail(typeof id.name === 'string' && IDENTIFIER.test(id.name), 'spec.model.id.name debe ser un identificador TypeScript.');
  fail(id.type === 'string' || id.type === 'number', 'spec.model.id.type debe ser string o number.');
  fail(Array.isArray(model.fields) && model.fields.length > 0, 'spec.model.fields debe contener al menos un campo.');

  const fields = new Map([[id.name, { name: id.name, type: id.type, label: 'Identificador', nullable: false }]]);
  for (const [index, fieldValue] of model.fields.entries()) {
    const field = object(fieldValue, `spec.model.fields[${index}]`);
    rejectUnknown(
      field,
      [
        'name',
        'type',
        'label',
        'nullable',
        'required',
        'minLength',
        'maxLength',
        'initialValue',
        'minimum',
        'maximum',
        'step',
        'mustBeTrue',
      ],
      `spec.model.fields[${index}]`,
    );
    fail(typeof field.name === 'string' && IDENTIFIER.test(field.name), `spec.model.fields[${index}].name no es válido.`);
    fail(!fields.has(field.name), `El campo ${field.name} está duplicado o colisiona con el identificador.`);
    fail(FIELD_TYPES.has(field.type), `Tipo no soportado para ${field.name}: ${field.type}.`);
    nonEmptyString(field.label, `spec.model.fields[${index}].label`);
    fail(field.label.length <= 100, `${field.name}.label no puede superar 100 caracteres.`);
    for (const booleanKey of ['nullable', 'required']) {
      if (field[booleanKey] !== undefined) {
        fail(typeof field[booleanKey] === 'boolean', `${field.name}.${booleanKey} debe ser boolean.`);
      }
    }
    for (const lengthKey of ['minLength', 'maxLength']) {
      if (field[lengthKey] !== undefined) {
        fail(Number.isInteger(field[lengthKey]) && field[lengthKey] >= (lengthKey === 'maxLength' ? 1 : 0), `${field.name}.${lengthKey} no es válido.`);
        fail(field.type === 'string', `${field.name}.${lengthKey} solo aplica a strings.`);
      }
    }
    if (field.minLength !== undefined && field.maxLength !== undefined) {
      fail(field.minLength <= field.maxLength, `${field.name}: minLength no puede superar maxLength.`);
    }
    if (field.type !== 'string') {
      fail(field.minLength === undefined && field.maxLength === undefined, `${field.name}: minLength y maxLength solo aplican a strings.`);
    }
    for (const numericKey of ['minimum', 'maximum', 'step']) {
      if (field[numericKey] !== undefined) {
        fail(field.type === 'number', `${field.name}.${numericKey} solo aplica a números.`);
        fail(Number.isFinite(field[numericKey]), `${field.name}.${numericKey} debe ser un número finito.`);
      }
    }
    if (field.step !== undefined) {
      fail(field.step > 0, `${field.name}.step debe ser mayor que cero.`);
    }
    if (field.minimum !== undefined && field.maximum !== undefined) {
      fail(field.minimum <= field.maximum, `${field.name}: minimum no puede superar maximum.`);
    }
    if (field.mustBeTrue !== undefined) {
      fail(field.type === 'boolean' && typeof field.mustBeTrue === 'boolean', `${field.name}.mustBeTrue solo aplica a booleanos.`);
    }
    if (Object.prototype.hasOwnProperty.call(field, 'initialValue')) {
      const initialValue = field.initialValue;
      const validInitialValue = initialValue === null
        ? field.nullable === true
        : typeof initialValue === field.type;
      fail(validInitialValue, `${field.name}.initialValue no coincide con el tipo ${field.type}.`);
      if (typeof initialValue === 'number') {
        fail(Number.isFinite(initialValue), `${field.name}.initialValue debe ser finito.`);
        if (field.minimum !== undefined) fail(initialValue >= field.minimum, `${field.name}.initialValue es menor que minimum.`);
        if (field.maximum !== undefined) fail(initialValue <= field.maximum, `${field.name}.initialValue supera maximum.`);
      }
      if (typeof initialValue === 'string') {
        if (field.minLength !== undefined && initialValue.length > 0) {
          fail(initialValue.length >= field.minLength, `${field.name}.initialValue no cumple minLength.`);
        }
        if (field.maxLength !== undefined) {
          fail(initialValue.length <= field.maxLength, `${field.name}.initialValue supera maxLength.`);
        }
      }
    }
    if (field.type === 'number') {
      for (const key of ['initialValue', 'minimum', 'maximum', 'step']) {
        fail(Object.prototype.hasOwnProperty.call(field, key), `El campo numérico ${field.name} exige ${key} explícito.`);
      }
    }
    if (field.type === 'boolean') {
      fail(
        Object.prototype.hasOwnProperty.call(field, 'initialValue'),
        `El campo booleano ${field.name} exige initialValue explícito.`,
      );
    }
    fail(!(field.nullable && field.required), `${field.name} no puede ser nullable y required a la vez.`);
    fields.set(field.name, field);
  }
  return fields;
}

function validateTable(tableValue, fields) {
  const table = object(tableValue, 'spec.table');
  rejectUnknown(table, ['columns', 'pageSize'], 'spec.table');
  fail(Array.isArray(table.columns) && table.columns.length > 0, 'spec.table.columns debe contener al menos una columna.');
  const used = new Set();
  for (const [index, columnValue] of table.columns.entries()) {
    const column = object(columnValue, `spec.table.columns[${index}]`);
    rejectUnknown(column, ['field', 'header', 'sortable'], `spec.table.columns[${index}]`);
    fail(typeof column.field === 'string' && fields.has(column.field), `Columna desconocida: ${column.field}.`);
    fail(!used.has(column.field), `Columna duplicada: ${column.field}.`);
    used.add(column.field);
    nonEmptyString(column.header, `spec.table.columns[${index}].header`);
    fail(column.header.length <= 100, `${column.field}.header no puede superar 100 caracteres.`);
    if (column.sortable !== undefined) {
      fail(typeof column.sortable === 'boolean', `${column.field}.sortable debe ser boolean.`);
    }
  }
  if (table.pageSize !== undefined) {
    fail(Number.isInteger(table.pageSize) && table.pageSize >= 1 && table.pageSize <= 100, 'spec.table.pageSize debe estar entre 1 y 100.');
  }
}

function validateEditorAndDetail(spec, fields) {
  const needsEditor = spec.recipe === 'modal-catalog' || spec.recipe === 'route-form';
  if (needsEditor) {
    const editor = object(spec.editor, 'spec.editor');
    rejectUnknown(editor, ['fields'], 'spec.editor');
    const editorFields = uniqueStrings(editor.fields, 'spec.editor.fields');
    for (const fieldName of editorFields) {
      fail(fields.has(fieldName), `Campo de editor desconocido: ${fieldName}.`);
      fail(fieldName !== spec.model.id.name, 'El identificador no puede editarse como campo ordinario.');
      const field = fields.get(fieldName);
      fail(!field.nullable, `El generador v1 exige que el campo editable ${fieldName} no sea nullable.`);
    }
  } else {
    fail(spec.editor === undefined, `${spec.recipe} no admite editor en schemaVersion 1.`);
  }

  if (spec.recipe === 'master-detail') {
    const detail = object(spec.detail, 'spec.detail');
    rejectUnknown(detail, ['fields'], 'spec.detail');
    const detailFields = uniqueStrings(detail.fields, 'spec.detail.fields');
    for (const fieldName of detailFields) {
      fail(fields.has(fieldName), `Campo de detalle desconocido: ${fieldName}.`);
    }
  } else {
    fail(spec.detail === undefined, `${spec.recipe} no admite detail en schemaVersion 1.`);
  }
}

function validateVariants(variantsValue, recipe) {
  const variants = object(variantsValue, 'spec.variants');
  rejectUnknown(variants, ['density', 'editorSize', 'formLayout', 'detailPlacement', 'actionDisplay'], 'spec.variants');
  for (const [key, value] of Object.entries(variants)) {
    const supported = recipe.supportedVariants[key];
    fail(Array.isArray(supported), `La receta ${recipe.variant} no admite la variante ${key}.`);
    fail(supported.includes(value), `Valor no soportado para ${key}: ${value}.`);
  }
  for (const [key, value] of Object.entries(recipe.defaults)) {
    fail(recipe.supportedVariants[key]?.includes(value), `Default inválido en receta para ${key}.`);
  }
}

function validateActions(actionsValue, recipe) {
  if (actionsValue === undefined) return [];
  fail(Array.isArray(actionsValue) && actionsValue.length > 0, 'spec.actions debe ser un arreglo no vacío.');
  const seen = new Set();
  return actionsValue.map((actionValue, index) => {
    const location = `spec.actions[${index}]`;
    const action = object(actionValue, location);
    rejectUnknown(action, ['operation', 'location', 'label', 'permissionKey', 'confirmation'], location);
    fail(action.operation === 'delete', `${location}.operation debe ser delete en schemaVersion 1.`);
    fail(action.location === 'row', `${location}.location debe ser row.`);
    fail(recipe.optionalOperations.includes(action.operation), `La receta ${recipe.variant} no admite la acción ${action.operation}.`);
    fail(!seen.has(action.operation), `La acción ${action.operation} está duplicada.`);
    seen.add(action.operation);
    nonEmptyString(action.label, `${location}.label`);
    nonEmptyString(action.permissionKey, `${location}.permissionKey`);
    fail(action.label.length <= 80, `${location}.label no puede superar 80 caracteres.`);
    fail(action.permissionKey.length <= 160, `${location}.permissionKey no puede superar 160 caracteres.`);
    const confirmation = object(action.confirmation, `${location}.confirmation`);
    rejectUnknown(confirmation, ['title', 'message', 'confirmLabel', 'cancelLabel'], `${location}.confirmation`);
    for (const key of ['title', 'message', 'confirmLabel', 'cancelLabel']) {
      nonEmptyString(confirmation[key], `${location}.confirmation.${key}`);
    }
    fail(confirmation.title.length <= 120, `${location}.confirmation.title no puede superar 120 caracteres.`);
    fail(confirmation.message.length <= 300, `${location}.confirmation.message no puede superar 300 caracteres.`);
    fail(confirmation.confirmLabel.length <= 80, `${location}.confirmation.confirmLabel no puede superar 80 caracteres.`);
    fail(confirmation.cancelLabel.length <= 80, `${location}.confirmation.cancelLabel no puede superar 80 caracteres.`);
    return action;
  });
}

function validateContract(contractValue, recipe, actions) {
  const contract = object(contractValue, 'spec.contract');
  const explicitOperations = new Set(actions.map((action) => action.operation));
  const allowedOperations = new Set([...recipe.requiredOperations, ...explicitOperations]);
  fail(contract.mode === 'ui-only' || contract.mode === 'integrated', 'spec.contract.mode debe ser ui-only o integrated.');
  if (contract.mode === 'ui-only') {
    rejectUnknown(contract, ['mode', 'capabilities'], 'spec.contract');
    const capabilities = uniqueStrings(contract.capabilities, 'spec.contract.capabilities');
    for (const operation of capabilities) {
      fail(OPERATION_SET.has(operation), `Capability desconocida: ${operation}.`);
      fail(allowedOperations.has(operation), `La capability ${operation} no tiene una acción explícita en la receta ${recipe.variant}.`);
    }
    for (const required of recipe.requiredOperations) {
      fail(capabilities.includes(required), `La receta ${recipe.variant} exige la capability ${required}.`);
    }
    for (const operation of explicitOperations) {
      fail(capabilities.includes(operation), `La acción ${operation} exige la capability correspondiente.`);
    }
    return;
  }

  rejectUnknown(contract, ['mode', 'operations'], 'spec.contract');
  const operations = object(contract.operations, 'spec.contract.operations');
  fail(Object.keys(operations).length > 0, 'integrated exige al menos una operación.');
  rejectUnknown(operations, OPERATION_ORDER, 'spec.contract.operations');
  for (const required of recipe.requiredOperations) {
    fail(operations[required] !== undefined, `La receta ${recipe.variant} exige endpoint y método para ${required}.`);
  }
  for (const operationName of orderedOperations(Object.keys(operations))) {
    fail(
      allowedOperations.has(operationName),
      `La operación ${operationName} no tiene una acción explícita en la receta ${recipe.variant}.`,
    );
    validateOperation(operationName, operations[operationName]);
  }
  for (const operation of explicitOperations) {
    fail(operations[operation] !== undefined, `La acción ${operation} exige method, path y contrato de operación.`);
  }
}

function validateOperation(name, operationValue) {
  const operation = object(operationValue, `spec.contract.operations.${name}`);
  rejectUnknown(operation, ['method', 'path', 'request', 'response', 'id', 'queryParameters'], `spec.contract.operations.${name}`);
  fail(HTTP_METHODS.has(operation.method), `${name}.method no es válido.`);
  fail(typeof operation.path === 'string' && /^\/[^\s]*$/.test(operation.path), `${name}.path es obligatorio y debe iniciar con /.`);
  fail(REQUEST_KINDS.has(operation.request), `${name}.request no es válido.`);
  fail(RESPONSE_KINDS.has(operation.response), `${name}.response no es válido.`);

  const expected = {
    list: { request: 'query', response: ['page'] },
    read: { request: 'id', response: ['entity'] },
    create: { request: 'draft', response: ['entity', 'void'] },
    update: { request: 'id-draft', response: ['entity', 'void'] },
    delete: { request: 'id', response: ['entity', 'void'] },
    activate: { request: 'id', response: ['entity', 'void'] },
    deactivate: { request: 'id', response: ['entity', 'void'] },
  }[name];
  fail(operation.request === expected.request, `${name}.request debe ser ${expected.request} en schemaVersion 1.`);
  fail(expected.response.includes(operation.response), `${name}.response no es compatible con la operación.`);

  if (operation.request === 'id' || operation.request === 'id-draft') {
    const id = object(operation.id, `spec.contract.operations.${name}.id`);
    rejectUnknown(id, ['location', 'name'], `spec.contract.operations.${name}.id`);
    fail(['path', 'query', 'body'].includes(id.location), `${name}.id.location no es válido.`);
    fail(typeof id.name === 'string' && IDENTIFIER.test(id.name), `${name}.id.name no es válido.`);
    if (id.location === 'path') {
      const placeholders = operation.path.match(/\{[^{}]+\}/g) || [];
      fail(
        placeholders.length === 1 && placeholders[0] === '{id}',
        `${name}.path debe contener exactamente un marcador {id} cuando id.location es path.`,
      );
    } else {
      fail(!/[{}]/.test(operation.path), `${name}.path no puede contener marcadores si el id no viaja en path.`);
    }
  } else {
    fail(operation.id === undefined, `${name}.id solo aplica a requests id o id-draft.`);
    fail(!/[{}]/.test(operation.path), `${name}.path no puede contener marcadores sin un request con id.`);
  }

  if (operation.request === 'query' && operation.method === 'GET') {
    const parameters = object(operation.queryParameters, `spec.contract.operations.${name}.queryParameters`);
    rejectUnknown(parameters, ['page', 'pageSize', 'search', 'sortField', 'sortDirection'], `${name}.queryParameters`);
    for (const key of ['page', 'pageSize', 'search', 'sortField', 'sortDirection']) {
      nonEmptyString(parameters[key], `${name}.queryParameters.${key}`);
    }
  } else {
    fail(operation.queryParameters === undefined, `${name}.queryParameters solo aplica a query mediante GET.`);
  }
}

function orderedOperations(operations) {
  return OPERATION_ORDER.filter((operation) => operations.includes(operation));
}

function capabilities(spec) {
  return spec.contract.mode === 'ui-only'
    ? orderedOperations(spec.contract.capabilities)
    : orderedOperations(Object.keys(spec.contract.operations));
}

function actionFor(spec, operation) {
  return spec.actions.find((action) => action.operation === operation);
}

function generatedHeader(spec, recipe) {
  return [
    `// Generated from ${spec.id}.`,
    `// Atomic recipe: ${recipe.id}.`,
    '// Deterministic scaffold: change the requirement or an explicit extension, never this header.',
    '',
  ].join('\n');
}

function generatedHtmlHeader(spec, recipe) {
  return `<!-- Generated from ${spec.id}; Atomic recipe: ${recipe.id}. -->\n`;
}

function tsString(value) {
  return JSON.stringify(value);
}

function html(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function constantName(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
}

function typeFor(field) {
  return `${field.type}${field.nullable ? ' | null' : ''}`;
}

function fieldByName(spec, name) {
  if (name === spec.model.id.name) {
    return { ...spec.model.id, label: 'Identificador', nullable: false };
  }
  return spec.model.fields.find((field) => field.name === name);
}

function defaultValue(field) {
  if (Object.prototype.hasOwnProperty.call(field, 'initialValue')) {
    return tsString(field.initialValue);
  }
  return "''";
}

function exampleValue(field, index) {
  if (field.type === 'number') return String(index + 1);
  if (field.type === 'boolean') return 'true';
  return tsString(`${field.label} ${index + 1}`);
}

function buildModels(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const model = spec.model.name;
  const id = spec.model.id;
  const draftNames = spec.editor?.fields || spec.model.fields.map((field) => field.name);
  const draftFields = draftNames.map((name) => fieldByName(spec, name));
  return `${header}export type ${model}Id = ${id.type};

export type ${model}RequestStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface ${model} {
  readonly ${id.name}: ${id.type};
${spec.model.fields.map((field) => `  readonly ${field.name}: ${typeFor(field)};`).join('\n')}
}

export interface ${model}Draft {
${draftFields.map((field) => `  readonly ${field.name}: ${typeFor(field)};`).join('\n')}
}

export interface ${model}Query {
  readonly page: number;
  readonly pageSize: number;
  readonly search: string;
  readonly sortField: string;
  readonly sortDirection: 'asc' | 'desc';
}

export interface ${model}Page {
  readonly rows: readonly ${model}[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalRecords: number;
  readonly totalPages: number;
}
`;
}

function canonicalHttpContract(spec) {
  const operations = {};
  for (const name of orderedOperations(Object.keys(spec.contract.operations))) {
    operations[name] = spec.contract.operations[name];
  }
  return { mode: 'integrated', operations };
}

function buildHttpContract(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const featureClass = spec.feature.className;
  const contract = `${constantName(featureClass)}_HTTP_CONTRACT`;
  const contractJson = JSON.stringify(canonicalHttpContract(spec), null, 2);
  return `${header}/**
 * Metadatos HTTP declarados por el requisito. No son un adaptador ejecutable:
 * el consumidor debe mapear sus DTO, paginación, errores y URL base al puerto de datos.
 */
export const ${contract} = ${contractJson} as const;

export type ${featureClass}HttpContract = typeof ${contract};
`;
}

function portMethod(spec, name) {
  const model = spec.model.name;
  const signatures = {
    list: `list(query: ${model}Query): Promise<${model}Page>`,
    read: `read(id: ${model}Id): Promise<${model}>`,
    create: `create(draft: ${model}Draft): Promise<void>`,
    update: `update(id: ${model}Id, draft: ${model}Draft): Promise<void>`,
    delete: `delete(id: ${model}Id): Promise<void>`,
    activate: `activate(id: ${model}Id): Promise<void>`,
    deactivate: `deactivate(id: ${model}Id): Promise<void>`,
  };
  return signatures[name];
}

function portStubMethod(spec, name) {
  const args = {
    list: '_query',
    read: '_id',
    create: '_draft',
    update: '_id, _draft',
    delete: '_id',
    activate: '_id',
    deactivate: '_id',
  }[name];
  return `  ${name}: (${args}) => Promise.reject(missingPortError()),`;
}

function buildDataPort(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const featureClass = spec.feature.className;
  const model = spec.model.name;
  const port = `${featureClass}DataPort`;
  const token = `${constantName(featureClass)}_DATA_PORT`;
  const operations = capabilities(spec);
  const imports = new Set();
  for (const name of operations) {
    if (name === 'list') {
      imports.add(model);
      imports.add(`${model}Page`);
      imports.add(`${model}Query`);
    }
    if (name === 'read') {
      imports.add(model);
      imports.add(`${model}Id`);
    }
    if (name === 'create') imports.add(`${model}Draft`);
    if (name === 'update') {
      imports.add(`${model}Draft`);
      imports.add(`${model}Id`);
    }
    if (['delete', 'activate', 'deactivate'].includes(name)) imports.add(`${model}Id`);
  }
  const missingMessage = spec.contract.mode === 'integrated'
    ? `Configure un adaptador para ${token}; ${spec.id} conserva métodos y rutas HTTP, pero no inventa DTO, paginación ni URL base.`
    : `Configure un proveedor para ${token}; el requisito ${spec.id} es ui-only y no contiene endpoints.`;
  return `${header}import { InjectionToken } from '@angular/core';
import { ${[...imports].sort().join(', ')} } from './${spec.feature.key}.models';

export interface ${port} {
${operations.map((name) => `  ${portMethod(spec, name)};`).join('\n')}
}

function missingPortError(): Error {
  return new Error(${tsString(missingMessage)});
}

const MISSING_${token}: ${port} = {
${operations.map((name) => portStubMethod(spec, name)).join('\n')}
};

export const ${token} = new InjectionToken<${port}>(${tsString(token)}, {
  factory: () => MISSING_${token},
});
`;
}

function buildPermissionPort(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const featureClass = spec.feature.className;
  const model = spec.model.name;
  const port = `${featureClass}PermissionPort`;
  const token = `${constantName(featureClass)}_PERMISSION_PORT`;
  return `${header}import { InjectionToken } from '@angular/core';
import { ${model}Id } from './${spec.feature.key}.models';

export interface ${port} {
  can(permissionKey: string, subjectId: ${model}Id): boolean;
}

const DENY_ALL_${token}: ${port} = {
  can: (_permissionKey, _subjectId) => false,
};

/** Deniega por defecto. El consumidor debe proveer su autoridad real. */
export const ${token} = new InjectionToken<${port}>(${tsString(token)}, {
  factory: () => DENY_ALL_${token},
});
`;
}

function buildPermissionSpec(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const featureClass = spec.feature.className;
  const token = `${constantName(featureClass)}_PERMISSION_PORT`;
  const fixtureId = spec.model.id.type === 'number' ? '0' : tsString('fixture-id');
  return `${header}import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ${token} } from './${spec.feature.key}.permissions';

describe('${featureClass}PermissionPort', () => {
  it('denies every permission until the consumer provides its authority', () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    expect(TestBed.inject(${token}).can(${tsString(actionFor(spec, 'delete').permissionKey)}, ${fixtureId})).toBe(false);
  });
});
`;
}

function dataCall(spec, expression) {
  return expression;
}

function buildMutationMethod(spec, name) {
  const model = spec.model.name;
  const singular = spec.feature.singular;
  const args = name === 'create'
    ? `draft: ${model}Draft`
    : name === 'update'
      ? `id: ${model}Id, draft: ${model}Draft`
      : `id: ${model}Id`;
  const callArgs = name === 'create' ? 'draft' : name === 'update' ? 'id, draft' : 'id';
  const messages = {
    create: `${singular} creado correctamente.`,
    update: `${singular} actualizado correctamente.`,
    delete: `${singular} eliminado correctamente.`,
    activate: `${singular} activado correctamente.`,
    deactivate: `${singular} desactivado correctamente.`,
  };
  return `  async ${name}(${args}): Promise<boolean> {
    return this.mutate(
      async () => { await ${dataCall(spec, `this.data.${name}(${callArgs})`)}; },
      ${tsString(messages[name])},
    );
  }`;
}

function buildFacade(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const model = spec.model.name;
  const featureClass = spec.feature.className;
  const operations = capabilities(spec);
  const hasRead = operations.includes('read');
  const mutationOperations = operations.filter((name) => ['create', 'update', 'delete', 'activate', 'deactivate'].includes(name));
  const imports = [model, `${model}Draft`, `${model}Id`, `${model}Page`, `${model}Query`, `${model}RequestStatus`];
  const dataImport = `import { ${constantName(featureClass)}_DATA_PORT, ${featureClass}DataPort } from './${spec.feature.key}.data-port';`;
  const dataDeclaration = `private readonly data: ${featureClass}DataPort = inject(${constantName(featureClass)}_DATA_PORT);`;
  const firstSort = spec.table.columns.find((column) => column.sortable)?.field || spec.table.columns[0].field;
  const pageSize = spec.table.pageSize || 10;
  const selectedState = hasRead
    ? `  private readonly selectedState = signal<${model} | null>(null);
  private readonly detailStatusState = signal<${model}RequestStatus>('idle');
  private readonly detailErrorState = signal<string | null>(null);
  private detailSequence = 0;
`
    : '';
  const selectedReadonly = hasRead
    ? `  readonly selected = this.selectedState.asReadonly();
  readonly detailStatus = this.detailStatusState.asReadonly();
  readonly detailError = this.detailErrorState.asReadonly();
`
    : '';
  const loadDetail = hasRead
    ? `
  async loadDetail(id: ${model}Id): Promise<boolean> {
    const requestId = ++this.detailSequence;
    this.detailStatusState.set('loading');
    this.detailErrorState.set(null);
    try {
      const row = await ${dataCall(spec, 'this.data.read(id)')};
      if (requestId !== this.detailSequence) return false;
      this.selectedState.set(row);
      this.detailStatusState.set('success');
      return true;
    } catch (error: unknown) {
      if (requestId !== this.detailSequence) return false;
      this.selectedState.set(null);
      this.detailStatusState.set('error');
      this.detailErrorState.set(errorMessage(error, ${tsString(`No fue posible cargar el detalle de ${spec.feature.singular}.`)}));
      return false;
    }
  }

  clearDetail(): void {
    this.detailSequence += 1;
    this.selectedState.set(null);
    this.detailStatusState.set('idle');
    this.detailErrorState.set(null);
  }
`
    : '';
  const saveMethod = operations.includes('create') && operations.includes('update')
    ? `
  save(id: ${model}Id | null, draft: ${model}Draft): Promise<boolean> {
    return id === null ? this.create(draft) : this.update(id, draft);
  }
`
    : '';
  const mutationState = mutationOperations.length > 0
    ? `  private readonly mutationStatusState = signal<${model}RequestStatus>('idle');
  private readonly mutationErrorState = signal<string | null>(null);
  private readonly feedbackState = signal<string | null>(null);
`
    : '';
  const mutationReadonly = mutationOperations.length > 0
    ? `  readonly mutationStatus = this.mutationStatusState.asReadonly();
  readonly mutationError = this.mutationErrorState.asReadonly();
  readonly feedback = this.feedbackState.asReadonly();
  readonly isMutating = computed(() => this.mutationStatusState() === 'loading');
`
    : '';
  const mutationHelpers = mutationOperations.length > 0
    ? `
  clearFeedback(): void {
    if (!this.isMutating()) this.mutationStatusState.set('idle');
    this.mutationErrorState.set(null);
    this.feedbackState.set(null);
  }

  private async mutate(action: () => Promise<unknown>, successMessage: string): Promise<boolean> {
    if (this.isMutating()) return false;
    this.mutationStatusState.set('loading');
    this.mutationErrorState.set(null);
    this.feedbackState.set(null);
    try {
      await action();
      await this.load();
      this.mutationStatusState.set('success');
      this.feedbackState.set(successMessage);
      return true;
    } catch (error: unknown) {
      this.mutationStatusState.set('error');
      this.mutationErrorState.set(errorMessage(error, ${tsString(`No fue posible modificar ${spec.feature.singular}.`)}));
      return false;
    }
  }
`
    : '';
  return `${header}import { Injectable, computed, inject, signal } from '@angular/core';
import { ${imports.join(', ')} } from './${spec.feature.key}.models';
${dataImport}

@Injectable()
export class ${featureClass}Facade {
  ${dataDeclaration}
  private readonly rowsState = signal<readonly ${model}[]>([]);
  private readonly statusState = signal<${model}RequestStatus>('idle');
  private readonly errorState = signal<string | null>(null);
  private readonly queryState = signal<${model}Query>({
    page: 1,
    pageSize: ${pageSize},
    search: '',
    sortField: ${tsString(firstSort)},
    sortDirection: 'asc',
  });
  private readonly totalRecordsState = signal(0);
  private readonly totalPagesState = signal(1);
  private requestSequence = 0;
${selectedState}${mutationState}
  readonly rows = this.rowsState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly page = computed(() => this.queryState().page);
  readonly pageSize = computed(() => this.queryState().pageSize);
  readonly totalRecords = this.totalRecordsState.asReadonly();
  readonly totalPages = this.totalPagesState.asReadonly();
  readonly hasPreviousPage = computed(() => this.page() > 1);
  readonly hasNextPage = computed(() => this.page() < this.totalPages());
${selectedReadonly}${mutationReadonly}
  async load(patch: Partial<${model}Query> = {}): Promise<boolean> {
    const query = normalizeQuery({ ...this.queryState(), ...patch });
    const requestId = ++this.requestSequence;
    this.queryState.set(query);
    this.statusState.set('loading');
    this.errorState.set(null);
    try {
      const page: ${model}Page = await ${dataCall(spec, 'this.data.list(query)')};
      if (requestId !== this.requestSequence) return false;
      this.rowsState.set(page.rows);
      this.totalRecordsState.set(Math.max(0, page.totalRecords));
      this.totalPagesState.set(Math.max(1, page.totalPages));
      this.queryState.update((current) => ({ ...current, page: Math.max(1, page.page), pageSize: page.pageSize }));
      this.statusState.set(page.rows.length > 0 ? 'success' : 'empty');
      return true;
    } catch (error: unknown) {
      if (requestId !== this.requestSequence) return false;
      this.rowsState.set([]);
      this.totalRecordsState.set(0);
      this.totalPagesState.set(1);
      this.statusState.set('error');
      this.errorState.set(errorMessage(error, ${tsString(`No fue posible cargar ${spec.feature.plural}.`)}));
      return false;
    }
  }
${loadDetail}${saveMethod}
${mutationOperations.map((name) => buildMutationMethod(spec, name)).join('\n\n')}
${mutationHelpers}}

function normalizeQuery(query: ${model}Query): ${model}Query {
  return {
    page: Math.max(1, Math.trunc(query.page)),
    pageSize: Math.min(100, Math.max(1, Math.trunc(query.pageSize))),
    search: query.search.trim().slice(0, 150),
    sortField: query.sortField.trim(),
    sortDirection: query.sortDirection === 'desc' ? 'desc' : 'asc',
  };
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}
`;
}

function tableColumns(spec) {
  const model = spec.model.name;
  return `[
${spec.table.columns.map((column) => `    { key: ${tsString(column.field)}, header: ${tsString(column.header)}${column.sortable ? ', sortable: true' : ''} },`).join('\n')}
  ] satisfies readonly DataTableColumn<${model}>[]`;
}

function validatorsFor(field) {
  const validators = [];
  if (field.required && field.type !== 'boolean') validators.push('Validators.required');
  if (field.mustBeTrue) validators.push('Validators.requiredTrue');
  if (field.minLength !== undefined) validators.push(`Validators.minLength(${field.minLength})`);
  if (field.maxLength !== undefined) validators.push(`Validators.maxLength(${field.maxLength})`);
  if (field.minimum !== undefined) validators.push(`Validators.min(${field.minimum})`);
  if (field.maximum !== undefined) validators.push(`Validators.max(${field.maximum})`);
  return validators.length > 0 ? `, [${validators.join(', ')}]` : '';
}

function formDefinition(spec) {
  return spec.editor.fields
    .map((name) => {
      const field = fieldByName(spec, name);
      return `    ${name}: this.forms.control(${defaultValue(field)}${validatorsFor(field)}),`;
    })
    .join('\n');
}

function formReset(spec, rowExpression) {
  return `{
${spec.editor.fields.map((name) => {
    const field = fieldByName(spec, name);
    const value = rowExpression ? `${rowExpression}.${name}` : defaultValue(field);
    return `      ${name}: ${value},`;
  }).join('\n')}
    }`;
}

function formErrorMethod(spec) {
  const model = spec.model.name;
  const branches = spec.editor.fields.map((name) => {
    const field = fieldByName(spec, name);
    const checks = [];
    if (field.required && field.type !== 'boolean') checks.push(`      if (control.hasError('required')) return ${tsString(`${field.label} es obligatorio.`)};`);
    if (field.mustBeTrue) checks.push(`      if (control.hasError('required')) return ${tsString(`${field.label} debe confirmarse.`)};`);
    if (field.minLength !== undefined) checks.push(`      if (control.hasError('minlength')) return ${tsString(`${field.label} exige al menos ${field.minLength} caracteres.`)};`);
    if (field.maxLength !== undefined) checks.push(`      if (control.hasError('maxlength')) return ${tsString(`${field.label} admite hasta ${field.maxLength} caracteres.`)};`);
    if (field.minimum !== undefined) checks.push(`      if (control.hasError('min')) return ${tsString(`${field.label} no puede ser menor que ${field.minimum}.`)};`);
    if (field.maximum !== undefined) checks.push(`      if (control.hasError('max')) return ${tsString(`${field.label} no puede superar ${field.maximum}.`)};`);
    return `    if (field === ${tsString(name)}) {
      const control = this.form.controls.${name};
      if (!control.touched && !control.dirty) return null;
${checks.join('\n')}
      return null;
    }`;
  }).join('\n');
  return `  protected fieldError(field: keyof ${model}Draft): string | null {
${branches}
    return null;
  }

  private focusFirstInvalid(): void {
    queueMicrotask(() => {
      const root = this.editorForm()?.nativeElement;
      root?.querySelector<HTMLElement>(
        'prest-input.ng-invalid input, app-number-input.ng-invalid input, prest-choice-control.ng-invalid input',
      )?.focus({ preventScroll: true });
    });
  }
`;
}

function editorImports(spec) {
  const imports = new Set(['ButtonComponent']);
  for (const name of spec.editor.fields) {
    const field = fieldByName(spec, name);
    if (field.type === 'string') imports.add('Input');
    if (field.type === 'number') imports.add('NumberInputComponent');
    if (field.type === 'boolean') imports.add('ChoiceControl');
  }
  return [...imports].sort();
}

function editorTemplate(spec) {
  return spec.editor.fields.map((name) => {
    const field = fieldByName(spec, name);
    const required = field.required ? ' [required]="true"' : '';
    if (field.type === 'number') {
      return `      <div class="atomic-generated-field">
        <app-number-input
          label="${html(field.label)}"
          formControlName="${name}"
          [min]="${field.minimum}"
          [max]="${field.maximum}"
          [step]="${field.step}"
          [error]="fieldError('${name}') ?? ''"
        />
      </div>`;
    }
    if (field.type === 'boolean') {
      return `      <div class="atomic-generated-field">
        <prest-choice-control
          label="${html(field.label)}"
          [checked]="form.controls.${name}.value"
          (changed)="form.controls.${name}.setValue($event); form.controls.${name}.markAsTouched()"
        />
        @if (fieldError('${name}'); as message) {
          <span class="atomic-generated-field__error" role="alert">{{ message }}</span>
        }
      </div>`;
    }
    const maxLength = field.maxLength !== undefined ? ` [maxLength]="${field.maxLength}"` : '';
    const minLength = field.minLength !== undefined ? ` [minLength]="${field.minLength}"` : '';
    return `      <div class="atomic-generated-field">
        <prest-input
          label="${html(field.label)}"
          formControlName="${name}"
          [error]="fieldError('${name}')"
          ${required}${minLength}${maxLength}
        />
      </div>`;
  }).join('\n');
}

function commonListImports(spec, extras = []) {
  const rowActionComponent = spec.variants.actionDisplay === 'overflow'
    ? 'ActionGroupComponent'
    : 'TableAction';
  return [...new Set([
    'AlertComponent',
    'ButtonComponent',
    'CardComponent',
    'DataTable',
    'Input',
    'PageHeader',
    'QueryToolbar',
    rowActionComponent,
    ...extras,
  ])].sort();
}

function rowActionTemplate(spec, action, label, handler) {
  const size = spec.variants.density === 'compact' ? 'sm' : 'md';
  if (spec.variants.actionDisplay === 'overflow') {
    const actionLiteral = html(tsString(action));
    const labelLiteral = html(tsString(label));
    return `<prest-action-group
          [actions]="[{ id: ${actionLiteral}, action: ${actionLiteral}, label: ${labelLiteral} }]"
          [compact]="true"
          size="${size}"
          (actionClick)="${handler}(row)"
        />`;
  }
  return `<prest-table-action
          action="${action}"
          label="${html(label)}"
          size="${size}"
          (triggered)="${handler}(row)"
        />`;
}

function modalRowActionsTemplate(spec) {
  const deleteAction = actionFor(spec, 'delete');
  if (!deleteAction) {
    return rowActionTemplate(spec, 'edit', `Editar ${spec.feature.singular}`, 'openEdit');
  }
  const size = spec.variants.density === 'compact' ? 'sm' : 'md';
  if (spec.variants.actionDisplay === 'overflow') {
    return `<prest-action-group
          [actions]="rowActions(row)"
          [compact]="true"
          size="${size}"
          (actionClick)="handleRowAction($event, row)"
        />`;
  }
  return `${rowActionTemplate(spec, 'edit', `Editar ${spec.feature.singular}`, 'openEdit')}
        @if (canDelete(row)) {
          <prest-table-action
            action="delete"
            label="${html(deleteAction.label)}"
            tone="danger"
            size="${size}"
            (triggered)="requestDelete(row)"
          />
        }`;
}

function buildModalPage(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const model = spec.model.name;
  const featureClass = spec.feature.className;
  const page = `${featureClass}Page`;
  const deleteAction = actionFor(spec, 'delete');
  const imports = commonListImports(spec, ['FormDialog', 'FormDialogActions', ...editorImports(spec)]);
  const permissionToken = `${constantName(featureClass)}_PERMISSION_PORT`;
  const permissionImport = deleteAction
    ? `import { ${permissionToken}, ${featureClass}PermissionPort } from './${spec.feature.key}.permissions';\n`
    : '';
  const actionItemImport = deleteAction && spec.variants.actionDisplay === 'overflow'
    ? "import type { ActionItem } from '@shared/ui';\n"
    : '';
  const deleteState = deleteAction
    ? `  private readonly permissions: ${featureClass}PermissionPort = inject(${permissionToken});
  protected readonly confirmDeleteDialog = viewChild<FormDialog>('confirmDeleteDialog');
  protected readonly deleteCandidate = signal<${model} | null>(null);
  protected readonly deleteOpen = signal(false);
`
    : '';
  const overflowMethods = deleteAction && spec.variants.actionDisplay === 'overflow'
    ? `
  protected rowActions(row: ${model}): ActionItem[] {
    const actions: ActionItem[] = [
      { id: 'edit', action: 'edit', label: ${tsString(`Editar ${spec.feature.singular}`)} },
    ];
    if (this.canDelete(row)) {
      actions.push({ id: 'delete', action: 'delete', label: ${tsString(deleteAction.label)}, variant: 'danger' });
    }
    return actions;
  }

  protected handleRowAction(actionId: string, row: ${model}): void {
    if (actionId === 'edit') {
      this.openEdit(row);
    } else if (actionId === 'delete') {
      this.requestDelete(row);
    }
  }
`
    : '';
  const deleteMethods = deleteAction
    ? `
  protected canDelete(row: ${model}): boolean {
    return this.permissions.can(${tsString(deleteAction.permissionKey)}, row.${spec.model.id.name});
  }

  protected requestDelete(row: ${model}): void {
    if (!this.canDelete(row) || this.facade.isMutating()) return;
    this.facade.clearFeedback();
    this.deleteCandidate.set(row);
    this.deleteOpen.set(true);
  }

  protected cancelDelete(): void {
    if (this.facade.isMutating()) return;
    this.confirmDeleteDialog()?.close();
    this.deleteOpen.set(false);
  }

  protected deleteClosed(): void {
    this.deleteOpen.set(false);
    this.deleteCandidate.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const row = this.deleteCandidate();
    if (!row || !this.canDelete(row)) {
      this.cancelDelete();
      return;
    }
    if (await this.facade.delete(row.${spec.model.id.name})) this.cancelDelete();
  }
`
    : '';
  return `${header}import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ${imports.join(', ')}, DataTableColumn, DataTableSortChange } from '@shared/ui';
${actionItemImport}import { ${featureClass}Facade } from './${spec.feature.key}.facade';
import { ${model}, ${model}Draft, ${model}Id } from './${spec.feature.key}.models';
${permissionImport}

@Component({
  selector: ${tsString(spec.feature.selector)},
  standalone: true,
  imports: [ReactiveFormsModule, ${imports.join(', ')}],
  providers: [${featureClass}Facade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './${spec.feature.key}-page.html',
  styleUrl: './${spec.feature.key}.feature.scss',
})
export class ${page} implements OnInit {
  private readonly forms = inject(NonNullableFormBuilder);
  protected readonly facade = inject(${featureClass}Facade);
${deleteState}  protected readonly editorDialog = viewChild<FormDialog>('editorDialog');
  protected readonly editorForm = viewChild<ElementRef<HTMLFormElement>>('editorForm');
  protected readonly editorOpen = signal(false);
  protected readonly editingId = signal<${model}Id | null>(null);
  protected readonly editorTitle = computed(() => this.editingId() === null ? ${tsString(`Nuevo ${spec.feature.singular}`)} : ${tsString(`Editar ${spec.feature.singular}`)});
  protected readonly filterForm = this.forms.group({ search: this.forms.control('') });
  protected readonly form = this.forms.group({
${formDefinition(spec)}
  });
  protected readonly columns = ${tableColumns(spec)};
  protected readonly trackById = (_index: number, row: ${model}): ${model}Id => row.${spec.model.id.name};

${formErrorMethod(spec)}

  constructor() {
    effect(() => {
      if (this.editorOpen()) queueMicrotask(() => this.editorDialog()?.showModal());
    });
  }

  ngOnInit(): void {
    void this.facade.load();
  }

  protected applySearch(): void {
    void this.facade.load({ page: 1, search: this.filterForm.controls.search.value });
  }

  protected clearSearch(): void {
    this.filterForm.reset({ search: '' });
    void this.facade.load({ page: 1, search: '' });
  }

  protected pageChanged(page: number): void {
    void this.facade.load({ page });
  }

  protected pageSizeChanged(pageSize: number): void {
    void this.facade.load({ page: 1, pageSize });
  }

  protected sortChanged(sort: DataTableSortChange<${model}>): void {
    void this.facade.load({
      page: 1,
      sortField: String(sort.key),
      sortDirection: sort.direction === 'desc' ? 'desc' : 'asc',
    });
  }

  protected openCreate(): void {
    this.facade.clearFeedback();
    this.editingId.set(null);
    this.form.reset(${formReset(spec, null)});
    this.editorOpen.set(true);
  }

  protected openEdit(row: ${model}): void {
    this.facade.clearFeedback();
    this.editingId.set(row.${spec.model.id.name});
    this.form.reset(${formReset(spec, 'row')});
    this.editorOpen.set(true);
  }
${overflowMethods}${deleteMethods}

  protected closeEditor(): void {
    if (this.facade.isMutating()) return;
    this.editorDialog()?.close();
    this.editorOpen.set(false);
  }

  protected editorClosed(): void {
    this.editorOpen.set(false);
    this.editingId.set(null);
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }
    const draft: ${model}Draft = this.form.getRawValue();
    if (await this.facade.save(this.editingId(), draft)) this.closeEditor();
  }
}
`;
}

function buildModalTemplate(spec, recipe) {
  const deleteAction = actionFor(spec, 'delete');
  const deleteDialog = deleteAction
    ? `
  @if (deleteOpen()) {
    <prest-form-dialog
      #confirmDeleteDialog
      title="${html(deleteAction.confirmation.title)}"
      description="${html(deleteAction.confirmation.message)}"
      size="sm"
      [opened]="deleteOpen()"
      [busy]="facade.isMutating()"
      (cancelled)="cancelDelete()"
      (closed)="deleteClosed()"
    >
      <app-button
        dialog-close
        type="button"
        variant="ghost"
        [disabled]="facade.isMutating()"
        (buttonClick)="cancelDelete()"
      >${html(deleteAction.confirmation.cancelLabel)}</app-button>
      @if (facade.mutationError(); as message) {
        <app-alert variant="danger" [message]="message" />
      }
      <prest-form-dialog-actions>
        <app-button type="button" variant="ghost" [disabled]="facade.isMutating()" (buttonClick)="cancelDelete()">${html(deleteAction.confirmation.cancelLabel)}</app-button>
        <app-button type="button" variant="danger" tone="danger" [disabled]="facade.isMutating()" (buttonClick)="confirmDelete()">${html(deleteAction.confirmation.confirmLabel)}</app-button>
      </prest-form-dialog-actions>
    </prest-form-dialog>
  }
`
    : '';
  return `${generatedHtmlHeader(spec, recipe)}<section aria-labelledby="${spec.feature.key}-title" data-ui-requirement="${html(spec.id)}">
  <prest-page-header
    title="${html(spec.feature.title)}"
    subtitle="Administre ${html(spec.feature.plural)} sin abandonar el listado."
    headingId="${spec.feature.key}-title"
    density="${html(spec.variants.density)}"
  >
    <app-button page-header-actions type="button" (buttonClick)="openCreate()">Nuevo</app-button>
  </prest-page-header>

  @if (facade.error(); as message) {
    <app-alert variant="danger" [message]="message" />
  }
  @if (facade.feedback(); as message) {
    <app-alert variant="success" [message]="message" />
  }

  <app-card class="atomic-generated-list">
    <prest-query-toolbar
      density="${html(spec.variants.density)}"
      accessibleLabel="Buscar ${html(spec.feature.plural)}"
    >
      <form class="atomic-generated-filters" query-filters [formGroup]="filterForm" (ngSubmit)="applySearch()" novalidate>
        <prest-input label="Buscar" type="search" formControlName="search" />
        <app-button type="button" variant="ghost" (buttonClick)="clearSearch()">Limpiar</app-button>
        <app-button type="submit" variant="secondary">Buscar</app-button>
      </form>
    </prest-query-toolbar>

    <prest-data-table
      caption="${html(spec.feature.title)}"
      density="${html(spec.variants.density)}"
      [columns]="columns"
      [rows]="facade.rows()"
      [status]="facade.status()"
      [totalRecords]="facade.totalRecords()"
      [page]="facade.page()"
      [pageSize]="facade.pageSize()"
      [totalPages]="facade.totalPages()"
      [hasPreviousPage]="facade.hasPreviousPage()"
      [hasNextPage]="facade.hasNextPage()"
      [errorMessage]="facade.error() ?? '${html(`No fue posible cargar ${spec.feature.plural}.`)}'"
      emptyMessage="${html(`No hay ${spec.feature.plural} para mostrar.`)}"
      [trackBy]="trackById"
      (retry)="facade.load()"
      (pageChange)="pageChanged($event)"
      (pageSizeChange)="pageSizeChanged($event)"
      (sortChange)="sortChanged($event)"
    >
      <ng-template #actions let-row>
        ${modalRowActionsTemplate(spec)}
      </ng-template>
    </prest-data-table>
  </app-card>

  @if (editorOpen()) {
    <prest-form-dialog
      #editorDialog
      [title]="editorTitle()"
      size="${html(spec.variants.editorSize)}"
      [busy]="facade.isMutating()"
      (cancelled)="closeEditor()"
      (closed)="editorClosed()"
    >
      <app-button dialog-close type="button" variant="ghost" (buttonClick)="closeEditor()">Cerrar</app-button>
      <form #editorForm class="atomic-generated-form" [attr.data-form-layout]="'${html(spec.variants.formLayout)}'" [formGroup]="form" (ngSubmit)="save()" novalidate>
${editorTemplate(spec)}
        @if (facade.mutationError(); as message) {
          <app-alert variant="danger" [message]="message" />
        }
        <prest-form-dialog-actions>
          <app-button type="button" variant="ghost" [disabled]="facade.isMutating()" (buttonClick)="closeEditor()">Cancelar</app-button>
          <app-button type="submit" [disabled]="facade.isMutating()">Guardar</app-button>
        </prest-form-dialog-actions>
      </form>
    </prest-form-dialog>
  }
${deleteDialog}</section>
`;
}

function buildListPage(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const model = spec.model.name;
  const featureClass = spec.feature.className;
  const page = `${featureClass}ListPage`;
  const selector = `${spec.feature.selector.replace(/-page$/, '')}-list-page`;
  const imports = commonListImports(spec);
  return `${header}import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ${imports.join(', ')}, DataTableColumn, DataTableSortChange } from '@shared/ui';
import { ${featureClass}Facade } from './${spec.feature.key}.facade';
import { ${model}, ${model}Id } from './${spec.feature.key}.models';

@Component({
  selector: ${tsString(selector)},
  standalone: true,
  imports: [ReactiveFormsModule, ${imports.join(', ')}],
  providers: [${featureClass}Facade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './${spec.feature.key}-list-page.html',
  styleUrl: './${spec.feature.key}.feature.scss',
})
export class ${page} implements OnInit {
  private readonly forms = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  protected readonly facade = inject(${featureClass}Facade);
  protected readonly filterForm = this.forms.group({ search: this.forms.control('') });
  protected readonly columns = ${tableColumns(spec)};
  protected readonly trackById = (_index: number, row: ${model}): ${model}Id => row.${spec.model.id.name};

  ngOnInit(): void {
    void this.facade.load();
  }

  protected applySearch(): void {
    void this.facade.load({ page: 1, search: this.filterForm.controls.search.value });
  }

  protected clearSearch(): void {
    this.filterForm.reset({ search: '' });
    void this.facade.load({ page: 1, search: '' });
  }

  protected pageChanged(page: number): void {
    void this.facade.load({ page });
  }

  protected pageSizeChanged(pageSize: number): void {
    void this.facade.load({ page: 1, pageSize });
  }

  protected sortChanged(sort: DataTableSortChange<${model}>): void {
    void this.facade.load({
      page: 1,
      sortField: String(sort.key),
      sortDirection: sort.direction === 'desc' ? 'desc' : 'asc',
    });
  }

  protected create(): void {
    void this.router.navigate(['/', ${tsString(spec.feature.routePath)}, 'create']);
  }

  protected edit(row: ${model}): void {
    void this.router.navigate(['/', ${tsString(spec.feature.routePath)}, 'edit', row.${spec.model.id.name}]);
  }
}
`;
}

function buildListTemplate(spec, recipe) {
  return `${generatedHtmlHeader(spec, recipe)}<section aria-labelledby="${spec.feature.key}-title" data-ui-requirement="${html(spec.id)}">
  <prest-page-header
    title="${html(spec.feature.title)}"
    subtitle="Consulte y administre ${html(spec.feature.plural)}."
    headingId="${spec.feature.key}-title"
    density="${html(spec.variants.density)}"
  >
    <app-button page-header-actions type="button" (buttonClick)="create()">Nuevo</app-button>
  </prest-page-header>
  @if (facade.error(); as message) {
    <app-alert variant="danger" [message]="message" />
  }
  <app-card class="atomic-generated-list">
    <prest-query-toolbar
      density="${html(spec.variants.density)}"
      accessibleLabel="Buscar ${html(spec.feature.plural)}"
    >
      <form class="atomic-generated-filters" query-filters [formGroup]="filterForm" (ngSubmit)="applySearch()" novalidate>
        <prest-input label="Buscar" type="search" formControlName="search" />
        <app-button type="button" variant="ghost" (buttonClick)="clearSearch()">Limpiar</app-button>
        <app-button type="submit" variant="secondary">Buscar</app-button>
      </form>
    </prest-query-toolbar>
    <prest-data-table
      caption="${html(spec.feature.title)}"
      density="${html(spec.variants.density)}"
      [columns]="columns"
      [rows]="facade.rows()"
      [status]="facade.status()"
      [totalRecords]="facade.totalRecords()"
      [page]="facade.page()"
      [pageSize]="facade.pageSize()"
      [totalPages]="facade.totalPages()"
      [hasPreviousPage]="facade.hasPreviousPage()"
      [hasNextPage]="facade.hasNextPage()"
      [trackBy]="trackById"
      (retry)="facade.load()"
      (pageChange)="pageChanged($event)"
      (pageSizeChange)="pageSizeChanged($event)"
      (sortChange)="sortChanged($event)"
    >
      <ng-template #actions let-row>
        ${rowActionTemplate(spec, 'edit', `Editar ${spec.feature.singular}`, 'edit')}
      </ng-template>
    </prest-data-table>
  </app-card>
</section>
`;
}

function parseRouteIdExpression(spec) {
  return spec.model.id.type === 'number'
    ? `const parsed = Number(rawId);\n    return rawId !== null && rawId.trim() !== '' && Number.isFinite(parsed) ? parsed : null;`
    : `return rawId?.trim() || null;`;
}

function buildRouteFormPage(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const model = spec.model.name;
  const featureClass = spec.feature.className;
  const page = `${featureClass}FormPage`;
  const selector = `${spec.feature.selector.replace(/-page$/, '')}-form-page`;
  const uiImports = [...new Set([
    'AlertComponent',
    'ButtonComponent',
    'CardComponent',
    'DataStateComponent',
    'PageHeader',
    ...editorImports(spec),
  ])].sort();
  return `${header}import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ${uiImports.join(', ')} } from '@shared/ui';
import { ${featureClass}Facade } from './${spec.feature.key}.facade';
import { ${model}Draft, ${model}Id } from './${spec.feature.key}.models';

@Component({
  selector: ${tsString(selector)},
  standalone: true,
  imports: [ReactiveFormsModule, ${uiImports.join(', ')}],
  providers: [${featureClass}Facade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './${spec.feature.key}-form-page.html',
  styleUrl: './${spec.feature.key}.feature.scss',
})
export class ${page} implements OnInit {
  private readonly forms = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly facade = inject(${featureClass}Facade);
  protected readonly recordId = signal<${model}Id | null>(null);
  protected readonly invalidRouteId = signal(false);
  protected readonly editorForm = viewChild<ElementRef<HTMLFormElement>>('editorForm');
  protected readonly title = computed(() => this.invalidRouteId() || this.recordId() !== null ? ${tsString(`Editar ${spec.feature.singular}`)} : ${tsString(`Nuevo ${spec.feature.singular}`)});
  protected readonly detailError = computed(() => {
    if (this.invalidRouteId()) {
      return { message: ${tsString(`El identificador de ${spec.feature.singular} no es válido.`)}, status: 0, statusText: '', url: null };
    }
    const message = this.facade.detailError();
    return message === null ? null : { message, status: 0, statusText: '', url: null };
  });
  protected readonly retryDetailAction = { emit: () => this.retryDetail() };
  protected readonly form = this.forms.group({
${formDefinition(spec)}
  });

${formErrorMethod(spec)}

  async ngOnInit(): Promise<void> {
    const rawId = this.route.snapshot.paramMap.get('id');
    if (rawId === null) return;
    const id = this.parseId(rawId);
    if (id === null) {
      this.invalidRouteId.set(true);
      return;
    }
    this.recordId.set(id);
    if (await this.facade.loadDetail(id)) {
      const row = this.facade.selected();
      if (row) this.form.reset(${formReset(spec, 'row')});
    }
  }

  protected async save(): Promise<void> {
    if (this.invalidRouteId()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }
    const draft: ${model}Draft = this.form.getRawValue();
    if (await this.facade.save(this.recordId(), draft) && this.recordId() === null) {
      this.form.disable();
    }
  }

  protected retryDetail(): void {
    const id = this.recordId();
    if (id !== null) void this.facade.loadDetail(id);
  }

  protected cancel(): Promise<boolean> {
    return this.router.navigate(['/', ${tsString(spec.feature.routePath)}]);
  }

  private parseId(rawId: string | null): ${model}Id | null {
    ${parseRouteIdExpression(spec)}
  }
}
`;
}

function buildRouteFormTemplate(spec, recipe) {
  return `${generatedHtmlHeader(spec, recipe)}<section aria-labelledby="${spec.feature.key}-form-title" data-ui-requirement="${html(spec.id)}">
  <prest-page-header
    [title]="title()"
    subtitle="Complete los datos requeridos y guarde los cambios."
    headingId="${spec.feature.key}-form-title"
    density="${html(spec.variants.density)}"
  >
    <app-button page-header-actions type="button" variant="ghost" (buttonClick)="cancel()">Volver</app-button>
  </prest-page-header>
  <app-data-state
    [loading]="recordId() !== null && facade.detailStatus() === 'loading'"
    [error]="detailError()"
    [onRetry]="retryDetailAction"
    [showRetryButton]="!invalidRouteId()"
  >
    <ng-template #content>
      <app-card>
        <form #editorForm class="atomic-generated-form" [attr.data-form-layout]="'${html(spec.variants.formLayout)}'" [formGroup]="form" (ngSubmit)="save()" novalidate>
${editorTemplate(spec)}
          @if (facade.mutationError(); as message) {
            <app-alert variant="danger" [message]="message" />
          }
          @if (facade.feedback(); as message) {
            <app-alert variant="success" [message]="message" />
          }
          <div class="atomic-generated-form__actions">
            <app-button type="button" variant="ghost" [disabled]="facade.isMutating()" (buttonClick)="cancel()">Volver</app-button>
            <app-button type="submit" [disabled]="facade.isMutating() || form.disabled">{{ form.disabled ? 'Guardado' : 'Guardar' }}</app-button>
          </div>
        </form>
      </app-card>
    </ng-template>
  </app-data-state>
</section>
`;
}

function buildRoutes(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const featureClass = spec.feature.className;
  const key = spec.feature.key;
  return `${header}import { Routes } from '@angular/router';

export const ${constantName(key)}_ROUTES: Routes = [
  {
    path: ${tsString(`${spec.feature.routePath}/create`)},
    data: { uiRequirementId: ${tsString(spec.id)}, uiRecipeId: ${tsString(recipe.id)} },
    loadComponent: () => import('./${key}-form-page').then((module) => module.${featureClass}FormPage),
  },
  {
    path: ${tsString(`${spec.feature.routePath}/edit/:id`)},
    data: { uiRequirementId: ${tsString(spec.id)}, uiRecipeId: ${tsString(recipe.id)} },
    loadComponent: () => import('./${key}-form-page').then((module) => module.${featureClass}FormPage),
  },
  {
    path: ${tsString(spec.feature.routePath)},
    data: { uiRequirementId: ${tsString(spec.id)}, uiRecipeId: ${tsString(recipe.id)} },
    loadComponent: () => import('./${key}-list-page').then((module) => module.${featureClass}ListPage),
  },
];
`;
}

function buildMasterPage(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const model = spec.model.name;
  const featureClass = spec.feature.className;
  const page = `${featureClass}Page`;
  const imports = commonListImports(spec, ['DataStateComponent']);
  return `${header}import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ${imports.join(', ')}, DataTableColumn, DataTableSortChange } from '@shared/ui';
import { ${featureClass}Facade } from './${spec.feature.key}.facade';
import { ${model}, ${model}Id } from './${spec.feature.key}.models';

@Component({
  selector: ${tsString(spec.feature.selector)},
  standalone: true,
  imports: [ReactiveFormsModule, ${imports.join(', ')}],
  providers: [${featureClass}Facade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './${spec.feature.key}-page.html',
  styleUrl: './${spec.feature.key}.feature.scss',
})
export class ${page} implements OnInit {
  private readonly forms = inject(NonNullableFormBuilder);
  protected readonly facade = inject(${featureClass}Facade);
  protected readonly selectedId = signal<${model}Id | null>(null);
  protected readonly detailError = computed(() => {
    const message = this.facade.detailError();
    return message === null ? null : { message, status: 0, statusText: '', url: null };
  });
  protected readonly retryDetailAction = { emit: () => this.retryDetail() };
  protected readonly filterForm = this.forms.group({ search: this.forms.control('') });
  protected readonly columns = ${tableColumns(spec)};
  protected readonly trackById = (_index: number, row: ${model}): ${model}Id => row.${spec.model.id.name};

  ngOnInit(): void {
    void this.facade.load();
  }

  protected applySearch(): void {
    this.clearSelection();
    void this.facade.load({ page: 1, search: this.filterForm.controls.search.value });
  }

  protected clearSearch(): void {
    this.filterForm.reset({ search: '' });
    this.clearSelection();
    void this.facade.load({ page: 1, search: '' });
  }

  protected pageChanged(page: number): void {
    this.clearSelection();
    void this.facade.load({ page });
  }

  protected pageSizeChanged(pageSize: number): void {
    this.clearSelection();
    void this.facade.load({ page: 1, pageSize });
  }

  protected sortChanged(sort: DataTableSortChange<${model}>): void {
    this.clearSelection();
    void this.facade.load({
      page: 1,
      sortField: String(sort.key),
      sortDirection: sort.direction === 'desc' ? 'desc' : 'asc',
    });
  }

  protected select(row: ${model}): void {
    this.selectedId.set(row.${spec.model.id.name});
    void this.facade.loadDetail(row.${spec.model.id.name});
  }

  protected retryDetail(): void {
    const id = this.selectedId();
    if (id !== null) void this.facade.loadDetail(id);
  }

  private clearSelection(): void {
    this.selectedId.set(null);
    this.facade.clearDetail();
  }
}
`;
}

function buildMasterTemplate(spec, recipe) {
  return `${generatedHtmlHeader(spec, recipe)}<section class="atomic-generated-master-detail" aria-labelledby="${spec.feature.key}-title" data-ui-requirement="${html(spec.id)}" data-detail-placement="${html(spec.variants.detailPlacement)}">
  <prest-page-header
    title="${html(spec.feature.title)}"
    subtitle="Seleccione ${html(spec.feature.singular)} para consultar su detalle."
    headingId="${spec.feature.key}-title"
    density="${html(spec.variants.density)}"
  />
  @if (facade.error(); as message) {
    <app-alert variant="danger" [message]="message" />
  }
  <app-card class="atomic-generated-list">
    <prest-query-toolbar
      density="${html(spec.variants.density)}"
      accessibleLabel="Buscar ${html(spec.feature.plural)}"
    >
      <form class="atomic-generated-filters" query-filters [formGroup]="filterForm" (ngSubmit)="applySearch()" novalidate>
        <prest-input label="Buscar" type="search" formControlName="search" />
        <app-button type="button" variant="ghost" (buttonClick)="clearSearch()">Limpiar</app-button>
        <app-button type="submit" variant="secondary">Buscar</app-button>
      </form>
    </prest-query-toolbar>
    <prest-data-table
      caption="${html(spec.feature.title)}"
      density="${html(spec.variants.density)}"
      [columns]="columns"
      [rows]="facade.rows()"
      [status]="facade.status()"
      [totalRecords]="facade.totalRecords()"
      [page]="facade.page()"
      [pageSize]="facade.pageSize()"
      [totalPages]="facade.totalPages()"
      [hasPreviousPage]="facade.hasPreviousPage()"
      [hasNextPage]="facade.hasNextPage()"
      [trackBy]="trackById"
      (retry)="facade.load()"
      (pageChange)="pageChanged($event)"
      (pageSizeChange)="pageSizeChanged($event)"
      (sortChange)="sortChanged($event)"
    >
      <ng-template #actions let-row>
        ${rowActionTemplate(spec, 'view', `Ver ${spec.feature.singular}`, 'select')}
      </ng-template>
    </prest-data-table>
  </app-card>
  <app-card class="atomic-generated-detail" title="Detalle">
    <app-data-state
      [loading]="facade.detailStatus() === 'loading'"
      [error]="detailError()"
      [isEmpty]="selectedId() === null"
      emptyText="Seleccione ${html(spec.feature.singular)} para consultar su detalle."
      [onRetry]="retryDetailAction"
    >
      <ng-template #content>
        @if (facade.selected(); as detail) {
          <dl>
${spec.detail.fields.map((name) => `            <div><dt>${html(fieldByName(spec, name).label)}</dt><dd>{{ detail.${name} }}</dd></div>`).join('\n')}
          </dl>
        }
      </ng-template>
    </app-data-state>
  </app-card>
</section>
`;
}

function buildFeatureStyles(spec, recipe) {
  return `${generatedHeader(spec, recipe)}:host {
  display: block;
  min-width: 0;
}

section {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-4);
}

.atomic-generated-filters {
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: minmax(12rem, 1fr) auto auto;
  align-items: end;
  gap: var(--space-2);
}

.atomic-generated-form {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
}

.atomic-generated-form[data-form-layout='two-columns'] {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.atomic-generated-field {
  min-width: 0;
}

.atomic-generated-field__error {
  display: block;
  margin-block-start: var(--space-1);
  color: var(--danger-color);
  font-size: var(--text-xs);
}

.atomic-generated-form > app-alert,
.atomic-generated-form__actions {
  grid-column: 1 / -1;
}

.atomic-generated-form__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
}

.atomic-generated-master-detail[data-detail-placement='below'] {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 64rem) {
  .atomic-generated-master-detail[data-detail-placement='aside'] {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(18rem, 2fr);
    align-items: start;
  }

  .atomic-generated-master-detail[data-detail-placement='aside'] > prest-page-header,
  .atomic-generated-master-detail[data-detail-placement='aside'] > app-alert {
    grid-column: 1 / -1;
  }
}

@media (max-width: 40rem) {
  .atomic-generated-filters,
  .atomic-generated-form[data-form-layout='two-columns'] {
    grid-template-columns: minmax(0, 1fr);
  }

  .atomic-generated-form__actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }
}
`;
}

function buildComponentSpec(spec, recipe, fileStem, className) {
  const header = generatedHeader(spec, recipe);
  return `${header}import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ${className} } from './${fileStem}';

describe('${className}', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('declares OnPush metadata under an actual zoneless TestBed', () => {
    const definition = (${className} as unknown as { ɵcmp?: { onPush?: boolean } }).ɵcmp;
    expect(definition?.onPush).toBe(true);
    expect(TestBed).toBeDefined();
  });
});
`;
}

function buildFacadeSpec(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const featureClass = spec.feature.className;
  const model = spec.model.name;
  const key = spec.feature.key;
  const row = {
    [spec.model.id.name]: spec.model.id.type === 'number' ? 1 : 'fixture-id',
  };
  spec.model.fields.forEach((field, index) => {
    row[field.name] = field.type === 'number' ? index + 1 : field.type === 'boolean' ? true : `${field.label} ${index + 1}`;
  });
  const page = { rows: [row], page: 1, pageSize: spec.table.pageSize || 10, totalRecords: 1, totalPages: 1 };
  const provider = `{ provide: ${constantName(featureClass)}_DATA_PORT, useValue: { list: () => Promise.resolve(${JSON.stringify(page)}) } }`;
  const dataImport = `import { ${constantName(featureClass)}_DATA_PORT } from './${key}.data-port';`;
  return `${header}import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
${dataImport}
import { ${featureClass}Facade } from './${key}.facade';

describe('${featureClass}Facade', () => {
  it('loads the typed page through its data boundary', async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ${featureClass}Facade, ${provider}],
    });
    const facade = TestBed.inject(${featureClass}Facade);
    expect(await facade.load()).toBe(true);
    expect(facade.status()).toBe('success');
    expect(facade.rows().length).toBe(1);
  });
});
`;
}

function buildHttpContractSpec(spec, recipe) {
  const header = generatedHeader(spec, recipe);
  const featureClass = spec.feature.className;
  const contract = `${constantName(featureClass)}_HTTP_CONTRACT`;
  return `${header}import { ${contract} } from './${spec.feature.key}.http-contract';

describe('${featureClass} HTTP contract', () => {
  it('preserves every declared method and endpoint without inference', () => {
    expect(${contract}).toEqual(${JSON.stringify(canonicalHttpContract(spec), null, 2)});
  });
});
`;
}

function buildFiles(spec, recipe) {
  const key = spec.feature.key;
  const featureClass = spec.feature.className;
  const base = path.posix.join('src', 'app', 'features', key);
  const files = new Map();
  files.set(path.posix.join(base, `${key}.models.ts`), buildModels(spec, recipe));
  files.set(path.posix.join(base, `${key}.data-port.ts`), buildDataPort(spec, recipe));
  files.set(path.posix.join(base, `${key}.feature.scss`), buildFeatureStyles(spec, recipe));
  if (spec.actions.length > 0) {
    files.set(path.posix.join(base, `${key}.permissions.ts`), buildPermissionPort(spec, recipe));
    files.set(path.posix.join(base, `${key}.permissions.spec.ts`), buildPermissionSpec(spec, recipe));
  }
  if (spec.contract.mode === 'integrated') {
    files.set(path.posix.join(base, `${key}.http-contract.ts`), buildHttpContract(spec, recipe));
    files.set(path.posix.join(base, `${key}.http-contract.spec.ts`), buildHttpContractSpec(spec, recipe));
  }
  files.set(path.posix.join(base, `${key}.facade.ts`), buildFacade(spec, recipe));
  files.set(path.posix.join(base, `${key}.facade.spec.ts`), buildFacadeSpec(spec, recipe));

  if (spec.recipe === 'modal-catalog') {
    files.set(path.posix.join(base, `${key}-page.ts`), buildModalPage(spec, recipe));
    files.set(path.posix.join(base, `${key}-page.html`), buildModalTemplate(spec, recipe));
    files.set(path.posix.join(base, `${key}-page.spec.ts`), buildComponentSpec(spec, recipe, `${key}-page`, `${featureClass}Page`));
  } else if (spec.recipe === 'route-form') {
    files.set(path.posix.join(base, `${key}-list-page.ts`), buildListPage(spec, recipe));
    files.set(path.posix.join(base, `${key}-list-page.html`), buildListTemplate(spec, recipe));
    files.set(path.posix.join(base, `${key}-list-page.spec.ts`), buildComponentSpec(spec, recipe, `${key}-list-page`, `${featureClass}ListPage`));
    files.set(path.posix.join(base, `${key}-form-page.ts`), buildRouteFormPage(spec, recipe));
    files.set(path.posix.join(base, `${key}-form-page.html`), buildRouteFormTemplate(spec, recipe));
    files.set(path.posix.join(base, `${key}-form-page.spec.ts`), buildComponentSpec(spec, recipe, `${key}-form-page`, `${featureClass}FormPage`));
    files.set(path.posix.join(base, `${key}.routes.ts`), buildRoutes(spec, recipe));
  } else {
    files.set(path.posix.join(base, `${key}-page.ts`), buildMasterPage(spec, recipe));
    files.set(path.posix.join(base, `${key}-page.html`), buildMasterTemplate(spec, recipe));
    files.set(path.posix.join(base, `${key}-page.spec.ts`), buildComponentSpec(spec, recipe, `${key}-page`, `${featureClass}Page`));
  }
  return files;
}

function printPlan(spec, recipe, outputRoot, files, dryRun) {
  const label = dryRun ? 'DRY_RUN' : 'GENERATED';
  process.stdout.write(`${label} spec=${spec.id} recipe=${recipe.id} mode=${spec.contract.mode}\n`);
  process.stdout.write(`output=${outputRoot}\n`);
  for (const relative of files.keys()) {
    process.stdout.write(`${relative}\n`);
  }
}

function isPathInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function assertNoLinkedAncestors(outputRoot, relativeDirectory) {
  let current = outputRoot;
  for (const segment of relativeDirectory.split('/').filter(Boolean)) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) return;
    const stat = fs.lstatSync(current);
    fail(!stat.isSymbolicLink(), `Destino rechazado porque contiene un enlace o junction: ${current}.`);
    fail(stat.isDirectory(), `Se esperaba un directorio en la ruta de salida: ${current}.`);
  }
}

function preflightFiles(outputRoot, files) {
  fail(fs.existsSync(outputRoot), `El output debe existir antes de generar: ${outputRoot}.`);
  const outputStat = fs.lstatSync(outputRoot);
  fail(outputStat.isDirectory(), `El output no es un directorio: ${outputRoot}.`);
  fail(!outputStat.isSymbolicLink(), `El output no puede ser un enlace o junction: ${outputRoot}.`);
  const realOutputRoot = fs.realpathSync(outputRoot);
  const relatives = [...files.keys()];
  fail(relatives.length > 0, 'El plan de generación está vacío.');
  const featureRoot = path.posix.dirname(relatives[0]);
  fail(
    relatives.every((relative) => path.posix.dirname(relative) === featureRoot),
    'Todos los archivos generados deben pertenecer a un único feature transaccional.',
  );

  const targets = [...files.keys()].map((relative) => ({
    relative,
    absolute: path.resolve(outputRoot, relative),
  }));
  for (const target of targets) {
    fail(isPathInside(outputRoot, target.absolute) && target.absolute !== outputRoot, `Destino fuera del output: ${target.relative}.`);
  }
  const featureTarget = path.resolve(outputRoot, featureRoot);
  fail(isPathInside(outputRoot, featureTarget) && featureTarget !== outputRoot, `Feature fuera del output: ${featureRoot}.`);
  assertNoLinkedAncestors(outputRoot, path.posix.dirname(featureRoot));
  fail(!fs.existsSync(featureTarget), `No se sobrescribirá el feature existente: ${featureTarget}.`);
  return { featureRoot, featureTarget, realOutputRoot, targets };
}

function writeFiles(outputRoot, files) {
  const plan = preflightFiles(outputRoot, files);
  const featureParent = path.dirname(plan.featureTarget);
  fs.mkdirSync(featureParent, { recursive: true });
  assertNoLinkedAncestors(outputRoot, path.posix.dirname(plan.featureRoot));
  const realFeatureParent = fs.realpathSync(featureParent);
  fail(isPathInside(plan.realOutputRoot, realFeatureParent), `El directorio real de destino escapó del output: ${realFeatureParent}.`);

  const staging = fs.mkdtempSync(path.join(featureParent, '.atomic-ui-stage-'));
  let committed = false;
  try {
    for (const target of plan.targets) {
      const relativeWithinFeature = path.posix.relative(plan.featureRoot, target.relative);
      fail(
        relativeWithinFeature && !relativeWithinFeature.startsWith('..') && !path.posix.isAbsolute(relativeWithinFeature),
        `Archivo fuera del feature transaccional: ${target.relative}.`,
      );
      const stagedTarget = path.join(staging, ...relativeWithinFeature.split('/'));
      fs.mkdirSync(path.dirname(stagedTarget), { recursive: true });
      fs.writeFileSync(stagedTarget, files.get(target.relative), { encoding: 'utf8', flag: 'wx' });
    }
    fs.renameSync(staging, plan.featureTarget);
    committed = true;
  } finally {
    if (!committed && fs.existsSync(staging)) {
      fs.rmSync(staging, { recursive: true, force: true });
    }
  }
}

function run(argv = process.argv.slice(2)) {
  const args = parseArguments(argv);
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }
  fail(args.spec, '--spec es obligatorio.');
  fail(args.output, '--output es obligatorio para evitar escribir en una ubicación implícita.');
  const specPath = path.resolve(args.spec);
  const outputRoot = path.resolve(args.output);
  const rawSpec = object(readJson(specPath, 'el requisito UI'), 'spec');
  const recipe = loadRecipe(rawSpec.recipe);
  const spec = validateRequirement(rawSpec, recipe);
  const files = buildFiles(spec, recipe);
  if (args.dryRun) {
    preflightFiles(outputRoot, files);
  } else {
    writeFiles(outputRoot, files);
  }
  printPlan(spec, recipe, outputRoot, files, args.dryRun);
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`ERROR: ${message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  RequirementError,
  buildFiles,
  loadRecipe,
  parseArguments,
  run,
  validateRequirement,
};
