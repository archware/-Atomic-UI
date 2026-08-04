#!/usr/bin/env node

const {
  CatalogError,
  compactDocument,
  loadCatalog,
  normalizeSearch,
  parseArgs,
  queryCatalog,
  stringsBelow,
  uniqueStrings,
} = require('./query-atomic-catalog.js');

const DEFAULT_CONTEXT_BUDGET_BYTES = 12 * 1024;

function contextArgs(argv) {
  const options = parseArgs(argv.filter((argument) => argument !== '--all'));
  options.allowAll = argv.includes('--all');
  return options;
}

function referencedComponentIds(item, componentById) {
  if (item.kind === 'component') return [];
  const document = item.document;
  const candidates = uniqueStrings([
    ...stringsBelow(document.component),
    ...stringsBelow(document.components),
    ...stringsBelow(document.componentStack),
    ...stringsBelow(document.requires?.components),
    ...stringsBelow(document.appliesTo?.components),
  ]);
  const references = [];
  for (const candidate of candidates) {
    const normalized = normalizeSearch(candidate);
    if (componentById.has(normalized)) references.push(componentById.get(normalized).document.id);
  }
  return uniqueStrings(references);
}

function compactContextComponent(item, details) {
  if (details) return compactDocument(item, true);
  const document = item.document;
  const variants = {};
  for (const variant of Array.isArray(document.variants) ? document.variants : []) {
    if (!variant || typeof variant !== 'object' || !variant.name) continue;
    const values = Array.isArray(variant.values) ? variant.values : [];
    variants[variant.name] = {
      default: values.find((value) => value && typeof value === 'object' && value.default)?.value ?? null,
      values: values.length,
    };
  }
  return {
    kind: 'component',
    id: document.id,
    layer: document.layer,
    selector: document.selector,
    export: document.export,
    source: document.source,
    variants,
  };
}

function compactContextRule(item, details) {
  if (details) return compactDocument(item, true);
  const document = item.document;
  return {
    kind: 'ux-rule',
    id: document.id,
    title: document.title,
    priority: document.priority,
    requirements: uniqueStrings(
      (Array.isArray(document.requirements) ? document.requirements : []).map((requirement) =>
        typeof requirement === 'string' ? requirement : requirement?.id,
      ),
    ),
  };
}

function compactContextRecipe(item, details) {
  const recipe = compactDocument(item, details);
  if (!details) {
    delete recipe.path;
    delete recipe.qualityGates;
  }
  return recipe;
}

function buildAgentContext(catalog, options = {}) {
  const hasFilter =
    (options.intents?.length || 0) > 0
    || (options.components?.length || 0) > 0
    || (options.variants?.length || 0) > 0
    || (options.kinds?.length || 0) > 0;
  if (!hasFilter && !options.allowAll) {
    throw new CatalogError(
      'El contexto requiere --intent, --component o --variant. Use --all solo para una auditor\u00eda deliberada.',
    );
  }

  const queried = queryCatalog(catalog, options);
  const componentById = new Map(
    catalog.items
      .filter((item) => item.kind === 'component' && item.document.id)
      .map((item) => [normalizeSearch(item.document.id), item]),
  );
  const selected = new Map(
    queried.items.map((item) => [`${item.kind}:${item.relativePath}`, item]),
  );
  const unresolvedReferences = [];

  if ((options.intents?.length || 0) > 0) {
    const applicableRules = queryCatalog(catalog, {
      intents: options.intents,
      kinds: ['ux-rule'],
      limit: Number.POSITIVE_INFINITY,
    });
    for (const rule of applicableRules.items) selected.set(`${rule.kind}:${rule.relativePath}`, rule);
  }

  for (const item of [...selected.values()]) {
    if (item.kind !== 'recipe') continue;
    const rawReferences = uniqueStrings([
      ...stringsBelow(item.document.component),
      ...stringsBelow(item.document.components),
      ...stringsBelow(item.document.componentStack),
      ...stringsBelow(item.document.requires?.components),
      ...stringsBelow(item.document.appliesTo?.components),
    ]);
    const resolved = new Set(referencedComponentIds(item, componentById));
    for (const componentId of resolved) {
      const component = componentById.get(normalizeSearch(componentId));
      selected.set(`${component.kind}:${component.relativePath}`, component);
    }
    for (const reference of rawReferences) {
      if (!componentById.has(normalizeSearch(reference))) unresolvedReferences.push(reference);
    }
  }

  const ordered = [...selected.values()].sort((left, right) => {
    const order = { component: 0, recipe: 1, 'ux-rule': 2 };
    return (order[left.kind] - order[right.kind])
      || String(left.document.id).localeCompare(String(right.document.id));
  });
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : 50;
  const limited = ordered.slice(0, limit);
  const components = limited.filter((item) => item.kind === 'component');
  const recipes = limited.filter((item) => item.kind === 'recipe');
  const uxRules = limited.filter((item) => item.kind === 'ux-rule');
  const qualityGates = uniqueStrings(
    limited.flatMap((item) => [
      ...stringsBelow(item.document.qualityGates),
      ...stringsBelow(item.document.gates),
    ]),
  );

  return {
    schemaVersion: 1,
    filters: queried.filters,
    counts: {
      components: components.length,
      recipes: recipes.length,
      uxRules: uxRules.length,
      total: limited.length,
    },
    truncated: ordered.length > limit,
    components: components.map((item) => compactContextComponent(item, options.details)),
    recipes: recipes.map((item) => compactContextRecipe(item, options.details)),
    uxRules: uxRules.map((item) => compactContextRule(item, options.details)),
    qualityGates,
    warnings: uniqueStrings(unresolvedReferences).map(
      (reference) => `Referencia de componente no resuelta: ${reference}`,
    ),
  };
}

