import type { ReactElement } from 'react';
import MuiIconButton from '@mui/material/IconButton';
import type { IconButtonProps as MuiIconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { palette } from '@/theme/palette';

export type IconButtonTone = 'default' | 'primary' | 'danger';

export interface IconButtonProps extends Omit<
  MuiIconButtonProps,
  'color' | 'children' | 'aria-label'
> {
  /** Nombre accesible Y texto del tooltip (un icono solo nunca es suficiente). */
  label: string;
  icon: ReactElement;
  /** `danger` para acciones destructivas (eliminar). */
  tone?: IconButtonTone;
}

const COLORS: Record<IconButtonTone, { color: string; hover: string }> = {
  default: { color: palette.neutral.textSecondary, hover: palette.neutral.textPrimary },
  primary: { color: palette.primary.main, hover: palette.primary.dark },
  danger: { color: palette.error.main, hover: palette.error.dark },
};

/**
 * Botón de solo icono con tooltip y `aria-label` (mismo texto). El tooltip envuelve el botón en
 * un `span` para que también funcione cuando está deshabilitado.
 */
export function IconButton({ label, icon, tone = 'default', sx, ...rest }: IconButtonProps) {
  const { color, hover } = COLORS[tone];

  return (
    <Tooltip title={label}>
      <span style={{ display: 'inline-flex' }}>
        <MuiIconButton
          aria-label={label}
          size="small"
          sx={[
            { color, '&:hover': { color: hover, backgroundColor: palette.info.bg } },
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ]}
          {...rest}
        >
          {icon}
        </MuiIconButton>
      </span>
    </Tooltip>
  );
}
