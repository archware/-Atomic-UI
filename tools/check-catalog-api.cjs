#!/usr/bin/env node

/*
El catálogo debe reflejar el nombre público real de cada entrada Angular.

La compuerta compara `catalog/components/*.json` con las declaraciones del
componente. Se utiliza el árbol sintáctico de TypeScript porque una señal puede
conservar un contrato estable mediante `input(..., { alias: 'nombrePublico' })`:
el identificador interno no forma parte de la API del consumidor.

También se mantiene lectura de `@Input` para que la compuerta produzca un
diagnóstico útil si reaparece código heredado. La prohibición de ese código la
aplica de forma independiente `check:signals`.
*/
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function nombreMiembro(nombre) {
  if (ts.isIdentifier(nombre) || ts.isStringLiteralLike(nombre)) return nombre.text;
  return undefined;
}

function nombrePropiedad(propiedad) {
  if (ts.isIdentifier(propiedad) || ts.isStringLiteralLike(propiedad)) return propiedad.text;
  return undefined;
}

function aliasEnObjeto(objeto) {
  if (!objeto || !ts.isObjectLiteralExpression(objeto)) return undefined;
  for (const propiedad of objeto.properties) {
    if (!ts.isPropertyAssignment(propiedad) || nombrePropiedad(propiedad.name) !== 'alias') {
      continue;
    }
    if (ts.isStringLiteralLike(propiedad.initializer)) return propiedad.initializer.text;
  }
  return undefined;
}

function aliasEnLlamada(llamada, admiteAliasPosicional = false) {
  for (let indice = llamada.arguments.length - 1; indice >= 0; indice -= 1) {
    const argumento = llamada.arguments[indice];
    const alias = aliasEnObjeto(argumento);
    if (alias) return alias;
  }
  const primero = llamada.arguments[0];
  if (admiteAliasPosicional && primero && ts.isStringLiteralLike(primero)) return primero.text;
  return undefined;
}

function familiaSenal(expresion) {
  if (ts.isIdentifier(expresion) && ['input', 'model'].includes(expresion.text)) {
    return expresion.text;
  }
  if (
    ts.isPropertyAccessExpression(expresion) &&
    expresion.name.text === 'required' &&
    ts.isIdentifier(expresion.expression) &&
    ['input', 'model'].includes(expresion.expression.text)
  ) {
    return expresion.expression.text;
  }
  return undefined;
}

function entradaDeSenal(miembro) {
  if (!ts.isPropertyDeclaration(miembro) || !miembro.initializer) return undefined;
  if (!ts.isCallExpression(miembro.initializer) || !familiaSenal(miembro.initializer.expression)) {
    return undefined;
  }
  const nombreInterno = nombreMiembro(miembro.name);
  if (!nombreInterno) return undefined;
  return aliasEnLlamada(miembro.initializer) || nombreInterno;
}

function entradaDeDecorador(miembro) {
  if (!ts.canHaveDecorators(miembro)) return undefined;
  for (const decorador of ts.getDecorators(miembro) || []) {
    const expresion = decorador.expression;
    const llamada = ts.isCallExpression(expresion) ? expresion : undefined;
    const referencia = llamada?.expression ?? expresion;
    if (!ts.isIdentifier(referencia) || referencia.text !== 'Input') continue;
    const nombreInterno = nombreMiembro(miembro.name);
    if (!nombreInterno) return undefined;
    return (llamada && aliasEnLlamada(llamada, true)) || nombreInterno;
  }
  return undefined;
}

function declaredInSource(source, fileName = 'component.ts') {
  const fuente = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const nombres = new Set();

  function visitar(nodo) {
    if (ts.isClassElement(nodo)) {
      const entrada = entradaDeSenal(nodo) || entradaDeDecorador(nodo);
      if (entrada) nombres.add(entrada);
    }
    ts.forEachChild(nodo, visitar);
  }

  visitar(fuente);
  return nombres;
}

function compararCatalogo(catalogRoot = path.resolve('catalog/components')) {
  const violations = [];
  let comparedEntries = 0;
  let comparedInputs = 0;

  for (const entry of fs.readdirSync(catalogRoot).sort()) {
    if (!entry.endsWith('.json')) continue;
    const catalogPath = path.join(catalogRoot, entry);
    const declared = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const inputs = declared.inputs;
    if (!Array.isArray(inputs) || inputs.length === 0) continue;

    const sourcePath = declared.source;
    if (typeof sourcePath !== 'string' || !fs.existsSync(sourcePath)) {
      violations.push(
        `catalog/components/${entry}: declara inputs pero su \`source\` no apunta a un fichero existente (${sourcePath}).`,
      );
      continue;
    }

    comparedEntries += 1;
    const real = declaredInSource(fs.readFileSync(sourcePath, 'utf8'), sourcePath);
    const catalogued = new Set(inputs.map((input) => input.name));
    comparedInputs += catalogued.size;

    for (const name of catalogued) {
      if (!real.has(name)) {
        violations.push(
          `catalog/components/${entry}: declara la entrada \`${name}\`, que ${sourcePath} ya no tiene. ` +
            'Renombrada o retirada sin actualizar el catálogo.',
        );
      }
    }
    for (const name of real) {
      if (!catalogued.has(name)) {
        violations.push(
          `catalog/components/${entry}: ${sourcePath} expone la entrada \`${name}\`, que el catálogo no documenta. ` +
            'Una entrada sin documentar no existe para quien lee el catálogo.',
        );
      }
    }
  }

  return { violations, comparedEntries, comparedInputs };
}

function ejecutar() {
  const resultado = compararCatalogo();
  if (resultado.violations.length > 0) {
    console.error('El catálogo no coincide con la API real de los componentes.\n');
    for (const violation of resultado.violations) console.error(`- ${violation}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `Catálogo alineado con la API real: ${resultado.comparedEntries} componentes y ` +
      `${resultado.comparedInputs} entradas comprobadas.`,
  );
}

if (require.main === module) ejecutar();

module.exports = { compararCatalogo, declaredInSource };
