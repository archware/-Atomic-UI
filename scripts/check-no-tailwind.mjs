#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/*
COMPUERTA ANTI-TAILWIND — prohibicion de directivas, configuracion, paquetes y utilidades Tailwind.

Atomic UI gobierna su presentacion mediante tokens CSS semanticos (`var(--...)`), BEM y el catalogo
acotado de `src/styles/themes/_utilities.css`. Queda prohibido introducir:
1. Archivos `tailwind.config.*` en la raiz o en el arbol auditado.
2. Dependencias `tailwindcss` o `@tailwindcss/*` en `package.json`.
3. Directivas `@tailwind`, `@apply` o `@import "tailwindcss"` en hojas o plantillas.
4. Clases utilitarias de Tailwind prohibidas o huerfanas en atributos `class="..."` o selectores CSS
   (valores arbitrarios `w-[...]`, variantes con prefijo `md:...`/`hover:...`/`dark:...`, o clases
   como `pointer-events-none`, `col-span-*`, `mx-6`, `mt-6`, `inline`, `space-x-*`, `space-y-*`,
   `bg-slate-*`, `text-slate-*`, etc.).

DESCUBRIR, NO DECLARAR. El barrido recorre todos los archivos `.html`, `.ts`, `.css` y `.scss` del
directorio auditado. Si el barrido devuelve 0 archivos, la compuerta falla con codigo 2 (arnes roto).
*/

const raizRepositorio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origenPorDefecto = resolve(raizRepositorio, 'src');

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

const EXTENSIONES_AUDITADAS = new Set(['.html', '.ts', '.css', '.scss']);

const ARCHIVOS_CONFIG_TAILWIND = /^tailwind\.config\.(?:js|cjs|mjs|ts|json)$/u;

const DIRECTIVA_TAILWIND_REGEX =
  /@tailwind\s+(?:base|components|utilities|variants)\b|@apply\s+[^;{\n]+|@import\s+['"]tailwindcss/u;

const CLASES_TAILWIND_PROHIBIDAS = new Set([
  'pointer-events-none',
  'pointer-events-auto',
  'inline',
  'inline-block',
  'inline-flex',
  'mx-6',
  'mt-6',
  'sr-only',
  'not-sr-only',
]);

const PATRONES_CLASE_TAILWIND = [
  /^(?:sm|md|lg|xl|2xl|hover|focus|focus-visible|active|disabled|dark|group-hover):[a-z0-9-[\]]+/u,
  /^-?[a-z]+(?:-[a-z0-9]+)*-\[[^\]]+\]$/u,
  /^(?:col|row)-span-(?:\d+|full)$/u,
  /^space-[xy]-(?:\d+|px|reverse)$/u,
  /^divide-[xy](?:-\d+|-[a-z]+)?$/u,
  /^(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)$/u,
];

function esClaseTailwindProhibida(token) {
  if (!token) return false;
  if (CLASES_TAILWIND_PROHIBIDAS.has(token)) return true;
  return PATRONES_CLASE_TAILWIND.some((patron) => patron.test(token));
}

function recolectarArchivos(directorio) {
  const archivos = [];
  const configs = [];
  for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
    if (DIRECTORIOS_IGNORADOS.has(entrada.name)) continue;
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      const sub = recolectarArchivos(ruta);
      archivos.push(...sub.archivos);
      configs.push(...sub.configs);
    } else if (entrada.isFile()) {
      if (ARCHIVOS_CONFIG_TAILWIND.test(entrada.name)) {
        configs.push(ruta);
      }
      if (!entrada.name.endsWith('.d.ts') && EXTENSIONES_AUDITADAS.has(extname(entrada.name))) {
        archivos.push(ruta);
      }
    }
  }
  return { archivos, configs };
}

function auditarPackageJson(rutaPackage, raizRelativa) {
  if (!existsSync(rutaPackage)) return [];
  const contenido = readFileSync(rutaPackage, 'utf8');
  const lineas = contenido.split(/\r?\n/u);
  const pkg = JSON.parse(contenido);
  const hallazgos = [];
  const bloques = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

  for (const bloque of bloques) {
    const deps = pkg[bloque];
    if (!deps || typeof deps !== 'object') continue;
    for (const nombre of Object.keys(deps)) {
      if (nombre === 'tailwindcss' || nombre.startsWith('@tailwindcss/')) {
        const indiceLinea = lineas.findIndex((l) => l.includes(`"${nombre}"`));
        hallazgos.push({
          archivo: relative(raizRelativa, rutaPackage).replaceAll('\\', '/'),
          linea: indiceLinea >= 0 ? indiceLinea + 1 : 1,
          tipo: 'dependencia-tailwind',
          detalle: `dependencia prohibida "${nombre}" en ${bloque}`,
        });
      }
    }
  }
  return hallazgos;
}

function numeroLinea(contenido, desplazamiento) {
  return contenido.slice(0, desplazamiento).split(/\r?\n/u).length;
}

