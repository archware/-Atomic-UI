import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// El analizador de bloques y la cascada de temas viven ahora en un modulo
// compartido: el emisor de tokens de Dart necesita exactamente el mismo modelo
// y duplicarlo habria creado dos lecturas divergentes de la misma fuente.
// F3-DART-BRIDGE-20260825.
import {
  THEME_FILES,
  flatten,
  resolveToken,
  themeDir,
  tokensForTheme,
  topLevelBlocks,
} from './lib/atomic-tokens.mjs';

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
const sourceRoot = resolve(projectRoot, 'src');


// El switcher alterna light/dark, pero ThemeService mantiene brand-dark como
// selección pública explícita. Los tres temas son alcanzables por contrato.
const REACHABLE_THEMES = ['light', 'dark', 'brand-dark'];

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
  {
    what: 'texto de un boton deshabilitado',
    fg: '--button-disabled-text',
    bg: '--button-disabled-bg',
  },
  {
    what: 'borde de un boton deshabilitado',
    fg: '--button-disabled-border',
    bg: '--button-disabled-bg',
  },

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

/*
 * Los componentes Angular pueden declarar CSS dentro de styles: [`...`].
 * Analizar el TypeScript completo como si fuera una hoja de estilos mezcla
 * selectores presentes en cadenas de lógica con keyframes del decorador y
 * produce falsos positivos. El recorrido mantiene el balance del arreglo fuera
 * de cadenas y devuelve únicamente los literales de plantilla que contienen
 * estilos.
 */
function embeddedStyleSources(source) {
  const found = [];
  const marker = /\bstyles\s*:\s*\[/g;

  for (const match of source.matchAll(marker)) {
    let cursor = (match.index ?? 0) + match[0].length;
    let depth = 1;
    let quote = null;
    let templateStart = -1;
    let escaped = false;

    while (cursor < source.length && depth > 0) {
      const character = source[cursor];

      if (quote !== null) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === quote) {
          if (quote === '`') {
            found.push(source.slice(templateStart, cursor));
          }
          quote = null;
          templateStart = -1;
        }
        cursor += 1;
        continue;
      }

      if (character === "'" || character === '"' || character === '`') {
        quote = character;
        if (character === '`') templateStart = cursor + 1;
      } else if (character === '[') {
        depth += 1;
      } else if (character === ']') {
        depth -= 1;
      }
      cursor += 1;
    }
  }

  return found;
}

