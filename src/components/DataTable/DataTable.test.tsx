import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { DataTable } from './DataTable';
import type { Column, DataTableProps } from './DataTable';

interface Person {
  id: string;
  name: string;
  role: string;
}

const columns: Column<Person>[] = [
  { key: 'name', header: 'Nombre', primary: true, render: (person) => person.name },
  { key: 'role', header: 'Rol', render: (person) => person.role },
  {
    key: 'actions',
    header: 'Acciones',
    kind: 'actions',
    render: (person) => <button type="button">Editar a {person.name}</button>,
  },
];
const rows: Person[] = [
  { id: '1', name: 'Ana', role: 'admin' },
  { id: '2', name: 'Luis', role: 'viewer' },
];

const renderTable = (props: Partial<DataTableProps<Person>> = {}) =>
  render(
    <ThemeProvider>
      <DataTable
        caption="Usuarios"
        columns={columns}
        rows={rows}
        getRowId={(p) => p.id}
        getRowLabel={(p) => p.name}
        {...props}
      />
    </ThemeProvider>,
  );

describe('<DataTable /> — tabla (grid)', () => {
  it('es una tabla accesible con encabezados de columna y filas', () => {
    renderTable();

    const table = screen.getByRole('table', { name: 'Usuarios' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['Nombre', 'Rol', 'Acciones']);
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

  it('sin paginación no dibuja el pie', () => {
    renderTable();

    expect(screen.queryByRole('combobox', { name: 'Mostrar' })).not.toBeInTheDocument();
  });
});

describe('<DataTable /> — paginación', () => {
  const pagination = (overrides = {}) => ({
    page: 1,
    pageSize: 10,
    total: 25,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    ...overrides,
  });

  it('ofrece 10, 20, 50 y 100 registros por página', () => {
    renderTable({ pagination: pagination() });

    const select = screen.getByRole('combobox', { name: 'Mostrar' });
    expect(
      within(select)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['10', '20', '50', '100']);
    expect(select).toHaveValue('10');
  });

  it('avisa el nuevo tamaño elegido', async () => {
    const config = pagination();
    renderTable({ pagination: config });

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Mostrar' }), '50');

    expect(config.onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('muestra el rango visible y cambia de página', async () => {
    const config = pagination({ page: 2 });
    renderTable({ pagination: config });

    expect(screen.getByText('11–20 de 25')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /page 3/i }));

    expect(config.onPageChange).toHaveBeenCalledWith(3);
  });

  it('el último rango no pasa del total y sin datos muestra 0–0', () => {
    const { unmount } = render(
      <ThemeProvider>
        <DataTable
          caption="x"
          columns={columns}
          rows={rows}
          getRowId={(p) => p.id}
          pagination={pagination({ page: 3 })}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText('21–25 de 25')).toBeInTheDocument();
    unmount();

    renderTable({ rows: [], pagination: pagination({ total: 0 }) });
    expect(screen.getByText('0–0 de 0')).toBeInTheDocument();
  });

  it('acepta otros tamaños de página', () => {
    renderTable({ pagination: pagination({ pageSizeOptions: [5, 15] }) });

    expect(
      within(screen.getByRole('combobox', { name: 'Mostrar' }))
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['5', '15']);
  });
});

describe('<DataTable /> — tarjetas', () => {
  it('muestra una tarjeta por registro con su dato principal, datos y acciones', () => {
    renderTable({ view: 'cards' });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    const cards = screen.getAllByRole('listitem');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText('Ana')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Rol')).toBeInTheDocument();
    expect(within(cards[0]).getByText('admin')).toBeInTheDocument();
    expect(within(cards[0]).getByRole('button', { name: 'Editar a Ana' })).toBeInTheDocument();
  });

  it('no repite la columna principal ni las acciones como dato', () => {
    renderTable({ view: 'cards' });

    const card = screen.getAllByRole('listitem')[0];
    expect(within(card).queryByText('Nombre')).not.toBeInTheDocument();
    expect(within(card).queryByText('Acciones')).not.toBeInTheDocument();
  });

  it('muestra vacío y carga también en tarjetas', () => {
    const { unmount } = renderTable({ view: 'cards', rows: [], emptyMessage: 'Nada aquí' });
    expect(screen.getByText('Nada aquí')).toBeInTheDocument();
    unmount();

    renderTable({ view: 'cards', loading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
  });
});

describe('<DataTable /> — vista compacta (espacio angosto)', () => {
  it('solo se ve el registro y un icono de tres puntos, sin tabla', () => {
    renderTable({ compact: true });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.queryByText('admin')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver detalles de Ana' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('el icono despliega el resto de la información en vertical, con las acciones', async () => {
    renderTable({ compact: true });

    await userEvent.click(screen.getByRole('button', { name: 'Ver detalles de Ana' }));

    expect(screen.getByText('Rol')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar a Ana' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ocultar detalles de Ana' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('solo un registro queda desplegado a la vez', async () => {
    renderTable({ compact: true });

    await userEvent.click(screen.getByRole('button', { name: 'Ver detalles de Ana' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalles de Luis' }));

    expect(await screen.findByText('viewer')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('admin')).not.toBeInTheDocument());
  });

  it('se activa sola cuando el contenido mide menos de 720 px', () => {
    let notify: (width: number) => void = () => undefined;
    class FakeObserver {
      constructor(callback: ResizeObserverCallback) {
        notify = (width) =>
          callback([{ contentRect: { width } } as ResizeObserverEntry], this as never);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', FakeObserver);
    renderTable();
    expect(screen.getByRole('table')).toBeInTheDocument();

    act(() => notify(600));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    act(() => notify(1000));
    expect(screen.getByRole('table')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('compact={false} la impide aunque el espacio sea poco', () => {
    renderTable({ compact: false });

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('en tarjetas la vista compacta no aplica', () => {
    renderTable({ view: 'cards', compact: true });

    expect(screen.queryByRole('button', { name: /Ver detalles/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('muestra vacío y carga en compacto', () => {
    const { unmount } = renderTable({ compact: true, rows: [], emptyMessage: 'Sin nada' });
    expect(screen.getByText('Sin nada')).toBeInTheDocument();
    unmount();
    renderTable({ compact: true, loading: true });
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });
});
