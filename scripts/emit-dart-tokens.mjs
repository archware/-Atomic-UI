import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BASE_REM_EN_PIXELES_LOGICOS,
  comoDoubleDart,
  huellaCanonica,
  medidaAPixelesLogicos,
  resolveRaw,
  themeSources,
  tokensForTheme,
} from './lib/atomic-tokens.mjs';

/**
 * Puente de tokens Atomic UI -> Dart.  F3-DART-BRIDGE-20260825.
 *
 * La Ley C resuelve que Atomic UI es la unica fuente visual y que nada nace en
 * un consumidor. Un cliente Flutter no puede consumir componentes Angular, pero
 * si puede consumir la misma fuente canonica: este emisor lee los ficheros de
 * tema y produce el tema Dart, con manifiesto de procedencia y huella SHA-256.
 * La integracion continua reejecuta el emisor con `--check` y compara bytes; si
 * el CSS cambio y el Dart no se regenero, la compuerta rompe la compilacion.
 *
 * Uso:
 *   node scripts/emit-dart-tokens.mjs           genera los ficheros
 *   node scripts/emit-dart-tokens.mjs --check   verifica sin escribir
 */

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const salidaRaiz = resolve(projectRoot, 'dart/atomic_tokens');
const salidaSrc = join(salidaRaiz, 'lib/src');

const MODO_VERIFICACION = process.argv.includes('--check');

/** Temas alcanzables por contrato publico del `ThemeService`. */
const TEMAS = [
  { css: 'light', dart: 'claro', descripcion: 'tema claro, anclado a :root' },
  { css: 'dark', dart: 'oscuro', descripcion: 'tema oscuro' },
  { css: 'brand-dark', dart: 'marcaOscuro', descripcion: 'tema oscuro de marca' },
];

/**
 * Piso fisico del objetivo tactil. `kMinInteractiveDimension` de Flutter vale
 * 48.0 y Material Design exige 48dp. El emisor NO corrige el token: falla. Si
 * la fuente canonica bajara de 48, el defecto esta alli y alli se arregla.
 * Vease F3-ATOMIC-ADR-20260825.
 */
const PISO_OBJETIVO_TACTIL = 48.0;

const errores = [];

// ---------------------------------------------------------------------------
// Conversion de valores
// ---------------------------------------------------------------------------

function aCanal(texto) {
  const numero = Number(texto);
  if (Number.isNaN(numero)) return null;
  if (texto.includes('%')) return Math.round((numero / 100) * 255);
  return Math.round(numero);
}

/** Convierte un color CSS a literal `Color(0xAARRGGBB)` de Dart, o null. */
function aColorDart(bruto) {
  if (!bruto) return null;
  const texto = bruto.trim();

  const hex = /^#([0-9a-f]{3,8})$/i.exec(texto);
  if (hex) {
    let d = hex[1];
    if (d.length === 3) d = d.split('').map((c) => c + c).join('');
    if (d.length === 6) return `0xFF${d.toUpperCase()}`;
    if (d.length === 8) {
      // CSS es #RRGGBBAA; Dart es 0xAARRGGBB.
      return `0x${d.slice(6, 8).toUpperCase()}${d.slice(0, 6).toUpperCase()}`;
    }
    return null;
  }

  const rgba = /^rgba?\(([^)]+)\)$/i.exec(texto);
  if (rgba) {
    const partes = rgba[1].split(/[,/]/).map((p) => p.trim()).filter((p) => p !== '');
    if (partes.length < 3) return null;
    const canales = partes.slice(0, 3).map(aCanal);
    if (canales.some((c) => c === null || c < 0 || c > 255)) return null;
    const alfa = partes.length > 3 ? Number(partes[3]) : 1;
    if (Number.isNaN(alfa)) return null;
    const a = Math.round(Math.max(0, Math.min(1, alfa)) * 255);
    const hexado = [a, ...canales].map((v) => v.toString(16).padStart(2, '0')).join('');
    return `0x${hexado.toUpperCase()}`;
  }

  return null;
}

/** `--surface-background` -> `surfaceBackground`. */
function aNombreDart(token) {
  const limpio = token.replace(/^--/, '');
  const camel = limpio.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return /^[0-9]/.test(camel) ? `t${camel}` : camel;
}

