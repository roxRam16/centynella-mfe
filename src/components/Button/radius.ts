import { radius } from '@/theme/tokens';

/** Radio de borde de un botón según su variante y forma (el "text link" nunca es píldora). */
export function resolveButtonRadius(
  variant: 'primary' | 'secondary' | 'outlined' | 'text',
  shape: 'pill' | 'rounded',
): number {
  if (variant === 'text') return radius.small;
  return shape === 'pill' ? radius.full : radius.small;
}
