#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  loadCatalog,
  main: queryMain,
  queryCatalog,
} = require('./query-atomic-catalog.js');
const {
  DEFAULT_CONTEXT_BUDGET_BYTES,
  buildAgentContext,
  enforceContextBudget,
  main: contextMain,
  serializeContext,
} = require('./build-agent-context.js');
const {
  main: checkMain,
  validateCatalog,
} = require('./check-atomic-catalog.js');

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function writeJson(file, document) {
  write(file, `${JSON.stringify(document, null, 2)}\n`);
}

function component(id, extra = {}) {
  return {
    schemaVersion: 1,
    id,
    layer: 'atom',
    selector: `atomic-${id}`,
    export: `${id.replace(/(^|-)([a-z])/g, (_match, _dash, letter) => letter.toUpperCase())}Component`,
    source: `src/app/shared/ui/atoms/${id}/${id}.component.ts`,
    purpose: `Componente ${id} para CRUD.`,
    variants: [],
    inputs: [],
    outputs: [],
    states: [],
    a11y: ['Nombre accesible.'],
    responsive: ['Sin overflow.'],
    tokens: ['--space-2'],
    story: { path: null, status: 'missing' },
    test: { path: null, status: 'missing' },
    stability: { status: 'stable', notes: [] },
    canonicalFor: ['crud'],
    ...extra,
  };
}

