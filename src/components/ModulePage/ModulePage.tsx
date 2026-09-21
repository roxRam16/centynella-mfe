import { useState } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { ActionBar } from '@/components/ActionBar';
import { DataTable } from '@/components/DataTable';
import type { DataTableProps } from '@/components/DataTable';
import type { MenuAction } from '@/components/DropdownMenu';
import { FilterAdvanced } from '@/components/FilterAdvanced';
import type { FilterField, FilterValues } from '@/components/FilterAdvanced';
import { PageHeader } from '@/components/PageHeader';
import { SearchBar } from '@/components/SearchBar';
import { useViewMode } from '@/hooks/useViewMode';

export interface ModulePageProps<T> {
  /** Identificador estable del módulo (recuerda la vista elegida por módulo). */
  moduleKey: string;
  title: string;
  /** Leyenda que se ve al pulsar el "?" junto al título. */
  description?: string;

  /** Buscador principal (siempre visible). */
  search: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };

  /** Botón "+" de la botonera; omitirlo lo oculta (p. ej. sin permiso). */
  onNew?: () => void;
  newLabel?: string;
  onRefresh: () => void;
  /** Mientras es `true` el icono de actualizar gira. */
  refreshing?: boolean;

  /** Filtro avanzado: sin esto el módulo no tiene botón de filtro. */
  filters?: {
    fields: readonly FilterField[];
    values: FilterValues;
    onApply: (values: FilterValues) => void;
  };

  /** Opciones extra del menú "Acciones" (además de cambiar la vista). */
  actions?: readonly MenuAction[];

  /** La tabla o tarjetas de resultados (`view` lo decide esta plantilla). */
  table: Omit<DataTableProps<T>, 'view'>;

  /** Avisos sobre los resultados (errores de carga con "Reintentar", etc.). */
  notice?: ReactNode;
  /** Diálogos del módulo (crear/editar, confirmar…). */
  children?: ReactNode;
}

/**
 * PLANTILLA de módulo de listado: todo módulo nuevo nace con esto.
 *
 *   Título (?)                                   [ + ][ ⟳ ][ filtro ][ Acciones ▾ ]
 *   ┌ Refina tu búsqueda ┐ ┌ buscador principal (todo el ancho) ─────────────────┐
 *   │  (filtro avanzado, │ │  tabla o tarjetas · selector de registros · páginas │
 *   │   oculto por       │ └─────────────────────────────────────────────────────┘
 *   └   defecto)         ┘
 *
 * El filtro avanzado aparece al activar el botón de filtro; el menú "Acciones" cambia entre
 * tabla (grid) y tarjetas, y la elección se recuerda por módulo.
 */
export function ModulePage<T>({
  moduleKey,
  title,
  description,
  search,
  onNew,
  newLabel,
  onRefresh,
  refreshing,
  filters,
  actions = [],
  table,
  notice,
  children,
}: ModulePageProps<T>) {
  const [view, setView] = useViewMode(moduleKey);
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilters = filters ? Object.values(filters.values).filter(Boolean).length : 0;
  const showFilters = Boolean(filters) && filterOpen;

  const menu: MenuAction[] = [
    { label: 'Ver como tabla', checked: view === 'grid', onClick: () => setView('grid') },
    { label: 'Ver como tarjetas', checked: view === 'cards', onClick: () => setView('cards') },
    ...actions,
  ];

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <ActionBar
            onNew={onNew}
            newLabel={newLabel}
            onRefresh={onRefresh}
            refreshing={refreshing}
            filter={
              filters
                ? {
                    open: filterOpen,
                    count: activeFilters,
                    onToggle: () => setFilterOpen((current) => !current),
                  }
                : undefined
            }
            actions={menu}
          />
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          alignItems: 'start',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: showFilters ? 'minmax(15rem, 18rem) minmax(0, 1fr)' : 'minmax(0, 1fr)',
          },
        }}
      >
        {showFilters && filters && (
          <Box component="aside" sx={{ position: { md: 'sticky' }, top: { md: '5rem' } }}>
            <FilterAdvanced
              fields={filters.fields}
              values={filters.values}
              onApply={filters.onApply}
            />
          </Box>
        )}

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <SearchBar
            label={search.label}
            placeholder={search.placeholder}
            value={search.value}
            onChange={search.onChange}
          />
          {notice}
          <DataTable {...table} view={view} />
        </Stack>
      </Box>

      {children}
    </>
  );
}
