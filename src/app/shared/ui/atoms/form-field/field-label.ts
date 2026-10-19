/**
 * Contrato unico del modo de etiqueta de los controles de formulario.
 *
 * Todos los controles con `label` exponen el mismo `variant`:
 *
 * - `standard`       Etiqueta superior fija, siempre sobre el control.
 * - `floating`       Etiqueta dentro del control que SUBE al enfocar o cuando hay valor
 *                    (comportamiento Material).
 * - `floating-value` Etiqueta dentro del control que SUBE solo cuando hay valor; al enfocar
 *                    un campo vacio permanece dentro.
 *
 * Con una etiqueta flotante el marcador (`placeholder`) permanece oculto mientras la etiqueta
 * este abajo y se muestra cuando la etiqueta ya subio; asi nunca se superponen.
 *
 * Los identificadores son ASCII porque son contrato (valores de enumeracion).
 */
export type FieldLabelVariant = 'standard' | 'floating' | 'floating-value';

/** Valor por defecto comun a todos los controles. Etiqueta superior: es el modo canonico de los formularios. */
export const FIELD_LABEL_VARIANT_DEFAULT: FieldLabelVariant = 'standard';

/** Enumeracion cerrada del contrato; la compuerta de catalogo la contrasta con cada componente. */
export const FIELD_LABEL_VARIANTS: readonly FieldLabelVariant[] = [
  'standard',
  'floating',
  'floating-value',
];

/** `true` si la variante coloca la etiqueta DENTRO del control. Sin etiqueta no hay nada que flotar. */
export function esEtiquetaFlotante(variant: string, tieneEtiqueta: boolean): boolean {
  return tieneEtiqueta && (variant === 'floating' || variant === 'floating-value');
}

/**
 * `true` si la etiqueta flotante ya subio al borde del control.
 *
 * - `floating`:       enfoque o valor.
 * - `floating-value`: solo valor.
 */
export function esEtiquetaElevada(
  variant: string,
  tieneEtiqueta: boolean,
  enfocado: boolean,
  conValor: boolean,
): boolean {
  if (!esEtiquetaFlotante(variant, tieneEtiqueta)) return false;
  return variant === 'floating' ? enfocado || conValor : conValor;
}

/** El marcador solo se ve si la etiqueta no esta en su lugar de reposo dentro del control. */
export function esMarcadorVisible(
  variant: string,
  tieneEtiqueta: boolean,
  elevada: boolean,
): boolean {
  return !esEtiquetaFlotante(variant, tieneEtiqueta) || elevada;
}
