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

/// Medidas del sistema de diseno, en pixeles logicos de Flutter.
///
/// Base de conversion declarada del puente: 1rem = 16 pixeles logicos.
/// Escala de espaciado.
class AtomicEspacios {
  const AtomicEspacios._();

  /// `--space-1`
  static const double space1 = 4.0;
  /// `--space-10`
  static const double space10 = 64.0;
  /// `--space-11`
  static const double space11 = 44.0;
  /// `--space-2`
  static const double space2 = 8.0;
  /// `--space-3`
  static const double space3 = 12.0;
  /// `--space-4`
  static const double space4 = 16.0;
  /// `--space-5`
  static const double space5 = 24.0;
  /// `--space-6`
  static const double space6 = 32.0;
  /// `--space-7`
  static const double space7 = 40.0;
  /// `--space-8`
  static const double space8 = 48.0;
  /// `--space-9`
  static const double space9 = 56.0;
}

/// Radios de borde.
class AtomicRadios {
  const AtomicRadios._();

  /// `--radius-full`
  static const double radiusFull = 9999.0;
  /// `--radius-lg`
  static const double radiusLg = 12.0;
  /// `--radius-md`
  static const double radiusMd = 8.0;
  /// `--radius-sm`
  static const double radiusSm = 4.0;
  /// `--radius-xl`
  static const double radiusXl = 16.0;
}

/// Anchos de borde.
class AtomicBordes {
  const AtomicBordes._();

  /// `--border-width-medium`
  static const double borderWidthMedium = 2.0;
  /// `--border-width-thick`
  static const double borderWidthThick = 3.0;
  /// `--border-width-thin`
  static const double borderWidthThin = 1.0;
}

/// Objetivo tactil minimo.
///
/// PISO FISICO. No se escala con la preferencia de tamano de texto y jamas
/// queda por debajo de kMinInteractiveDimension (48.0). Puede crecer con el
/// contenido; nunca encoger. Ley E, apartado 8.6.
class AtomicObjetivoTactil {
  const AtomicObjetivoTactil._();

  /// `--touch-target-min`
  static const double touchTargetMin = 48.0;
}

