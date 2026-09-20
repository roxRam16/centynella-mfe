import type { Page, PermissionInfo, Profile, Role, TokenResponse, User } from '@/services/types';

export const ALL_PERMISSIONS = [
  'roles:manage',
  'roles:read',
  'users:create',
  'users:delete',
  'users:read',
  'users:update',
];

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u-1',
  name: 'Ana Pérez',
  email: 'ana@example.com',
  role: 'viewer',
  status: 'active',
  providers: ['password'],
  created_at: '2026-09-01T10:00:00Z',
  updated_at: '2026-09-01T10:00:00Z',
  last_login_at: '2026-09-20T12:00:00Z',
  ...overrides,
});

export const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  ...makeUser({
    id: 'admin-1',
    name: 'Admin Principal',
    email: 'admin@example.com',
    role: 'admin',
  }),
  permissions: ALL_PERMISSIONS,
  ...overrides,
});

export const makeSession = (overrides: Partial<TokenResponse> = {}): TokenResponse => ({
  access_token: 'access-token-1',
  token_type: 'bearer',
  expires_in: 900,
  user: makeProfile(),
  ...overrides,
});

export const makeRole = (overrides: Partial<Role> = {}): Role => ({
  key: 'viewer',
  name: 'Consulta',
  description: 'Sin permisos de administración',
  permissions: [],
  is_system: true,
  ...overrides,
});

export const makePage = <T>(items: T[], overrides: Partial<Page<T>> = {}): Page<T> => ({
  items,
  total: items.length,
  page: 1,
  page_size: 10,
  ...overrides,
});

export const PERMISSION_CATALOG: PermissionInfo[] = ALL_PERMISSIONS.map((key) => ({
  key,
  description: `Permiso ${key}`,
}));
