import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { FilterAdvanced } from './FilterAdvanced';
import type { FilterAdvancedProps } from './FilterAdvanced';

const FIELDS: FilterAdvancedProps['fields'] = [
  {
    key: 'role',
    label: 'Rol',
    type: 'select',
    options: [
      { value: 'admin', label: 'Administrador' },
      { value: 'viewer', label: 'Consulta' },
    ],
  },
  { key: 'reference', label: 'Referencia', placeholder: 'Ej. ABC-123' },
];

const renderFilter = (props: Partial<FilterAdvancedProps> = {}) => {
  const onApply = vi.fn();
  render(
    <ThemeProvider>
      <FilterAdvanced fields={FIELDS} values={{}} onApply={onApply} {...props} />
    </ThemeProvider>,
  );
  return onApply;
};

describe('<FilterAdvanced />', () => {
  it('muestra el título y un campo por fila, todos cerrados al inicio', () => {
    renderFilter();

    expect(screen.getByRole('form', { name: 'Refina tu búsqueda' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rol' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Referencia' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('cada fila se despliega para mostrar su control', async () => {
    renderFilter();

    await userEvent.click(screen.getByRole('button', { name: 'Referencia' }));

    expect(screen.getByRole('textbox', { name: 'Referencia' })).toHaveAttribute(
      'placeholder',
      'Ej. ABC-123',
    );
    expect(screen.getByRole('button', { name: 'Referencia' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('Buscar aplica todos los valores juntos, sin espacios ni vacíos', async () => {
    const onApply = renderFilter();
    await userEvent.click(screen.getByRole('button', { name: 'Rol' }));
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Rol' }), 'admin');
    await userEvent.click(screen.getByRole('button', { name: 'Referencia' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Referencia' }), '  ABC  ');

    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onApply).toHaveBeenCalledWith({ role: 'admin', reference: 'ABC' });
  });

  it('Enter en un campo también busca', async () => {
    const onApply = renderFilter();
    await userEvent.click(screen.getByRole('button', { name: 'Referencia' }));

    await userEvent.type(screen.getByRole('textbox', { name: 'Referencia' }), 'X1{Enter}');

    expect(onApply).toHaveBeenCalledWith({ reference: 'X1' });
  });

  it('un valor en blanco no se envía', async () => {
    const onApply = renderFilter();
    await userEvent.click(screen.getByRole('button', { name: 'Referencia' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Referencia' }), '   ');

    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onApply).toHaveBeenCalledWith({});
  });

  it('Restaurar limpia los campos y aplica el filtro vacío', async () => {
    const onApply = renderFilter({ values: { reference: 'ABC' } });
    const input = screen.getByRole('textbox', { name: 'Referencia' });
    expect(input).toHaveValue('ABC');

    await userEvent.click(screen.getByRole('button', { name: 'Restaurar' }));

    expect(onApply).toHaveBeenCalledWith({});
    expect(screen.getByRole('textbox', { name: 'Referencia' })).toHaveValue('');
  });

  it('los campos con valor aplicado vienen abiertos', () => {
    renderFilter({ values: { role: 'viewer' } });

    expect(screen.getByRole('button', { name: 'Rol' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('combobox', { name: 'Rol' })).toHaveValue('viewer');
  });

  it('un campo cerrado con valor muestra un resumen (no solo color)', async () => {
    renderFilter({ values: { role: 'viewer' } });

    await userEvent.click(screen.getByRole('button', { name: /^Rol/ }));

    expect(screen.getByRole('button', { name: /Filtro activo:\s*Consulta/ })).toBeInTheDocument();
  });

  it('el borrador sigue a los filtros que cambian desde fuera', () => {
    const onApply = vi.fn();
    const { rerender } = render(
      <ThemeProvider>
        <FilterAdvanced fields={FIELDS} values={{ reference: 'A' }} onApply={onApply} />
      </ThemeProvider>,
    );

    rerender(
      <ThemeProvider>
        <FilterAdvanced fields={FIELDS} values={{ reference: 'B' }} onApply={onApply} />
      </ThemeProvider>,
    );

    expect(
      within(screen.getByRole('form')).getByRole('textbox', { name: 'Referencia' }),
    ).toHaveValue('B');
  });

  it('acepta un título propio', () => {
    renderFilter({ title: 'Filtrar usuarios' });

    expect(screen.getByRole('form', { name: 'Filtrar usuarios' })).toBeInTheDocument();
  });
});