function auditarClasesEnContenido(contenido) {
  const detectadas = [];
  const regexAtributoClass = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/gu;
  for (const match of contenido.matchAll(regexAtributoClass)) {
    const valor = match[1] ?? match[2] ?? '';
    const offsetValor = (match.index ?? 0) + match[0].indexOf(valor);
    for (const tokenMatch of valor.matchAll(/\S+/gu)) {
      const token = tokenMatch[0];
      if (esClaseTailwindProhibida(token)) {
        detectadas.push({
          clase: token,
          linea: numeroLinea(contenido, offsetValor + (tokenMatch.index ?? 0)),
        });
      }
    }
  }
  const regexBindingClass = /\[class\.([a-zA-Z0-9_-]+)\]\s*=/gu;
  for (const match of contenido.matchAll(regexBindingClass)) {
    const token = match[1];
    if (esClaseTailwindProhibida(token)) {
      detectadas.push({
        clase: token,
        linea: numeroLinea(contenido, match.index ?? 0),
      });
    }
  }
  return detectadas;
}

function auditarSelectoresCssEnLinea(linea) {
  const detectadas = [];
  if (linea.trim().startsWith('/*') || linea.trim().startsWith('*') || linea.trim().startsWith('//')) {
    return detectadas;
  }
  const antesDeLlave = (linea.split('{')[0] ?? '').replace(/:host(?:-context)?\([^)]*\)/gu, '');
  if (!antesDeLlave.includes('.')) return detectadas;
  for (const match of antesDeLlave.matchAll(/\.([a-zA-Z0-9_-]+)/gu)) {
    const clase = match[1];
    if (esClaseTailwindProhibida(clase)) {
      detectadas.push(`.${clase}`);
    }
  }
  return detectadas;
}

export function auditarNoTailwind(origen = origenPorDefecto, opciones = {}) {
  const raizProyecto = opciones.raizProyecto ?? resolve(origen, '..');
  const raizRelativa = opciones.raizRelativa ?? raizProyecto;
  const { archivos, configs } = recolectarArchivos(origen);
  const hallazgos = [];

  if (existsSync(raizProyecto) && statSync(raizProyecto).isDirectory()) {
    for (const entrada of readdirSync(raizProyecto, { withFileTypes: true })) {
      if (entrada.isFile() && ARCHIVOS_CONFIG_TAILWIND.test(entrada.name)) {
        const rutaConfig = join(raizProyecto, entrada.name);
        if (!configs.includes(rutaConfig)) configs.push(rutaConfig);
      }
    }
  }

  for (const rutaConfig of configs) {
    hallazgos.push({
      archivo: relative(raizRelativa, rutaConfig).replaceAll('\\', '/'),
      linea: 1,
      tipo: 'config-tailwind',
      detalle: `archivo de configuracion Tailwind prohibido (${ rutaConfig.split(/[\\/]/).pop() })`,
    });
  }

  const rutaPackage = opciones.rutaPackageJson ?? join(raizProyecto, 'package.json');
  hallazgos.push(...auditarPackageJson(rutaPackage, raizRelativa));

  for (const ruta of archivos) {
    const contenido = readFileSync(ruta, 'utf8');
    const lineas = contenido.split(/\r?\n/u);
    const ext = extname(ruta);
    const archivoRel = relative(raizRelativa, ruta).replaceAll('\\', '/');

    if (ext === '.html' || ext === '.ts') {
      for (const { clase, linea } of auditarClasesEnContenido(contenido)) {
        hallazgos.push({
          archivo: archivoRel,
          linea,
          tipo: 'clase-tailwind',
          detalle: `clase utilitaria Tailwind prohibida "${clase}"`,
        });
      }
    }

    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];

      const matchDirectiva = linea.match(DIRECTIVA_TAILWIND_REGEX);
      if (matchDirectiva) {
        hallazgos.push({
          archivo: archivoRel,
          linea: i + 1,
          tipo: 'directiva-tailwind',
          detalle: `directiva Tailwind prohibida (${matchDirectiva[0].trim()})`,
        });
      }

      if (ext === '.css' || ext === '.scss') {
        for (const selector of auditarSelectoresCssEnLinea(linea)) {
          hallazgos.push({
            archivo: archivoRel,
            linea: i + 1,
            tipo: 'selector-tailwind',
            detalle: `selector utilitario Tailwind prohibido "${selector}"`,
          });
        }
      }
    }
  }

  return { hallazgos, descubiertos: archivos.length };
}

function ejecutar() {
  const origen = process.argv[2] ? resolve(process.argv[2]) : origenPorDefecto;
  if (!existsSync(origen) || !statSync(origen).isDirectory()) {
    console.error(`- No existe el directorio a auditar: ${origen}`);
    process.exit(2);
  }

  const raizProyecto = process.argv[2] ? resolve(origen, '..') : raizRepositorio;
  const { hallazgos, descubiertos } = auditarNoTailwind(origen, {
    raizProyecto,
    raizRelativa: raizProyecto,
  });

  if (descubiertos === 0) {
    console.error('- El barrido no descubrio ningun archivo en el origen: la compuerta no certifica nada.');
    process.exit(2);
  }

  if (hallazgos.length > 0) {
    console.error(`Se detectaron ${hallazgos.length} incumplimientos de la compuerta Anti-Tailwind:`);
    for (const h of hallazgos) {
      console.error(`- ${h.archivo}:${h.linea} [${h.tipo}] -> ${h.detalle}`);
    }
    process.exit(1);
  }

  console.log(
    `Compuerta Anti-Tailwind verificada: ${descubiertos} archivos auditados, 0 residuos de Tailwind.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  ejecutar();
}
