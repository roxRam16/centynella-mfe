import { formatCurrency, formatDateTime } from './format';

describe('formatCurrency', () => {
  it('formatea un precio en pesos con dos decimales', () => {
    expect(formatCurrency(18.5)).toMatch(/18\.50/);
    expect(formatCurrency(0)).toMatch(/0\.00/);
  });
});

describe('formatDateTime', () => {
  it('muestra "Nunca" cuando no hay fecha', () => {
    expect(formatDateTime(null)).toBe('Nunca');
    expect(formatDateTime(undefined)).toBe('Nunca');
  });

  it('formatea una fecha ISO en español', () => {
    expect(formatDateTime('2026-09-20T18:45:00Z')).toMatch(/2026/);
  });

  it('no rompe con una fecha inválida', () => {
    expect(formatDateTime('no-es-fecha')).toBe('—');
  });
});
