import { mockApi } from '@/test/mockApi';
import * as productsService from './productsService';
import * as rolesService from './rolesService';
import * as usersService from './usersService';

afterEach(() => vi.unstubAllGlobals());

describe('usersService', () => {
  it('lista con filtros como query string', async () => {
    const api = mockApi({ 'GET /api/v1/users': () => ({ json: { items: [], total: 0 } }) });

    await usersService.listUsers({
      q: 'ana',
      role: 'admin',
      status: 'active',
      page: 2,
      page_size: 10,
    });

    expect(api.calls[0].url.searchParams.get('q')).toBe('ana');
    expect(api.calls[0].url.searchParams.get('role')).toBe('admin');
    expect(api.calls[0].url.searchParams.get('page_size')).toBe('10');
  });

  it('crea, edita y elimina con los verbos REST correctos', async () => {
    const api = mockApi({
      'POST /api/v1/users': () => ({ status: 201, json: {} }),
      'PATCH /api/v1/users/u%201': () => ({ json: {} }),
      'DELETE /api/v1/users/u%201': () => undefined,
    });

    await usersService.createUser({
      name: 'A',
      email: 'a@b.co',
      password: 'x',
      role: 'viewer',
      status: 'active',
    });
    await usersService.updateUser('u 1', { role: 'admin' });
    await usersService.deleteUser('u 1');

    expect(api.calls.map((call) => call.method)).toEqual(['POST', 'PATCH', 'DELETE']);
    expect(api.calls[1].body).toEqual({ role: 'admin' });
  });
});

describe('rolesService', () => {
  it('lista roles y el catálogo de permisos', async () => {
    const api = mockApi({
      'GET /api/v1/roles': () => ({ json: [] }),
      'GET /api/v1/permissions': () => ({ json: [] }),
    });

    await rolesService.listRoles();
    await rolesService.listPermissions();

    expect(api.calls.map((call) => call.path)).toEqual(['/api/v1/roles', '/api/v1/permissions']);
  });

  it('crea, edita y elimina roles', async () => {
    const api = mockApi({
      'POST /api/v1/roles': () => ({ status: 201, json: {} }),
      'PATCH /api/v1/roles/auditor': () => ({ json: {} }),
      'DELETE /api/v1/roles/auditor': () => undefined,
    });

    await rolesService.createRole({
      key: 'auditor',
      name: 'Auditor',
      description: '',
      permissions: ['users:read'],
    });
    await rolesService.updateRole('auditor', { permissions: [] });
    await rolesService.deleteRole('auditor');

    expect(api.calls[0].body).toMatchObject({ key: 'auditor', permissions: ['users:read'] });
    expect(api.calls[2].method).toBe('DELETE');
  });
});

describe('productsService', () => {
  it('lista con filtros como query string', async () => {
    const api = mockApi({
      'GET /api/v1/products': () => ({ json: { items: [], total: 0 } }),
    });

    await productsService.listProducts({
      q: 'refresco',
      category: 'Bebidas',
      status: 'active',
      page: 2,
      page_size: 10,
    });

    expect(api.calls[0].url.searchParams.get('q')).toBe('refresco');
    expect(api.calls[0].url.searchParams.get('category')).toBe('Bebidas');
    expect(api.calls[0].url.searchParams.get('page_size')).toBe('10');
  });

  it('crea, edita y elimina con los verbos REST correctos', async () => {
    const api = mockApi({
      'POST /api/v1/products': () => ({ status: 201, json: {} }),
      'PATCH /api/v1/products/p%201': () => ({ json: {} }),
      'DELETE /api/v1/products/p%201': () => undefined,
    });

    await productsService.createProduct({
      sku: 'ABC-1',
      name: 'Producto',
      category: '',
      unit: 'pieza',
      price: 10,
      quantity: 1,
      low_stock_threshold: 1,
      status: 'active',
    });
    await productsService.updateProduct('p 1', { quantity: 5 });
    await productsService.deleteProduct('p 1');

    expect(api.calls.map((call) => call.method)).toEqual(['POST', 'PATCH', 'DELETE']);
    expect(api.calls[1].body).toEqual({ quantity: 5 });
  });
});
