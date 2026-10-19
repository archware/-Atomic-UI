import {
  FIELD_LABEL_VARIANTS,
  FIELD_LABEL_VARIANT_DEFAULT,
  esEtiquetaElevada,
  esEtiquetaFlotante,
  esMarcadorVisible,
} from './field-label';

describe('contrato de etiqueta de campo', () => {
  it('declara las tres variantes y standard como valor por defecto comun', () => {
    expect([...FIELD_LABEL_VARIANTS]).toEqual(['standard', 'floating', 'floating-value']);
    expect(FIELD_LABEL_VARIANT_DEFAULT).toBe('standard');
  });

  it('solo flota con etiqueta y una variante flotante', () => {
    expect(esEtiquetaFlotante('standard', true)).toBe(false);
    expect(esEtiquetaFlotante('floating', true)).toBe(true);
    expect(esEtiquetaFlotante('floating-value', true)).toBe(true);
    expect(esEtiquetaFlotante('floating', false)).toBe(false);
  });

  it('el momento de subida depende de la variante', () => {
    // floating: enfoque o valor
    expect(esEtiquetaElevada('floating', true, false, false)).toBe(false);
    expect(esEtiquetaElevada('floating', true, true, false)).toBe(true);
    expect(esEtiquetaElevada('floating', true, false, true)).toBe(true);
    // floating-value: solo valor
    expect(esEtiquetaElevada('floating-value', true, true, false)).toBe(false);
    expect(esEtiquetaElevada('floating-value', true, false, true)).toBe(true);
    // standard nunca eleva: la etiqueta ya esta arriba
    expect(esEtiquetaElevada('standard', true, true, true)).toBe(false);
  });

  it('el marcador se oculta exactamente mientras la etiqueta reposa dentro del control', () => {
    expect(esMarcadorVisible('standard', true, false)).toBe(true);
    expect(esMarcadorVisible('floating', true, false)).toBe(false);
    expect(esMarcadorVisible('floating', true, true)).toBe(true);
    expect(esMarcadorVisible('floating-value', true, false)).toBe(false);
    // Sin etiqueta no hay nada que superponer: el marcador se conserva.
    expect(esMarcadorVisible('floating', false, false)).toBe(true);
  });
});
