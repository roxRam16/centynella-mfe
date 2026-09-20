import { render, screen } from '@testing-library/react';
import * as healthService from '@/services/healthService';
import { App } from './App';

describe('<App />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('arranca el shell y muestra el Hola Mundo', () => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: '¡Hola Mundo!' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page');
  });
});
