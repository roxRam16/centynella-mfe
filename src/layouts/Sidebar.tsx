import { useId, useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/PersonOutline';
import { Avatar } from '@/components';
import { config } from '@/config/env';
import { APP_VERSION } from '@/config/version';
import { palette } from '@/theme/palette';
import { isLinkActive } from './navigation';
import type { NavGroup, NavItem, NavLink } from './navigation';

export const SIDEBAR_ID = 'menu-lateral';
/** Ancho del riel (solo iconos) y del menú extendido. */
const RAIL_WIDTH = '3.75rem';
const FULL_WIDTH = 'min(18rem, 88vw)';
const { sidebar } = palette;

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { name: string; role: string };
  items: readonly NavItem[];
  onLogout: () => void;
}

const slide = {
  transition: 'width 200ms ease',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
};

/**
 * Estilo de una fila. El icono queda siempre a la misma distancia del borde (18 px), así no
 * "salta" al pasar del riel al menú extendido.
 */
const rowSx = (active: boolean) => ({
  minHeight: 48,
  px: '1.125rem',
  whiteSpace: 'nowrap',
  color: active ? sidebar.activeText : sidebar.text,
  backgroundColor: active ? sidebar.activeBackground : 'transparent',
  '&:hover': { backgroundColor: active ? sidebar.activeBackground : sidebar.hover },
  '&.Mui-focusVisible': { outline: `2px solid ${sidebar.activeText}`, outlineOffset: -2 },
  '& .MuiListItemIcon-root': {
    minWidth: '2.5rem',
    color: active ? sidebar.activeText : sidebar.textMuted,
  },
});

/** Con el menú colapsado el nombre de cada opción se muestra en un tooltip (y como nombre accesible). */
function RailTooltip({
  label,
  open,
  children,
}: {
  label: string;
  open: boolean;
  children: ReactElement;
}) {
  return (
    <Tooltip title={open ? '' : label} placement="right" arrow>
      {children}
    </Tooltip>
  );
}

/**
 * Menú lateral de dos estados (prototipo mockups/mockup.png):
 *  · Colapsado: riel angosto solo con iconos (siempre visible).
 *  · Extendido: muestra usuario, textos, grupos y versión, y EMPUJA el contenido en lugar de
 *    taparlo. En pantallas muy pequeñas (xs) no hay espacio para empujar: se superpone al
 *    contenido con un velo, y se cierra al elegir una opción.
 * Color negro suave; el ítem activo va en violet. Esc lo colapsa.
 */
