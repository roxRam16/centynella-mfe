import Box from '@mui/material/Box';
import { palette } from '@/theme/palette';

export interface LogoProps {
  /** Alto del símbolo en px. */
  size?: number;
  /** Muestra el nombre junto al símbolo. */
  showText?: boolean;
  /** `dark`: para fondos claros. `light`: para fondos de color. */
  tone?: 'dark' | 'light';
}

/**
 * Logotipo de CENTYNELLA: símbolo (hexágono = caja/inventario, punto = "centinela" que vigila)
 * y nombre. Es un SVG: nítido a cualquier tamaño y sin peticiones extra.
 * Cuando exista el logo oficial, reemplazar solo este componente.
 */
export function Logo({ size = 32, showText = true, tone = 'dark' }: LogoProps) {
  const textColor = tone === 'dark' ? palette.neutral.textPrimary : palette.primary.contrastText;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="CENTYNELLA">
        <rect width="64" height="64" rx="16" fill={palette.primary.main} />
        <path
          d="M32 12 48 21v18L32 48 16 39V21z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="30" r="5" fill={palette.brand.iris} />
      </svg>
      {showText && (
        <Box
          component="span"
          sx={{ fontWeight: 700, letterSpacing: '0.08em', fontSize: size * 0.5, color: textColor }}
        >
          CENTYNELLA
        </Box>
      )}
    </Box>
  );
}
