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

import 'package:flutter/material.dart';

import 'atomic_colores.g.dart';
import 'atomic_dimensiones.g.dart';
import 'atomic_tipografia.g.dart';

/// Tema de la aplicacion construido desde los tokens canonicos.
///
/// Ningun widget construye Color, TextStyle ni EdgeInsets con literales: los
/// toma de aqui. Ley E, apartado 8.6.
class AtomicTema {
  const AtomicTema._();

  /// ThemeData del tema claro, anclado a :root.
  static ThemeData claro() => _construir(
        brillo: Brightness.light,
        fondo: AtomicColoresClaro.surfaceBackground,
        superficie: AtomicColoresClaro.surfaceSection,
        texto: AtomicColoresClaro.textColor,
        primario: AtomicColoresClaro.primaryColor,
      );

  /// ThemeData del tema oscuro.
  static ThemeData oscuro() => _construir(
        brillo: Brightness.dark,
        fondo: AtomicColoresOscuro.surfaceBackground,
        superficie: AtomicColoresOscuro.surfaceSection,
        texto: AtomicColoresOscuro.textColor,
        primario: AtomicColoresOscuro.primaryColor,
      );

  /// ThemeData del tema oscuro de marca.
  static ThemeData marcaOscuro() => _construir(
        brillo: Brightness.dark,
        fondo: AtomicColoresMarcaOscuro.surfaceBackground,
        superficie: AtomicColoresMarcaOscuro.surfaceSection,
        texto: AtomicColoresMarcaOscuro.textColor,
        primario: AtomicColoresMarcaOscuro.primaryColor,
      );

  static ThemeData _construir({
    required Brightness brillo,
    required Color fondo,
    required Color superficie,
    required Color texto,
    required Color primario,
  }) {
    final ColorScheme esquema = ColorScheme.fromSeed(
      seedColor: primario,
      brightness: brillo,
    ).copyWith(surface: superficie, onSurface: texto);

    return ThemeData(
      useMaterial3: true,
      colorScheme: esquema,
      scaffoldBackgroundColor: fondo,
      fontFamily: AtomicFamilias.fontFamilyBase,
      // El objetivo tactil no se escala con el texto: es un piso fisico.
      materialTapTargetSize: MaterialTapTargetSize.padded,
      visualDensity: VisualDensity.standard,
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontSize: AtomicTipografia.text4xl),
        displayMedium: TextStyle(fontSize: AtomicTipografia.text3xl),
        headlineMedium: TextStyle(fontSize: AtomicTipografia.text2xl),
        titleLarge: TextStyle(fontSize: AtomicTipografia.textXl),
        titleMedium: TextStyle(fontSize: AtomicTipografia.textLg),
        bodyLarge: TextStyle(fontSize: AtomicTipografia.textMd),
        bodyMedium: TextStyle(fontSize: AtomicTipografia.textSm),
        labelSmall: TextStyle(fontSize: AtomicTipografia.textXs),
      ),
      cardTheme: CardThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AtomicRadios.radiusMd),
        ),
      ),
    );
  }
}