export function Sidebar({ open, onOpenChange, user, items, onLogout }: SidebarProps) {
  const { pathname } = useLocation();
  const compact = useMediaQuery(useTheme().breakpoints.down('sm'));

  /** En pantallas pequeñas el menú se repliega al elegir; en grandes se queda como está. */
  const handleNavigate = () => {
    if (compact) onOpenChange(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) onOpenChange(false);
  };

  return (
    <Box
      component="aside"
      id={SIDEBAR_ID}
      aria-label="Menú principal"
      onKeyDown={handleKeyDown}
      sx={{
        flexShrink: 0,
        zIndex: 'drawer',
        width: { xs: RAIL_WIDTH, sm: open ? FULL_WIDTH : RAIL_WIDTH },
        ...slide,
      }}
    >
      {open && (
        <Box
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
          sx={{
            display: { xs: 'block', sm: 'none' },
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      <Box
        sx={{
          position: { xs: open ? 'fixed' : 'sticky', sm: 'sticky' },
          top: 0,
          left: 0,
          zIndex: 1,
          height: '100dvh',
          width: open ? FULL_WIDTH : RAIL_WIDTH,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: sidebar.background,
          color: sidebar.text,
          ...slide,
        }}
      >
        <Box sx={{ px: '0.625rem', pt: 1.5, pb: 0.5 }}>
          <IconButton
            onClick={() => onOpenChange(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls={SIDEBAR_ID}
            sx={{ color: sidebar.text }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: '0.875rem', py: 1.5 }}>
          <Avatar name={user.name} size={32} />
          {open && (
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography noWrap variant="caption" sx={{ color: sidebar.textMuted }}>
                {user.role}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ borderTop: `1px solid ${sidebar.border}` }} />

        <Box
          component="nav"
          aria-label="Principal"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            py: 1,
            scrollbarColor: `${palette.scrollbar.thumbOnDark} transparent`,
          }}
        >
          <List disablePadding>
            {items.map((item) =>
              item.kind === 'group' ? (
                <NavGroupRow
                  key={item.id}
                  group={item}
                  open={open}
                  pathname={pathname}
                  onOpenChange={onOpenChange}
                  onNavigate={handleNavigate}
                />
              ) : (
                <NavLinkRow
                  key={item.to}
                  link={item}
                  open={open}
                  active={isLinkActive(item, pathname)}
                  onNavigate={handleNavigate}
                />
              ),
            )}
          </List>
        </Box>

        <Box sx={{ borderTop: `1px solid ${sidebar.border}`, py: 1 }}>
          <List disablePadding>
            <NavLinkRow
              link={{ kind: 'link', to: '/profile', label: 'Mi perfil', icon: <PersonIcon /> }}
              open={open}
              active={pathname === '/profile'}
              onNavigate={handleNavigate}
            />
            <RailTooltip label="Cerrar sesión" open={open}>
              <ListItemButton
                onClick={() => {
                  handleNavigate();
                  onLogout();
                }}
                sx={rowSx(false)}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Cerrar sesión" />}
              </ListItemButton>
            </RailTooltip>
          </List>

          {open && (
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
          )}
        </Box>
      </Box>
    </Box>
  );
}

function NavLinkRow({
  link,
  open,
  active,
  onNavigate,
  indent = 0,
}: {
  link: NavLink;
  open: boolean;
  active: boolean;
  onNavigate: () => void;
  indent?: number;
}) {
  return (
    <RailTooltip label={link.label} open={open}>
      <ListItemButton
        component={RouterLink}
        to={link.to}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        sx={{ ...rowSx(active), pl: `${1.125 + indent}rem` }}
      >
        <ListItemIcon>{link.icon}</ListItemIcon>
        {open && <ListItemText primary={link.label} />}
      </ListItemButton>
    </RailTooltip>
  );
}

function NavGroupRow({
  group,
  open,
  pathname,
  onOpenChange,
  onNavigate,
}: {
  group: NavGroup;
  open: boolean;
  pathname: string;
  onOpenChange: (open: boolean) => void;
  onNavigate: () => void;
}) {
  const panelId = useId();
  const hasActiveChild = group.children.some((child) => isLinkActive(child, pathname));
  // Si la persona lo abrió/cerró a mano se respeta; si no, se abre solo cuando contiene la página actual.
  const [manual, setManual] = useState<boolean | null>(null);
  const expanded = open && (manual ?? hasActiveChild);

  const toggle = () => {
    if (!open) {
      // En el riel no hay dónde mostrar los hijos: se extiende el menú con el grupo abierto.
      onOpenChange(true);
      setManual(true);
    } else {
      setManual(!expanded);
    }
  };

  return (
    <>
      <RailTooltip label={group.label} open={open}>
        <ListItemButton
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          sx={rowSx(!open && hasActiveChild)}
        >
          <ListItemIcon>{group.icon}</ListItemIcon>
          {open && (
            <>
              <ListItemText primary={group.label} />
              <ExpandMoreIcon
                aria-hidden
                sx={{
                  color: sidebar.textMuted,
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms',
                }}
              />
            </>
          )}
        </ListItemButton>
      </RailTooltip>
      <Collapse in={expanded} timeout="auto" unmountOnExit id={panelId}>
        <List disablePadding>
          {group.children.map((child) => (
            <NavLinkRow
              key={child.to}
              link={child}
              open={open}
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
