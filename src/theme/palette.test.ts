import { contrastRatio } from '@/utils/color';
import { brand, palette } from './palette';
import type { SemanticColor } from './palette';

const AA_NORMAL_TEXT = 4.5;
const AA_LARGE_TEXT = 3;

const semanticColors: SemanticColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
];

describe('palette (colores de marca)', () => {
  it('conserva los seis colores de la guía de estilo', () => {
    expect(brand).toEqual({
      blue: '#2D28F3',
      iris: '#6E6DF8',
      violet: '#7D58E0',
      lightPink: '#D1CFF7',
      lightBlue: '#EEF3F9',
      darkGray: '#2B3037',
    });
  });

  it('el fondo de la app es el Light blue y el texto principal el Dark gray', () => {
    expect(palette.neutral.background).toBe(brand.lightBlue);
    expect(palette.neutral.textPrimary).toBe(brand.darkGray);
  });
});

describe('palette (accesibilidad WCAG AA)', () => {
  it.each(semanticColors)('%s: el texto sobre el color principal y oscuro es legible', (name) => {
    const { main, dark, contrastText } = palette[name];
    expect(contrastRatio(contrastText, main)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(contrastText, dark)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('el botón primario mantiene contraste en sus tres estados (normal, hover, pressed)', () => {
    const { main, hover, dark, contrastText } = palette.primary;
    for (const background of [main, hover, dark]) {
      expect(contrastRatio(contrastText, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it('primary es legible como texto/enlace sobre la superficie y el fondo', () => {
    const { surface, background } = palette.neutral;
    expect(contrastRatio(palette.primary.main, surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(palette.primary.main, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('secondary (violet) es legible como texto solo sobre la superficie blanca', () => {
    // Sobre el fondo lightBlue baja a 4.33:1: no usarlo para texto pequeño allí.
    expect(contrastRatio(palette.secondary.main, palette.neutral.surface)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
    expect(contrastRatio(palette.secondary.main, palette.neutral.background)).toBeLessThan(
      AA_NORMAL_TEXT,
    );
  });

  it.each(['success', 'warning', 'error', 'info'] as const)(
    '%s: el texto de la alerta es legible sobre su fondo tenue',
    (name) => {
      expect(contrastRatio(palette[name].main, palette[name].bg)).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT,
      );
      expect(contrastRatio(palette.neutral.textPrimary, palette[name].bg)).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT,
      );
    },
  );

  it('el texto neutro es legible sobre fondo y superficie', () => {
    const { textPrimary, textSecondary, textPlaceholder, background, surface } = palette.neutral;
    for (const text of [textPrimary, textSecondary, textPlaceholder]) {
      expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(contrastRatio(text, surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it('el iris solo alcanza contraste de texto grande: no debe usarse para texto normal', () => {
    const ratio = contrastRatio(brand.iris, palette.neutral.surface);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
    expect(ratio).toBeLessThan(AA_NORMAL_TEXT);
  });

  it('el borde de foco (violet) es distinguible del fondo blanco', () => {
    expect(contrastRatio(palette.focus.border, palette.neutral.surface)).toBeGreaterThanOrEqual(
      AA_LARGE_TEXT,
    );
  });

  it('el texto blanco del encabezado es legible en TODO el degradado (Blue → Violet)', () => {
    const { text: headerText } = palette.header;
    expect(contrastRatio(headerText, brand.blue)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(headerText, brand.violet)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(palette.header.gradient).toContain(brand.blue);
    expect(palette.header.gradient).toContain(brand.violet);
  });

  it('el menú lateral es un negro suave y su texto y sus estados son legibles', () => {
    const { background, text: main, textMuted, activeBackground, activeText } = palette.sidebar;
    expect(background).not.toBe('#000000');
    expect(contrastRatio(main, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(textMuted, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(activeText, activeBackground)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(palette.sidebar.badgeWarning, background)).toBeGreaterThanOrEqual(
      AA_LARGE_TEXT,
    );
  });

  it('el pulgar de las barras de desplazamiento se distingue del fondo (≥ 3:1)', () => {
    expect(
      contrastRatio(palette.scrollbar.thumb, palette.neutral.background),
    ).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
    expect(contrastRatio(palette.scrollbar.thumb, palette.neutral.surface)).toBeGreaterThanOrEqual(
      AA_LARGE_TEXT,
    );
  });

  it('todos los degradados con texto blanco son legibles en AMBOS extremos', () => {
    const stops = {
      primary: [brand.blue, brand.violet],
      primaryHover: ['#4A46F5', brand.violet],
      primaryPressed: ['#1E1AB8', '#5B3DB5'],
      secondary: [brand.violet, '#5B3DB5'],
      secondaryHover: [brand.violet, brand.blue],
      secondaryPressed: ['#5B3DB5', '#1E1AB8'],
      danger: ['#B91C1C', '#7F1D1D'],
      dangerHover: ['#DC2626', '#991B1B'],
      dangerPressed: ['#7F1D1D', '#5C1515'],
    } as const;

    for (const [name, [from, to]] of Object.entries(stops)) {
      const gradient = palette.gradient[name as keyof typeof stops];
      expect(gradient, name).toContain(from);
      expect(gradient, name).toContain(to);
      expect(contrastRatio('#FFFFFF', from), `${name} ${from}`).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT,
      );
      expect(contrastRatio('#FFFFFF', to), `${name} ${to}`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it('el degradado suave de los chips deja el texto oscuro legible en sus dos extremos', () => {
    for (const end of [brand.lightBlue, brand.lightPink]) {
      expect(palette.gradient.soft).toContain(end);
      expect(contrastRatio(palette.neutral.textPrimary, end)).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT,
      );
    }
  });

  it('el ítem activo del menú lateral usa el degradado de marca con texto blanco legible', () => {
    expect(palette.sidebar.activeGradient).toBe(palette.gradient.primary);
    expect(contrastRatio(palette.sidebar.activeText, brand.blue)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
    expect(contrastRatio(palette.sidebar.activeText, brand.violet)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it('el menú lateral es casi negro', () => {
    expect(palette.sidebar.background).toBe('#0A0A12');
  });
});
