import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { HttpError } from '@/services/httpClient';
import { mockApi, problem } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ResetPasswordPage } from './ResetPasswordPage';

/** Destino "login" para comprobar hacia dónde se navega y con qué mensaje. */
function LoginStub() {
  const notice = (useLocation().state as { notice?: string } | null)?.notice;
  return <p>login stub: {notice}</p>;
}

const type = async (label: string | RegExp, value: string) =>
  userEvent.type(screen.getByLabelText(label), value);
const click = (name: string | RegExp) => userEvent.click(screen.getByRole('button', { name }));

afterEach(() => vi.unstubAllGlobals());

describe('<LoginPage />', () => {
  const renderLogin = (options = {}) =>
    renderWithProviders(<LoginPage />, { auth: { user: null }, ...options });

  it('sigue el diseño: título, campos, botón, enlaces y Google deshabilitado', () => {
    renderLogin();

    expect(screen.getByRole('heading', { level: 1, name: 'Bienvenido' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('placeholder', '8+ caracteres');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Recupérala aquí' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeDisabled();
  });

  it('valida los campos antes de llamar al servidor', async () => {
    const { auth } = renderLogin();

    await click('Entrar');

    expect(await screen.findByText('Ingresa tu correo electrónico')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('inicia sesión con las credenciales ingresadas', async () => {
    const { auth } = renderLogin();

    await type('Correo electrónico', 'ana@example.com');
    await type('Contraseña', 'Clave12345');
    await click('Entrar');

    await waitFor(() =>
      expect(auth.login).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'Clave12345' }),
    );
  });

  it('muestra el error del backend en español', async () => {
    const login = vi
      .fn()
      .mockRejectedValue(new HttpError(401, 'X', { code: 'invalid_credentials' }));
    renderLogin({ auth: { user: null, login } });

    await type('Correo electrónico', 'ana@example.com');
    await type('Contraseña', 'mala');
    await click('Entrar');

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
  });
});

describe('<RegisterPage />', () => {
  const renderRegister = (auth = {}) =>
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginStub />} />
      </Routes>,
      { route: '/register', auth: { user: null, ...auth } },
    );

  const fillValid = async () => {
    await type('Nombre', 'Ana Pérez');
    await type('Correo electrónico', 'ana@example.com');
    await type('Contraseña', 'Segura#12345');
    await type('Confirmar contraseña', 'Segura#12345');
  };

  it('exige que las contraseñas coincidan', async () => {
    const api = mockApi({});
    renderRegister();

    await type('Nombre', 'Ana');
    await type('Correo electrónico', 'ana@example.com');
    await type('Contraseña', 'Segura#12345');
    await type('Confirmar contraseña', 'Otra#12345');
    await click('Registrarme');

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(api.calls).toHaveLength(0);
  });

  it('crea la cuenta e inicia sesión automáticamente', async () => {
    const api = mockApi({ 'POST /api/v1/auth/register': () => ({ status: 201, json: {} }) });
    const { auth } = renderRegister();

    await fillValid();
    await click('Registrarme');

    await waitFor(() =>
      expect(auth.login).toHaveBeenCalledWith({
        email: 'ana@example.com',
        password: 'Segura#12345',
      }),
    );
    expect(api.calls[0].body).toEqual({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'Segura#12345',
    });
  });

  it('si el auto-login falla, lleva al login con un aviso', async () => {
    mockApi({ 'POST /api/v1/auth/register': () => ({ status: 201, json: {} }) });
    renderRegister({ login: vi.fn().mockRejectedValue(new Error('x')) });

    await fillValid();
    await click('Registrarme');

    expect(await screen.findByText(/Tu cuenta fue creada/)).toBeInTheDocument();
  });

  it('muestra un correo repetido', async () => {
    mockApi({ 'POST /api/v1/auth/register': () => problem(409, 'email_taken', 'x') });
    renderRegister();

    await fillValid();
    await click('Registrarme');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una cuenta con ese correo.',
    );
  });
});

describe('<ForgotPasswordPage />', () => {
  it('pide el enlace y confirma sin revelar si el correo existe', async () => {
    const api = mockApi({ 'POST /api/v1/auth/password-reset-requests': () => ({ status: 202 }) });
    renderWithProviders(<ForgotPasswordPage />, { auth: { user: null } });

    await type('Correo electrónico', 'ana@example.com');
    await click('Enviar enlace');

    expect(await screen.findByText(/Si el correo está registrado/)).toBeInTheDocument();
    expect(api.calls[0].body).toEqual({ email: 'ana@example.com' });
    expect(screen.queryByRole('button', { name: 'Enviar enlace' })).not.toBeInTheDocument();
  });

  it('valida el correo', async () => {
    renderWithProviders(<ForgotPasswordPage />, { auth: { user: null } });

    await type('Correo electrónico', 'no-es-correo');
    await click('Enviar enlace');

    expect(await screen.findByText('El correo debe incluir @')).toBeInTheDocument();
  });

  it('muestra un error de red', async () => {
    mockApi({ 'POST /api/v1/auth/password-reset-requests': () => problem(500, 'boom', 'x') });
    renderWithProviders(<ForgotPasswordPage />, { auth: { user: null } });

    await type('Correo electrónico', 'ana@example.com');
    await click('Enviar enlace');

    expect(await screen.findByRole('alert')).toHaveTextContent('servidor');
  });
});

describe('<ResetPasswordPage />', () => {
  const renderReset = (route: string) =>
    renderWithProviders(
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<LoginStub />} />
      </Routes>,
      { route, auth: { user: null } },
    );

  it('sin token muestra que el enlace es inválido y ofrece pedir otro', () => {
    renderReset('/reset-password');

    expect(screen.getByText('Enlace incompleto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solicita uno nuevo' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.queryByLabelText('Contraseña nueva')).not.toBeInTheDocument();
  });

  it('guarda la nueva contraseña y vuelve al login con un aviso', async () => {
    const api = mockApi({ 'POST /api/v1/auth/password-resets': () => undefined });
    renderReset('/reset-password?token=tok-123');

    await type('Contraseña nueva', 'Nueva#12345');
    await type('Confirmar contraseña', 'Nueva#12345');
    await click('Guardar contraseña');

    expect(await screen.findByText(/Tu contraseña fue actualizada/)).toBeInTheDocument();
    expect(api.calls[0].body).toEqual({ token: 'tok-123', password: 'Nueva#12345' });
  });

  it('valida la política de contraseña', async () => {
    renderReset('/reset-password?token=tok-123');

    await type('Contraseña nueva', 'corta');
    await type('Confirmar contraseña', 'corta');
    await click('Guardar contraseña');

    expect(await screen.findByText('Usa al menos 8 caracteres')).toBeInTheDocument();
  });

  it('muestra que el enlace venció', async () => {
    mockApi({
      'POST /api/v1/auth/password-resets': () => problem(400, 'invalid_reset_token', 'x'),
    });
    renderReset('/reset-password?token=vencido');

    await type('Contraseña nueva', 'Nueva#12345');
    await type('Confirmar contraseña', 'Nueva#12345');
    await click('Guardar contraseña');

    expect(await screen.findByRole('alert')).toHaveTextContent('ya expiró');
  });
});
