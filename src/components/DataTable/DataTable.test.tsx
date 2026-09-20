import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { DataTable } from './DataTable';
import type { Column } from './DataTable';

interface Person {
  id: string;
  name: string;
  role: string;
}

const columns: Column<Person>[] = [
  { key: 'name', header: 'Nombre', render: (person) => person.name },
  { key: 'role', header: 'Rol', render: (person) => person.role },
];
const rows: Person[] = [
  { id: '1', name: 'Ana', role: 'admin' },
  { id: '2', name: 'Luis', role: 'viewer' },
];

const renderTable = (props: Partial<React.ComponentProps<typeof DataTable<Person>>> = {}) =>
  render(
    <ThemeProvider>
      <DataTable
        caption="Usuarios"
        columns={columns}
        rows={rows}
        getRowId={(p) => p.id}
        {...props}
      />
    </ThemeProvider>,
  );

describe('<DataTable />', () => {
  it('es una tabla accesible con encabezados de columna y filas', () => {
    renderTable();

    const table = screen.getByRole('table', { name: 'Usuarios' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['Nombre', 'Rol']);
    expect(within(table).getAllByRole('row')).toHaveLength(3); // encabezado + 2 filas
    expect(within(table).getByRole('cell', { name: 'Luis' })).toBeInTheDocument();
  });

  it('muestra el mensaje de vacío', () => {
    renderTable({ rows: [], emptyMessage: 'Sin usuarios' });

    expect(screen.getByText('Sin usuarios')).toBeInTheDocument();
  });

  it('muestra el estado de carga y lo marca con aria-busy', () => {
    renderTable({ loading: true });

    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  });
});
