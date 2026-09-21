import { render, screen } from '@testing-library/react';
import * as healthService from '@/services/healthService';
import { tokenStore } from '@/services/tokenStore';
import { makeSession } from '@/test/factories';
import { mockApi, problem } from '@/test/mockApi';
import { App } from './App';

describe('<App /> (integración: sesión real, sin dobles de contexto)', () => {
  beforeEach(() => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
  });

  afterEach(() => {
    tokenStore.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sin sesión muestra el login', async () => {
    mockApi({ 'POST /api/v1/auth/refresh': () => problem(401, 'no_session', 'x') });
    render(<App />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Bienvenido' }),
    ).toBeInTheDocument();
  });

  it('con la cookie de sesión restaura al usuario y muestra el shell (persistencia)', async () => {
    mockApi({ 'POST /api/v1/auth/refresh': () => ({ json: makeSession() }) });
    render(<App />);

    expect(
      await screen.findByRole('heading', { level: 1, name: '¡Hola Mundo!' }),
    ).toBeInTheDocument();
    // El menú lateral es un riel de iconos siempre visible.
    expect(await screen.findByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
