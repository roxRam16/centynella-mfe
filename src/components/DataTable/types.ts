import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  /**
   * Columna que identifica al registro: es la única que se ve en pantallas angostas y el
   * encabezado de cada tarjeta. Por defecto, la primera que no sea de acciones.
   */
  primary?: boolean;
  /** Columna de botones (editar, eliminar…): en tarjetas y en el detalle va aparte, sin rótulo. */
  kind?: 'data' | 'actions';
}

/** Tamaños de página ofrecidos por defecto. El primero es el tamaño inicial recomendado. */
export const DEFAULT_PAGE_SIZES = [10, 20, 50, 100] as const;

/** Paginación del lado del servidor: la tabla muestra el selector y el paginador. */
export interface DataTablePagination {
  /** Página actual (empieza en 1). */
  page: number;
  pageSize: number;
  /** Total de registros (todas las páginas). */
  total: number;
  onPageChange: (page: number) => void;
  /** Al cambiar el tamaño el llamador debe volver a la página 1. */
  onPageSizeChange: (pageSize: number) => void;
  /** Tamaños ofrecidos (por defecto 10, 20, 50 y 100). */
  pageSizeOptions?: readonly number[];
}

/** Cómo se muestran los registros: tabla (grid) o tarjetas. */
export type DataView = 'grid' | 'cards';

/** Reparto de columnas de un registro: identificación, datos y acciones. */
export interface ColumnGroups<T> {
  primary: Column<T>;
  details: Column<T>[];
  actions: Column<T> | undefined;
}

export function groupColumns<T>(columns: readonly Column<T>[]): ColumnGroups<T> {
  const actions = columns.find((column) => column.kind === 'actions');
  const data = columns.filter((column) => column !== actions);
  const primary = data.find((column) => column.primary) ?? data[0] ?? columns[0];
  return { primary, details: data.filter((column) => column !== primary), actions };
}
