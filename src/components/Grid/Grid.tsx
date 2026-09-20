import type { ReactNode } from 'react';
import MuiGrid from '@mui/material/Grid';

/** Columnas por breakpoint sobre una grilla de 12 (mobile-first). */
export interface GridSpan {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export interface GridProps {
  /** Separación entre celdas (múltiplos de 8px). */
  spacing?: number;
  children: ReactNode;
}

export interface GridItemProps extends GridSpan {
  children: ReactNode;
}

/**
 * Contenedor de grilla responsive de 12 columnas.
 * Úsalo junto con `GridItem`: el layout se define por breakpoint, nunca por píxeles fijos.
 */
export function Grid({ spacing = 2, children }: GridProps) {
  return (
    <MuiGrid container spacing={spacing}>
      {children}
    </MuiGrid>
  );
}

/**
 * Celda de la grilla. Por defecto ocupa las 12 columnas en móvil (`xs`),
 * de modo que sin configuración el contenido se apila (mobile-first).
 */
export function GridItem({ xs = 12, sm, md, lg, children }: GridItemProps) {
  return <MuiGrid size={{ xs, sm, md, lg }}>{children}</MuiGrid>;
}
