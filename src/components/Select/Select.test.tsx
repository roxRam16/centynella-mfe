import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { Select } from './Select';

const options = [
  { value: 'admin', label: 'Administrador' },
  { value: 'viewer', label: 'Consulta' },
];

const renderSelect = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Select />', () => {
  it('lista las opciones y notifica el cambio', async () => {
    const onChange = vi.fn();
    renderSelect(
      <Select label="Rol" options={options} defaultValue="viewer" onChange={onChange} />,
    );

    const select = screen.getByLabelText('Rol');
    expect(select).toHaveValue('viewer');

    await userEvent.selectOptions(select, 'admin');

    expect(select).toHaveValue('admin');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('muestra la opción vacía cuando hay placeholder', () => {
    renderSelect(<Select label="Rol" options={options} placeholder="Selecciona un rol" />);

    expect(screen.getByRole('option', { name: 'Selecciona un rol' })).toHaveValue('');
  });

  it('en error marca aria-invalid y anuncia el mensaje', () => {
    renderSelect(<Select label="Rol" options={options} error="Elige un rol" />);

    expect(screen.getByLabelText('Rol')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Elige un rol');
  });
});
