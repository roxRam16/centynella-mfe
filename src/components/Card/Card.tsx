import type { ElementType, ReactNode } from 'react';
import MuiCard from '@mui/material/Card';
import { palette } from '@/theme/palette';
import { elevation } from '@/theme/tokens';
import type { ElevationLevel } from '@/theme/tokens';

export interface CardProps {
  /** Nivel de elevación de la guía: 0 plano · 1 sombra baja · 2 media · 3 alta. */
  elevation?: ElevationLevel;
  /** Espaciado interno en múltiplos de 8px. */
  padding?: number;
  /** Eleva la tarjeta al pasar el cursor (para tarjetas clicables). */
  interactive?: boolean;
  /** Elemento HTML semántico (`section`, `article`…). */
  as?: ElementType;
  children: ReactNode;
}

/** Tarjeta de contenido con la elevación de marca (sombra con tinte azul). */
export function Card({
  elevation: level = 1,
  padding = 3,
  interactive = false,
  as = 'div',
  children,
}: CardProps) {
  return (
    <MuiCard
      component={as}
      elevation={0}
      sx={{
        p: padding,
        border: `1px solid ${palette.neutral.border}`,
        boxShadow: elevation[level],
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        ...(interactive && {
          '&:hover': { boxShadow: elevation[Math.min(level + 1, 3) as ElevationLevel] },
        }),
      }}
    >
      {children}
    </MuiCard>
  );
}
