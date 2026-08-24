#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { BindingType, parseTemplate } from '@angular/compiler';

function listarArchivos(raiz) {
  if (!fs.existsSync(raiz)) return [];
  return fs.readdirSync(raiz, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(raiz, entrada.name);
    if (entrada.isDirectory()) return listarArchivos(ruta);
    if (!entrada.isFile() || entrada.name.endsWith('.spec.ts')) return [];
    return entrada.name.endsWith('.ts') || entrada.name.endsWith('.html') ? [ruta] : [];
  });
}

function nombrePropiedad(nodo) {
  if (!nodo) return null;
  if (ts.isIdentifier(nodo) || ts.isStringLiteral(nodo) || ts.isNumericLiteral(nodo)) {
    return nodo.text;
  }
  return null;
}

function lineaTypeScript(fuente, nodo) {
  return fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente)).line + 1;
}

function lineaPlantilla(contenido, desplazamiento) {
  return contenido.slice(0, desplazamiento).split(/\r?\n/u).length;
}

function auditarPlantilla(contenido, rutaArchivo, lineaBase = 0) {
  const resultado = parseTemplate(contenido, rutaArchivo, {
    preserveWhitespaces: true,
  });
  const hallazgos = [];
  const visitados = new WeakSet();

  function registrar(tipo, nodo) {
    const inicio = nodo?.sourceSpan?.start?.offset ?? 0;
    hallazgos.push({
      rutaArchivo,
      linea: lineaBase + lineaPlantilla(contenido, inicio),
      tipo,
    });
  }

  function visitar(valor) {
    if (!valor || typeof valor !== 'object') return;
    if (visitados.has(valor)) return;
    visitados.add(valor);

    if (Array.isArray(valor.attributes)) {
      for (const atributo of valor.attributes) {
        if (atributo.name === 'style') registrar('atributo style', atributo);
      }
    }

    if (Array.isArray(valor.inputs)) {
      for (const entrada of valor.inputs) {
        const esEstilo =
          entrada.type === BindingType.Style ||
          (entrada.type === BindingType.Attribute && entrada.name === 'style') ||
          (entrada.type === BindingType.Property && entrada.name === 'style');
        if (esEstilo) registrar('binding de estilo', entrada);
      }
    }

    for (const [clave, descendiente] of Object.entries(valor)) {
      if (clave === 'sourceSpan' || clave === 'keySpan' || clave === 'valueSpan') continue;
      if (Array.isArray(descendiente)) {
        for (const elemento of descendiente) visitar(elemento);
      } else if (descendiente && typeof descendiente === 'object') {
        visitar(descendiente);
      }
    }
  }

  for (const nodo of resultado.nodes) visitar(nodo);
  return hallazgos;
}

function auditarTypeScript(rutaArchivo) {
  const contenido = fs.readFileSync(rutaArchivo, 'utf8');
  const fuente = ts.createSourceFile(
    rutaArchivo,
    contenido,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const hallazgos = [];
  const aliasesHostBinding = new Set(['HostBinding']);

  for (const sentencia of fuente.statements) {
    if (!ts.isImportDeclaration(sentencia) || sentencia.moduleSpecifier.text !== '@angular/core') {
      continue;
    }
    const enlaces = sentencia.importClause?.namedBindings;
    if (!enlaces || !ts.isNamedImports(enlaces)) continue;
    for (const elemento of enlaces.elements) {
      if ((elemento.propertyName?.text ?? elemento.name.text) === 'HostBinding') {
        aliasesHostBinding.add(elemento.name.text);
      }
    }
  }

  function auditarComponente(llamada, nodoDecorado) {
    const metadatos = llamada.arguments[0];
    if (!metadatos || !ts.isObjectLiteralExpression(metadatos)) return;

    for (const propiedad of metadatos.properties) {
      const nombre = nombrePropiedad(propiedad.name);
      if (nombre === 'styles') {
        hallazgos.push({
          rutaArchivo,
          linea: lineaTypeScript(fuente, propiedad),
          tipo: 'metadato Component.styles',
        });
        continue;
      }

      if (
        nombre === 'template' &&
        ts.isPropertyAssignment(propiedad) &&
        (ts.isNoSubstitutionTemplateLiteral(propiedad.initializer) ||
          ts.isStringLiteral(propiedad.initializer))
      ) {
        const plantilla = propiedad.initializer.text;
        const lineaInicial = lineaTypeScript(fuente, propiedad.initializer) - 1;
        hallazgos.push(...auditarPlantilla(plantilla, rutaArchivo, lineaInicial));
      }

      if (nombre === 'host' && ts.isPropertyAssignment(propiedad) && ts.isObjectLiteralExpression(propiedad.initializer)) {
        for (const enlace of propiedad.initializer.properties) {
          const nombreEnlace = nombrePropiedad(enlace.name);
          if (nombreEnlace === 'style' || /^\[(?:style(?:\.|\])|attr\.style\])/u.test(nombreEnlace ?? '')) {
            hallazgos.push({
              rutaArchivo,
              linea: lineaTypeScript(fuente, enlace),
              tipo: 'binding de estilo en host',
            });
          }
        }
      }
    }
  }

  function visitar(nodo) {
    if (ts.isDecorator(nodo) && ts.isCallExpression(nodo.expression)) {
      const llamada = nodo.expression;
      if (ts.isIdentifier(llamada.expression) && llamada.expression.text === 'Component') {
        auditarComponente(llamada, nodo.parent);
      }
      if (
        ts.isIdentifier(llamada.expression) &&
        aliasesHostBinding.has(llamada.expression.text) &&
        llamada.arguments[0] &&
        ts.isStringLiteralLike(llamada.arguments[0]) &&
        /^(?:style(?:\.|$)|attr\.style$)/u.test(llamada.arguments[0].text)
      ) {
        hallazgos.push({
          rutaArchivo,
          linea: lineaTypeScript(fuente, nodo),
          tipo: 'HostBinding de estilo',
        });
      }
    }
    ts.forEachChild(nodo, visitar);
  }

  visitar(fuente);
  return hallazgos;
}

function auditarArbol(raiz) {
  return listarArchivos(raiz).flatMap((rutaArchivo) =>
    rutaArchivo.endsWith('.html')
      ? auditarPlantilla(fs.readFileSync(rutaArchivo, 'utf8'), rutaArchivo)
      : auditarTypeScript(rutaArchivo),
  );
}

function ejecutar() {
  const raiz = path.resolve(process.argv[2] || path.join(import.meta.dirname, '../src/app/shared/ui'));
  const hallazgos = auditarArbol(raiz);
  if (hallazgos.length > 0) {
    console.error('Se detectaron estilos Angular embebidos o enlazados fuera de hojas externas:');
    for (const hallazgo of hallazgos) {
      console.error(
        `- ${path.relative(process.cwd(), hallazgo.rutaArchivo)}:${hallazgo.linea} (${hallazgo.tipo})`,
      );
    }
    process.exitCode = 1;
    return;
  }
  console.log('Estilos Angular verificados: metadatos y plantillas dependen de hojas externas.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  ejecutar();
}

export { auditarArbol, auditarPlantilla, auditarTypeScript, listarArchivos };
