#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const PATRON_DIRECTIVAS_PROHIBIDAS = /\*(ngIf|ngFor|ngSwitchCase|ngSwitchDefault|ngSwitch)\b/;

const DIRECTORIOS_IGNORADOS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.angular',
  '.vscode',
  'storybook-static',
  '.agent',
  '.agents',
]);

function listarArchivos(raiz) {
  if (!fs.existsSync(raiz)) return [];
  return fs.readdirSync(raiz, { withFileTypes: true }).flatMap((entrada) => {
    if (DIRECTORIOS_IGNORADOS.has(entrada.name)) return [];
    const ruta = path.join(raiz, entrada.name);
    if (entrada.isDirectory()) return listarArchivos(ruta);
    if (!entrada.isFile()) return [];
    if (entrada.name.endsWith('.d.ts')) return [];
    return entrada.name.endsWith('.html') || entrada.name.endsWith('.ts') ? [ruta] : [];
  });
}

function auditarArchivo(rutaArchivo) {
  const contenido = fs.readFileSync(rutaArchivo, 'utf8');
  const lineas = contenido.split(/\r?\n/);
  const hallazgos = [];

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    const coincidencia = linea.match(PATRON_DIRECTIVAS_PROHIBIDAS);
    if (coincidencia) {
      hallazgos.push({
        rutaArchivo,
        linea: i + 1,
        directiva: coincidencia[0],
        detalle: `directiva estructural legacy ${coincidencia[0]} prohibida; use control flow nativo (@if, @for, @switch)`,
      });
    }
  }

  return hallazgos;
}

function auditarArbol(raiz) {
  return listarArchivos(raiz).flatMap(auditarArchivo);
}

/*
LA AUDITORIA SE EXPORTA PARA QUE EL CONSUMIDOR NO LA REESCRIBA.

`governance/consumer/check-atomic-rules.mjs` importa `auditarArbol` y la corre
contra el arbol del consumidor. Si el consumidor tuviera su propia copia de esta
regla, las dos versiones divergirian el dia que una se afine. Una sola implementacion,
dos invocaciones.
*/
function ejecutar() {
  const raiz = path.resolve(process.argv[2] || path.join(__dirname, '../src'));
  const hallazgos = auditarArbol(raiz);
  if (hallazgos.length > 0) {
    console.error('Se detectaron directivas estructurales legacy (*ngIf, *ngFor, *ngSwitch); use control flow nativo (@if, @for, @switch):');
    for (const hallazgo of hallazgos) {
      console.error(
        `- ${path.relative(process.cwd(), hallazgo.rutaArchivo)}:${hallazgo.linea} (${hallazgo.directiva})`,
      );
    }
    process.exitCode = 1;
    return;
  }
  console.log('Control flow nativo verificado: no se detectaron *ngIf, *ngFor ni *ngSwitch.');
}

if (require.main === module) ejecutar();

module.exports = { auditarArchivo, auditarArbol, listarArchivos };
