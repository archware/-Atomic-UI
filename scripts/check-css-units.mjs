#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/*
COMPUERTA DE UNIDADES CSS — prohibicion de medidas rigidas `px` fuera de trazos finos y puntos de corte.

Atomic UI gobierna el espaciado, la tipografia y las dimensiones mediante tokens CSS (`var(--...)`)
o unidades relativas (`rem`, `em`, `%`, `dvh`, `vw`). Queda prohibido emplear unidades `px` rigidas
en declaraciones CSS de `src/app/shared/ui/` (`.css` y `.scss`) y `src/styles/themes/_utilities.css` salvo:
1. Consultas de medios o contenedor (`@media`, `@container`) y tokens de breakpoint (`--table-mobile-breakpoint`, `--table-breakpoint`).
2. Trazos finos de bordes, contornos, anillos, sombras o recortes (`border*`, `outline*`, `box-shadow`, `column-rule*`, `text-decoration-thickness`, `clip`, `--*border*`, `--*shadow*`, `--*outline*`)
   cuyas magnitudes en `px` pertenezcan exclusivamente a `{0px, 0.5px, 1px, 1.5px, 2px, -0.5px, -1px, -1.5px, -2px}`.
3. Lineas divisorias y cajas de ocultacion accesible (`width`, `height`, `inline-size`, `block-size`, `margin*`) de exactamente `1px` o `-1px`.

DESCUBRIR, NO DECLARAR. Si el barrido descubre 0 hojas `.css`/`.scss`, la compuerta falla con codigo 2 (arnes roto).
*/

const raizRepositorio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origenPorDefecto = resolve(raizRepositorio, 'src/app/shared/ui');
const hojaUtilidadesPorDefecto = resolve(raizRepositorio, 'src/styles/themes/_utilities.css');

const DIRECTORIOS_IGNORADOS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.angular',
  '.vscode',
  'storybook-static',
]);

const EXTENSIONES_AUDITADAS = new Set(['.css', '.scss']);

const MAGNITUDES_TRAZO_FINO = new Set([
  '0px',
  '0.5px',
  '.5px',
  '1px',
  '1.5px',
  '2px',
  '-0.5px',
  '-.5px',
  '-1px',
  '-1.5px',
  '-2px',
]);
const MAGNITUDES_UN_PIXEL = new Set(['1px', '-1px']);

const PROPIEDAD_TRAZO_FINO_REGEX =
  /^(?:border(?!-[a-z-]*radius\b|-spacing\b|-collapse\b|-image\b)(?:-[a-z-]+)?|outline(?:-[a-z-]+)?|box-shadow|column-rule(?:-[a-z-]+)?|text-decoration-thickness|clip|--[a-z0-9-]*(?:border|shadow|outline)[a-z0-9-]*)$/iu;

const PROPIEDAD_UN_PIXEL_REGEX =
  /^(?:width|height|inline-size|block-size|margin(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?)$/iu;

const PROPIEDAD_BREAKPOINT_TOKEN_REGEX = /^--table-(?:mobile-)?breakpoint$/iu;

function recolectarHojasCss(directorio) {
  if (!existsSync(directorio)) {
    return [];
  }
  const estadistica = statSync(directorio);
  if (estadistica.isFile()) {
    return EXTENSIONES_AUDITADAS.has(extname(directorio)) ? [directorio] : [];
  }
  if (!estadistica.isDirectory()) {
    return [];
  }
  const archivos = [];
  for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
    if (DIRECTORIOS_IGNORADOS.has(entrada.name)) continue;
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      archivos.push(...recolectarHojasCss(ruta));
    } else if (entrada.isFile() && EXTENSIONES_AUDITADAS.has(extname(entrada.name))) {
      archivos.push(ruta);
    }
  }
  return archivos;
}

