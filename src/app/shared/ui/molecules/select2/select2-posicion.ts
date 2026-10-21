export interface RectanguloSelect2 {
  readonly izquierda: number;
  readonly superior: number;
  readonly ancho: number;
  readonly alto: number;
}

export interface MedidasCapaSelect2 {
  readonly disparador: RectanguloSelect2;
  readonly ventana: RectanguloSelect2;
  readonly altoNatural: number;
  readonly margen: number;
  readonly separacion: number;
}

export interface PosicionCapaSelect2 {
  readonly izquierda: number;
  readonly superior: number;
  readonly ancho: number;
  readonly altoMaximo: number;
  readonly lado: 'arriba' | 'abajo';
}

/** Coordenadas de cliente; no se suma el desplazamiento del documento. */
export function calcularPosicionCapaSelect2(medidas: MedidasCapaSelect2): PosicionCapaSelect2 {
  const { disparador, ventana, altoNatural, margen, separacion } = medidas;
  const ancho = Math.max(0, Math.min(disparador.ancho, ventana.ancho - margen * 2));
  const izquierdaMinima = ventana.izquierda + margen;
  const izquierda = Math.max(izquierdaMinima,
    Math.min(disparador.izquierda, ventana.izquierda + ventana.ancho - margen - ancho));
  const superiorMinimo = ventana.superior + margen;
  const inferiorMaximo = ventana.superior + ventana.alto - margen;
  const inicioAbajo = disparador.superior + disparador.alto + separacion;
  const espacioAbajo = Math.max(0, inferiorMaximo - inicioAbajo);
  const espacioArriba = Math.max(0, disparador.superior - separacion - superiorMinimo);
  const lado = altoNatural <= espacioAbajo || espacioAbajo >= espacioArriba ? 'abajo' : 'arriba';
  const altoMaximo = Math.max(0, Math.min(altoNatural,
    lado === 'abajo' ? espacioAbajo : espacioArriba, ventana.alto - margen * 2));
  const superior = Math.max(superiorMinimo, Math.min(
    lado === 'abajo' ? inicioAbajo : disparador.superior - separacion - altoMaximo,
    inferiorMaximo - altoMaximo));
  return { izquierda, superior, ancho, altoMaximo, lado };
}
