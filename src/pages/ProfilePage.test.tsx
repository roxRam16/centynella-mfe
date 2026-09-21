import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeProfile, makeSession } from '@/test/factories';
import { mockApi, problem } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ProfilePage } from './ProfilePage';

afterEach(() => vi.unstubAllGlobals());

describe('<ProfilePage />', () => {
  it('muestra los datos de la persona con el correo bloqueado', () => {
    renderWithProviders(<ProfilePage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Mi perfil' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Admin Principal');
    expect(screen.getByLabelText('Correo electrónico')).toBeDisabled();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText(/Último acceso/)).toBeInTheDocument();
  });

  it('edita el nombre y actualiza la sesión', async () => {
    const updated = makeProfile({ name: 'Nombre Nuevo' });
    const api = mockApi({ 'PATCH /api/v1/users/me': () => ({ json: updated }) });
    const { auth } = renderWithProviders(<ProfilePage />);

    await userEvent.clear(screen.getByLabelText('Nombre'));
    await userEvent.type(screen.getByLabelText('Nombre'), 'Nombre Nuevo');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Datos personales guardados correctamente')).toBeInTheDocument();
    expect(api.calls[0].body).toEqual({ name: 'Nombre Nuevo' });
    expect(auth.updateUser).toHaveBeenCalledWith(updated);
  });

  it('valida el nombre', async () => {
    renderWithProviders(<ProfilePage />);

    await userEvent.clear(screen.getByLabelText('Nombre'));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText(/Escribe tu nombre/)).toBeInTheDocument();
  });

  describe('pestaña Seguridad', () => {
    const openSecurity = async () => {
      const view = renderWithProviders(<ProfilePage />);
      await userEvent.click(screen.getByRole('tab', { name: 'Seguridad' }));
      return view;
    };
    const fill = async (current: string, next: string, confirm: string) => {
      await userEvent.type(screen.getByLabelText('Contraseña actual'), current);
      await userEvent.type(screen.getByLabelText('Contraseña nueva'), next);
      await userEvent.type(screen.getByLabelText('Confirmar contraseña nueva'), confirm);
      await userEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
    };

    it('cambia la contraseña y adopta la sesión nueva', async () => {
      const session = makeSession({ access_token: 'token-nuevo' });
      const api = mockApi({ 'PUT /api/v1/users/me/password': () => ({ json: session }) });
      const { auth } = await openSecurity();

      await fill('Actual12345', 'Nueva#12345', 'Nueva#12345');

      expect(await screen.findByText(/Contraseña actualizada/)).toBeInTheDocument();
      expect(api.calls[0].body).toEqual({
        current_password: 'Actual12345',
        new_password: 'Nueva#12345',
      });
      expect(auth.setSession).toHaveBeenCalledWith(session);
      expect(screen.getByLabelText('Contraseña actual')).toHaveValue(''); // el formulario se limpia
    });

    it('avisa cuando la contraseña actual es incorrecta', async () => {
      mockApi({
        'PUT /api/v1/users/me/password': () => problem(401, 'invalid_current_password', 'x'),
      });
      const { auth } = await openSecurity();

      await fill('Equivocada1', 'Nueva#12345', 'Nueva#12345');

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'La contraseña actual es incorrecta.',
      );
      expect(auth.setSession).not.toHaveBeenCalled();
    });

    it('valida que las contraseñas nuevas coincidan sin llamar al servidor', async () => {
      const api = mockApi({});
      await openSecurity();

      await fill('Actual12345', 'Nueva#12345', 'Distinta#12345');

      await waitFor(() =>
        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument(),
      );
      expect(api.calls).toHaveLength(0);
    });
  });
});