function styleSources(file, source) {
  if (/\.(?:scss|css)$/.test(file)) return [source];
  if (file.endsWith('.ts')) return embeddedStyleSources(source);
  return [];
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

const embeddedStyleFixture =
  '@Component({ styles: [`.control[disabled] { opacity: 0.5; }`] })';
const extractedFixtureStyles = embeddedStyleSources(embeddedStyleFixture);
if (
  extractedFixtureStyles.length !== 1 ||
  !extractedFixtureStyles[0].includes('.control[disabled]')
) {
  failures.push(
    '[gate] el extractor de estilos Angular no conserva un selector [disabled] dentro de styles.',
  );
}

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

/*
LA COMPUERTA MIRABA LA LISTA, NO LA INTERFAZ. OTRA VEZ.

Arriba esta escrito que auditar cuatro pares mientras las alertas fallaban daba
una garantia falsa. Se anadieron las alertas a la lista... y `status-badge`
siguio pintando los ocho tonos con el token de RELLENO sobre el fondo claro del
mismo tono, en verde, porque ese par no estaba enumerado. Enumerar casos no
cierra una clase de defecto: hay que buscar el PATRON.

El patron es exactamente este: en la misma regla, fondo `--TONO-color-lighter`
—o `-light`— y texto `--TONO-color`. Eso es pintar el texto con el relleno, que
es lo que el capitulo 8 de la doctrina prohibe, y lo que estaba medido por
debajo de 4,5:1 en los cuatro tonos.

Buscarlo asi encuentra tambien el que nadie ha escrito todavia.
*/
const TONOS = ['success', 'warning', 'danger', 'info'];
for (const [file, source] of allSources) {
  for (const styleSource of styleSources(file, source)) {
    for (const { selector, body } of topLevelBlocks(styleSource)) {
      for (const tono of TONOS) {
        const fondoTonal = new RegExp(
          String.raw`background(?:-color)?\s*:\s*var\(\s*--` + tono + String.raw`-color-light(?:er)?\s*[,)]`,
        ).test(body);
        const textoDeRelleno = new RegExp(
          String.raw`(?:^|[^-\w])color\s*:\s*var\(\s*--` + tono + String.raw`-color\s*[,)]`,
        ).test(body);
        if (fondoTonal && textoDeRelleno) {
          failures.push(
            `${relative(projectRoot, file)}: en \`${selector}\` el fondo es ` +
              `--${tono}-color-light(er) y el texto --${tono}-color, que es el token de RELLENO. ` +
              `Use --${tono}-color-text: pintar el texto con el relleno queda por debajo de 4,5:1.`,
          );
        }
      }
    }
  }
}

/*
EL TOKEN DE RELLENO NO PINTA TEXTO NI ICONOS. EN NINGUN SITIO.

La regla de arriba caza el par «fondo tonal + texto de relleno». Faltaba el caso
mas comun, que no tiene fondo tonal ninguno: `color: var(--danger-color)` sobre
la superficie blanca de la pagina. Asi estaban el mensaje de error de TODOS los
campos, el asterisco de obligatorio, los cuatro tonos del aviso flotante y los
botones de accion de tabla, que son solo icono.

`--TONO-color` es el color de RELLENO: sirve para fondos y bordes. Para texto
esta `--TONO-color-text`, con el contraste ya calculado. Y para iconos tambien:
el liston de WCAG 1.4.11 es 3:1, y success y warning como color de icono sobre
superficie clara dan 2,22 y 2,20.

Se mira `color:` y solo `color:`. `background` y `border-color` con el token de
relleno son justo su uso correcto.
*/
for (const [file, source] of allSources) {
  if (/[\/]themes[\/]/.test(file)) continue;
  for (const styleSource of styleSources(file, source)) {
    for (const match of styleSource.matchAll(
      /(?:^|[^-\w])color:\s*var\(\s*--(success|warning|danger|info)-color\s*\)/g,
    )) {
      failures.push(
        `${relative(projectRoot, file)}: pinta texto o icono con --${match[1]}-color, que es el ` +
          `token de RELLENO. Use --${match[1]}-color-text, que es el que trae el contraste calculado.`,
      );
    }
  }
}

/*
UN ESTADO DESHABILITADO NO SE COMUNICA CON TRANSPARENCIA.

`opacity` atenua texto Y fondo contra la pagina a la vez, asi que anula el
contraste que el token ya traia calculado —medido: 4,09:1 con transparencia,
6,99:1 sin ella— y el icono que acompana al control recibe la atenuacion por
partida doble, con lo que queda mas apagado que su propio texto.

Solo se mira dentro de reglas cuyo selector habla de deshabilitado. Una
transparencia decorativa —una marca de agua, un separador— no comunica estado y
no es asunto de esta compuerta.
*/
const SELECTOR_APAGADO = /(?::disabled|\bdisabled\b|--disabled|--retired|--inactive)/;

for (const selector of ['.control:disabled', '.control.disabled', '.control--disabled']) {
  if (!SELECTOR_APAGADO.test(selector)) {
    failures.push(
      `[gate] el detector de estados deshabilitados no reconoce el selector de control ${selector}.`,
    );
  }
}
for (const [file, source] of allSources) {
  for (const styleSource of styleSources(file, source)) {
    for (const { selector, body } of topLevelBlocks(styleSource)) {
      if (!SELECTOR_APAGADO.test(selector)) continue;
      if (!/(?:^|[^-\w])opacity\s*:/.test(body)) continue;
      failures.push(
        `${relative(projectRoot, file)}: \`${selector}\` apaga con \`opacity\`. ` +
          `Un estado deshabilitado se comunica con los tokens (--input-disabled-text, ` +
          `--input-disabled-bg, --text-color-disabled) y el cursor, que traen el contraste ` +
          `verificado; la transparencia lo deshace.`,
      );
    }
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
