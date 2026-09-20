import type { ChangeEvent } from 'react';
import MuiPagination from '@mui/material/Pagination';

export interface PaginationProps {
  /** Página actual (empieza en 1). */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

/** Paginador (oculto si hay una sola página). Botones accesibles con `aria-current`. */
export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <MuiPagination
      page={page}
      count={pageCount}
      color="primary"
      shape="rounded"
      onChange={(_event: ChangeEvent<unknown>, value: number) => onChange(value)}
      aria-label="Paginación"
    />
  );
}
