#!/usr/bin/env node
'use strict';

/*
Ejecuta un script de PowerShell con el interprete que exista en esta maquina.

POR QUE EXISTE ESTE FICHERO. `tokens:check` invocaba `powershell` directamente,
y `powershell` es el nombre del ejecutable de Windows PowerShell 5.1: solo
existe en Windows. PowerShell 7 —multiplataforma— se llama `pwsh`, y es el que
traen las imagenes `ubuntu-latest` de GitHub Actions.

La consecuencia era que `governance:check`, que encadena `tokens:check`, no
podia completarse en el CI de este mismo repositorio (.github/workflows/ci.yml
corre en `ubuntu-latest` y ejecuta `npm run governance:check`). Una compuerta
que no puede correr en su propio CI es gobierno decorativo: da la sensacion de
proteger sin proteger, que es justo lo que esta politica persigue evitar.

EL ORDEN DE PREFERENCIA es `pwsh` primero. No es indiferente: en una maquina
Windows con las dos instaladas conviene ejercitar el mismo interprete que usa
el CI, para que un fallo aparezca en el escritorio y no en la rama.
*/

const { spawnSync } = require('node:child_process');

const CANDIDATOS = ['pwsh', 'powershell'];

function existe(binario) {
  // `-NoProfile -Command $PSVersionTable.PSVersion.Major` es la comprobacion
  // mas barata que no depende de `which`/`where`, que difieren entre sistemas.
  const prueba = spawnSync(binario, ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.Major'], {
    stdio: 'ignore',
    shell: false,
  });
  return prueba.error === undefined && prueba.status === 0;
}

const argumentos = process.argv.slice(2);
if (argumentos.length === 0) {
  process.stderr.write('run-powershell: falta la ruta del script .ps1.\n');
  process.exit(2);
}

const interprete = CANDIDATOS.find((candidato) => existe(candidato));
if (!interprete) {
  process.stderr.write(
    'run-powershell: no se encontro ningun interprete de PowerShell.\n' +
      `Se probaron, en este orden: ${CANDIDATOS.join(', ')}.\n` +
      'En Linux y macOS instale PowerShell 7 (paquete `powershell`, ejecutable `pwsh`).\n',
  );
  process.exit(127);
}

const resultado = spawnSync(
  interprete,
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ...argumentos],
  { stdio: 'inherit', shell: false },
);

if (resultado.error) {
  process.stderr.write(`run-powershell: fallo al ejecutar ${interprete}: ${resultado.error.message}\n`);
  process.exit(1);
}

// Una senal mata el proceso sin codigo de salida; se traduce a fallo explicito
// para que la compuerta no lo confunda con exito.
process.exit(resultado.status === null ? 1 : resultado.status);
