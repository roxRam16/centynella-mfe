import { visuallyHidden } from './a11y';

describe('visuallyHidden', () => {
  it('mide 1 px reales (en sx de MUI el número 1 significaría 100 %)', () => {
    expect(visuallyHidden.width).toBe('1px');
    expect(visuallyHidden.height).toBe('1px');
  });

  it('se recorta y no ocupa espacio en el flujo', () => {
    expect(visuallyHidden.position).toBe('absolute');
    expect(visuallyHidden.overflow).toBe('hidden');
    expect(visuallyHidden.clipPath).toBe('inset(50%)');
  });
});
