import { formatDateTime } from './format';

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
