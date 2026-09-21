import type { ReactElement } from 'react';
import AppsIcon from '@mui/icons-material/AppsOutlined';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import ShieldIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import type { RemoteDefinition } from '@/federation';
import { PERMISSIONS } from '@/services/types';

/** Un enlace del menú lateral. */
export interface NavLink {
  kind: 'link';
  to: string;
  label: string;
  icon: ReactElement;
}

/** Un grupo desplegable del menú (ej. "Administración"). */
export interface NavGroup {
  kind: 'group';
  id: string;
  label: string;
  icon: ReactElement;
  children: NavLink[];
}

export type NavItem = NavLink | NavGroup;

interface AdminEntry extends NavLink {
  /** Permiso necesario; sin él el enlace no se muestra. */
  permission: string;
}

const ADMIN_LINKS: readonly AdminEntry[] = [
  {
    kind: 'link',
    to: '/admin/users',
    label: 'Usuarios',
    icon: <PeopleIcon />,
    permission: PERMISSIONS.USERS_READ,
  },
  {
    kind: 'link',
    to: '/admin/roles',
    label: 'Roles y permisos',
    icon: <ShieldIcon />,
    permission: PERMISSIONS.ROLES_READ,
  },
  {
    kind: 'link',
    to: '/admin/logs',
    label: 'Bitácora',
    icon: <HistoryIcon />,
    permission: PERMISSIONS.LOGS_READ,
  },
];

/**
 * Construye el menú lateral según los microfrontends registrados y los permisos.
 *
 *  · "Inicio" siempre.
 *  · Un enlace por cada remote (ícono genérico de aplicación).
 *  · "Administración": grupo desplegable con lo que la persona puede ver; si no puede ver
 *    nada, el grupo entero se omite.
 * Ocultar un enlace NO es seguridad: el backend valida cada petición.
 */
export function buildNavigation(
  remotes: readonly RemoteDefinition[],
  hasPermission: (permission: string) => boolean,
): NavItem[] {
  const items: NavItem[] = [{ kind: 'link', to: '/', label: 'Inicio', icon: <HomeIcon /> }];

  for (const remote of remotes) {
    items.push({ kind: 'link', to: remote.path, label: remote.label, icon: <AppsIcon /> });
  }

  const adminChildren = ADMIN_LINKS.filter((link) => hasPermission(link.permission)).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ permission, ...link }): NavLink => link,
  );
  if (adminChildren.length > 0) {
    items.push({
      kind: 'group',
      id: 'admin',
      label: 'Administración',
      icon: <SecurityIcon />,
      children: adminChildren,
    });
  }
  return items;
}

/** ¿La ruta actual pertenece a este enlace? (`/` solo coincide exacto). */
export function isLinkActive(link: NavLink, pathname: string): boolean {
  return link.to === '/'
    ? pathname === '/'
    : pathname === link.to || pathname.startsWith(`${link.to}/`);
}
