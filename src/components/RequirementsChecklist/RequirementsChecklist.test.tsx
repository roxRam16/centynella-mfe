import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { RequirementsChecklist } from './RequirementsChecklist';

const renderList = (requirements: { label: string; met: boolean }[]) =>
  render(
    <ThemeProvider>
      <RequirementsChecklist label="Requisitos de la contraseña" requirements={requirements} />
    </ThemeProvider>,
  );

describe('<RequirementsChecklist />', () => {
  it('lista cada requisito con su estado en texto (no solo color)', () => {
    renderList([
      { label: 'Una mayúscula', met: true },
      { label: 'Un número', met: false },
    ]);

    const list = screen.getByRole('list', { name: 'Requisitos de la contraseña' });
    const [upper, digit] = within(list).getAllByRole('listitem');
    expect(upper).toHaveTextContent('Una mayúscula — cumplido');
    expect(digit).toHaveTextContent('Un número — pendiente');
  });

  it('muestra un icono distinto según se cumpla', () => {
    renderList([
      { label: 'A', met: true },
      { label: 'B', met: false },
    ]);

    expect(screen.getAllByTestId('CheckCircleIcon')).toHaveLength(1);
    expect(screen.getAllByTestId('RadioButtonUncheckedIcon')).toHaveLength(1);
  });
});
