import { calcularPosicionCapaSelect2, MedidasCapaSelect2 } from './select2-posicion';

describe('calcularPosicionCapaSelect2', () => {
  const medidas: MedidasCapaSelect2 = {
    disparador: { izquierda: 100, superior: 100, ancho: 240, alto: 40 },
    ventana: { izquierda: 0, superior: 0, ancho: 800, alto: 600 },
    altoNatural: 200, margen: 8, separacion: 4,
  };

  it('abre abajo cuando cabe y conserva el ancho del disparador', () => {
    expect(calcularPosicionCapaSelect2(medidas)).toEqual({
      izquierda: 100, superior: 144, ancho: 240, altoMaximo: 200, lado: 'abajo',
    });
  });

  it('abre arriba cerca del borde inferior', () => {
    expect(calcularPosicionCapaSelect2({ ...medidas,
      disparador: { ...medidas.disparador, superior: 540 },
    })).toEqual({ izquierda: 100, superior: 336, ancho: 240, altoMaximo: 200, lado: 'arriba' });
  });

  it('limita una lista larga al lado con mayor espacio', () => {
    const posicion = calcularPosicionCapaSelect2({ ...medidas, altoNatural: 1000 });
    expect(posicion.altoMaximo).toBe(448);
    expect(posicion.superior + posicion.altoMaximo).toBe(592);
  });

  it('resuelve un empate hacia abajo', () => {
    const posicion = calcularPosicionCapaSelect2({ ...medidas, altoNatural: 1000,
      disparador: { ...medidas.disparador, superior: 280 },
    });
    expect(posicion.lado).toBe('abajo');
    expect(posicion.altoMaximo).toBe(268);
  });

  it('limita el ancho y corrige ambos bordes horizontales', () => {
    for (const izquierda of [-100, 500]) {
      const posicion = calcularPosicionCapaSelect2({ ...medidas,
        ventana: { ...medidas.ventana, ancho: 320 },
        disparador: { ...medidas.disparador, izquierda, ancho: 500 },
      });
      expect(posicion.izquierda).toBe(8);
      expect(posicion.ancho).toBe(304);
    }
  });

  it('respeta offsets del viewport visual sin sumar scroll del documento', () => {
    const posicion = calcularPosicionCapaSelect2({ ...medidas,
      ventana: { izquierda: 30, superior: 50, ancho: 320, alto: 300 },
      disparador: { izquierda: 0, superior: 300, ancho: 240, alto: 40 },
    });
    expect(posicion).toEqual({ izquierda: 38, superior: 96, ancho: 240, altoMaximo: 200, lado: 'arriba' });
  });

  it('no devuelve dimensiones negativas en un viewport sin espacio', () => {
    const posicion = calcularPosicionCapaSelect2({ ...medidas,
      ventana: { izquierda: 0, superior: 0, ancho: 10, alto: 10 },
    });
    expect(posicion.ancho).toBe(0);
    expect(posicion.altoMaximo).toBe(0);
  });
});
