import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Dos fallos reales que ninguna prueba podia ver, porque nada en la suite mira
// estilos calculados:
//
//   1. El bloque [data-theme="dark"] no declaraba --input-disabled-*, asi que
//      heredaba los del bloque claro -anclado a :root- y pintaba un campo casi
//      blanco sobre pagina oscura, con el texto a 2.05:1.
//   2. `var(--text-base)` referenciaba un token que no existe en ningun tema:
//      la declaracion quedaba invalida y el tamano caia por herencia. Sobrevivio
//      meses en 13 archivos.
//
// Este trinquete convierte ambos en un fallo del gate. Es deliberadamente
// estrecho: solo mira familias de tokens definidas en los ficheros de tema, para
// no producir ruido que acabe con alguien desactivandolo.

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const themeDir = resolve(projectRoot, 'src/styles/themes');
const sourceRoot = resolve(projectRoot, 'src');

const THEME_FILES = ['_tokens-primitives.css', '_tokens-semantic.css', '_tokens-components.css'];

// Temas alcanzables desde la interfaz. app-shell solo alterna estos dos, asi que
// exigir contraste en temas que nadie puede seleccionar seria ruido.
const REACHABLE_THEMES = ['light', 'dark'];

// Un control inactivo esta exento del 4.5:1 por WCAG 1.4.3. Se sostiene igual
// como liston propio: un campo que no se lee es un defecto, lo exima la norma
// o no.
const MIN_RATIO = 4.5;

const CONTRAST_PAIRS = [
  {
    what: 'campo de formulario deshabilitado',
    fg: '--input-disabled-text',
    bg: '--input-disabled-bg',
  },
  { what: 'texto principal sobre el fondo de pagina', fg: '--text-color', bg: '--surface-background' },
  { what: 'texto principal sobre una seccion', fg: '--text-color', bg: '--surface-section' },
  { what: 'texto de un campo activo', fg: '--input-text', bg: '--input-bg' },

  // Las alertas se anaden tras encontrarlas incumpliendo las cuatro en tema
  // claro —warning 2,13:1 y danger 3,24:1— mientras esta comprobacion salia en
  // verde: auditaba cuatro pares y ninguno las cubria. Una compuerta que no mira
  // donde falla la interfaz da una garantia falsa, que es peor que no tenerla.
  { what: 'texto de una alerta informativa', fg: '--alert-info-text', bg: '--info-color-lighter' },
  { what: 'texto de una alerta de exito', fg: '--alert-success-text', bg: '--success-color-lighter' },
  { what: 'texto de una alerta de aviso', fg: '--alert-warning-text', bg: '--warning-color-lighter' },
  { what: 'texto de una alerta de peligro', fg: '--alert-danger-text', bg: '--danger-color-lighter' },
];

const failures = [];

