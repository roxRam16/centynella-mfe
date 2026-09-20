import type { ReactNode } from 'react';
import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';

/**
 * Variantes propias de CENTYNELLA. Ocultan los detalles de la librería de UI:
 *  · primary   → acción principal de la pantalla (una sola por vista).
 *  · secondary → acción de énfasis con el color de acento.
 *  · outlined  → acción alternativa.
 *  · text      → acción de baja jerarquía.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?: ButtonVariant;
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
export function Button({ variant = 'primary', children, ...rest }: ButtonProps) {
  return (
    <MuiButton {...VARIANT_PROPS[variant]} {...rest}>
      {children}
    </MuiButton>
  );
}
