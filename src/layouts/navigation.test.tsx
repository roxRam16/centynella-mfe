import type { RemoteDefinition } from '@/federation';
import { PERMISSIONS } from '@/services/types';
import { buildNavigation, isLinkActive } from './navigation';
import type { NavGroup, NavLink } from './navigation';

const remote = (id: string, label: string): RemoteDefinition => ({
  id,
  label,
  path: `/${id}`,
  loader: async () => ({ default: () => null }),
});

const allowing =
  (...permissions: string[]) =>
  (permission: string) =>
    permissions.includes(permission);

describe('buildNavigation', () => {
  it('siempre incluye Inicio', () => {
    const [home] = buildNavigation([], allowing());

    expect(home).toMatchObject({ kind: 'link', to: '/', label: 'Inicio' });
  });

  it('añade un enlace por cada microfrontend registrado', () => {
    const items = buildNavigation(
      [remote('inventory', 'Inventario'), remote('orders', 'Pedidos')],
      allowing(),
    );

    expect(items.map((item) => item.label)).toEqual(['Inicio', 'Inventario', 'Pedidos']);
    expect((items[1] as NavLink).to).toBe('/inventory');
  });

  it('agrupa la administración y solo muestra lo que el permiso permite', () => {
    const items = buildNavigation([], allowing(PERMISSIONS.USERS_READ, PERMISSIONS.LOGS_READ));

    const admin = items.find((item) => item.kind === 'group') as NavGroup;
    expect(admin.label).toBe('Administración');
    expect(admin.children.map((link) => link.to)).toEqual(['/admin/users', '/admin/logs']);
  });

  it('con todos los permisos muestra usuarios, roles y bitácora', () => {
    const items = buildNavigation(
      [],
      allowing(PERMISSIONS.USERS_READ, PERMISSIONS.ROLES_READ, PERMISSIONS.LOGS_READ),
    );

    const admin = items.find((item) => item.kind === 'group') as NavGroup;
    expect(admin.children.map((link) => link.label)).toEqual([
      'Usuarios',
      'Roles y permisos',
      'Bitácora',
    ]);
  });

  it('omite el grupo entero si no puede ver nada de administración', () => {
    const items = buildNavigation([remote('inventory', 'Inventario')], allowing());

    expect(items.some((item) => item.kind === 'group')).toBe(false);
  });

  it('no expone el permiso en los enlaces resultantes', () => {
    const items = buildNavigation([], allowing(PERMISSIONS.USERS_READ));
    const admin = items.find((item) => item.kind === 'group') as NavGroup;

    expect(admin.children[0]).not.toHaveProperty('permission');
  });
});

describe('isLinkActive', () => {
  const link = (to: string): NavLink => ({ kind: 'link', to, label: 'x', icon: <span /> });

  it('"/" solo coincide exacto', () => {
    expect(isLinkActive(link('/'), '/')).toBe(true);
    expect(isLinkActive(link('/'), '/admin/users')).toBe(false);
  });

  it('un enlace coincide con su ruta y sus subrutas', () => {
    expect(isLinkActive(link('/inventory'), '/inventory')).toBe(true);
    expect(isLinkActive(link('/inventory'), '/inventory/items/3')).toBe(true);
  });

  it('no confunde prefijos parecidos', () => {
    expect(isLinkActive(link('/admin/users'), '/admin/users-old')).toBe(false);
  });
});
