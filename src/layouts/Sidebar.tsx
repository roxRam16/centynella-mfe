import { useId, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import { Avatar } from '@/components';
import { config } from '@/config/env';
import { APP_VERSION } from '@/config/version';
import { palette } from '@/theme/palette';
import { isLinkActive } from './navigation';
import type { NavGroup, NavItem, NavLink } from './navigation';

export const SIDEBAR_ID = 'menu-lateral';
const SIDEBAR_WIDTH = 288;
const { sidebar } = palette;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user: { name: string; role: string };
  items: readonly NavItem[];
  onLogout: () => void;
}

/** Estilo común de una fila del menú: hover suave y ítem activo en violet. */
const rowSx = (active: boolean, indent = 0) => ({
  minHeight: 48,
  px: 2.5,
  pl: 2.5 + indent,
  color: active ? sidebar.activeText : sidebar.text,
  backgroundColor: active ? sidebar.activeBackground : 'transparent',
  '&:hover': { backgroundColor: active ? sidebar.activeBackground : sidebar.hover },
  '&.Mui-focusVisible': { outline: `2px solid ${sidebar.activeText}`, outlineOffset: -2 },
  '& .MuiListItemIcon-root': {
    minWidth: 40,
    color: active ? sidebar.activeText : sidebar.textMuted,
  },
});

/**
 * Menú lateral: negro suave, OCULTO por defecto (se abre con el botón de menú del encabezado).
 * Es un cajón modal: atrapa el foco, se cierra con Esc, con la X o al hacer clic fuera, y
 * también al elegir una opción. Contiene: usuario, navegación (con grupos desplegables),
 * perfil/cerrar sesión y el ambiente + versión.
 */
export function Sidebar({ open, onClose, user, items, onLogout }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <Drawer
      id={SIDEBAR_ID}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          'aria-label': 'Menú principal',
          sx: {
            width: `min(${SIDEBAR_WIDTH}px, 88vw)`,
            backgroundColor: sidebar.background,
            color: sidebar.text,
            backgroundImage: 'none',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 1.5, pt: 1.5 }}>
          <IconButton onClick={onClose} aria-label="Cerrar menú" sx={{ color: sidebar.text }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2 }}>
          <Avatar name={user.name} size={40} />
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography noWrap variant="caption" sx={{ color: sidebar.textMuted }}>
              {user.role}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderTop: `1px solid ${sidebar.border}` }} />

        <Box component="nav" aria-label="Principal" sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
          <List disablePadding>
            {items.map((item) =>
              item.kind === 'group' ? (
                <NavGroupRow key={item.id} group={item} pathname={pathname} onNavigate={onClose} />
              ) : (
                <NavLinkRow
                  key={item.to}
                  link={item}
                  active={isLinkActive(item, pathname)}
                  onNavigate={onClose}
                />
              ),
            )}
          </List>
        </Box>

        <Box sx={{ borderTop: `1px solid ${sidebar.border}`, py: 1 }}>
          <List disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/profile"
              onClick={onClose}
              sx={rowSx(pathname === '/profile')}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Mi perfil" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                onClose();
                onLogout();
              }}
              sx={rowSx(false)}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </List>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, pt: 1.5, pb: 1 }}>
            {config.appEnv === 'sandbox' && (
              <Box
                component="span"
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 9999,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: sidebar.background,
                  backgroundColor: sidebar.badgeWarning,
                }}
              >
                SANDBOX
              </Box>
            )}
            <Typography variant="caption" sx={{ color: sidebar.textMuted }}>
              v{APP_VERSION}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

function NavLinkRow({
  link,
  active,
  onNavigate,
  indent = 0,
}: {
  link: NavLink;
  active: boolean;
  onNavigate: () => void;
  indent?: number;
}) {
  return (
    <ListItemButton
      component={RouterLink}
      to={link.to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      sx={rowSx(active, indent)}
    >
      <ListItemIcon>{link.icon}</ListItemIcon>
      <ListItemText primary={link.label} />
    </ListItemButton>
  );
}

function NavGroupRow({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate: () => void;
}) {
  const panelId = useId();
  const hasActiveChild = group.children.some((child) => isLinkActive(child, pathname));
  // Si la persona lo abrió/cerró a mano se respeta; si no, se abre solo cuando contiene la página actual.
  const [manual, setManual] = useState<boolean | null>(null);
  const expanded = manual ?? hasActiveChild;

  return (
    <>
      <ListItemButton
        onClick={() => setManual(!expanded)}
        aria-expanded={expanded}
        aria-controls={panelId}
        sx={rowSx(false)}
      >
        <ListItemIcon>{group.icon}</ListItemIcon>
        <ListItemText primary={group.label} />
        <ExpandMoreIcon
          aria-hidden
          sx={{
            color: sidebar.textMuted,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms',
          }}
        />
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit id={panelId}>
        <List disablePadding>
          {group.children.map((child) => (
            <NavLinkRow
              key={child.to}
              link={child}
              active={isLinkActive(child, pathname)}
              onNavigate={onNavigate}
              indent={1.5}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}
