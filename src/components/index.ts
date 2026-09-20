/**
 * Librería de componentes propia de CENTYNELLA (sobre MUI).
 * Toda la app —y los remotes— importan de aquí, nunca de MUI directamente,
 * para mantener consistencia visual y poder cambiar de librería en un solo lugar.
 */
export { Button } from './Button';
export type { ButtonProps, ButtonVariant } from './Button';
export { Alert } from './Alert';
export type { AlertProps, AlertSeverity } from './Alert';
export { Grid, GridItem } from './Grid';
export type { GridProps, GridItemProps, GridSpan } from './Grid';