/** Devuelve [{selector, body}] de los bloques de primer nivel del fichero. */
function topLevelBlocks(text) {
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

/**
 * Tokens visibles para un tema. El bloque claro esta anclado a `:root`, asi que
 * cualquier tema hereda lo que el no redeclare: exactamente el mecanismo del
 * fallo 1. Se modela igual que el navegador para poder detectarlo.
 */
function tokensForTheme(theme) {
  const values = new Map();
  for (const file of THEME_FILES) {
    const css = readFileSync(join(themeDir, file), 'utf8');
    for (const { selector, body } of topLevelBlocks(css)) {
      const lower = selector.toLowerCase();
      // `:root` casa con <html> SIEMPRE, tambien cuando el selector lista ademas
      // [data-theme="light"]. Por eso los valores del bloque claro se filtran a
      // cualquier tema que no los redeclare: ese fue el fallo. El modelo tiene
      // que replicarlo o el gate diagnosticaria mal.
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

/**
 * Compone un color translucido sobre su fondo y devuelve el hex resultante.
 *
 * Los fondos de alerta de los temas oscuros son `rgba(r, g, b, .1)`: lo que el
 * ojo ve no es ese color sino su mezcla con la superficie de debajo. Sin
 * componer, el par no se podia evaluar y la comprobacion se saltaba justo los
 * temas donde no habia forma de mirarlo.
 */
function flatten(rgba, backdropHex) {
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

function resolveToken(values, name, seen = new Set(), backdrop = null) {
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

function channel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const clean = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(clean.slice(offset, offset + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

// El contraste de texto no basta para detectar el fallo real: si el bloque
// oscuro no redeclara los tokens, hereda los del claro y pinta un campo casi
// blanco sobre pagina oscura -aunque su texto contraste bien CONTRA ESE FONDO
// CLARO-. Lo que delata la fuga es que el campo destaque sobre la pagina: un
// control deshabilitado se funde con su superficie, no compite con ella.
const MAX_SURFACE_DIVERGENCE = 1.8;

for (const theme of REACHABLE_THEMES) {
  const values = tokensForTheme(theme);
  const disabledBg = resolveToken(values, '--input-disabled-bg');
  const pageBg = resolveToken(values, '--surface-background');
  if (disabledBg && pageBg) {
    const divergence = contrast(disabledBg, pageBg);
    if (divergence > MAX_SURFACE_DIVERGENCE) {
      failures.push(
        `[${theme}] el fondo de un campo deshabilitado (${disabledBg}) contrasta ` +
          `${divergence.toFixed(2)}:1 con el fondo de pagina (${pageBg}), por encima de ` +
          `${MAX_SURFACE_DIVERGENCE}:1. Sintoma tipico de que el tema no redeclara ` +
          `--input-disabled-bg y esta heredando el valor del bloque claro anclado a :root.`,
      );
    }
  }
  for (const pair of CONTRAST_PAIRS) {
    // Un fondo translucido se compone sobre la superficie de seccion, que es
    // donde estas piezas se pintan de verdad.
    const backdrop = resolveToken(values, '--surface-section') ?? pageBg;
    const fg = resolveToken(values, pair.fg, new Set(), backdrop);
    const bg = resolveToken(values, pair.bg, new Set(), backdrop);
    if (!fg || !bg) {
      failures.push(
        `[${theme}] ${pair.what}: no se pudo resolver a color (${pair.fg}=${fg ?? 'sin valor'}, ` +
          `${pair.bg}=${bg ?? 'sin valor'}). Un token sin resolver deja la propiedad invalida.`,
      );
      continue;
    }
    const ratio = contrast(fg, bg);
    if (ratio < MIN_RATIO) {
      failures.push(
        `[${theme}] ${pair.what}: ${fg} sobre ${bg} da ${ratio.toFixed(2)}:1, por debajo de ` +
          `${MIN_RATIO}:1. Revise si ${theme} esta redeclarando el token o heredandolo del bloque claro.`,
      );
    }
  }
}

// --- Referencias colgantes ------------------------------------------------
// Solo familias gobernadas por los ficheros de tema: fuera de ellas hay tokens
// legitimos definidos en el propio componente o inyectados por [style].
const GOVERNED = /^--(?:text-(?:2xs|xs|sm|md|lg|xl|2xl|3xl|4xl)|input-|surface-|gray-|letter-spacing-|border-width-)/;

const defined = new Set();
for (const theme of [...REACHABLE_THEMES, 'brand-dark', 'brand-light']) {
  for (const name of tokensForTheme(theme).keys()) defined.add(name);
}

function sourceFiles2(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...sourceFiles2(full));
    else if (/\.(?:scss|css|html|ts)$/.test(entry.name) && !entry.name.endsWith('.spec.ts')) {
      found.push(full);
    }
  }
  return found;
}

const allSources = sourceFiles2(sourceRoot).map((file) => [file, readFileSync(file, 'utf8')]);

// Un token tambien es legitimo si se declara en el ambito de su propia regla,
// como las utilidades `.surface-tone`. Solo interesa el que no se declara EN
// NINGUN sitio: ese es el que deja la propiedad invalida.
for (const [, source] of allSources) {
  for (const match of source.matchAll(/(--[\w-]+)\s*:/g)) defined.add(match[1]);
}

for (const [file, source] of allSources) {
  for (const match of source.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
    const [, name, terminator] = match;
    const hasFallback = terminator === ',';
    if (hasFallback || !GOVERNED.test(name) || defined.has(name)) continue;
    failures.push(
      `${relative(projectRoot, file)}: usa ${name}, que no esta definido en ningun tema y no ` +
        `lleva valor de respaldo. La declaracion queda invalida y el valor cae por herencia.`,
    );
  }
}

if (failures.length > 0) {
  console.error('Contraste y tokens de tema: fallos encontrados.\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Contraste de temas verificado: ${REACHABLE_THEMES.length} temas alcanzables, ` +
    `${CONTRAST_PAIRS.length} pares por tema, y cero referencias colgantes en familias gobernadas.`,
);
