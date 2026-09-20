import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { Logo } from './Logo';

const renderLogo = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Logo />', () => {
  it('expone el nombre de marca como imagen accesible y como texto', () => {
    renderLogo(<Logo />);

    expect(screen.getByRole('img', { name: 'CENTYNELLA' })).toBeInTheDocument();
    expect(screen.getByText('CENTYNELLA')).toBeInTheDocument();
  });

  it('puede mostrarse solo con el símbolo', () => {
    renderLogo(<Logo showText={false} />);

    expect(screen.getByRole('img', { name: 'CENTYNELLA' })).toBeInTheDocument();
    expect(screen.queryByText('CENTYNELLA')).not.toBeInTheDocument();
  });

  it('respeta el tamaño', () => {
    renderLogo(<Logo size={48} />);

    expect(screen.getByRole('img')).toHaveAttribute('width', '48');
  });
});
