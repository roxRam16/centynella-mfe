import { contrastRatio, hexToRgb, relativeLuminance } from './color';

describe('color utils', () => {
  it('convierte hex a rgb', () => {
    expect(hexToRgb('#ff8000')).toEqual([255, 128, 0]);
    expect(hexToRgb('000000')).toEqual([0, 0, 0]);
  });

  it('rechaza hex inválidos', () => {
    expect(() => hexToRgb('#fff')).toThrow(/inválido/);
  });

  it('calcula la luminancia de negro y blanco', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });

  it('calcula el contraste máximo (21:1) entre negro y blanco, sin importar el orden', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('devuelve 1 para el mismo color', () => {
    expect(contrastRatio('#1d4ed8', '#1d4ed8')).toBeCloseTo(1, 5);
  });
});
