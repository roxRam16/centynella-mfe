import type { ReactElement, ReactNode } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { palette } from '@/theme/palette';
import { elevation, radius } from '@/theme/tokens';

export type RecordCardIconTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface RecordCardAction {
  /** Texto visible del botón (corto, p. ej. "Editar"). */
  label: string;
  /** Nombre accesible completo (p. ej. "Editar a Ana Pérez"); por defecto usa `label`. */
  accessibleLabel?: string;
  onClick: () => void;
}

export interface RecordCardProps {
  /** Icono de estado a la izquierda del título (va dentro de un círculo de color). */
  icon: ReactElement;
  iconTone?: RecordCardIconTone;
  title: string;
  subtitle?: string;
  /** Botón(es) pequeño(s) en la esquina superior derecha (p. ej. eliminar). Opcional. */
  cornerAction?: ReactNode;
  /** Insignia destacada con el degradado de marca (p. ej. un código o folio). */
  badge?: string;
  /** Línea en negritas debajo de la insignia (p. ej. el cliente o la entidad relacionada). */
  highlight?: string;
  /** Fila de métricas (rótulo + valor, estado…). Cada módulo compone su propio contenido. */
  metrics?: ReactNode;
  /** Pie con un dato secundario (icono + texto). */
  footer?: ReactNode;
  /** Botón de ancho completo al pie de la tarjeta (la acción principal del registro). */
  action?: RecordCardAction;
}

const ICON_TONES: Record<RecordCardIconTone, { fg: string; bg: string }> = {
  success: { fg: palette.success.main, bg: palette.success.bg },
  warning: { fg: palette.warning.main, bg: palette.warning.bg },
  error: { fg: palette.error.main, bg: palette.error.bg },
  info: { fg: palette.info.main, bg: palette.info.bg },
  neutral: { fg: palette.neutral.textSecondary, bg: palette.neutral.background },
};

/**
 * Tarjeta de registro (inspirada en el mockup de referencia; colores y tipografía son los
 * nuestros): icono de estado + título/subtítulo, una insignia destacada, una fila de métricas,
 * un pie opcional y un botón de acción de ancho completo. Puramente presentacional — cada
 * módulo decide qué va en cada hueco; se usa desde `DataTable` (prop `renderCard`) o suelta.
 */
export function RecordCard({
  icon,
  iconTone = 'neutral',
  title,
  subtitle,
  cornerAction,
  badge,
  highlight,
  metrics,
  footer,
  action,
}: RecordCardProps) {
  const tone = ICON_TONES[iconTone];

  return (
    <Box
      component="article"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: palette.neutral.surface,
        border: `1px solid ${palette.neutral.border}`,
        borderRadius: 2,
        boxShadow: elevation[1],
        overflow: 'hidden',
        transition: 'box-shadow 200ms ease',
        '&:hover': { boxShadow: elevation[2] },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, p: 2, pb: 1 }}>
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '50%',
            color: tone.fg,
            backgroundColor: tone.bg,
            '& svg': { fontSize: '1.25rem' },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {cornerAction}
      </Box>

      {badge && (
        <Box sx={{ px: 2, pb: highlight ? 1 : 1.5 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              px: 1.25,
              py: 0.375,
              borderRadius: `${radius.small}px`,
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: palette.primary.contrastText,
              backgroundImage: palette.gradient.primary,
            }}
          >
            {badge}
          </Box>
        </Box>
      )}

      {highlight && (
        <Typography sx={{ px: 2, pb: 1.5, fontWeight: 700, overflowWrap: 'anywhere' }}>
          {highlight}
        </Typography>
      )}

      {metrics && (
        <Box sx={{ px: 2, pb: 2, flexGrow: 1 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
          >
            {metrics}
          </Box>
        </Box>
      )}

      {footer && (
        <>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1.25,
              color: palette.neutral.textSecondary,
              fontSize: '0.8125rem',
              '& svg': { fontSize: '1.125rem' },
            }}
          >
            {footer}
          </Box>
        </>
      )}

      {action && (
        <>
          <Divider />
          <ButtonBase
            onClick={action.onClick}
            aria-label={action.accessibleLabel ?? action.label}
            sx={{
              width: '100%',
              py: 1.5,
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: palette.primary.main,
              '&:hover': { backgroundColor: palette.info.bg },
            }}
          >
            {action.label}
          </ButtonBase>
        </>
      )}
    </Box>
  );
}
