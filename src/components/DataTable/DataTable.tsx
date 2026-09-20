import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { palette } from '@/theme/palette';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  /** Descripción de la tabla para lectores de pantalla (no se ve). */
  caption: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Tabla de datos semántica (`<table>`, `<caption>`, `<th scope="col">`).
 * En pantallas estrechas el contenedor hace scroll horizontal: la página nunca se desborda.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  loading = false,
  emptyMessage = 'No hay datos para mostrar.',
}: DataTableProps<T>) {
  return (
    <TableContainer
      sx={{
        border: `1px solid ${palette.neutral.border}`,
        borderRadius: 1,
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
              <TableCell key={column.key} scope="col" align={column.align} sx={{ fontWeight: 600 }}>
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography color="text.secondary">Cargando…</Typography>
              </TableCell>
            </TableRow>
          )}
          {!loading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography color="text.secondary">{emptyMessage}</Typography>
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

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;
