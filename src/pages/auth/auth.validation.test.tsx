import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

const type = (label: string | RegExp, value: string) =>
  userEvent.type(screen.getByLabelText(label), value);

afterEach(() => vi.unstubAllGlobals());

describe('login: nombre del sistema', () => {
  it('muestra solo el nombre del sistema bajo el saludo (la versión va en el pie)', () => {
    renderWithProviders(<LoginPage />, { auth: { user: null } });

    expect(screen.getByText('Sistema de inventario IA')).toBeInTheDocument();
    expect(screen.queryByText(/V\.\d+\.\d+\.\d+/)).not.toBeInTheDocument();
  });
});

describe('login: validación de entradas', () => {
  it.each([
    ['sin-arroba.com', 'El correo debe incluir @'],
    ['ana @example.com', 'Ingresa un correo válido, sin espacios ni caracteres especiales'],
    ['<script>@example.com', 'Ingresa un correo válido, sin espacios ni caracteres especiales'],
  ])('rechaza el correo "%s" sin llamar al servidor', async (email, message) => {
    const api = mockApi({});
    renderWithProviders(<LoginPage />, { auth: { user: null } });

    await type('Correo electrónico', email);
    await type('Contraseña', 'cualquiera');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.calls).toHaveLength(0);
  });

  it('limita la longitud de los campos en el propio input', () => {
    renderWithProviders(<LoginPage />, { auth: { user: null } });

    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('maxlength', '254');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('maxlength', '128');
  });
});

describe('registro: validación de entradas', () => {
  const renderRegister = () => renderWithProviders(<RegisterPage />, { auth: { user: null } });

  it('muestra los requisitos de la contraseña y los marca en vivo', async () => {
    renderRegister();
    const list = screen.getByRole('list', { name: 'Requisitos de la contraseña' });
    const item = (label: string) =>
      within(list)
        .getAllByRole('listitem')
        .find((li) => li.textContent?.startsWith(label))!;
    expect(item('Una mayúscula')).toHaveTextContent('— pendiente');

    await type('Contraseña', 'Hola');
    expect(item('Una mayúscula')).toHaveTextContent('— cumplido');
    expect(item('Una minúscula')).toHaveTextContent('— cumplido');
    expect(item('Un número')).toHaveTextContent('— pendiente');

    await userEvent.type(screen.getByLabelText('Contraseña'), '#9xyz');
    expect(within(list).queryByText(/— pendiente/)).not.toBeInTheDocument();
  });

  it('bloquea un nombre con HTML/scripts y una contraseña débil sin llamar al servidor', async () => {
    const api = mockApi({});
    renderRegister();

    await type('Nombre', '<script>alert(1)</script>');
    await type('Correo electrónico', 'ana@example.com');
    await type('Contraseña', 'password123');
    await type('Confirmar contraseña', 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(
      await screen.findByText(
        'El nombre solo admite letras, espacios, apóstrofes, puntos y guiones',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Incluye al menos una mayúscula')).toBeInTheDocument();
    expect(api.calls).toHaveLength(0);
  });

  it('pide el símbolo cuando solo faltaba ese requisito', async () => {
    renderRegister();

    await type('Nombre', 'Ana');
    await type('Correo electrónico', 'ana@example.com');
    await type('Contraseña', 'Segura12345');
    await type('Confirmar contraseña', 'Segura12345');
    await userEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(
      await screen.findByText('Incluye al menos un símbolo (! @ # $ % …)'),
    ).toBeInTheDocument();
  });

  it('limita la longitud de nombre, correo y contraseñas en el propio input', () => {
    renderRegister();

    expect(screen.getByLabelText('Nombre')).toHaveAttribute('maxlength', '80');
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('maxlength', '254');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('maxlength', '128');
  });
});