// ---------------------------------------------------------------------------
// Clasificacion de tokens
// ---------------------------------------------------------------------------

const ES_TIPOGRAFIA_TAMANO = /^--text-(2xs|xs|sm|md|lg|xl|2xl|3xl|4xl)$/;
const ES_PESO = /^--font-weight-/;
const ES_FAMILIA = /^--font-family/;
const ES_ALTURA_LINEA = /^--line-height-/;
const ES_INTERLETRA = /^--letter-spacing-/;
const ES_ESPACIO = /^--space-\d+$/;
const ES_RADIO = /^--radius-/;
const ES_ANCHO_BORDE = /^--border-width-/;
const ES_PUNTO_CORTE = /^--breakpoint-/;

function clasificar(token) {
  if (ES_TIPOGRAFIA_TAMANO.test(token)) return 'tamanoTexto';
  if (ES_PESO.test(token)) return 'peso';
  if (ES_FAMILIA.test(token)) return 'familia';
  if (ES_ALTURA_LINEA.test(token)) return 'alturaLinea';
  if (ES_INTERLETRA.test(token)) return 'interletra';
  if (ES_ESPACIO.test(token)) return 'espacio';
  if (ES_RADIO.test(token)) return 'radio';
  if (ES_ANCHO_BORDE.test(token)) return 'anchoBorde';
  if (ES_PUNTO_CORTE.test(token)) return 'puntoCorte';
  if (token === '--touch-target-min') return 'objetivoTactil';
  return null;
}

// ---------------------------------------------------------------------------
// Recoleccion
// ---------------------------------------------------------------------------

const fuentes = themeSources();
const valoresPorTema = new Map(TEMAS.map((t) => [t.css, tokensForTheme(t.css)]));

// Los colores se recogen por tema. Un token es color si resuelve a color en el
// tema claro; los demas temas lo redeclaran o lo heredan.
const valoresClaro = valoresPorTema.get('light');

const colores = new Map(); // nombreDart -> Map(temaDart -> literal)
const medidas = new Map(); // categoria -> Map(nombreDart -> {token, valor})
const textos = new Map(); // nombreDart -> valor literal (familias)

