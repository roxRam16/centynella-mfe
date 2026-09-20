import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import { Avatar, DropdownMenu, Logo } from '@/components';
import { config } from '@/config/env';
import { remoteRegistry } from '@/federation';
import type { RemoteDefinition } from '@/federation';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/services/types';

interface NavEntry {
  to: string;
  label: string;
  /** Permiso necesario para ver el enlace (sin él, el enlace no se muestra). */
  permission?: string;
}

const ADMIN_LINKS: readonly NavEntry[] = [
  { to: '/admin/users', label: 'Usuarios', permission: PERMISSIONS.USERS_READ },
  { to: '/admin/roles', label: 'Roles', permission: PERMISSIONS.ROLES_READ },
];

/**
 * Estructura base del shell con HTML semántico:
 * <header> · <nav> · <main> · <footer>, más un enlace "saltar al contenido"
 * para navegación por teclado y lectores de pantalla.
 */
export function ShellLayout({
  remotes = remoteRegistry,
}: {
  remotes?: readonly RemoteDefinition[];
}) {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const links: NavEntry[] = [
    { to: '/', label: 'Inicio' },
    ...remotes.map((remote) => ({ to: remote.path, label: remote.label })),
    ...ADMIN_LINKS.filter((link) => !link.permission || hasPermission(link.permission)),
  ];

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="a"
        href="#contenido-principal"
        sx={{
          position: 'absolute',
          left: -9999,
          '&:focus': { left: 8, top: 8, zIndex: 'tooltip', bgcolor: 'background.paper', p: 1 },
        }}
      >
        Saltar al contenido
      </Box>

      <AppBar component="header" position="static" color="primary">
        <Toolbar sx={{ flexWrap: 'wrap', gap: 2, py: 0.5 }}>
          <Box sx={{ flexGrow: { xs: 1, md: 0 }, mr: { md: 3 } }}>
            <Logo tone="light" size={30} />
          </Box>

          <Box component="nav" aria-label="Principal" sx={{ order: { xs: 3, md: 0 }, flexGrow: 1 }}>
            <Box
              component="ul"
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, listStyle: 'none', m: 0, p: 0 }}
            >
              {links.map((link) => (
                <li key={link.to}>
                  <NavItem to={link.to} label={link.label} />
                </li>
              ))}
            </Box>
          </Box>

          {user && (
            <DropdownMenu
              label="Menú de usuario"
              trigger={
                <>
                  <Avatar name={user.name} size={32} />
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      display: { xs: 'none', sm: 'inline' },
                      color: 'inherit',
                      fontWeight: 500,
                    }}
                  >
                    {user.name}
                  </Typography>
                </>
              }
              items={[
                {
                  label: 'Mi perfil',
                  icon: <PersonIcon fontSize="small" />,
                  onClick: () => navigate('/profile'),
                },
                {
                  label: 'Cerrar sesión',
                  icon: <LogoutIcon fontSize="small" />,
                  danger: true,
                  onClick: () => void logout(),
                },
              ]}
            />
          )}
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        id="contenido-principal"
        sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}
      >
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          {config.appName} · ambiente {config.appEnv}
        </Typography>
      </Box>
    </Box>
  );
}

interface NavItemProps {
  to: string;
  label: string;
}

/** Enlace de navegación; marca la página actual con `aria-current` (lo aplica NavLink). */
function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        color: 'inherit',
        fontWeight: isActive ? 700 : 400,
        textDecoration: isActive ? 'underline' : 'none',
        textUnderlineOffset: 6,
      })}
    >
      {label}
    </NavLink>
  );
}
