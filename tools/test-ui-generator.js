#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ATOMIC_ROOT = path.resolve(__dirname, '..');
const GENERATOR = path.join(ATOMIC_ROOT, 'tools', 'generate-ui.js');
const FIXTURES_ROOT = path.join(ATOMIC_ROOT, 'test-fixtures', 'ui-requirements');
const SCHEMA = path.join(ATOMIC_ROOT, 'catalog', 'schemas', 'ui-requirement.schema.json');
const RECIPES_ROOT = path.join(ATOMIC_ROOT, 'catalog', 'recipes');
const COMPONENTS_ROOT = path.join(ATOMIC_ROOT, 'catalog', 'components');

const VALID_FIXTURES = [
  {
    name: 'modal-catalog-ui-only',
    file: 'modal-catalog-ui-only.json',
    feature: 'relationship',
    mode: 'ui-only',
    requiredFiles: ['relationship.models.ts', 'relationship.data-port.ts', 'relationship.permissions.ts', 'relationship.facade.ts', 'relationship-page.ts'],
  },
  {
    name: 'route-form-integrated',
    file: 'route-form-integrated.json',
    feature: 'role-access',
    mode: 'integrated',
    requiredFiles: ['role-access.models.ts', 'role-access.data-port.ts', 'role-access.http-contract.ts', 'role-access.facade.ts', 'role-access-list-page.ts', 'role-access-form-page.ts', 'role-access.routes.ts'],
  },
  {
    name: 'master-detail-ui-only',
    file: 'master-detail-ui-only.json',
    feature: 'account-summary',
    mode: 'ui-only',
    requiredFiles: ['account-summary.models.ts', 'account-summary.data-port.ts', 'account-summary.facade.ts', 'account-summary-page.ts'],
  },
];

function invoke(spec, output, extraArguments = []) {
  return childProcess.spawnSync(
    process.execPath,
    [GENERATOR, '--spec', spec, '--output', output, ...extraArguments],
    { cwd: ATOMIC_ROOT, encoding: 'utf8' },
  );
}

