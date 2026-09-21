import { useId } from 'react';
import Box from '@mui/material/Box';
import NativeSelect from '@mui/material/NativeSelect';
import Typography from '@mui/material/Typography';
import { Pagination } from '@/components/Pagination';
import { DEFAULT_PAGE_SIZES } from './types';
import type { DataTablePagination } from './types';

/**
 * Pie de la tabla: selector de registros por página ("Mostrar 10 registros"), el rango visible
 * ("1–10 de 25") y el paginador. Se acomoda en varias líneas en pantallas angostas.
 */
export function TableFooter({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
}: DataTablePagination) {
  const selectId = useId();
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        pt: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography component="label" htmlFor={selectId} variant="body2" color="text.secondary">
          Mostrar
        </Typography>
        <NativeSelect
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          inputProps={{ id: selectId }}
          sx={{ fontSize: '0.8125rem', minWidth: '4rem' }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </NativeSelect>
        <Typography variant="body2" color="text.secondary">
          registros
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" aria-live="polite">
        {from}–{to} de {total}
      </Typography>

      <Pagination page={page} pageCount={Math.ceil(total / pageSize)} onChange={onPageChange} />
    </Box>
  );
}
