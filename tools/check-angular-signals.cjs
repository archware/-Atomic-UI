#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const SIMBOLOS_PROHIBIDOS = new Set(['Input', 'Output', 'EventEmitter']);

function listarArchivosTypeScript(raiz) {
  if (!fs.existsSync(raiz)) return [];
  return fs.readdirSync(raiz, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(raiz, entrada.name);
    if (entrada.isDirectory()) return listarArchivosTypeScript(ruta);
    return entrada.isFile() && entrada.name.endsWith('.ts') ? [ruta] : [];
  });
}

function auditarArchivo(rutaArchivo) {
  const contenido = fs.readFileSync(rutaArchivo, 'utf8');
  const fuente = ts.createSourceFile(
    rutaArchivo,
    contenido,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const hallazgos = [];

  for (const sentencia of fuente.statements) {
    if (!ts.isImportDeclaration(sentencia) || sentencia.moduleSpecifier.text !== '@angular/core') {
      continue;
    }
    const enlaces = sentencia.importClause?.namedBindings;
    if (!enlaces || !ts.isNamedImports(enlaces)) continue;

    for (const elemento of enlaces.elements) {
      const simboloOriginal = elemento.propertyName?.text ?? elemento.name.text;
      if (!SIMBOLOS_PROHIBIDOS.has(simboloOriginal)) continue;
      const posicion = fuente.getLineAndCharacterOfPosition(elemento.getStart(fuente));
      hallazgos.push({
        rutaArchivo,
        linea: posicion.line + 1,
        simbolo: simboloOriginal,
      });
    }
  }

  return hallazgos;
}

function auditarArbol(raiz) {
  return listarArchivosTypeScript(raiz).flatMap(auditarArchivo);
}

/*
LA AUDITORIA SE EXPORTA PARA QUE EL CONSUMIDOR NO LA REESCRIBA.

`governance/consumer/check-atomic-rules.mjs` importa `auditarArbol` y la corre
contra el arbol del consumidor. Si el consumidor tuviera su propia copia de esta
regla, las dos versiones divergirian el dia que una se afine, y la del consumidor
seria la que nadie recuerda actualizar. Una sola implementacion, dos invocaciones.

El bloque CLI de abajo solo corre cuando se ejecuta el archivo directamente, de
modo que importarlo no dispara `process.exitCode`.
*/
function ejecutar() {
  const raiz = path.resolve(process.argv[2] || path.join(__dirname, '../src/app/shared/ui'));
  const hallazgos = auditarArbol(raiz);
  if (hallazgos.length > 0) {
    console.error('Se detectaron contratos Angular heredados; deben utilizarse input() y output():');
    for (const hallazgo of hallazgos) {
      console.error(
        `- ${path.relative(process.cwd(), hallazgo.rutaArchivo)}:${hallazgo.linea} (${hallazgo.simbolo})`,
      );
    }
    process.exitCode = 1;
    return;
  }
  console.log('Contrato Signals verificado: no se importan Input, Output ni EventEmitter.');
}

if (require.main === module) ejecutar();

module.exports = { auditarArchivo, auditarArbol, listarArchivosTypeScript };
