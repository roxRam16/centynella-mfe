import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import { ThemeProvider } from '@/theme';
import { RecordCard } from './RecordCard';

const renderCard = (props: Partial<React.ComponentProps<typeof RecordCard>> = {}) =>
  render(
    <ThemeProvider>
      <RecordCard icon={<CheckIcon />} title="Refresco de cola 600ml" {...props} />
    </ThemeProvider>,
  );

describe('<RecordCard />', () => {
  it('muestra el título y, si se da, el subtítulo', () => {
    renderCard({ subtitle: 'Bebidas' });

    expect(screen.getByText('Refresco de cola 600ml')).toBeInTheDocument();
    expect(screen.getByText('Bebidas')).toBeInTheDocument();
  });

  it('el icono de estado es decorativo (no estorba al lector de pantalla)', () => {
    renderCard();

    expect(document.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();
  });

  it('sin subtítulo, insignia, resaltado, métricas, pie o acción no los dibuja', () => {
    renderCard();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    // Un solo texto (el título): nada más se renderizó de más.
    expect(screen.getAllByText(/./)).toHaveLength(1);
  });

  it('muestra la insignia con el degradado de marca', () => {
    renderCard({ badge: 'REFR-600' });

    const badge = screen.getByText('REFR-600');
    expect(getComputedStyle(badge).backgroundImage).toContain('linear-gradient');
  });

  it('muestra la línea resaltada', () => {
    renderCard({ highlight: 'Proveedor ABC' });

    expect(screen.getByText('Proveedor ABC')).toBeInTheDocument();
  });

  it('muestra las métricas y el pie que le pase el módulo', () => {
    renderCard({
      metrics: <span>3 piezas</span>,
      footer: <span>$18.50</span>,
    });

    expect(screen.getByText('3 piezas')).toBeInTheDocument();
    expect(screen.getByText('$18.50')).toBeInTheDocument();
  });

  it('dibuja la acción de la esquina tal cual se la pasen', () => {
    renderCard({ cornerAction: <button type="button">Eliminar</button> });

    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
  });

  it('el botón de acción ocupa todo el ancho, muestra el texto corto y usa el nombre accesible completo', async () => {
    const onClick = vi.fn();
    renderCard({
      action: { label: 'Editar', accessibleLabel: 'Editar a Refresco de cola 600ml', onClick },
    });

    const button = screen.getByRole('button', { name: 'Editar a Refresco de cola 600ml' });
    expect(button).toHaveTextContent('Editar');

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('sin nombre accesible propio, la acción usa el texto visible', () => {
    renderCard({ action: { label: 'Ver', onClick: vi.fn() } });

    expect(screen.getByRole('button', { name: 'Ver' })).toBeInTheDocument();
  });
});
