import { useId, useState } from 'react';
import type { MouseEvent, ReactElement, ReactNode } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { palette } from '@/theme/palette';

export interface MenuAction {
  label: string;
  onClick: () => void;
  icon?: ReactElement;
  /** Acción destructiva (p. ej. cerrar sesión): se muestra en rojo. */
  danger?: boolean;
}

export interface DropdownMenuProps {
  /** Nombre accesible del botón que abre el menú. */
  label: string;
  /** Contenido visible del botón (avatar, nombre…). */
  trigger: ReactNode;
  items: readonly MenuAction[];
}

/**
 * Botón con menú desplegable accesible (`aria-haspopup`, `aria-expanded`, navegación con
 * flechas y cierre con Escape). El menú se cierra al elegir una opción.
 */
export function DropdownMenu({ label, trigger, items }: DropdownMenuProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  const close = () => setAnchor(null);

  return (
    <>
      <ButtonBase
        onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        sx={{ borderRadius: 2, p: 0.5, gap: 1 }}
      >
        {trigger}
      </ButtonBase>
      <Menu id={id} anchorEl={anchor} open={open} onClose={close}>
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              close();
              item.onClick();
            }}
            sx={item.danger ? { color: palette.error.main } : undefined}
          >
            {item.icon && (
              <ListItemIcon sx={item.danger ? { color: palette.error.main } : undefined}>
                {item.icon}
              </ListItemIcon>
            )}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