function limpiarComentariosYCabecerasMediaPreservandoLineas(contenido) {
  return contenido
    .replace(/\/\*[\s\S]*?\*\//gu, (bloque) => bloque.replace(/[^\r\n]/gu, ' '))
    .replace(/(?<!:)\/\/[^\r\n]*/gu, (comentario) => ' '.repeat(comentario.length))
    .replace(/@(?:media|container)\b[^{]+/giu, (cabecera) => cabecera.replace(/[^\r\n]/gu, ' '));
}

function numeroLinea(contenido, indice) {
  return contenido.slice(0, indice).split(/\r?\n/u).length;
}

function esMagnitudPermitidaEnPropiedad(propiedad, valorPx) {
  const prop = propiedad.trim().toLowerCase();
  const px = valorPx.toLowerCase();

  if (PROPIEDAD_BREAKPOINT_TOKEN_REGEX.test(prop)) {
    return true;
  }
  if (PROPIEDAD_TRAZO_FINO_REGEX.test(prop) && MAGNITUDES_TRAZO_FINO.has(px)) {
    return true;
  }
  if (PROPIEDAD_UN_PIXEL_REGEX.test(prop) && MAGNITUDES_UN_PIXEL.has(px)) {
    return true;
  }
  return false;
}

export function auditarUnidadesCss(origen = origenPorDefecto, opciones = {}) {
  const raizRelativa = opciones.raizRelativa ?? raizRepositorio;
  const archivos = recolectarHojasCss(origen);
  if (
    resolve(origen) === origenPorDefecto &&
    existsSync(hojaUtilidadesPorDefecto) &&
    !archivos.includes(hojaUtilidadesPorDefecto)
  ) {
    archivos.push(hojaUtilidadesPorDefecto);
  }
  const hallazgos = [];

  const declaracionRegex = /([a-zA-Z-]+|--[a-zA-Z0-9-]+)\s*:\s*([^;{}]+?)\s*(?:;|(?=\}))/gu;

  for (const ruta of archivos) {
    const contenidoOriginal = readFileSync(ruta, 'utf8');
    const contenidoLimpio = limpiarComentariosYCabecerasMediaPreservandoLineas(contenidoOriginal);
    const archivoRel = relative(raizRelativa, ruta).replaceAll('\\', '/');

    for (const match of contenidoLimpio.matchAll(declaracionRegex)) {
      const propiedad = match[1].trim();
      const valor = match[2].trim();
      if (!/px\b/iu.test(valor)) continue;

      const offsetValor = (match.index ?? 0) + match[0].indexOf(match[2]);
      for (const matchPx of match[2].matchAll(/(-?(?:\d+(?:\.\d+)?|\.\d+))px\b/giu)) {
        const tokenPx = matchPx[0];
        if (!esMagnitudPermitidaEnPropiedad(propiedad, tokenPx)) {
          const linea = numeroLinea(contenidoLimpio, offsetValor + (matchPx.index ?? 0));
          hallazgos.push({
            archivo: archivoRel,
            linea,
            propiedad,
            valorPx: tokenPx,
            detalle: `unidad rigida "${tokenPx}" en "${propiedad}: ${valor.replace(/\s+/gu, ' ')}" (use token var(--...) o rem)`,
          });
        }
      }
    }
  }

  return {
    archivosAuditados: archivos.length,
    hallazgos,
  };
}

function parsearArgumentos(argv) {
  let origen = origenPorDefecto;
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--root' && argv[i + 1]) {
      origen = resolve(argv[++i]);
    } else if (!arg.startsWith('-')) {
      origen = resolve(arg);
    }
  }
  return { origen };
}

function ejecutarCli() {
  const { origen } = parsearArgumentos(process.argv);
  if (!existsSync(origen)) {
    console.error(`[check-css-units] Arnes roto: el directorio "${origen}" no existe.`);
    process.exit(2);
  }

  const resultado = auditarUnidadesCss(origen, { raizRelativa: raizRepositorio });
  if (resultado.archivosAuditados === 0) {
    console.error(
      `[check-css-units] Arnes roto: el barrido en "${origen}" devolvio 0 hojas .css/.scss.`,
    );
    process.exit(2);
  }

  if (resultado.hallazgos.length > 0) {
    console.error(
      `[check-css-units] Se detectaron ${resultado.hallazgos.length} medidas rigidas en px fuera de trazos finos permitidos:`,
    );
    for (const h of resultado.hallazgos) {
      console.error(`  - ${h.archivo}:${h.linea} -> ${h.detalle}`);
    }
    process.exit(1);
  }

  console.log(
    `[check-css-units] OK (${resultado.archivosAuditados} hojas auditadas en ${relative(raizRepositorio, origen).replaceAll('\\', '/') || '.'}, 0 medidas px rigidas prohibidas).`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  ejecutarCli();
}