for (const [token] of valoresClaro) {
  const categoria = clasificar(token);

  if (categoria === 'familia') {
    const bruto = resolveRaw(valoresClaro, token);
    if (bruto) textos.set(aNombreDart(token), bruto.replace(/'/g, "\\'"));
    continue;
  }

  if (categoria) {
    const bruto = resolveRaw(valoresClaro, token);
    if (categoria === 'peso' || categoria === 'alturaLinea') {
      const numero = Number(bruto);
      if (!Number.isNaN(numero)) {
        if (!medidas.has(categoria)) medidas.set(categoria, new Map());
        medidas.get(categoria).set(aNombreDart(token), { token, valor: numero });
      }
      continue;
    }
    const pixeles = medidaAPixelesLogicos(bruto);
    if (pixeles !== null) {
      if (!medidas.has(categoria)) medidas.set(categoria, new Map());
      medidas.get(categoria).set(aNombreDart(token), { token, valor: pixeles });
    }
    continue;
  }

  // Color: debe resolver en el tema claro para entrar al contrato.
  const literalClaro = aColorDart(resolveRaw(valoresClaro, token));
  if (!literalClaro) continue;

  const porTema = new Map();
  for (const tema of TEMAS) {
    const literal = aColorDart(resolveRaw(valoresPorTema.get(tema.css), token));
    porTema.set(tema.dart, literal ?? literalClaro);
  }
  colores.set(aNombreDart(token), porTema);
}

// Compuerta del emisor: el objetivo tactil no puede quedar por debajo del piso.
const objetivo = medidas.get('objetivoTactil')?.get('touchTargetMin');
if (!objetivo) {
  errores.push('--touch-target-min no existe o no resuelve a una medida.');
} else if (objetivo.valor < PISO_OBJETIVO_TACTIL) {
  errores.push(
    `--touch-target-min vale ${objetivo.valor} pixeles logicos, por debajo del piso ` +
      `${PISO_OBJETIVO_TACTIL} que exige kMinInteractiveDimension y la Ley E, apartado 8.6. ` +
      'Corrijase en la fuente canonica, no en el emisor.',
  );
}

if (errores.length > 0) {
  for (const error of errores) console.error(`[EMISOR_TOKENS] ${error}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Emision
// ---------------------------------------------------------------------------

const CABECERA = `// GENERADO POR scripts/emit-dart-tokens.mjs. NO EDITAR A MANO.
//
// Fuente canonica: src/styles/themes de -Atomic-UI.
// Cambio: F3-DART-BRIDGE-20260825 (ECO-20260825-001).
//
// Este es el UNICO archivo del ecosistema movil donde puede existir un literal
// de color o de geometria. La Ley E, apartado 8.6, lo prohibe en cualquier otro
// lugar, y la compuerta R5/R6 de verificar-movil.ps1 lo detecta.
//
// Para cambiar un valor se modifica el CSS canonico y se regenera. Editar este
// archivo a mano rompe la compuerta de procedencia en la siguiente ejecucion.
`;

function bloqueColores() {
  const lineas = [];
  for (const tema of TEMAS) {
    lineas.push(`/// Paleta del ${tema.descripcion}.`);
    lineas.push(`class AtomicColores${tema.dart[0].toUpperCase()}${tema.dart.slice(1)} {`);
    lineas.push(`  const AtomicColores${tema.dart[0].toUpperCase()}${tema.dart.slice(1)}._();`);
    lineas.push('');
    for (const [nombre, porTema] of [...colores].sort(([a], [b]) => a.localeCompare(b))) {
      lineas.push(`  static const Color ${nombre} = Color(${porTema.get(tema.dart)});`);
    }
    lineas.push('}');
    lineas.push('');
  }
  return lineas.join('\n');
}

function bloqueMedidas(categoria, titulo, clase, docExtra = '') {
  const entradas = medidas.get(categoria);
  if (!entradas || entradas.size === 0) return '';
  const lineas = [`/// ${titulo}`];
  if (docExtra) lineas.push(`///`, ...docExtra.split('\n').map((l) => `/// ${l}`));
  lineas.push(`class ${clase} {`, `  const ${clase}._();`, '');
  for (const [nombre, { token, valor }] of [...entradas].sort(([a], [b]) => a.localeCompare(b))) {
    lineas.push(`  /// \`${token}\``);
    lineas.push(`  static const double ${nombre} = ${comoDoubleDart(valor)};`);
  }
  lineas.push('}', '');
  return lineas.join('\n');
}

const archivoColores = `${CABECERA}
import 'dart:ui' show Color;

${bloqueColores()}`;

const archivoDimensiones = `${CABECERA}
/// Medidas del sistema de diseno, en pixeles logicos de Flutter.
///
/// Base de conversion declarada del puente: 1rem = ${BASE_REM_EN_PIXELES_LOGICOS} pixeles logicos.
${bloqueMedidas('espacio', 'Escala de espaciado.', 'AtomicEspacios')}
${bloqueMedidas('radio', 'Radios de borde.', 'AtomicRadios')}
${bloqueMedidas('anchoBorde', 'Anchos de borde.', 'AtomicBordes')}
${bloqueMedidas(
  'objetivoTactil',
  'Objetivo tactil minimo.',
  'AtomicObjetivoTactil',
  'PISO FISICO. No se escala con la preferencia de tamano de texto y jamas\nqueda por debajo de kMinInteractiveDimension (48.0). Puede crecer con el\ncontenido; nunca encoger. Ley E, apartado 8.6.',
)}
${bloqueMedidas(
  'puntoCorte',
  'Puntos de corte adaptativos.',
  'AtomicPuntosDeCorte',
  'Se resuelven EXCLUSIVAMENTE con MediaQuery.sizeOf(context). Escalarlos con\ntextScaler es un incumplimiento del apartado 8.6 y divergiria del\ncomportamiento de la fuente canonica, donde un breakpoint no depende del\ntamano de letra.',
)}`;

function bloqueTipografia() {
  const tamanos = medidas.get('tamanoTexto');
  const lineas = [
    '/// Escala tipografica, en pixeles logicos y SIN escalar.',
    '///',
    '/// Los widgets Text y RichText aplican por si solos MediaQuery.textScalerOf',
    '/// sobre TextStyle.fontSize. Aplicar aqui un TextScaler produciria un doble',
    '/// escalado: con escala 2.0 el texto saldria a 4x. La Ley E, apartado 8.6, lo',
    '/// prohibe de forma expresa y la compuerta R7 lo detecta.',
    'class AtomicTipografia {',
    '  const AtomicTipografia._();',
    '',
  ];
  for (const [nombre, { token, valor }] of [...tamanos].sort(([a], [b]) => a.localeCompare(b))) {
    lineas.push(`  /// \`${token}\``);
    lineas.push(`  static const double ${nombre} = ${comoDoubleDart(valor)};`);
  }
  lineas.push('}', '');

  const pesos = medidas.get('peso');
  if (pesos && pesos.size > 0) {
    lineas.push('/// Pesos tipograficos declarados por la fuente canonica.');
    lineas.push('class AtomicPesos {', '  const AtomicPesos._();', '');
    for (const [nombre, { token, valor }] of [...pesos].sort(([a], [b]) => a.localeCompare(b))) {
      lineas.push(`  /// \`${token}\``);
      lineas.push(`  static const int ${nombre} = ${Math.round(valor)};`);
    }
    lineas.push('}', '');
  }

  const alturas = medidas.get('alturaLinea');
  if (alturas && alturas.size > 0) {
    lineas.push('/// Alturas de linea, como multiplicador sin unidad.');
    lineas.push('class AtomicAlturasDeLinea {', '  const AtomicAlturasDeLinea._();', '');
    for (const [nombre, { token, valor }] of [...alturas].sort(([a], [b]) => a.localeCompare(b))) {
      lineas.push(`  /// \`${token}\``);
      lineas.push(`  static const double ${nombre} = ${comoDoubleDart(valor)};`);
    }
    lineas.push('}', '');
  }

  const interletras = medidas.get('interletra');
  if (interletras && interletras.size > 0) {
    lineas.push('/// Espaciado entre letras, en pixeles logicos.');
    lineas.push('class AtomicInterletras {', '  const AtomicInterletras._();', '');
    for (const [nombre, { token, valor }] of [...interletras].sort(([a], [b]) => a.localeCompare(b))) {
      lineas.push(`  /// \`${token}\``);
      lineas.push(`  static const double ${nombre} = ${comoDoubleDart(valor)};`);
    }
    lineas.push('}', '');
  }

  if (textos.size > 0) {
    lineas.push('/// Familias tipograficas declaradas por la fuente canonica.');
    lineas.push('class AtomicFamilias {', '  const AtomicFamilias._();', '');
    for (const [nombre, valor] of [...textos].sort(([a], [b]) => a.localeCompare(b))) {
      lineas.push(`  static const String ${nombre} = '${valor}';`);
    }
    lineas.push('}', '');
  }

  return lineas.join('\n');
}

const archivoTipografia = `${CABECERA}
${bloqueTipografia()}`;

const archivoEscala = `${CABECERA}
import 'package:flutter/widgets.dart';

/// Conversion de medidas dependientes del texto.
///
/// No existe un escalar generico aplicable a una dimension: desde el escalado
/// no lineal del sistema, la conversion debe pasar por TextScaler.scale. Esta
/// clase implementa la formula proporcional documentada por Flutter y es el
/// UNICO camino autorizado para que un espaciado acompane al texto.
class AtomicEscala {
  const AtomicEscala._();

  /// Referencia declarada del puente, en pixeles logicos.
  static const double referencia = ${comoDoubleDart(BASE_REM_EN_PIXELES_LOGICOS)};

  /// Escala un espaciado que debe acompanar al texto.
  ///
  /// NO usar sobre un valor destinado a TextStyle.fontSize: el framework ya lo
  /// escala y el resultado seria un doble escalado.
  static double espacio(BuildContext context, double valorBase) {
    final TextScaler escalador = MediaQuery.textScalerOf(context);
    return valorBase * escalador.scale(referencia) / referencia;
  }

  /// Objetivo tactil efectivo: puede crecer con el contenido, nunca encoger.
  static double objetivoTactil(BuildContext context, {double? deseado}) {
    const double piso = ${comoDoubleDart(PISO_OBJETIVO_TACTIL)};
    if (deseado == null) return piso;
    return deseado > piso ? deseado : piso;
  }
}
`;

function bloqueTema() {
  const lineas = [
    "import 'package:flutter/material.dart';",
    '',
    "import 'atomic_colores.g.dart';",
    "import 'atomic_dimensiones.g.dart';",
    "import 'atomic_tipografia.g.dart';",
    '',
    '/// Tema de la aplicacion construido desde los tokens canonicos.',
    '///',
    '/// Ningun widget construye Color, TextStyle ni EdgeInsets con literales: los',
    '/// toma de aqui. Ley E, apartado 8.6.',
    'class AtomicTema {',
    '  const AtomicTema._();',
    '',
  ];
  for (const tema of TEMAS) {
    const clase = `AtomicColores${tema.dart[0].toUpperCase()}${tema.dart.slice(1)}`;
    lineas.push(`  /// ThemeData del ${tema.descripcion}.`);
    lineas.push(`  static ThemeData ${tema.dart}() => _construir(`);
    lineas.push(`        brillo: ${tema.css === 'light' ? 'Brightness.light' : 'Brightness.dark'},`);
    lineas.push(`        fondo: ${clase}.surfaceBackground,`);
    lineas.push(`        superficie: ${clase}.surfaceSection,`);
    lineas.push(`        texto: ${clase}.textColor,`);
    lineas.push(`        primario: ${clase}.primaryColor,`);
    lineas.push('      );');
    lineas.push('');
  }
  lineas.push(
    '  static ThemeData _construir({',
    '    required Brightness brillo,',
    '    required Color fondo,',
    '    required Color superficie,',
    '    required Color texto,',
    '    required Color primario,',
    '  }) {',
    '    final ColorScheme esquema = ColorScheme.fromSeed(',
    '      seedColor: primario,',
    '      brightness: brillo,',
    '    ).copyWith(surface: superficie, onSurface: texto);',
    '',
    '    return ThemeData(',
    '      useMaterial3: true,',
    '      colorScheme: esquema,',
    '      scaffoldBackgroundColor: fondo,',
    '      fontFamily: AtomicFamilias.fontFamilyBase,',
    '      // El objetivo tactil no se escala con el texto: es un piso fisico.',
    '      materialTapTargetSize: MaterialTapTargetSize.padded,',
    '      visualDensity: VisualDensity.standard,',
    '      textTheme: const TextTheme(',
    '        displayLarge: TextStyle(fontSize: AtomicTipografia.text4xl),',
    '        displayMedium: TextStyle(fontSize: AtomicTipografia.text3xl),',
    '        headlineMedium: TextStyle(fontSize: AtomicTipografia.text2xl),',
    '        titleLarge: TextStyle(fontSize: AtomicTipografia.textXl),',
    '        titleMedium: TextStyle(fontSize: AtomicTipografia.textLg),',
    '        bodyLarge: TextStyle(fontSize: AtomicTipografia.textMd),',
    '        bodyMedium: TextStyle(fontSize: AtomicTipografia.textSm),',
    '        labelSmall: TextStyle(fontSize: AtomicTipografia.textXs),',
    '      ),',
    '      cardTheme: CardThemeData(',
    '        shape: RoundedRectangleBorder(',
    '          borderRadius: BorderRadius.circular(AtomicRadios.radiusMd),',
    '        ),',
    '      ),',
    '    );',
    '  }',
    '}',
    '',
  );
  return lineas.join('\n');
}

const archivoTema = `${CABECERA}
${bloqueTema()}`;

const archivoBarril = `${CABECERA}
library atomic_tokens;

export 'src/atomic_colores.g.dart';
export 'src/atomic_dimensiones.g.dart';
export 'src/atomic_escala.g.dart';
export 'src/atomic_tema.g.dart';
export 'src/atomic_tipografia.g.dart';
`;

const archivoPubspec = `name: atomic_tokens
description: >-
  Tokens de Atomic UI emitidos hacia Dart. Generado por
  scripts/emit-dart-tokens.mjs. No se edita a mano.
version: 1.0.0
publish_to: none

environment:
  sdk: ">=3.10.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

flutter: {}
`;

const emitidos = [
  ['lib/src/atomic_colores.g.dart', archivoColores],
  ['lib/src/atomic_dimensiones.g.dart', archivoDimensiones],
  ['lib/src/atomic_tipografia.g.dart', archivoTipografia],
  ['lib/src/atomic_escala.g.dart', archivoEscala],
  ['lib/src/atomic_tema.g.dart', archivoTema],
  ['lib/atomic_tokens.dart', archivoBarril],
  ['pubspec.yaml', archivoPubspec],
];

// Misma canonizacion que las fuentes: la procedencia mide diseno, no finales
// de linea. Vease git-clean-eol-v1.
const huella = huellaCanonica;

const procedencia = {
  contrato: 'atomic.dart-tokens.v1',
  canonizacionDeContenido: 'git-clean-eol-v1',
  changeId: 'F3-DART-BRIDGE-20260825',
  identificadorTransversal: 'ECO-20260825-001',
  emisor: 'scripts/emit-dart-tokens.mjs',
  baseRemEnPixelesLogicos: BASE_REM_EN_PIXELES_LOGICOS,
  pisoObjetivoTactil: PISO_OBJETIVO_TACTIL,
  temas: TEMAS.map((t) => ({ css: t.css, dart: t.dart })),
  recuento: {
    colores: colores.size,
    espacios: medidas.get('espacio')?.size ?? 0,
    radios: medidas.get('radio')?.size ?? 0,
    tamanosDeTexto: medidas.get('tamanoTexto')?.size ?? 0,
    puntosDeCorte: medidas.get('puntoCorte')?.size ?? 0,
  },
  fuente: fuentes.map(({ file, sha256 }) => ({
    archivo: `src/styles/themes/${file}`,
    sha256,
  })),
  emitido: emitidos.map(([ruta, contenido]) => ({ archivo: ruta, sha256: huella(contenido) })),
};

const archivoProcedencia = `${JSON.stringify(procedencia, null, 2)}\n`;
const todos = [...emitidos, ['PROCEDENCIA.json', archivoProcedencia]];

if (MODO_VERIFICACION) {
  const divergentes = [];
  for (const [ruta, contenido] of todos) {
    const destino = join(salidaRaiz, ruta);
    if (!existsSync(destino)) {
      divergentes.push(`${ruta}: no existe; el puente nunca se genero.`);
      continue;
    }
    const enDisco = readFileSync(destino, 'utf8');
    if (huella(enDisco) !== huella(contenido)) {
      divergentes.push(
        `${ruta}: diverge de la regeneracion (disco ${huella(enDisco).slice(0, 12)}, ` +
          `esperado ${huella(contenido).slice(0, 12)}).`,
      );
    }
  }
  if (divergentes.length > 0) {
    console.error('');
    console.error('[PUENTE_TOKENS_DIVERGENTE] El Dart generado no corresponde al CSS canonico:');
    for (const linea of divergentes) console.error(`  - ${linea}`);
    console.error('');
    console.error('  Regenerelo con: node scripts/emit-dart-tokens.mjs');
    process.exit(1);
  }
  console.log(
    `[PUENTE_TOKENS_OK] ${todos.length} archivos coinciden con la regeneracion desde ` +
      `${fuentes.length} ficheros de tema.`,
  );
  process.exit(0);
}

for (const [ruta, contenido] of todos) {
  const destino = join(salidaRaiz, ruta);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, contenido, 'utf8');
}

console.log('');
console.log('[PUENTE_TOKENS] emitido hacia dart/atomic_tokens');
console.log(`  temas          : ${TEMAS.map((t) => t.dart).join(', ')}`);
console.log(`  colores        : ${colores.size} por tema`);
console.log(`  espacios       : ${procedencia.recuento.espacios}`);
console.log(`  radios         : ${procedencia.recuento.radios}`);
console.log(`  tamanos texto  : ${procedencia.recuento.tamanosDeTexto}`);
console.log(`  objetivo tactil: ${comoDoubleDart(objetivo.valor)} px logicos (piso ${PISO_OBJETIVO_TACTIL})`);
console.log(`  archivos       : ${todos.length}`);
console.log('');
