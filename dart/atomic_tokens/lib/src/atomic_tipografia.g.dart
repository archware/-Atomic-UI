// GENERADO POR scripts/emit-dart-tokens.mjs. NO EDITAR A MANO.
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

/// Escala tipografica, en pixeles logicos y SIN escalar.
///
/// Los widgets Text y RichText aplican por si solos MediaQuery.textScalerOf
/// sobre TextStyle.fontSize. Aplicar aqui un TextScaler produciria un doble
/// escalado: con escala 2.0 el texto saldria a 4x. La Ley E, apartado 8.6, lo
/// prohibe de forma expresa y la compuerta R7 lo detecta.
class AtomicTipografia {
  const AtomicTipografia._();

  /// `--text-2xl`
  static const double text2xl = 24.0;
  /// `--text-2xs`
  static const double text2xs = 11.0;
  /// `--text-3xl`
  static const double text3xl = 32.0;
  /// `--text-4xl`
  static const double text4xl = 40.0;
  /// `--text-lg`
  static const double textLg = 18.0;
  /// `--text-md`
  static const double textMd = 16.0;
  /// `--text-sm`
  static const double textSm = 14.0;
  /// `--text-xl`
  static const double textXl = 20.0;
  /// `--text-xs`
  static const double textXs = 12.0;
}

/// Pesos tipograficos declarados por la fuente canonica.
class AtomicPesos {
  const AtomicPesos._();

  /// `--font-weight-body`
  static const int fontWeightBody = 400;
  /// `--font-weight-display`
  static const int fontWeightDisplay = 800;
  /// `--font-weight-emphasis`
  static const int fontWeightEmphasis = 600;
  /// `--font-weight-title`
  static const int fontWeightTitle = 700;
}

/// Familias tipograficas declaradas por la fuente canonica.
class AtomicFamilias {
  const AtomicFamilias._();

  static const String fontFamilyBase = '\'Open Sans\', system-ui, -apple-system, sans-serif';
}
