import { theme } from './theme';
import { fontFamily, fontFamilyDisplay } from './tokens';

const rem = (value: unknown) => parseFloat(String(value));

describe('tema: tipografía', () => {
  it('combina Raleway (títulos y botones) con Poppins (texto)', () => {
    expect(fontFamilyDisplay).toMatch(/^"Raleway"/);
    expect(fontFamily).toMatch(/^"Poppins"/);
    for (const variant of ['h1', 'h2', 'h3', 'subtitle1', 'button'] as const) {
      expect(theme.typography[variant].fontFamily, variant).toBe(fontFamilyDisplay);
    }
    expect(theme.typography.body1.fontFamily).toBe(fontFamily);
    expect(theme.typography.body2.fontFamily).toBe(fontFamily);
  });

  it('la escala es compacta pero legible (texto ≥ 12 px)', () => {
    expect(rem(theme.typography.body1.fontSize)).toBeLessThanOrEqual(0.875);
    expect(rem(theme.typography.body2.fontSize)).toBeLessThanOrEqual(0.8125);
    expect(rem(theme.typography.body2.fontSize)).toBeGreaterThanOrEqual(0.75);
    expect(rem(theme.typography.caption.fontSize)).toBeGreaterThanOrEqual(0.75);
  });
});

describe('tema: botones con degradado', () => {
  const overrides = theme.components?.MuiButton?.styleOverrides as Record<
    string,
    Record<string, unknown>
  >;

  it.each(['containedPrimary', 'containedSecondary', 'containedError'])(
    '%s lleva degradado en reposo, hover y pressed',
    (name) => {
      const rule = overrides[name];
      expect(String(rule.backgroundImage)).toContain('linear-gradient');
      expect(String((rule['&:hover'] as Record<string, unknown>).backgroundImage)).toContain(
        'linear-gradient',
      );
      expect(String((rule['&:active'] as Record<string, unknown>).backgroundImage)).toContain(
        'linear-gradient',
      );
    },
  );

  it('el botón de contorno tiene el borde con degradado', () => {
    expect(String(overrides.outlinedPrimary.background)).toContain('border-box');
    expect(String(overrides.outlinedPrimary.background)).toContain('linear-gradient');
  });
});
