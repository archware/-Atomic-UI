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
  static const double referencia = 16.0;

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
    const double piso = 48.0;
    if (deseado == null) return piso;
    return deseado > piso ? deseado : piso;
  }
}