function assertSucceeded(result, context) {
  assert.equal(result.error, undefined, `${context}: ${result.error?.message || ''}`);
  assert.equal(result.status, 0, `${context}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
}

function relativeFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      if (entry.isFile()) files.push(path.relative(root, absolute).replaceAll(path.sep, '/'));
    }
  };
  visit(root);
  return files;
}

function snapshot(root) {
  return Object.fromEntries(relativeFiles(root).map((relative) => [
    relative,
    fs.readFileSync(path.join(root, ...relative.split('/')), 'utf8'),
  ]));
}

function assertCatalogReferences() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA, 'utf8'));
  const validateSchema = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
  const componentIds = new Set(
    fs.readdirSync(COMPONENTS_ROOT)
      .filter((name) => name.endsWith('.json'))
      .map((name) => JSON.parse(fs.readFileSync(path.join(COMPONENTS_ROOT, name), 'utf8')).id),
  );
  assert(componentIds.has('page-header'), 'El catalogo debe registrar page-header.');
  assert(componentIds.has('query-toolbar'), 'El catalogo debe registrar query-toolbar.');

  for (const recipeName of ['modal-catalog', 'route-form', 'master-detail']) {
    const recipe = JSON.parse(fs.readFileSync(path.join(RECIPES_ROOT, `${recipeName}.json`), 'utf8'));
    assert.equal(recipe.schemaVersion, 1);
    assert.equal(recipe.id, `atomic.recipe.${recipeName}.v1`);
    assert.equal(recipe.variant, recipeName);
    assert.deepEqual(
      recipe.optionalOperations,
      recipeName === 'modal-catalog' ? ['delete'] : [],
      `${recipeName} declara operaciones opcionales inesperadas.`,
    );
    for (const componentIdsForSlot of Object.values(recipe.componentStack)) {
      for (const componentId of componentIdsForSlot) {
        assert(componentIds.has(componentId), `${recipeName} referencia el id no catalogado ${componentId}.`);
      }
    }
  }
  return validateSchema;
}

function assertGeneratedQuality(fixture, output) {
  const featureRoot = path.join(output, 'src', 'app', 'features', fixture.feature);
  const files = relativeFiles(featureRoot);
  assert(files.length > 0, `${fixture.name} no genero archivos.`);
  for (const expected of fixture.requiredFiles) assert(files.includes(expected), `${fixture.name} no genero ${expected}.`);

  const generated = snapshot(featureRoot);
  for (const [relative, source] of Object.entries(generated)) {
    assert(source.includes('Generated from atomic.fixture.'), `${relative} no conserva trazabilidad.`);
    assert(!/\bany\b/.test(source), `${relative} introduce any.`);
    assert(!source.includes('zone.js'), `${relative} introduce zone.js.`);
    if (relative.endsWith('-page.ts')) {
      assert(source.includes('ChangeDetectionStrategy.OnPush'), `${relative} no usa OnPush.`);
      assert(source.includes('PageHeader'), `${relative} no consume PageHeader.`);
    }
    if (relative.endsWith('-page.html') && !relative.endsWith('-form-page.html')) {
      assert(source.includes('<prest-query-toolbar'), `${relative} no consume QueryToolbar.`);
    }
    if (relative.endsWith('.spec.ts') && relative.includes('-page.spec.ts')) {
      assert(source.includes('provideZonelessChangeDetection'), `${relative} no explicita pruebas zoneless.`);
      assert(source.includes('TestBed.configureTestingModule'), `${relative} no configura un TestBed zoneless real.`);
    }
  }

  const aggregate = Object.values(generated).join('\n');
  assert(!aggregate.includes('HttpClient'), `${fixture.name} no debe generar transporte sin DTO y mapping completos.`);
  assert(!aggregate.includes('@angular/common/http'), `${fixture.name} no debe importar transporte HTTP inferido.`);
  if (fixture.mode === 'ui-only') {
    assert(aggregate.includes('no contiene endpoints'), `${fixture.name} no explica el puerto pendiente.`);
  } else {
    const contract = generated[`${fixture.feature}.http-contract.ts`];
    assert(contract.includes('"method": "GET"'), 'No se preservo GET declarado.');
    assert(contract.includes('"method": "POST"'), 'No se preservo POST declarado.');
    assert(contract.includes('"method": "PATCH"'), 'No se preservo PATCH declarado.');
    assert(contract.includes('"path": "/roles/{id}"'), 'El contrato generado no conserva el endpoint con id.');
    assert(contract.includes('No son un adaptador ejecutable'), 'El contrato no delimita el adapter pendiente.');
    assert(aggregate.includes('no inventa DTO'), 'El puerto integrated no explica el mapping pendiente.');
    assert(!files.some((name) => name.endsWith('.api.ts')), 'Integrated no debe fingir una API ejecutable.');
  }

  const styles = generated[`${fixture.feature}.feature.scss`];
  assert(styles.includes("[data-form-layout='two-columns']"), 'No se genero layout real de formulario.');
  assert(styles.includes("[data-detail-placement='aside']"), 'No se genero layout real master-detail.');
  assert(styles.includes('atomic-generated-filters'), 'No se genero layout interno para filtros proyectados.');

  if (fixture.name === 'route-form-integrated') {
    assert(aggregate.includes('<prest-action-group'), 'actionDisplay=overflow no genero ActionGroup.');
    assert(aggregate.includes('[compact]="true"'), 'El overflow no activo el modo compacto.');
    assert(aggregate.includes('invalidRouteId'), 'La ruta de edicion no distingue un id invalido.');
    assert(aggregate.includes('Number.isFinite(parsed)'), 'El id numerico no se valida sin reglas de signo inventadas.');
    assert(!aggregate.includes('parsed > 0'), 'El generador invento que todo id numerico debe ser positivo.');
    assert(aggregate.includes('fieldError('), 'El formulario no expone validacion visible.');
  } else {
    assert(aggregate.includes('<prest-table-action'), 'actionDisplay=inline no genero TableAction.');
  }

  if (fixture.name === 'modal-catalog-ui-only') {
    assert(aggregate.includes('[min]="0"'), 'No se aplico el minimo numerico explicito.');
    assert(aggregate.includes('[max]="9999"'), 'No se aplico el maximo numerico explicito.');
    assert(aggregate.includes('[step]="1"'), 'No se aplico el step numerico explicito.');
    assert(aggregate.includes('variant="success"'), 'No se renderiza feedback de exito.');
    const permissions = generated['relationship.permissions.ts'];
    assert(permissions.includes('=> false'), 'PermissionPort no deniega por defecto.');
    assert(permissions.includes('RELATIONSHIP_PERMISSION_PORT'), 'No se genero el token de permisos tipado.');
    assert(aggregate.includes('relationships.delete'), 'No se preservo permissionKey explicito.');
    assert(aggregate.includes('canDelete(row)'), 'El affordance delete no esta protegido por permiso.');
    assert(aggregate.includes('confirmDelete()'), 'Delete no usa confirmacion explicita.');
    assert(aggregate.includes('Eliminar parentesco'), 'No se preservaron labels de delete.');
    assert(aggregate.includes('tone="danger"'), 'Delete no usa tone danger.');
    assert(aggregate.includes('this.facade.delete('), 'La confirmacion no llama facade.delete.');
    assert(!aggregate.includes('window.confirm'), 'Delete usa window.confirm en vez de FormDialog.');
    assert(!aggregate.includes('ModalService'), 'Delete usa un servicio modal no canonico.');
  }
}

function assertAngularCompilation(tempRoot) {
  const config = path.join(tempRoot, 'tsconfig.generated.json');
  const extendsPath = path.relative(tempRoot, path.join(ATOMIC_ROOT, 'tsconfig.json')).replaceAll(path.sep, '/');
  const include = [
    ...VALID_FIXTURES.map((fixture) => `${fixture.name}/first/src/**/*.ts`),
    'modal-delete-overflow/first/src/**/*.ts',
  ];
  fs.writeFileSync(config, `${JSON.stringify({
    extends: extendsPath,
    compilerOptions: {
      noEmit: true,
      types: ['jasmine'],
    },
    include,
  }, null, 2)}\n`, 'utf8');

  const ngc = path.join(ATOMIC_ROOT, 'node_modules', '@angular', 'compiler-cli', 'bundles', 'src', 'bin', 'ngc.js');
  assert(fs.existsSync(ngc), `No se encontro el compilador Angular esperado: ${ngc}`);
  const compilation = childProcess.spawnSync(process.execPath, [ngc, '-p', config], {
    cwd: ATOMIC_ROOT,
    encoding: 'utf8',
  });
  assertSucceeded(compilation, 'compilacion Angular estricta de los consumidores generados');
}

function main() {
  const validateSchema = assertCatalogReferences();
  const tempRoot = fs.mkdtempSync(path.join(ATOMIC_ROOT, '.tmp-ui-generator-'));
  try {
    const modalSpec = path.join(FIXTURES_ROOT, 'modal-catalog-ui-only.json');
    const dryRunOutput = path.join(tempRoot, 'dry-run');
    fs.mkdirSync(dryRunOutput, { recursive: true });
    const dryRun = invoke(modalSpec, dryRunOutput, ['--dry-run']);
    assertSucceeded(dryRun, 'dry-run');
    assert.match(dryRun.stdout, /^DRY_RUN /);
    assert.deepEqual(relativeFiles(dryRunOutput), [], '--dry-run no debe crear archivos.');

    for (const fixture of VALID_FIXTURES) {
      const spec = path.join(FIXTURES_ROOT, fixture.file);
      const firstOutput = path.join(tempRoot, fixture.name, 'first');
      const secondOutput = path.join(tempRoot, fixture.name, 'second');
      fs.mkdirSync(firstOutput, { recursive: true });
      fs.mkdirSync(secondOutput, { recursive: true });
      const first = invoke(spec, firstOutput);
      const second = invoke(spec, secondOutput);
      assertSucceeded(first, `${fixture.name}: primera generacion`);
      assertSucceeded(second, `${fixture.name}: segunda generacion`);
      assert.deepEqual(snapshot(firstOutput), snapshot(secondOutput), `${fixture.name} no es determinista.`);
      assertGeneratedQuality(fixture, firstOutput);

      const before = snapshot(firstOutput);
      const overwrite = invoke(spec, firstOutput);
      assert.notEqual(overwrite.status, 0, `${fixture.name} permitio sobrescritura.`);
      assert.match(overwrite.stderr, /No se sobrescrib/);
      assert.deepEqual(snapshot(firstOutput), before, `${fixture.name} altero archivos al rechazar sobrescritura.`);

      const dryRunCollision = invoke(spec, firstOutput, ['--dry-run']);
      assert.notEqual(dryRunCollision.status, 0, `${fixture.name}: dry-run oculto una colision.`);
      assert.match(dryRunCollision.stderr, /No se sobrescrib/);
      assert.deepEqual(snapshot(firstOutput), before, `${fixture.name}: dry-run altero el output.`);
    }

    const overflowRequirement = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    overflowRequirement.id = 'atomic.fixture.relationship.modal.delete-overflow';
    overflowRequirement.feature.key = 'relationship-overflow';
    overflowRequirement.feature.className = 'RelationshipOverflow';
    overflowRequirement.feature.selector = 'prest-relationship-overflow-page';
    overflowRequirement.variants.actionDisplay = 'overflow';
    const overflowSpec = path.join(tempRoot, 'modal-delete-overflow.json');
    fs.writeFileSync(overflowSpec, `${JSON.stringify(overflowRequirement, null, 2)}\n`, 'utf8');
    const overflowOutput = path.join(tempRoot, 'modal-delete-overflow', 'first');
    fs.mkdirSync(overflowOutput, { recursive: true });
    assertSucceeded(invoke(overflowSpec, overflowOutput), 'delete explicito con actionDisplay overflow');
    const overflowFeature = snapshot(path.join(overflowOutput, 'src', 'app', 'features', 'relationship-overflow'));
    const overflowAggregate = Object.values(overflowFeature).join('\n');
    assert(overflowAggregate.includes('[actions]="rowActions(row)"'), 'Overflow no compone acciones segun permiso.');
    assert(overflowAggregate.includes("variant: 'danger'"), 'Overflow no conserva semantica danger para delete.');
    assert(overflowAggregate.includes("actionId === 'delete'"), 'Overflow no despacha delete explicitamente.');

    assertAngularCompilation(tempRoot);

    const invalidOutput = path.join(tempRoot, 'invalid-contract');
    fs.mkdirSync(invalidOutput, { recursive: true });
    const invalid = invoke(path.join(FIXTURES_ROOT, 'invalid-integrated-missing-endpoint.json'), invalidOutput);
    assert.notEqual(invalid.status, 0, 'El contrato integrated incompleto fue aceptado.');
    assert.match(invalid.stderr, /list\.(?:path|method)|endpoint.*list|list.*endpoint/i);
    assert.deepEqual(relativeFiles(invalidOutput), [], 'Un requisito invalido no debe crear archivos.');

    const unknownSpec = path.join(tempRoot, 'unknown-property.json');
    const unknown = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    unknown.unexpected = true;
    fs.writeFileSync(unknownSpec, `${JSON.stringify(unknown, null, 2)}\n`, 'utf8');
    const unknownOutput = path.join(tempRoot, 'unknown-property-output');
    fs.mkdirSync(unknownOutput, { recursive: true });
    const rejectedUnknown = invoke(unknownSpec, unknownOutput);
    assert.notEqual(rejectedUnknown.status, 0, 'Una propiedad fuera del schema fue aceptada.');
    assert.match(rejectedUnknown.stderr, /unexpected.*no est/i);
    assert.deepEqual(relativeFiles(unknownOutput), [], 'Una spec fuera de schema no debe crear archivos.');

    for (const fixture of VALID_FIXTURES) {
      const requirement = JSON.parse(fs.readFileSync(path.join(FIXTURES_ROOT, fixture.file), 'utf8'));
      assert.equal(validateSchema(requirement), true, `${fixture.file} no cumple el schema publicado: ${JSON.stringify(validateSchema.errors)}`);
    }

    const tooLong = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    tooLong.feature.title = 'x'.repeat(121);
    assert.equal(validateSchema(tooLong), false, 'El schema acepto un titulo fuera de limite.');
    const tooLongSpec = path.join(tempRoot, 'too-long.json');
    fs.writeFileSync(tooLongSpec, `${JSON.stringify(tooLong, null, 2)}\n`, 'utf8');
    const tooLongOutput = path.join(tempRoot, 'too-long-output');
    fs.mkdirSync(tooLongOutput, { recursive: true });
    const rejectedTooLong = invoke(tooLongSpec, tooLongOutput);
    assert.notEqual(rejectedTooLong.status, 0, 'El runtime acepto un titulo que el schema rechaza.');
    assert.match(rejectedTooLong.stderr, /120 caracteres/);

    const invalidList = JSON.parse(fs.readFileSync(path.join(FIXTURES_ROOT, 'route-form-integrated.json'), 'utf8'));
    invalidList.contract.operations.list.request = 'draft';
    delete invalidList.contract.operations.list.queryParameters;
    assert.equal(validateSchema(invalidList), false, 'El schema acepto request draft para list.');
    const invalidListSpec = path.join(tempRoot, 'invalid-list.json');
    fs.writeFileSync(invalidListSpec, `${JSON.stringify(invalidList, null, 2)}\n`, 'utf8');
    const invalidListOutput = path.join(tempRoot, 'invalid-list-output');
    fs.mkdirSync(invalidListOutput, { recursive: true });
    const rejectedInvalidList = invoke(invalidListSpec, invalidListOutput);
    assert.notEqual(rejectedInvalidList.status, 0, 'El runtime acepto request draft para list.');
    assert.match(rejectedInvalidList.stderr, /list\.request debe ser query/);

    const missingBounds = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    delete missingBounds.model.fields.find((field) => field.name === 'priority').minimum;
    assert.equal(validateSchema(missingBounds), false, 'El schema acepto un numero sin rango completo.');
    const missingBoundsSpec = path.join(tempRoot, 'missing-bounds.json');
    fs.writeFileSync(missingBoundsSpec, `${JSON.stringify(missingBounds, null, 2)}\n`, 'utf8');
    const missingBoundsOutput = path.join(tempRoot, 'missing-bounds-output');
    fs.mkdirSync(missingBoundsOutput, { recursive: true });
    const rejectedMissingBounds = invoke(missingBoundsSpec, missingBoundsOutput);
    assert.notEqual(rejectedMissingBounds.status, 0, 'El runtime acepto un numero sin minimum explicito.');
    assert.match(rejectedMissingBounds.stderr, /priority.*minimum/i);

    const orphanOperation = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    delete orphanOperation.actions;
    const orphanSpec = path.join(tempRoot, 'orphan-operation.json');
    fs.writeFileSync(orphanSpec, `${JSON.stringify(orphanOperation, null, 2)}\n`, 'utf8');
    const orphanOutput = path.join(tempRoot, 'orphan-operation-output');
    fs.mkdirSync(orphanOutput, { recursive: true });
    const rejectedOrphan = invoke(orphanSpec, orphanOutput);
    assert.notEqual(rejectedOrphan.status, 0, 'Una operacion sin accion UI explicita fue aceptada.');
    assert.match(rejectedOrphan.stderr, /no tiene una acci.n expl.cita/i);

    const actionWithoutOperation = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    delete actionWithoutOperation.actions[0].operation;
    assert.equal(validateSchema(actionWithoutOperation), false, 'El schema acepto una accion sin operation.');
    const actionWithoutOperationSpec = path.join(tempRoot, 'action-without-operation.json');
    fs.writeFileSync(actionWithoutOperationSpec, `${JSON.stringify(actionWithoutOperation, null, 2)}\n`, 'utf8');
    const actionWithoutOperationOutput = path.join(tempRoot, 'action-without-operation-output');
    fs.mkdirSync(actionWithoutOperationOutput, { recursive: true });
    const rejectedActionWithoutOperation = invoke(actionWithoutOperationSpec, actionWithoutOperationOutput);
    assert.notEqual(rejectedActionWithoutOperation.status, 0, 'Una accion sin operation fue aceptada.');
    assert.match(rejectedActionWithoutOperation.stderr, /operation debe ser delete/i);

    const actionWithoutPermission = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    actionWithoutPermission.actions[0].permissionKey = '   ';
    const actionWithoutPermissionSpec = path.join(tempRoot, 'action-without-permission.json');
    fs.writeFileSync(actionWithoutPermissionSpec, `${JSON.stringify(actionWithoutPermission, null, 2)}\n`, 'utf8');
    const actionWithoutPermissionOutput = path.join(tempRoot, 'action-without-permission-output');
    fs.mkdirSync(actionWithoutPermissionOutput, { recursive: true });
    const rejectedActionWithoutPermission = invoke(actionWithoutPermissionSpec, actionWithoutPermissionOutput);
    assert.notEqual(rejectedActionWithoutPermission.status, 0, 'Delete sin permissionKey fue aceptado.');
    assert.match(rejectedActionWithoutPermission.stderr, /permissionKey.*no vac/i);

    const actionWithoutConfirmation = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    delete actionWithoutConfirmation.actions[0].confirmation.confirmLabel;
    assert.equal(validateSchema(actionWithoutConfirmation), false, 'El schema acepto delete sin confirmacion completa.');
    const actionWithoutConfirmationSpec = path.join(tempRoot, 'action-without-confirmation.json');
    fs.writeFileSync(actionWithoutConfirmationSpec, `${JSON.stringify(actionWithoutConfirmation, null, 2)}\n`, 'utf8');
    const actionWithoutConfirmationOutput = path.join(tempRoot, 'action-without-confirmation-output');
    fs.mkdirSync(actionWithoutConfirmationOutput, { recursive: true });
    const rejectedActionWithoutConfirmation = invoke(actionWithoutConfirmationSpec, actionWithoutConfirmationOutput);
    assert.notEqual(rejectedActionWithoutConfirmation.status, 0, 'Delete sin confirmacion completa fue aceptado.');
    assert.match(rejectedActionWithoutConfirmation.stderr, /confirmLabel.*no vac/i);

    const mustConfirm = JSON.parse(fs.readFileSync(modalSpec, 'utf8'));
    const activeField = mustConfirm.model.fields.find((field) => field.name === 'active');
    activeField.required = true;
    activeField.mustBeTrue = true;
    activeField.initialValue = false;
    assert.equal(validateSchema(mustConfirm), true, `mustBeTrue explicito no cumple schema: ${JSON.stringify(validateSchema.errors)}`);
    const mustConfirmSpec = path.join(tempRoot, 'must-confirm.json');
    fs.writeFileSync(mustConfirmSpec, `${JSON.stringify(mustConfirm, null, 2)}\n`, 'utf8');
    const mustConfirmOutput = path.join(tempRoot, 'must-confirm-output');
    fs.mkdirSync(mustConfirmOutput, { recursive: true });
    assertSucceeded(invoke(mustConfirmSpec, mustConfirmOutput), 'boolean mustBeTrue explicito');
    const mustConfirmPage = fs.readFileSync(
      path.join(mustConfirmOutput, 'src', 'app', 'features', 'relationship', 'relationship-page.ts'),
      'utf8',
    );
    assert(mustConfirmPage.includes('Validators.requiredTrue'), 'mustBeTrue no genero el validador explicito.');

    const occupiedOutput = path.join(tempRoot, 'occupied-output');
    const occupiedFeature = path.join(occupiedOutput, 'src', 'app', 'features', 'relationship');
    fs.mkdirSync(occupiedFeature, { recursive: true });
    const sentinel = path.join(occupiedFeature, 'KEEP.txt');
    fs.writeFileSync(sentinel, 'preserve\n', 'utf8');
    const rejectedOccupied = invoke(modalSpec, occupiedOutput);
    assert.notEqual(rejectedOccupied.status, 0, 'Se escribio sobre un feature existente.');
    assert.equal(fs.readFileSync(sentinel, 'utf8'), 'preserve\n');
    assert.deepEqual(relativeFiles(occupiedFeature), ['KEEP.txt'], 'El rechazo dejo escritura parcial.');

    const absentOutput = path.join(tempRoot, 'absent-output');
    const rejectedAbsent = invoke(modalSpec, absentOutput, ['--dry-run']);
    assert.notEqual(rejectedAbsent.status, 0, 'dry-run acepto un consumer root inexistente.');
    assert.match(rejectedAbsent.stderr, /output debe existir/i);
    assert(!fs.existsSync(absentOutput), 'dry-run creo el consumer root inexistente.');

    assert.equal(
      fs.readdirSync(tempRoot, { withFileTypes: true }).some((entry) => entry.name.startsWith('.atomic-ui-stage-')),
      false,
      'Quedo staging transaccional en el temporal.',
    );

    process.stdout.write(`UI_GENERATOR_OK fixtures=${VALID_FIXTURES.length} temp=${tempRoot}\n`);
  } finally {
    const resolvedTemp = path.resolve(tempRoot);
    const resolvedAtomicRoot = `${path.resolve(ATOMIC_ROOT)}${path.sep}`;
    assert(resolvedTemp.startsWith(resolvedAtomicRoot), `Limpieza rechazada fuera de Atomic UI: ${resolvedTemp}`);
    assert(path.basename(resolvedTemp).startsWith('.tmp-ui-generator-'), `Temporal inesperado: ${resolvedTemp}`);
    fs.rmSync(resolvedTemp, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`UI_GENERATOR_TEST_FAILED: ${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
}
