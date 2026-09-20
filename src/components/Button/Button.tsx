import type { ReactNode } from 'react';
import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { resolveButtonRadius } from './radius';

/**
 * Variantes propias de CENTYNELLA (estados Normal · Hover · Pressed definidos en el tema):
 *  · primary   → acción principal de la pantalla (una sola por vista).
 *  · secondary → acción de énfasis con el color de acento (violet).
 *  · outlined  → acción alternativa.
 *  · text      → "text link": acción de baja jerarquía, se subraya al pasar el cursor.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text';

/** `pill` = totalmente redondeado (diseño del login); `rounded` = esquinas suaves (botones densos). */
export type ButtonShape = 'pill' | 'rounded';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?: ButtonVariant;
  shape?: ButtonShape;
  /** Acción destructiva (eliminar): usa el color de error en lugar del de marca. */
  danger?: boolean;
  children: ReactNode;
}

/** Mapa variante propia → props de MUI (patrón Adapter). */
const VARIANT_PROPS: Record<ButtonVariant, Pick<MuiButtonProps, 'variant' | 'color'>> = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'contained', color: 'secondary' },
  outlined: { variant: 'outlined', color: 'primary' },
  text: { variant: 'text', color: 'primary' },
};

/**
 * Botón de CENTYNELLA. Soporta `loading` (deshabilita y muestra progreso)
 * y hereda accesibilidad de teclado/foco de la librería base.
 */
export function Button({
  variant = 'primary',
  shape = 'pill',
  danger = false,
  children,
  sx,
  ...rest
}: ButtonProps) {
  const mapped = danger
    ? { ...VARIANT_PROPS[variant], color: 'error' as const }
    : VARIANT_PROPS[variant];
  const borderRadius = resolveButtonRadius(variant, shape);

  return (
    // El `sx` de quien llama se SUMA al radio de la forma (no lo reemplaza).
    <MuiButton
      {...mapped}
      sx={[{ borderRadius }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}
