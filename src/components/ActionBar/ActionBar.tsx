import type { ReactElement } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterIcon from '@mui/icons-material/FilterAltOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DropdownMenu } from '@/components/DropdownMenu';
import type { MenuAction } from '@/components/DropdownMenu';
import { palette } from '@/theme/palette';
import { elevation } from '@/theme/tokens';

export interface ActionBarFilter {
  /** ¿Está abierto el panel de filtros avanzados? */
  open: boolean;
  /** Cuántos filtros hay aplicados (se muestra como insignia). */
  count: number;
  onToggle: () => void;
}

export interface ActionBarProps {
  /** Muestra el botón "+" (nuevo registro). Omitirlo lo oculta (p. ej. sin permiso). */
  onNew?: () => void;
  /** Nombre del botón "+" (p. ej. "Nuevo usuario"). */
  newLabel?: string;
  onRefresh?: () => void;
  /** Mientras es `true` el icono de actualizar gira. */
  refreshing?: boolean;
  filter?: ActionBarFilter;
  /** Opciones del menú "Acciones" (p. ej. cambiar la vista de tabla a tarjetas). */
  actions?: readonly MenuAction[];
}

const segment = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.5,
  position: 'relative',
  minWidth: '2.5rem',
  minHeight: '2.5rem',
  px: 1.25,
  borderRadius: 0,
  color: palette.primary.contrastText,
  fontFamily: 'inherit',
  fontWeight: 700,
  fontSize: '0.8125rem',
  '&:hover': { backgroundImage: palette.gradient.primaryHover },
  '&:active, &[aria-pressed="true"], &[aria-expanded="true"]': {
    backgroundImage: palette.gradient.primaryPressed,
  },
  '&.Mui-focusVisible': { outline: '2px solid #FFFFFF', outlineOffset: -4 },
} as const;

/** Botón cuadrado de icono de la botonera: siempre con tooltip y `aria-label`. */
function BarButton({
  label,
  icon,
  onClick,
  pressed,
  badge,
}: {
  label: string;
  icon: ReactElement;
  onClick: () => void;
  pressed?: boolean;
  badge?: number;
}) {
  return (
    <Tooltip title={label}>
      <ButtonBase
        onClick={onClick}
        aria-label={badge ? `${label} (${badge} aplicado${badge === 1 ? '' : 's'})` : label}
        aria-pressed={pressed}
        sx={{ ...segment, borderLeft: '1px solid rgba(255, 255, 255, 0.28)' }}
      >
        {icon}
        {badge ? (
          <Box
            component="span"
            aria-hidden
            sx={{
              position: 'absolute',
              top: 3,
              right: 3,
              minWidth: '1rem',
              height: '1rem',
              px: 0.25,
              borderRadius: 9999,
              fontSize: '0.625rem',
              lineHeight: '1rem',
              fontWeight: 800,
              textAlign: 'center',
              color: palette.primary.dark,
              backgroundColor: palette.neutral.surface,
            }}
          >
            {badge}
          </Box>
        ) : null}
      </ButtonBase>
    </Tooltip>
  );
}

/**
 * Botonera del módulo (estilo Synapsis): una sola pieza con degradado que junta
 *   [+ Nuevo] [⟳ Actualizar] [filtro avanzado] [Acciones ▾]
 * Cada botón es opcional: solo se dibuja el que se configura. Los botones de icono llevan
 * tooltip y `aria-label`; el de filtro es un interruptor (`aria-pressed`) con insignia de
 * cuántos filtros hay aplicados.
 */
export function ActionBar({
  onNew,
  newLabel = 'Nuevo',
  onRefresh,
  refreshing = false,
  filter,
  actions,
}: ActionBarProps) {
  return (
    <Box
      role="toolbar"
      aria-label="Acciones del módulo"
      sx={{
        display: 'inline-flex',
        alignItems: 'stretch',
        alignSelf: 'flex-start',
        overflow: 'hidden',
        borderRadius: 1.5,
        backgroundColor: palette.primary.main,
        backgroundImage: palette.gradient.primary,
        boxShadow: elevation[2],
        // El primer botón no lleva divisor a la izquierda.
        '& > button:first-of-type': { borderLeft: 'none' },
      }}
    >
      {onNew && <BarButton label={newLabel} icon={<AddIcon />} onClick={onNew} />}
      {onRefresh && (
        <BarButton
          label="Actualizar"
          onClick={onRefresh}
          icon={
            <RefreshIcon
              sx={{
                '@keyframes bar-spin': { to: { transform: 'rotate(360deg)' } },
                animation: refreshing ? 'bar-spin 900ms linear infinite' : 'none',
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              }}
            />
          }
        />
      )}
      {filter && (
        <BarButton
          label="Filtros avanzados"
          icon={<FilterIcon />}
          pressed={filter.open}
          badge={filter.count}
          onClick={filter.onToggle}
        />
      )}
      {actions && actions.length > 0 && (
        <DropdownMenu
          label="Acciones"
          items={actions}
          triggerSx={{ ...segment, borderLeft: '1px solid rgba(255, 255, 255, 0.28)' }}
          trigger={
            <>
              Acciones
              <ExpandMoreIcon fontSize="small" />
            </>
          }
        />
      )}
    </Box>
  );
}
