import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useIsNarrow } from '@/hooks/useIsNarrow';
import { palette } from '@/theme/palette';
import { visuallyHidden } from '@/utils/a11y';
import { CompactRows, DataCards } from './RecordViews';
import { TableFooter } from './TableFooter';
import type { Column, DataTablePagination, DataView } from './types';

export type { Column, DataTablePagination, DataView } from './types';

/** Por debajo de este ancho DEL CONTENIDO la tabla pasa a la vista compacta (tres puntos). */
export const NARROW_BELOW_PX = 720;

export interface DataTableProps<T> {
  /** Descripción de la tabla para lectores de pantalla (no se ve). */
  caption: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  /** Nombre corto de un registro para los botones de detalle ("Ver detalles de Ana"). */
  getRowLabel?: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  /** `grid` (tabla, por defecto) o `cards` (una tarjeta por registro). */
  view?: DataView;
  /** Pie con selector de registros por página y paginador (paginación del servidor). */
  pagination?: DataTablePagination;
  /** Fuerza (o impide) la vista compacta; por defecto se decide midiendo el ancho disponible. */
  compact?: boolean;
}

/**
 * Datos en tabla o tarjetas, con paginación y selector de registros por página.
 *
 *  · `grid`: tabla semántica (`<table>`, `<caption>`, `<th scope="col">`). Si el espacio es
 *    angosto pasa sola a la vista compacta: solo el registro y un icono de tres puntos que
 *    despliega el resto en vertical. Nunca hay barra de desplazamiento horizontal.
 *  · `cards`: tarjetas responsivas (1, 2, 3… columnas según el ancho).
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  getRowLabel,
  loading = false,
  emptyMessage = 'No hay datos para mostrar.',
  view = 'grid',
  pagination,
  compact,
}: DataTableProps<T>) {
  const [containerRef, narrow] = useIsNarrow(NARROW_BELOW_PX);
  const isCompact = compact ?? narrow;
  const recordProps = { columns, rows, getRowId, getRowLabel };

  const message = (text: string, live = false) => (
    <Box
      role={live ? 'status' : undefined}
      sx={{
        p: 3,
        textAlign: 'center',
        backgroundColor: palette.neutral.surface,
        border: `1px solid ${palette.neutral.border}`,
        borderRadius: 1.5,
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {text}
      </Typography>
    </Box>
  );

  let body;
  if (view === 'cards' || isCompact) {
    if (loading) body = message('Cargando…', true);
    else if (rows.length === 0) body = message(emptyMessage);
    else
      body = view === 'cards' ? <DataCards {...recordProps} /> : <CompactRows {...recordProps} />;
  } else {
    body = (
      <TableContainer
        sx={{
          border: `1px solid ${palette.neutral.border}`,
          borderRadius: 1.5,
          backgroundColor: 'background.paper',
        }}
      >
        <Table aria-busy={loading} size="medium">
          <Box component="caption" sx={visuallyHidden}>
            {caption}
          </Box>
          <TableHead>
            <TableRow sx={{ backgroundColor: palette.neutral.surfaceAlt }}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  scope="col"
                  align={column.align}
                  sx={{ fontWeight: 600 }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography color="text.secondary" variant="body2">
                    Cargando…
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography color="text.secondary" variant="body2">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              rows.map((row) => (
                <TableRow key={getRowId(row)} hover>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box ref={containerRef} sx={{ width: '100%', minWidth: 0 }}>
      {body}
      {pagination && <TableFooter {...pagination} />}
    </Box>
  );
}
