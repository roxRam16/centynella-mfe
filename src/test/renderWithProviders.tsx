import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextValue } from '@/context/AuthContext';
import { ThemeProvider } from '@/theme';
import { makeProfile } from './factories';

/** Sesión falsa: administrador autenticado con todos los permisos. Cada campo se puede sobrescribir. */
export function makeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  const user = overrides.user === undefined ? makeProfile() : overrides.user;
  return {
    status: user ? 'authenticated' : 'anonymous',
    user,
    isAuthenticated: Boolean(user),
    login: vi.fn().mockResolvedValue(user),
    logout: vi.fn().mockResolvedValue(undefined),
    setSession: vi.fn(),
    updateUser: vi.fn(),
    hasPermission: (permission: string) => user?.permissions.includes(permission) ?? false,
    ...overrides,
  };
}

interface Options {
  /** Entradas iniciales del historial (`MemoryRouter`). */
  route?: string | { pathname: string; state?: unknown };
  auth?: Partial<AuthContextValue>;
}

/** Renderiza con tema, enrutador y una sesión falsa (sin red). Devuelve también `auth` para aserciones. */
export function renderWithProviders(ui: ReactElement, { route = '/', auth }: Options = {}) {
  const authValue = makeAuth(auth);
  const utils = render(
    <ThemeProvider>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>,
  );
  return { ...utils, auth: authValue };
}