function captureIo() {
  const output = [];
  const errors = [];
  return {
    output,
    errors,
    io: {
      log(value) { output.push(String(value)); },
      error(value) { errors.push(String(value)); },
    },
  };
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-catalog-tools-'));
try {
  const catalogRoot = path.join(tempRoot, 'catalog');
  for (const id of ['button', 'data-table']) {
    const document = component(id);
    if (id === 'button') {
      document.variants = [
        {
          name: 'variant',
          values: [
            { value: 'primary', meaning: 'Acci\u00f3n principal.', default: true },
            { value: 'soft', meaning: 'Acci\u00f3n secundaria de baja intensidad.' },
          ],
        },
        {
          name: 'compact',
          values: [
            { value: false, meaning: 'Espaciado normal.', default: true },
            { value: true, meaning: 'Espaciado reducido.' },
          ],
        },
      ];
      document.inputs = Array.from({ length: 80 }, (_value, index) => ({
        name: `input${index}`,
        type: 'string',
        meaning: `Contrato detallado ${index} que solo debe aparecer con --details.`,
      }));
    }
    write(path.join(tempRoot, document.source), '@Component({})\nexport class Fixture {}\n');
    writeJson(path.join(catalogRoot, 'components', `${id}.json`), document);
  }

  writeJson(path.join(catalogRoot, 'recipes', 'modal-catalog.json'), {
    schemaVersion: 1,
    id: 'atomic.recipe.modal-catalog.v1',
    kind: 'ui-recipe',
    variant: 'modal-catalog',
    summary: 'CRUD compacto con editor modal.',
    whenToUse: 'Cat\u00e1logos CRUD de pocos campos.',
    componentStack: {
      table: 'data-table',
      actions: ['button'],
    },
    requiredOperations: ['list', 'create', 'update'],
    optionalOperations: ['activate'],
    extensionSlots: ['filters'],
    outputLayers: ['page', 'facade'],
    qualityGates: ['typecheck', 'a11y'],
    supportedVariants: { density: ['comfortable', 'compact'] },
    defaults: { density: 'comfortable' },
    intent: 'crud',
  });
  writeJson(path.join(catalogRoot, 'ux-rules', 'crud-focus.json'), {
    schemaVersion: 1,
    id: 'ux-crud-focus',
    title: 'Foco de CRUD',
    intent: 'Mantener el foco predecible al cerrar una superficie CRUD.',
    priority: 'must',
    appliesTo: { intents: ['crud'], components: ['button'] },
    requirements: [{
      id: 'restore-focus',
      statement: 'El foco vuelve al disparador al cerrar.',
      enforcedBy: ['a11y', 'unit'],
    }],
    acceptance: ['El disparador recupera el foco despu\u00e9s del cierre.'],
  });

  const catalog = loadCatalog({ atomicRoot: tempRoot });
  assert.equal(catalog.items.length, 4);

  const byIntent = queryCatalog(catalog, { intents: ['crud'] });
  assert.equal(byIntent.total, 4);
  const byComponent = queryCatalog(catalog, { components: ['data-table'] });
  assert.deepEqual(byComponent.items.map((item) => item.document.id), [
    'data-table',
    'atomic.recipe.modal-catalog.v1',
  ]);
  const byVariant = queryCatalog(catalog, { variants: ['soft'] });
  assert.deepEqual(byVariant.items.map((item) => item.document.id), ['button']);
  const byBooleanVariant = queryCatalog(catalog, { variants: ['false'] });
  assert.deepEqual(byBooleanVariant.items.map((item) => item.document.id), ['button']);

  const context = buildAgentContext(catalog, { variants: ['modal-catalog'], limit: 20 });
  assert.deepEqual(context.components.map((item) => item.id), ['button', 'data-table']);
  assert.deepEqual(context.recipes.map((item) => item.id), ['atomic.recipe.modal-catalog.v1']);
  assert.equal(context.warnings.length, 0);
  assert.ok(context.qualityGates.includes('a11y'));
  assert.equal('inputs' in context.components[0], false);
  assert.equal('path' in context.components[0], false);
  assert.equal('qualityGates' in context.recipes[0], false);
  assert.ok(JSON.stringify(context).length < 8000, 'El contexto compacto excedi\u00f3 el presupuesto de 8 KB.');
  const prettyContext = serializeContext(context, { format: 'json', pretty: true });
  assert.ok(Buffer.byteLength(prettyContext, 'utf8') < DEFAULT_CONTEXT_BUDGET_BYTES);
  assert.equal(enforceContextBudget(prettyContext, {}), prettyContext);
  assert.throws(
    () => enforceContextBudget('x'.repeat(DEFAULT_CONTEXT_BUDGET_BYTES + 1), {}),
    /supera el presupuesto/,
  );
  assert.doesNotThrow(
    () => enforceContextBudget('x'.repeat(DEFAULT_CONTEXT_BUDGET_BYTES + 1), { details: true }),
  );
  const textContext = serializeContext(context);
  assert.match(textContext, /supports=density\[comfortable\/compact\]/);
  assert.match(textContext, /defaults=density=comfortable/);
  assert.match(textContext, /required=list,create,update/);
  assert.match(textContext, /optional=activate/);

  const validation = validateCatalog(catalog, {
    selection: catalog.items,
    requireMinimum: false,
    strictReferences: true,
  });
  assert.deepEqual(validation.failures, []);
  assert.deepEqual(validation.warnings, []);

  const queryCapture = captureIo();
  assert.equal(
    queryMain(['--catalog-root', catalogRoot, '--component', 'button', '--json'], queryCapture.io),
    0,
  );
  const queryJson = JSON.parse(queryCapture.output[0]);
  assert.equal(queryJson.count, 3);

  const contextCapture = captureIo();
  assert.equal(
    contextMain(['--catalog-root', catalogRoot, '--variant', 'modal-catalog', '--json'], contextCapture.io),
    0,
  );
  assert.equal(JSON.parse(contextCapture.output[0]).counts.components, 2);

  const noFilterCapture = captureIo();
  assert.equal(contextMain(['--catalog-root', catalogRoot], noFilterCapture.io), 1);
  assert.match(noFilterCapture.errors[0], /requiere --intent/);

  const checkCapture = captureIo();
  assert.equal(
    checkMain([
      '--atomic-root',
      tempRoot,
      '--catalog-root',
      catalogRoot,
      '--no-minimum',
      '--strict-references',
      '--json',
    ], checkCapture.io),
    0,
  );
  assert.equal(JSON.parse(checkCapture.output[0]).valid, true);

  const duplicate = component('button', { source: 'src/app/shared/ui/atoms/button-copy/button-copy.ts' });
  write(path.join(tempRoot, duplicate.source), '@Component({})\nexport class Duplicate {}\n');
  writeJson(path.join(catalogRoot, 'components', 'button-copy.json'), duplicate);
  const invalidCatalog = loadCatalog({ atomicRoot: tempRoot });
  const invalid = validateCatalog(invalidCatalog, {
    selection: invalidCatalog.items,
    requireMinimum: false,
  });
  assert.ok(invalid.failures.some((failure) => failure.includes('id duplicado')));

  console.log('Atomic catalog tools: query, context and validation tests passed.');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