function formatContextText(context) {
  const lines = [
    `atomic-agent-context components=${context.counts.components} recipes=${context.counts.recipes} uxRules=${context.counts.uxRules} truncated=${context.truncated}`,
  ];
  for (const [label, items] of [
    ['components', context.components],
    ['recipes', context.recipes],
    ['ux-rules', context.uxRules],
  ]) {
    if (items.length === 0) continue;
    lines.push(`${label}:`);
    for (const item of items) {
      const summary = item.summary || item.title || item.source || '-';
      const details = [];
      if (item.kind === 'component') {
        const defaults = Object.entries(item.variants || {})
          .filter(([, contract]) => contract?.default !== null && contract?.default !== undefined)
          .map(([axis, contract]) => `${axis}=${contract.default}`);
        if (defaults.length > 0) details.push(`defaults=${defaults.join(',')}`);
      } else if (item.kind === 'recipe') {
        const supported = Object.entries(item.supportedVariants || {})
          .map(([axis, values]) => `${axis}[${Array.isArray(values) ? values.join('/') : values}]`);
        const defaults = Object.entries(item.defaults || {})
          .map(([axis, value]) => `${axis}=${value}`);
        if (supported.length > 0) details.push(`supports=${supported.join(',')}`);
        if (defaults.length > 0) details.push(`defaults=${defaults.join(',')}`);
        if (item.requiredOperations?.length > 0) {
          details.push(`required=${item.requiredOperations.join(',')}`);
        }
        if (item.optionalOperations?.length > 0) {
          details.push(`optional=${item.optionalOperations.join(',')}`);
        }
        for (const [operation, contract] of Object.entries(item.operationContracts || {})) {
          const requiredFacts = Array.isArray(contract?.requires) ? contract.requires : [];
          if (requiredFacts.length > 0) details.push(`${operation}-requires=${requiredFacts.join(',')}`);
          if (contract?.authorization) details.push(`${operation}-auth=${contract.authorization}`);
        }
      } else if (item.kind === 'ux-rule' && item.requirements?.length > 0) {
        details.push(`requirements=${item.requirements.join(',')}`);
      }
      lines.push(`- ${item.id} | ${summary}${details.length > 0 ? ` | ${details.join(' | ')}` : ''}`);
    }
  }
  if (context.qualityGates.length > 0) {
    lines.push('quality-gates:', ...context.qualityGates.map((gate) => `- ${gate}`));
  }
  if (context.warnings.length > 0) lines.push('warnings:', ...context.warnings.map((warning) => `- ${warning}`));
  return lines.join('\n');
}

function serializeContext(context, options = {}) {
  return options.format === 'json'
    ? JSON.stringify(context, null, options.pretty ? 2 : 0)
    : formatContextText(context);
}

function enforceContextBudget(output, options = {}) {
  if (options.details) return output;
  const bytes = Buffer.byteLength(output, 'utf8');
  if (bytes > DEFAULT_CONTEXT_BUDGET_BYTES) {
    throw new CatalogError(
      `El contexto compacto ocupa ${bytes} bytes y supera el presupuesto de ${DEFAULT_CONTEXT_BUDGET_BYTES}. `
      + 'Use filtros m\u00e1s precisos o reduzca --limit; --details desactiva este l\u00edmite de forma expl\u00edcita.',
    );
  }
  return output;
}

function helpText() {
  return [
    'Uso: node tools/build-agent-context.js --intent <valor> [opciones]',
    '',
    'Filtros: --intent, --component, --variant y --kind.',
    'El contexto expande autom\u00e1ticamente componentes referenciados por recetas.',
    'Use --format=json para integraci\u00f3n con agentes y --details para conservar campos completos.',
    `La salida compacta se limita a ${DEFAULT_CONTEXT_BUDGET_BYTES} bytes para controlar tokens.`,
    'Sin filtros se rechaza la operaci\u00f3n; --all permite una auditor\u00eda expl\u00edcita.',
  ].join('\n');
}

function main(argv = process.argv.slice(2), io = console) {
  try {
    const options = contextArgs(argv);
    if (options.help) {
      io.log(helpText());
      return 0;
    }
    const catalog = loadCatalog(options);
    const context = buildAgentContext(catalog, options);
    io.log(enforceContextBudget(serializeContext(context, options), options));
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
  DEFAULT_CONTEXT_BUDGET_BYTES,
  buildAgentContext,
  compactContextComponent,
  compactContextRecipe,
  compactContextRule,
  contextArgs,
  enforceContextBudget,
  formatContextText,
  main,
  referencedComponentIds,
  serializeContext,
};
