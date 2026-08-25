import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// La casa ya resolvio la canonizacion de contenido: git-clean-eol-v1, que
// normaliza CRLF a LF antes de medir. Se reutiliza en lugar de inventar una
// segunda forma de calcular la misma huella. Sin ella, un `git stash` o un
// clon con autocrlf distinto cambia los bytes del CSS sin cambiar una sola
// declaracion, y la procedencia diverge por el sistema de archivos y no por el
// diseno. Comprobado en la practica durante F3.
const require = createRequire(import.meta.url);
const { normalizeCrlfToLf } = require('../../governance/consumer/git-clean-eol.cjs');

/**
 * Analizador compartido de los ficheros de tema de Atomic UI.
 *
 * Nace de `check-theme-contrast.mjs`, que ya modelaba la cascada de temas para
 * detectar fugas del bloque claro. El emisor de tokens de Dart necesitaba
 * exactamente ese modelo, y duplicarlo habria creado dos lecturas divergentes de
 * la misma fuente: la primera vez que alguien corrigiera una, la otra seguiria
 * mintiendo. Se promueve a modulo y ambos consumidores lo importan.
 *
 * Gobierna: F3-DART-BRIDGE-20260825, dentro de ECO-20260825-001.
 */

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const themeDir = resolve(projectRoot, 'src/styles/themes');

/**
 * `_tokens-brand.css` faltaba en esta lista. La consecuencia no era teorica: la
 * compuerta de contraste declaraba verificados «3 temas alcanzables» sin haber
 * leido nunca el fichero que define la paleta de marca, de modo que cualquier
 * regresion alli era invisible. Se incorpora.
 */
export const THEME_FILES = [
  '_tokens-primitives.css',
  '_tokens-brand.css',
  '_tokens-semantic.css',
  '_tokens-components.css',
];

/** Devuelve [{selector, body}] de los bloques de primer nivel del fichero. */
export function topLevelBlocks(text) {
  const blocks = [];
  let index = 0;
  while (index < text.length) {
    const open = text.indexOf('{', index);
    if (open < 0) break;
    const previousClose = text.lastIndexOf('}', open);
    const selector = text.slice(previousClose + 1, open).replace(/\s+/g, ' ').trim();
    let depth = 1;
    let cursor = open + 1;
    while (cursor < text.length && depth > 0) {
      if (text[cursor] === '{') depth += 1;
      else if (text[cursor] === '}') depth -= 1;
      cursor += 1;
    }
    blocks.push({ selector, body: text.slice(open + 1, cursor - 1) });
    index = cursor;
  }
  return blocks;
}

/** Contenido y huella SHA-256 de cada fichero de tema, en orden estable. */
export function themeSources() {
  return THEME_FILES.map((file) => {
    const canonicos = normalizeCrlfToLf(readFileSync(join(themeDir, file)));
    return {
      file,
      css: canonicos.toString('utf8'),
      sha256: createHash('sha256').update(canonicos).digest('hex'),
    };
  });
}

/** Huella de un texto emitido, bajo la misma canonizacion que las fuentes. */
export function huellaCanonica(texto) {
  return createHash('sha256')
    .update(normalizeCrlfToLf(Buffer.from(texto, 'utf8')))
    .digest('hex');
}

/**
 * Tokens visibles para un tema. El bloque claro esta anclado a `:root`, asi que
 * cualquier tema hereda lo que el no redeclare. Se modela igual que el
 * navegador: replicar la cascada es la unica forma de detectar una fuga.
 */
export function tokensForTheme(theme) {
  const values = new Map();
  for (const { css } of themeSources()) {
    for (const { selector, body } of topLevelBlocks(css)) {
      const lower = selector.toLowerCase();
      const isRootDefault = lower.includes(':root');
      const isThisTheme = lower.includes(`[data-theme="${theme}"]`);
      if (!isRootDefault && !isThisTheme) continue;
      for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
        values.set(match[1], match[2].trim());
      }
    }
  }
  return values;
}

/** Compone un color translucido sobre su fondo y devuelve el hex resultante. */
export function flatten(rgba, backdropHex) {
  const parts = /^rgba?\(([^)]+)\)$/i.exec(rgba.trim());
  if (!parts) return null;
  const [r, g, b, a = '1'] = parts[1].split(/[,/]/).map((piece) => piece.trim());
  const alpha = Number(a);
  if ([r, g, b].some((piece) => piece === '' || Number.isNaN(Number(piece))) || Number.isNaN(alpha)) {
    return null;
  }
  const backdrop = backdropHex.replace('#', '');
  const mix = [0, 2, 4].map((offset, index) => {
    const under = parseInt(backdrop.slice(offset, offset + 2), 16);
    const over = Number([r, g, b][index]);
    return Math.round(over * alpha + under * (1 - alpha));
  });
  return `#${mix.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

/** Sigue la cadena de `var()` hasta un hexadecimal, o null si no resuelve. */
export function resolveToken(values, name, seen = new Set(), backdrop = null) {
  if (seen.has(name)) return null;
  seen.add(name);
  const raw = values.get(name);
  if (!raw) return null;
  const alias = /^var\((--[\w-]+)\)$/.exec(raw.trim());
  if (alias) return resolveToken(values, alias[1], seen, backdrop);
  if (/^#[0-9a-f]{6}$/i.test(raw.trim())) return raw.trim();
  if (backdrop && /^rgba?\(/i.test(raw.trim())) return flatten(raw.trim(), backdrop);
  return null;
}

/**
 * Sigue la cadena de `var()` hasta un valor no aliasado, sin exigir que sea
 * color. Lo necesita el emisor para medidas: `rem`, `px`, numeros sin unidad.
 */
export function resolveRaw(values, name, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const raw = values.get(name);
  if (!raw) return null;
  const alias = /^var\((--[\w-]+)\)$/.exec(raw.trim());
  if (alias) return resolveRaw(values, alias[1], seen);
  return raw.trim();
}

/**
 * Base de conversion declarada del puente: 1rem = 16 pixeles logicos.
 *
 * El pixel logico de Flutter esta definido a unos 96 por pulgada, igual que el
 * `px` de CSS, de modo que la equivalencia es directa y la constante es
 * auditable. No es una medida fisica: es la base que este puente declara, y
 * queda registrada en el manifiesto de procedencia para que nadie tenga que
 * deducirla leyendo el generador.
 */
export const BASE_REM_EN_PIXELES_LOGICOS = 16.0;

/** Convierte `1.25rem` o `20px` a pixeles logicos. Devuelve null si no aplica. */
export function medidaAPixelesLogicos(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  const rem = /^(-?\d*\.?\d+)rem$/.exec(texto);
  if (rem) return Number(rem[1]) * BASE_REM_EN_PIXELES_LOGICOS;
  const px = /^(-?\d*\.?\d+)px$/.exec(texto);
  if (px) return Number(px[1]);
  const puro = /^(-?\d*\.?\d+)$/.exec(texto);
  if (puro) return Number(puro[1]);
  return null;
}

/** Normaliza un numero para emitirlo como literal `double` de Dart. */
export function comoDoubleDart(numero) {
  const redondeado = Math.round(numero * 1000) / 1000;
  return Number.isInteger(redondeado) ? `${redondeado}.0` : `${redondeado}`;
}
