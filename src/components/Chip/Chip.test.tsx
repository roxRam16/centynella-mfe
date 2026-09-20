import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { palette } from '@/theme/palette';
import { Chip } from './Chip';

const renderChip = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Chip />', () => {
  it('muestra el texto', () => {
    renderChip(<Chip label="Activo" tone="success" />);

    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('usa el color de su tono', () => {
    renderChip(<Chip label="Deshabilitado" tone="error" />);

    expect(screen.getByText('Deshabilitado').parentElement).toHaveStyle({
      backgroundColor: palette.error.bg,
    });
  });

  it('permite eliminar cuando recibe onDelete', async () => {
    const onDelete = vi.fn();
    renderChip(<Chip label="Filtro" onDelete={onDelete} />);

    await userEvent.click(screen.getByTestId('CancelIcon'));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
