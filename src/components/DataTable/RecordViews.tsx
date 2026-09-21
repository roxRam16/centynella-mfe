import { useId, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import MoreIcon from '@mui/icons-material/MoreVert';
import { IconButton } from '@/components/IconButton';
import { palette } from '@/theme/palette';
import { elevation } from '@/theme/tokens';
import { groupColumns } from './types';
import type { Column } from './types';

interface RecordViewProps<T> {
  columns: readonly Column<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  getRowLabel?: (row: T) => string;
}

/** Lista "rótulo: valor" de las columnas de datos de un registro. */
function DetailList<T>({
  row,
  details,
  stacked,
}: {
  row: T;
  details: readonly Column<T>[];
  stacked: boolean;
}) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gap: 1,
        gridTemplateColumns: stacked ? '1fr' : 'minmax(0, 8rem) 1fr',
        alignItems: 'baseline',
      }}
    >
      {details.map((column) => (
        <Box
          key={column.key}
          sx={{ display: 'contents', '& > dd': { m: 0, minWidth: 0, overflowWrap: 'anywhere' } }}
        >
          <Typography
            component="dt"
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            {column.header}
          </Typography>
          <Box component="dd">{column.render(row)}</Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Vista de TARJETAS (una por registro): cabecera con la columna principal, datos como
 * "rótulo: valor" y las acciones al pie. Se acomodan solas en 1, 2, 3… columnas según el ancho.
 */
export function DataCards<T>({ columns, rows, getRowId }: RecordViewProps<T>) {
  const { primary, details, actions } = groupColumns(columns);

  return (
    <Box
      component="ul"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gap: 2,
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 18rem), 1fr))',
      }}
    >
      {rows.map((row) => (
        <Box
          component="li"
          key={getRowId(row)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: palette.neutral.surface,
            border: `1px solid ${palette.neutral.border}`,
            borderRadius: 2,
            boxShadow: elevation[1],
            transition: 'box-shadow 200ms ease',
            '&:hover': { boxShadow: elevation[2] },
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        >
          <Box sx={{ p: 2, pb: 1.5, borderBottom: `1px solid ${palette.neutral.border}` }}>
            {primary.render(row)}
          </Box>
          <Box sx={{ p: 2, flexGrow: 1 }}>
            <DetailList row={row} details={details} stacked={false} />
          </Box>
          {actions && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 0.5,
                py: 1,
                borderTop: `1px solid ${palette.neutral.border}`,
              }}
            >
              {actions.render(row)}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

/**
 * Vista COMPACTA de la tabla para espacios angostos: solo se ve el registro (columna principal)
 * y un icono de tres puntos; al pulsarlo se despliega el resto de la información en vertical.
 * Así nunca aparece una barra de desplazamiento horizontal.
 */
export function CompactRows<T>({ columns, rows, getRowId, getRowLabel }: RecordViewProps<T>) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const { primary, details, actions } = groupColumns(columns);

  return (
    <Box
      component="ul"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        backgroundColor: palette.neutral.surface,
        border: `1px solid ${palette.neutral.border}`,
        borderRadius: 1.5,
        overflow: 'hidden',
      }}
    >
      {rows.map((row) => {
        const id = getRowId(row);
        const isOpen = openId === id;
        const panelId = `${baseId}-${id}`;
        const name = getRowLabel?.(row) ?? 'registro';

        return (
          <Box
            component="li"
            key={id}
            sx={{ '&:not(:last-child)': { borderBottom: `1px solid ${palette.neutral.border}` } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1 }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>{primary.render(row)}</Box>
              <IconButton
                label={isOpen ? `Ocultar detalles de ${name}` : `Ver detalles de ${name}`}
                icon={<MoreIcon />}
                aria-expanded={isOpen}
                aria-controls={isOpen ? panelId : undefined}
                onClick={() => setOpenId(isOpen ? null : id)}
              />
            </Box>
            <Collapse in={isOpen} unmountOnExit id={panelId}>
              <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, backgroundColor: palette.neutral.surfaceAlt }}>
                <DetailList row={row} details={details} stacked />
                {actions && (
                  <Box sx={{ display: 'flex', gap: 0.5, pt: 1.5 }}>{actions.render(row)}</Box>
                )}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}
