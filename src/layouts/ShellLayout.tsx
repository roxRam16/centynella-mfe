import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import { Avatar, DropdownMenu, Logo } from '@/components';
import { config } from '@/config/env';
import { APP_VERSION } from '@/config/version';
import { remoteRegistry } from '@/federation';
import type { RemoteDefinition } from '@/federation';
import { useAuth } from '@/hooks/useAuth';
import { palette } from '@/theme/palette';
import { elevation } from '@/theme/tokens';
import { buildNavigation } from './navigation';
import { Sidebar } from './Sidebar';

/**
 * Estructura base del shell (prototipo mockups/mockup.png):
 *  · Encabezado con DEGRADADO de marca (Blue → Violet), logo y menú de usuario.
 *  · Menú lateral negro suave a la izquierda: riel de iconos (colapsado) o extendido, y en ese
 *    caso EMPUJA el contenido en lugar de taparlo. Vive junto al encabezado, no dentro de él.
 *  · Contenido: aquí se montan las pantallas del shell y los microfrontends remotos, que NO
 *    dibujan su propio encabezado ni menú: heredan los del shell.
 * HTML semántico: <header> · <nav> (dentro del menú) · <main> · <footer>, más un enlace
 * "saltar al contenido" para teclado y lectores de pantalla.
 */
export function ShellLayout({
  remotes = remoteRegistry,
}: {
  remotes?: readonly RemoteDefinition[];
}) {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = useMemo(
    () => buildNavigation(remotes, hasPermission),
    [remotes, hasPermission],
  );

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex' }}>
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

      {user && (
        <Sidebar
          open={menuOpen}
          onOpenChange={setMenuOpen}
          user={{ name: user.name, role: user.role }}
          items={navigation}
          onLogout={() => void logout()}
        />
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          component="header"
          position="sticky"
          elevation={0}
          sx={{
            background: palette.header.gradient,
            color: palette.header.text,
            boxShadow: elevation[2],
          }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            <Logo tone="light" size={30} />

            <Box sx={{ flexGrow: 1 }} />

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

        {/* Sin ancho máximo: tablas, buscador y tarjetas ocupan todo el ancho del contenido. */}
        <Container
          component="main"
          id="contenido-principal"
          maxWidth={false}
          sx={{ flexGrow: 1, py: { xs: 2.5, md: 3 } }}
        >
          <Outlet />
        </Container>

        <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            {config.appName} · ambiente {config.appEnv} · V.{APP_VERSION}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
