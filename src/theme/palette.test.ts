import { contrastRatio } from '@/utils/color';
import { palette } from './palette';
import type { SemanticColor } from './palette';

const AA_NORMAL_TEXT = 4.5;

const semanticColors: SemanticColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
];

describe('palette (accesibilidad WCAG AA)', () => {
  it.each(semanticColors)('%s: el texto sobre el color principal es legible', (name) => {
    const { main, dark, contrastText } = palette[name];
    expect(contrastRatio(contrastText, main)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(contrastText, dark)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it.each(semanticColors)(
    '%s: el color principal es legible como texto sobre la superficie',
    (name) => {
      expect(contrastRatio(palette[name].main, palette.neutral.surface)).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT,
      );
    },
  );

  it('el texto neutro es legible sobre fondo y superficie', () => {
    const { textPrimary, textSecondary, background, surface } = palette.neutral;
    for (const text of [textPrimary, textSecondary]) {
      expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(contrastRatio(text, surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });
});
